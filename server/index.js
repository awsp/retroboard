import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import embeddedAssets from "./embeddedAssets.js";
import { COLUMN_DEFINITIONS } from "../shared/columnConfig.js";
import { STICKER_MAP, MAX_STICKERS_PER_CARD } from "../shared/stickers.js";

const app = express();
app.use(cors());

// Single-file build: serve the embedded client, falling back to index.html.
if (embeddedAssets) {
  const files = new Map(
    Object.entries(embeddedAssets).map(([file, base64]) => [
      file,
      Buffer.from(base64, "base64"),
    ]),
  );
  app.get("*", (req, res, next) => {
    const file = files.has(req.path) ? req.path : "/index.html";
    const body = files.get(file);
    if (!body) return next();
    res.type(path.extname(file));
    res.set(
      "Cache-Control",
      file.startsWith("/assets/")
        ? "public, max-age=31536000, immutable"
        : "no-cache",
    );
    res.send(body);
  });
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  serveClient: false,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const createInitialBoardState = () => {
  const state = {};
  for (const [key, config] of Object.entries(COLUMN_DEFINITIONS)) {
    state[key] = {
      ...config,
      cards: [],
    };
  }
  return state;
};

let boardState = createInitialBoardState();

let connectedUsers = 0;

// Timer state
let timerState = {
  remainingTime: 300, // 5 minutes in seconds
  isRunning: false,
  hasStarted: false,
  initialDuration: 300,
};

let timerInterval = null;

// Function to broadcast timer state
const broadcastTimerState = () => {
  io.emit("timer-state", timerState);
};

// Timer countdown logic
const startTimerCountdown = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    if (timerState.isRunning && timerState.remainingTime > 0) {
      timerState.remainingTime--;
      broadcastTimerState();

      if (timerState.remainingTime === 0) {
        timerState.isRunning = false;
        clearInterval(timerInterval);
        timerInterval = null;
        broadcastTimerState();
      }
    }
  }, 1000);
};

io.on("connection", (socket) => {
  connectedUsers++;
  console.log(`User connected. Total users: ${connectedUsers}`);

  socket.emit("board-state", boardState);
  socket.emit("timer-state", timerState);
  io.emit("user-count", connectedUsers);

  socket.on("add-card", ({ columnKey, text }) => {
    const newCard = {
      id: `${columnKey}-${Date.now()}-${Math.random()}`,
      text,
      votes: 0,
      stickers: [],
    };
    boardState[columnKey].cards.push(newCard);
    io.emit("board-state", boardState);
  });

  socket.on("delete-card", ({ columnKey, cardId }) => {
    boardState[columnKey].cards = boardState[columnKey].cards.filter(
      (card) => card.id !== cardId,
    );
    io.emit("board-state", boardState);
  });

  socket.on("vote-card", ({ columnKey, cardId }) => {
    const card = boardState[columnKey].cards.find((c) => c.id === cardId);
    if (card) {
      card.votes++;
      io.emit("board-state", boardState);
    }
  });

  const findCard = (columnKey, cardId) =>
    boardState[columnKey]?.cards.find((c) => c.id === cardId);

  const placementsOf = (card) => {
    if (!Array.isArray(card.stickers)) card.stickers = [];
    return card.stickers;
  };

  const clampNumber = (value, min, max, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  };

  // Sticker positions are fractions (0..1) of the card's width/height so they
  // stay put regardless of screen size or card re-ordering.
  socket.on("place-sticker", ({ columnKey, cardId, stickerId, x, y, rotation }) => {
    const card = findCard(columnKey, cardId);
    if (!card || !Object.hasOwn(STICKER_MAP, stickerId)) return;
    const placements = placementsOf(card);
    if (placements.length >= MAX_STICKERS_PER_CARD) return;
    placements.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      stickerId,
      x: clampNumber(x, 0, 1, 0.5),
      y: clampNumber(y, 0, 1, 0.5),
      rotation: clampNumber(rotation, -30, 30, 0),
    });
    io.emit("board-state", boardState);
  });

  socket.on(
    "move-sticker",
    ({ fromColumnKey, fromCardId, placementId, toColumnKey, toCardId, x, y }) => {
      const from = findCard(fromColumnKey, fromCardId);
      const to = findCard(toColumnKey, toCardId);
      if (!from || !to) return;
      const fromPlacements = placementsOf(from);
      const index = fromPlacements.findIndex((p) => p.id === placementId);
      if (index === -1) return;
      if (from !== to && placementsOf(to).length >= MAX_STICKERS_PER_CARD) return;
      const [placement] = fromPlacements.splice(index, 1);
      placement.x = clampNumber(x, 0, 1, placement.x);
      placement.y = clampNumber(y, 0, 1, placement.y);
      placementsOf(to).push(placement); // last in the list renders on top
      io.emit("board-state", boardState);
    },
  );

  socket.on("remove-sticker", ({ columnKey, cardId, placementId }) => {
    const card = findCard(columnKey, cardId);
    if (!card) return;
    const placements = placementsOf(card);
    const index = placements.findIndex((p) => p.id === placementId);
    if (index === -1) return;
    placements.splice(index, 1);
    io.emit("board-state", boardState);
  });

  socket.on("edit-card", ({ columnKey, cardId, newText }) => {
    const card = boardState[columnKey].cards.find((c) => c.id === cardId);
    if (card) {
      card.text = newText;
      io.emit("board-state", boardState);
    }
  });

  socket.on("reset-board", ({ password }) => {
    const requiredPassword = process.env.RESET_PASSWORD || "zero";

    if (password !== requiredPassword) {
      socket.emit("reset-board-error", { message: "Incorrect password" });
      return;
    }

    boardState = createInitialBoardState();
    io.emit("board-state", boardState);
    socket.emit("reset-board-success");
  });

  // Timer events
  socket.on("timer-start", () => {
    timerState.isRunning = true;
    timerState.hasStarted = true;
    broadcastTimerState();
    startTimerCountdown();
  });

  socket.on("timer-pause", () => {
    timerState.isRunning = false;
    broadcastTimerState();
  });

  socket.on("timer-reset", () => {
    timerState.remainingTime = timerState.initialDuration;
    timerState.isRunning = false;
    timerState.hasStarted = false;
    broadcastTimerState();
  });

  socket.on("timer-set", (durationInMinutes) => {
    const seconds = durationInMinutes * 60;
    timerState.initialDuration = seconds;
    timerState.remainingTime = seconds;
    timerState.isRunning = false;
    broadcastTimerState();
  });

  socket.on("disconnect", () => {
    connectedUsers--;
    console.log(`User disconnected. Total users: ${connectedUsers}`);
    io.emit("user-count", connectedUsers);
  });
});

const PORT = Number(process.env.PORT) || 3001;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Access from network at http://<your-ip>:${PORT}`);
});
