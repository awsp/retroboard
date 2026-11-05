export interface StickerDefinition {
  id: string;
  label: string;
  kind: "sticker" | "stamp";
  svg: string;
}

export const STICKERS: StickerDefinition[];
export const STICKER_MAP: Record<string, StickerDefinition>;
export const MAX_STICKERS_PER_CARD: number;
