import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { COLUMN_DEFINITIONS } from "../shared/columnConfig.js";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
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

const PORT = 3001;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Access from network at http://<your-ip>:${PORT}`);
});
