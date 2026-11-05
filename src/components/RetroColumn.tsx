import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Plus,
  Trash2,
  ThumbsUp,
  Pencil,
  Check,
  X,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BorderBeam } from "./ui/border-beam";
import { MagicCard } from "./ui/magic-card";
import {
  StickerSurface,
  type StickerDrop,
  type StickerMove,
  type StickerPlacement,
} from "./Stickers";

export interface RetroCard {
  id: string;
  text: string;
  votes: number;
  stickers?: StickerPlacement[];
}

interface RetroColumnProps {
  columnKey: string;
  title: string;
  color: string;
  cards: RetroCard[];
  onAddCard: (text: string) => void;
  onDeleteCard: (id: string) => void;
  onVote: (id: string) => void;
  onEditCard: (id: string, newText: string) => void;
  onPlaceSticker: (cardId: string, drop: StickerDrop) => void;
  onMoveSticker: (toCardId: string, move: StickerMove) => void;
  onRemoveSticker: (cardId: string, placementId: string) => void;
}

export function RetroColumn({
  columnKey,
  title,
  color,
  cards,
  onAddCard,
  onDeleteCard,
  onVote,
  onEditCard,
  onPlaceSticker,
  onMoveSticker,
  onRemoveSticker,
}: RetroColumnProps) {
  const [newCardText, setNewCardText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isAddHovered, setIsAddHovered] = useState(false);

  const handleAdd = () => {
    if (newCardText.trim()) {
      onAddCard(newCardText);
      setNewCardText("");
      setIsAdding(false);
    }
  };

  const startEdit = (card: RetroCard) => {
    setEditingCardId(card.id);
    setEditText(card.text);
  };

  const saveEdit = (cardId: string) => {
    if (editText.trim()) {
      onEditCard(cardId, editText);
    }
    setEditingCardId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingCardId(null);
    setEditText("");
  };

  const sortedCards = [...cards].sort((a, b) => b.votes - a.votes);

  const getGlowColor = () => {
    if (color.includes("green")) return "rgba(34, 197, 94, 0.25)";
    if (color.includes("yellow")) return "rgba(234, 179, 8, 0.25)";
    if (color.includes("blue")) return "rgba(59, 130, 246, 0.25)";
    if (color.includes("purple")) return "rgba(168, 85, 247, 0.25)";
    return "rgba(100, 100, 100, 0.3)";
  };

  const getCardColor = () => {
    if (color.includes("green")) return "rgba(34, 197, 94, 0.15)";
    if (color.includes("yellow")) return "rgba(234, 179, 8, 0.15)";
    if (color.includes("blue")) return "rgba(59, 130, 246, 0.15)";
    if (color.includes("purple")) return "rgba(168, 85, 247, 0.15)";
    return "rgba(100, 100, 100, 0.15)";
  };

  return (
    <div className="flex-1 min-w-[280px] relative">
      <div
        className="absolute inset-0 -z-10 rounded-lg"
        style={{
          background: getGlowColor(),
          filter: "blur(40px)",
          opacity: 0.6,
        }}
      />
      <Card className={cn("h-full border-t-4", color)}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedCards.map((card) => (
            <MagicCard
              key={card.id}
              gradientSize={300}
              gradientColor={getCardColor()}
              gradientOpacity={0.6}
              className="rounded-md"
            >
              <StickerSurface
                columnKey={columnKey}
                cardId={card.id}
                placements={editingCardId === card.id ? [] : card.stickers}
                onPlace={(drop) => onPlaceSticker(card.id, drop)}
                onMove={(move) => onMoveSticker(card.id, move)}
                onRemove={(placementId) =>
                  onRemoveSticker(card.id, placementId)
                }
                className="p-3 backdrop-blur-[3px] rounded-md space-y-2 group relative overflow-hidden min-h-[120px]"
                style={{
                  background: getCardColor(),
                }}
              >
                {editingCardId === card.id ? (
                  <div className="space-y-2">
                    <div>
                      <div className="rounded-md overflow-hidden border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                              e.preventDefault();
                              saveEdit(card.id);
                            }
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                          className="min-h-[60px] bg-white border-0 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
                        />
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <p className="text-xs text-muted-foreground">
                          ⌘+Enter or Ctrl+Enter to save
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(card.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap">{card.text}</p>
                    <div className="relative z-20 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onVote(card.id)}
                        className="gap-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-xs">{card.votes}</span>
                      </Button>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(card)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteCard(card.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </StickerSurface>
            </MagicCard>
          ))}

          {isAdding ? (
            <div className="space-y-2">
              <div>
                <div className="rounded-md overflow-hidden border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <Textarea
                    value={newCardText}
                    onChange={(e) => setNewCardText(e.target.value)}
                    placeholder="Enter your thought..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleAdd();
                      }
                    }}
                    autoFocus
                    className="min-h-[60px] bg-white border-0 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
                  />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Press ⌘+Enter or Ctrl+Enter to add</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-xs text-muted-foreground">
                    ⌘+Enter or Ctrl+Enter to add
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAdding(false);
                    setNewCardText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="relative rounded-md overflow-hidden"
              onMouseEnter={() => setIsAddHovered(true)}
              onMouseLeave={() => setIsAddHovered(false)}
              onFocus={() => setIsAddHovered(true)}
              onBlur={() => setIsAddHovered(false)}
            >
              <Button
                variant="outline"
                className="w-full transition-all duration-200 hover:bg-gray-100/50 hover:shadow-sm"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
              {isAddHovered && (
                <BorderBeam
                  size={60}
                  duration={12}
                  delay={0}
                  colorFrom="#fcc5e4"
                  colorTo="#c7d2fe"
                  borderWidth={2}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
