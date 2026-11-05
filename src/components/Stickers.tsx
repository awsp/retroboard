import {
  useEffect,
  useState,
  type CSSProperties,
  type DragEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  STICKERS,
  STICKER_MAP,
  type StickerDefinition,
} from "../../shared/stickers.js";

/** A sticker placed on a card. x/y are the sticker's centre as 0..1 fractions of the card. */
export interface StickerPlacement {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  rotation: number;
}

export interface StickerDrop {
  stickerId: string;
  x: number;
  y: number;
  rotation: number;
}

export interface StickerMove {
  fromColumnKey: string;
  fromCardId: string;
  placementId: string;
  x: number;
  y: number;
}

// Custom MIME type so ordinary text/file drags are ignored by drop targets.
const DRAG_MIME = "application/x-retro-sticker";

type DragPayload =
  | { type: "new"; stickerId: string; offsetX: number; offsetY: number }
  | {
      type: "move";
      stickerId: string;
      columnKey: string;
      cardId: string;
      placementId: string;
      offsetX: number;
      offsetY: number;
    };

const svgToDataUri = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

// Size classes: "panel" in the sticker tray, "card" when placed on a card.
const SIZE = {
  panel: { sticker: "h-12", stamp: "h-10" },
  card: { sticker: "h-14", stamp: "h-11" },
} as const;

function StickerImage({
  sticker,
  size,
  className,
  style,
}: {
  sticker: StickerDefinition;
  size: keyof typeof SIZE;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <img
      src={svgToDataUri(sticker.svg)}
      alt={sticker.label}
      draggable={false}
      className={cn(
        "w-auto select-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]",
        SIZE[size][sticker.kind],
        className,
      )}
      style={style}
    />
  );
}

/** Offset of the cursor from the dragged element's centre, so drops land where the sticker was "held". */
const offsetFromCentre = (e: DragEvent<HTMLElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  return {
    offsetX: e.clientX - (rect.left + rect.width / 2),
    offsetY: e.clientY - (rect.top + rect.height / 2),
  };
};

const startDrag = (e: DragEvent<HTMLElement>, payload: DragPayload) => {
  e.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
  e.dataTransfer.effectAllowed = payload.type === "new" ? "copy" : "move";
};

const readPayload = (e: DragEvent): DragPayload | null => {
  try {
    const payload = JSON.parse(e.dataTransfer.getData(DRAG_MIME));
    return payload && STICKER_MAP[payload.stickerId] ? payload : null;
  } catch {
    return null;
  }
};

// Rendered size (px) of a sticker on a card; matches SIZE.card (h-14 / h-11).
const placedSize = (sticker: StickerDefinition) =>
  sticker.kind === "stamp"
    ? { width: 44 * (120 / 56), height: 44 }
    : { width: 56, height: 56 };

/** Fraction along an axis that keeps a sticker of `size` px fully inside `length` px. */
const clampInside = (pos: number, size: number, length: number) => {
  const half = Math.min(0.5, size / 2 / length);
  return Math.min(1 - half, Math.max(half, pos / length));
};

const randomTilt = () => Math.round(Math.random() * 24 - 12);

interface StickerSurfaceProps {
  columnKey: string;
  cardId: string;
  placements?: StickerPlacement[];
  onPlace: (drop: StickerDrop) => void;
  onMove: (move: StickerMove) => void;
  onRemove: (placementId: string) => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Wraps a card: accepts sticker drops anywhere on it and renders the stickers placed on it. */
export function StickerSurface({
  columnKey,
  cardId,
  placements,
  onPlace,
  onMove,
  onRemove,
  className,
  style,
  children,
}: StickerSurfaceProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes(DRAG_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect =
      e.dataTransfer.effectAllowed === "move" ? "move" : "copy";
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsOver(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    setIsOver(false);
    const payload = readPayload(e);
    if (!payload) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const size = placedSize(STICKER_MAP[payload.stickerId]);
    const x = clampInside(e.clientX - payload.offsetX - rect.left, size.width, rect.width);
    const y = clampInside(e.clientY - payload.offsetY - rect.top, size.height, rect.height);

    if (payload.type === "new") {
      onPlace({ stickerId: payload.stickerId, x, y, rotation: randomTilt() });
    } else {
      onMove({
        fromColumnKey: payload.columnKey,
        fromCardId: payload.cardId,
        placementId: payload.placementId,
        x,
        y,
      });
    }
  };

  const validPlacements = Array.isArray(placements)
    ? placements.filter((p) => STICKER_MAP[p.stickerId])
    : [];

  return (
    <div
      className={cn(
        className,
        "transition-shadow",
        isOver && "ring-2 ring-inset ring-primary",
      )}
      style={style}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      {validPlacements.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-10">
          {validPlacements.map((placement) => (
            <PlacedSticker
              key={placement.id}
              placement={placement}
              columnKey={columnKey}
              cardId={cardId}
              onRemove={() => onRemove(placement.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PlacedSticker({
  placement,
  columnKey,
  cardId,
  onRemove,
}: {
  placement: StickerPlacement;
  columnKey: string;
  cardId: string;
  onRemove: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const sticker = STICKER_MAP[placement.stickerId];

  return (
    <div
      draggable
      onDragStart={(e) => {
        startDrag(e, {
          type: "move",
          stickerId: placement.stickerId,
          columnKey,
          cardId,
          placementId: placement.id,
          ...offsetFromCentre(e),
        });
        // Defer so the browser snapshots the visible sticker as the drag image.
        requestAnimationFrame(() => setIsDragging(true));
      }}
      onDragEnd={() => setIsDragging(false)}
      title={`${sticker.label} — drag to move`}
      className={cn(
        "group/sticker pointer-events-auto absolute cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30",
      )}
      style={{
        left: `${placement.x * 100}%`,
        top: `${placement.y * 100}%`,
        transform: `translate(-50%, -50%) rotate(${placement.rotation}deg)`,
      }}
    >
      <StickerImage sticker={sticker} size="card" />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${sticker.label} sticker`}
        title="Remove sticker"
        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow transition-opacity group-hover/sticker:opacity-100 focus-visible:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

/** Floating tray of stickers that can be dragged onto any card. */
export function StickerPanel({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const icons = STICKERS.filter((s) => s.kind === "sticker");
  const stamps = STICKERS.filter((s) => s.kind === "stamp");

  const renderOption = (sticker: StickerDefinition) => (
    <div
      key={sticker.id}
      draggable
      onDragStart={(e) =>
        startDrag(e, {
          type: "new",
          stickerId: sticker.id,
          ...offsetFromCentre(e),
        })
      }
      title={`${sticker.label} — drag onto a card`}
      className="flex cursor-grab items-center justify-center rounded-md p-1 transition-transform hover:scale-110 hover:bg-accent active:cursor-grabbing"
    >
      <StickerImage sticker={sticker} size="panel" />
    </div>
  );

  return (
    <div
      role="dialog"
      aria-label="Sticker panel"
      className="fixed bottom-6 left-1/2 z-50 w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border bg-popover/95 p-3 text-popover-foreground shadow-2xl backdrop-blur"
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold">Stickers & stamps</span>
          <span className="ml-2 text-xs text-muted-foreground">
            Drag onto any card · drag placed stickers to move them
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sticker panel"
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
        <div className="flex flex-wrap gap-1">{icons.map(renderOption)}</div>
        <div className="flex flex-wrap gap-1">{stamps.map(renderOption)}</div>
      </div>
    </div>
  );
}
