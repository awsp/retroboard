import {
  useEffect,
  useRef,
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
        "w-auto max-w-none select-none drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.15)]",
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

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const randomTilt = () => Math.round(Math.random() * 24 - 12);

// Cards grow taller as stickers pile up. Placements are stored as fractions of
// the card, so a taller card spreads its stickers out instead of stacking them.
const CARD_BASE_MIN_HEIGHT = 120;
const STICKERS_BEFORE_GROWTH = 3;
const GROWTH_PER_STICKER = 32;
const CARD_MAX_MIN_HEIGHT = 480;

/** Minimum card height in px for a card carrying `count` stickers. */
export const stickerCardMinHeight = (count: number) =>
  Math.min(
    CARD_MAX_MIN_HEIGHT,
    CARD_BASE_MIN_HEIGHT +
      Math.max(0, count - STICKERS_BEFORE_GROWTH) * GROWTH_PER_STICKER,
  );

interface StickerSurfaceProps {
  columnKey: string;
  cardId: string;
  placements?: StickerPlacement[];
  onPlace: (drop: StickerDrop) => void;
  onMove: (move: StickerMove) => void;
  onRemove: (placementId: string) => void;
  className?: string;
  /** Card tint. Drawn on its own layer so the card itself doesn't clip or trap stickers. */
  background?: string;
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
  background,
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
    // Only the sticker's centre must land on the card, so it can hang over the edge.
    const x = clamp01((e.clientX - payload.offsetX - rect.left) / rect.width);
    const y = clamp01((e.clientY - payload.offsetY - rect.top) / rect.height);

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
        "transition-[box-shadow,min-height] duration-300",
        isOver && "ring-2 ring-inset ring-primary",
      )}
      style={{ minHeight: stickerCardMinHeight(validPlacements.length) }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Tint + blur live on a sibling layer: backdrop-filter or overflow on the
          card itself would create a stacking context and clip stickers that hang
          over the edge (or let the next card paint over them). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] backdrop-blur-[3px]"
        style={{ background }}
      />
      <div className="relative space-y-2">{children}</div>
      {validPlacements.length > 0 && (
        // z-30: above the card's hover glow and neighbouring cards; the card's
        // action buttons use z-40 so they stay clickable.
        <div className="pointer-events-none absolute inset-0 z-30">
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
        "group/sticker pointer-events-auto absolute w-max cursor-grab active:cursor-grabbing",
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

/** True while any sticker (from the panel or already on a card) is being dragged. */
function useStickerDragInProgress() {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let frame = 0;
    // Bubble phase: the source's dragstart handler has already set DRAG_MIME.
    const onDragStart = (e: globalThis.DragEvent) => {
      if (!e.dataTransfer?.types.includes(DRAG_MIME)) return;
      // Defer so the browser snapshots the drag image before the panel fades.
      frame = requestAnimationFrame(() => setIsDragging(true));
    };
    const onDragFinish = () => {
      cancelAnimationFrame(frame);
      setIsDragging(false);
    };
    window.addEventListener("dragstart", onDragStart);
    window.addEventListener("dragend", onDragFinish);
    window.addEventListener("drop", onDragFinish);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("dragstart", onDragStart);
      window.removeEventListener("dragend", onDragFinish);
      window.removeEventListener("drop", onDragFinish);
    };
  }, []);

  return isDragging;
}

/** Floating tray of stickers that can be dragged onto any card. */
export function StickerPanel({
  onClose,
  onHeightChange,
}: {
  onClose: () => void;
  /** Reports the space the panel covers at the bottom of the viewport (0 when unmounted). */
  onHeightChange?: (height: number) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isDragging = useStickerDragInProgress();

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !onHeightChange) return;
    const report = () =>
      onHeightChange(window.innerHeight - panel.getBoundingClientRect().top);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(panel);
    window.addEventListener("resize", report);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", report);
      onHeightChange(0);
    };
  }, [onHeightChange]);

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
      ref={panelRef}
      role="dialog"
      aria-label="Sticker panel"
      className={cn(
        "fixed bottom-6 left-1/2 z-50 w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border bg-popover/95 p-3 text-popover-foreground shadow-2xl backdrop-blur transition-opacity duration-150",
        // Step aside mid-drag so cards underneath the panel can take the drop.
        isDragging && "pointer-events-none opacity-15",
      )}
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
