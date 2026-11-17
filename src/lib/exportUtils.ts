import { ColumnData } from "../App";
import { STICKER_MAP } from "../../shared/stickers.js";
import {
  stickerCardMinHeight,
  type StickerPlacement,
} from "../components/Stickers";

const renderStickers = (stickers: StickerPlacement[] = []): string => {
  if (!Array.isArray(stickers)) return "";
  const items = stickers
    .filter((p) => STICKER_MAP[p.stickerId])
    .map((p) => {
      const sticker = STICKER_MAP[p.stickerId];
      const style = `left:${p.x * 100}%;top:${p.y * 100}%;transform:translate(-50%,-50%) rotate(${p.rotation}deg)`;
      return `<span class="sticker sticker-${sticker.kind}" style="${style}" title="${escapeHtml(sticker.label)}">${sticker.svg}</span>`;
    })
    .join("");
  return items ? `<div class="card-stickers">${items}</div>` : "";
};

const countStickers = (stickers: StickerPlacement[] = []): number =>
  Array.isArray(stickers)
    ? stickers.filter((p) => STICKER_MAP[p.stickerId]).length
    : 0;

export const sanitizeFilename = (name: string): string => {
  return name
    .trim()
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
};

const tailwindToHex = (tailwindClass: string): string => {
  const colorMap: Record<string, string> = {
    "border-t-green-500": "#22c55e",
    "border-t-yellow-500": "#eab308",
    "border-t-blue-500": "#3b82f6",
    "border-t-purple-500": "#a855f7",
  };
  return colorMap[tailwindClass] || "#64748b";
};

export const generateHTMLReport = (
  columns: Record<string, ColumnData>,
  reportName: string,
  date: string,
): string => {
  const totalCards = Object.values(columns).reduce(
    (sum, col) => sum + col.cards.length,
    0,
  );
  const totalVotes = Object.values(columns).reduce(
    (sum, col) => sum + col.cards.reduce((s, card) => s + card.votes, 0),
    0,
  );

  const columnHTML = Object.entries(columns)
    .map(([_key, column]) => {
      const sortedCards = [...column.cards].sort((a, b) => b.votes - a.votes);
      const cardsHTML = sortedCards
        .map(
          (card) => `
          <div class="card" style="min-height:${stickerCardMinHeight(countStickers(card.stickers))}px">
            <div class="card-text">${escapeHtml(card.text)}</div>
            ${renderStickers(card.stickers)}
            <div class="card-votes">👍 ${card.votes} ${card.votes === 1 ? "vote" : "votes"}</div>
          </div>
        `,
        )
        .join("");

      return `
        <div class="column">
          <div class="column-header" style="border-top: 4px solid ${tailwindToHex(column.color)}">
            <h2>${column.title}</h2>
            <span class="card-count">${column.cards.length} ${column.cards.length === 1 ? "card" : "cards"}</span>
          </div>
          <div class="column-content">
            ${cardsHTML || '<div class="empty-column">No cards</div>'}
          </div>
        </div>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(reportName)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f8fafc;
      padding: 40px 20px;
      color: #1e293b;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 40px;
    }
    
    .header {
      margin-bottom: 40px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 30px;
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #0f172a;
    }
    
    .header .subtitle {
      font-size: 16px;
      color: #64748b;
      margin-bottom: 20px;
    }
    
    .metadata {
      display: flex;
      gap: 30px;
      flex-wrap: wrap;
      margin-top: 20px;
    }
    
    .metadata-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #475569;
    }
    
    .metadata-item strong {
      color: #0f172a;
    }
    
    .stats {
      display: flex;
      gap: 20px;
      margin-bottom: 40px;
      padding: 20px;
      background: #f1f5f9;
      border-radius: 8px;
    }
    
    .stat {
      flex: 1;
      text-align: center;
    }
    
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #0f172a;
    }
    
    .stat-label {
      font-size: 14px;
      color: #64748b;
      margin-top: 4px;
    }
    
    .columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }
    
    .column {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    
    .column-header {
      border-radius: 8px 8px 0 0;
      padding: 20px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .column-header h2 {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
    }
    
    .card-count {
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
    }
    
    .column-content {
      padding: 20px;
    }
    
    .card {
      position: relative;
      min-height: 120px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 12px;
    }
    
    .card:last-child {
      margin-bottom: 0;
    }
    
    .card-text {
      font-size: 14px;
      color: #334155;
      margin-bottom: 12px;
      word-wrap: break-word;
    }
    
    .card-stickers {
      position: absolute;
      inset: 0;
      z-index: 2;
      pointer-events: none;
    }

    .sticker {
      position: absolute;
      display: block;
      filter: drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.15));
    }

    .sticker svg {
      display: block;
      height: 56px;
      width: auto;
    }

    .sticker-stamp svg {
      height: 44px;
    }

    .card-votes {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    
    .empty-column {
      text-align: center;
      color: #94a3b8;
      font-size: 14px;
      padding: 20px;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
        padding: 20px;
      }
      
      .columns {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 768px) {
      .columns {
        grid-template-columns: 1fr;
      }
      
      .stats {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${escapeHtml(reportName)}</h1>
      <p class="subtitle">Sprint Retrospective Report</p>
      <div class="metadata">
        <div class="metadata-item">
          <strong>📅 Date:</strong> ${escapeHtml(date)}
        </div>
        <div class="metadata-item">
          <strong>⏰ Generated:</strong> ${new Date().toLocaleString()}
        </div>
      </div>
    </div>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${totalCards}</div>
        <div class="stat-label">Total Cards</div>
      </div>
      <div class="stat">
        <div class="stat-value">${totalVotes}</div>
        <div class="stat-label">Total Votes</div>
      </div>
      <div class="stat">
        <div class="stat-value">${Object.keys(columns).length}</div>
        <div class="stat-label">Categories</div>
      </div>
    </div>
    
    <div class="columns">
      ${columnHTML}
    </div>
  </div>
</body>
</html>`;
};

const escapeHtml = (text: string): string => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

export const downloadHTML = (html: string, filename: string): void => {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
