import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { RetroCard, RetroColumn } from "./components/RetroColumn";
import { Button } from "./components/ui/button";
import { Download, RotateCcw, Users } from "lucide-react";
import Timer from "@/components/Timer.tsx";
import { Toaster, toast } from "sonner";
import { ExportDialog } from "./components/ExportDialog";
import { ResetBoardDialog } from "./components/ResetBoardDialog";
import { ThemeToggle } from "./components/ThemeToggle";
import { Meteors } from "./components/ui/meteors";
import {
  downloadHTML,
  generateHTMLReport,
  sanitizeFilename,
} from "./lib/exportUtils";
import { COLUMN_DEFINITIONS } from "../shared/columnConfig.js";

export interface ColumnData {
  title: string;
  color: string;
  cards: RetroCard[];
}

function App() {
  const [columns, setColumns] = useState<Record<string, ColumnData>>(() => {
    const initialColumns: Record<string, ColumnData> = {};
    for (const [key, config] of Object.entries(COLUMN_DEFINITIONS)) {
      initialColumns[key] = {
        ...config,
        cards: [],
      };
    }
    return initialColumns;
  });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      window.location.origin.replace(/:\d+$/, ":3001");
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("board-state", (boardState: Record<string, ColumnData>) => {
      setColumns(boardState);
    });

    newSocket.on("user-count", (count: number) => {
      setUserCount(count);
    });

    newSocket.on("reset-board-success", () => {
      setIsResetDialogOpen(false);
      toast.success("Board Reset", {
        description: "All cards have been cleared successfully.",
      });
    });

    newSocket.on("reset-board-error", ({ message }: { message: string }) => {
      toast.error("Reset Failed", {
        description: message,
      });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const addCard = (columnKey: string, text: string) => {
    socket?.emit("add-card", { columnKey, text });
  };

  const deleteCard = (columnKey: string, cardId: string) => {
    socket?.emit("delete-card", { columnKey, cardId });
  };

  const voteCard = (columnKey: string, cardId: string) => {
    socket?.emit("vote-card", { columnKey, cardId });
  };

  const editCard = (columnKey: string, cardId: string, newText: string) => {
    socket?.emit("edit-card", { columnKey, cardId, newText });
  };

  const handleResetBoard = (password: string) => {
    socket?.emit("reset-board", { password });
  };

  const handleExport = (reportName: string, date: string) => {
    const html = generateHTMLReport(columns, reportName, date);
    const sanitizedName = sanitizeFilename(reportName);
    const filename = `${sanitizedName}-${date}.html`;
    downloadHTML(html, filename);
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onConfirm={handleExport}
      />
      <ResetBoardDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleResetBoard}
      />
      <div className="relative min-h-screen overflow-hidden bg-background p-6">
        <Meteors number={3} />
        <div className="relative z-10 mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Sprint Retrospective
              </h1>
              <p className="text-muted-foreground mt-2">
                Reflect on the sprint and identify improvements
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div
                  className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                />
                <Users className="h-4 w-4" />
                <span>{userCount} online</span>
              </div>
              <Timer socket={socket} />
              <div className="flex gap-2">
                <ThemeToggle />
                <Button
                  variant="outline"
                  onClick={() => setIsExportDialogOpen(true)}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsResetDialogOpen(true)}
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Board
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-6 flex-wrap lg:flex-nowrap">
            {Object.entries(columns).map(([key, column]) => (
              <RetroColumn
                key={key}
                title={column.title}
                color={column.color}
                cards={column.cards}
                onAddCard={(text) => addCard(key, text)}
                onDeleteCard={(id) => deleteCard(key, id)}
                onVote={(id) => voteCard(key, id)}
                onEditCard={(id, newText) => editCard(key, id, newText)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
