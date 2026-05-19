import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X } from "lucide-react";

interface ResetBoardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

export function ResetBoardDialog({
  isOpen,
  onClose,
  onConfirm,
}: ResetBoardDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }
    onConfirm(password);
    setPassword("");
    setError("");
  };

  const handleError = (message: string) => {
    setError(message);
  };

  const handleCancel = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
        onClick={handleCancel}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in fade-in zoom-in-95">
        <div className="bg-background rounded-lg shadow-lg border p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Reset Board</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will permanently delete all cards from the board. This action
              cannot be undone.
            </p>

            <div>
              <label
                htmlFor="reset-password"
                className="block text-sm font-medium mb-2"
              >
                Enter Password
              </label>
              <Input
                id="reset-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter password to confirm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirm();
                  if (e.key === "Escape") handleCancel();
                }}
                autoFocus
                className={error ? "border-red-500" : ""}
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleConfirm}
              className="flex-1"
              variant="destructive"
            >
              Reset Board
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
