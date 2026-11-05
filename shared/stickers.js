// Sticker / stamp catalog shared by the client (rendering), the server
// (validating sticker ids), and the HTML export (inline SVG).
//
// Icon stickers are 64x64 die-cut circles; stamps are 120x56 rubber stamps.

const SVG_OPEN = '<svg xmlns="http://www.w3.org/2000/svg"';

const badge = (bg, inner) =>
  `${SVG_OPEN} viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="${bg}" stroke="#fff" stroke-width="4"/>${inner}</svg>`;

const stamp = (text, color, { fontSize = 24, textLength } = {}) =>
  `${SVG_OPEN} viewBox="0 0 120 56"><g transform="rotate(-6 60 28)">` +
  `<rect x="6" y="8" width="108" height="40" rx="8" fill="${color}" fill-opacity=".12" stroke="${color}" stroke-width="4"/>` +
  `<rect x="12" y="14" width="96" height="28" rx="4" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="5 3"/>` +
  `<text x="60" y="${28 + fontSize * 0.36}" text-anchor="middle" font-family="'Arial Black','Helvetica Neue',Arial,sans-serif" font-weight="900" font-size="${fontSize}"` +
  ` textLength="${textLength ?? Math.min(84, text.length * 16)}" lengthAdjust="spacingAndGlyphs" fill="${color}">${text}</text>` +
  `</g></svg>`;

// Two-line rubber stamp, e.g. ["WORKS ON", "MY MACHINE"].
const stamp2 = ([top, bottom], color) =>
  `${SVG_OPEN} viewBox="0 0 120 56"><g transform="rotate(-6 60 28)">` +
  `<rect x="6" y="8" width="108" height="40" rx="8" fill="${color}" fill-opacity=".12" stroke="${color}" stroke-width="4"/>` +
  `<rect x="12" y="14" width="96" height="28" rx="4" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="5 3"/>` +
  [
    [top, 26.5],
    [bottom, 39.5],
  ]
    .map(
      ([line, y]) =>
        `<text x="60" y="${y}" text-anchor="middle" font-family="'Arial Black','Helvetica Neue',Arial,sans-serif" font-weight="900" font-size="13"` +
        ` textLength="${Math.min(86, line.length * 9)}" lengthAdjust="spacingAndGlyphs" fill="${color}">${line}</text>`,
    )
    .join("") +
  `</g></svg>`;

const banner = (text, color, shade) =>
  `${SVG_OPEN} viewBox="0 0 120 56">` +
  `<path d="M4 20h18v24H4l6-12z" fill="${shade}"/><path d="M116 20H98v24h18l-6-12z" fill="${shade}"/>` +
  `<rect x="14" y="12" width="92" height="30" rx="5" fill="${color}" stroke="#fff" stroke-width="3"/>` +
  `<circle cx="10" cy="8" r="3" fill="#ec4899"/><circle cx="112" cy="9" r="2.5" fill="#22c55e"/>` +
  `<rect x="100" y="46" width="6" height="3" rx="1" fill="#3b82f6" transform="rotate(25 103 47.5)"/><circle cx="18" cy="50" r="2.5" fill="#a855f7"/>` +
  `<text x="60" y="34.5" text-anchor="middle" font-family="'Arial Black','Helvetica Neue',Arial,sans-serif" font-weight="900" font-size="19"` +
  ` textLength="78" lengthAdjust="spacingAndGlyphs" fill="#fff" stroke="${shade}" stroke-width=".8">${text}</text></svg>`;

export const STICKERS = [
  {
    id: "rocket",
    label: "Ship It",
    kind: "sticker",
    svg: badge(
      "#1e3a8a",
      '<path d="M25 32l-6 10 6-1zM39 32l6 10-6-1z" fill="#ef4444"/>' +
        '<path d="M27 40q5 14 10 0z" fill="#f97316"/><path d="M29.5 40q2.5 8 5 0z" fill="#fde047"/>' +
        '<path d="M32 12c7 6 9 16 7 28H25c-2-12 0-22 7-28z" fill="#f1f5f9"/>' +
        '<circle cx="32" cy="26" r="4.5" fill="#38bdf8" stroke="#1e293b" stroke-width="2"/>',
    ),
  },
  {
    id: "fire",
    label: "On Fire",
    kind: "sticker",
    svg: badge(
      "#431407",
      '<path d="M32 10c2 9 12 13 12 25a12 12 0 0 1-24 0c0-6 3-9 6-12 0 5 2 7 4 8-1-8 0-15 2-21z" fill="#f97316"/>' +
        '<path d="M32 30c1 4 5 6 5 10a5 5 0 0 1-10 0c0-3 2-5 5-10z" fill="#fde047"/>',
    ),
  },
  {
    id: "gold-star",
    label: "Gold Star",
    kind: "sticker",
    svg: badge(
      "#fef3c7",
      '<polygon points="32,15 36.7,26.5 49.1,27.4 39.6,35.5 42.6,47.6 32,41 21.4,47.6 24.4,35.5 14.9,27.4 27.3,26.5" fill="#f59e0b" stroke="#b45309" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M29 25l2-4" stroke="#fef3c7" stroke-width="2" stroke-linecap="round"/>',
    ),
  },
  {
    id: "heart",
    label: "Love It",
    kind: "sticker",
    svg: badge(
      "#fce7f3",
      '<path d="M32 47s-15-9-15-20a8 8 0 0 1 15-4 8 8 0 0 1 15 4c0 11-15 20-15 20z" fill="#ec4899"/>' +
        '<path d="M22 26a4 4 0 0 1 4-4" stroke="#fbcfe8" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    ),
  },
  {
    id: "idea",
    label: "Great Idea",
    kind: "sticker",
    svg: badge(
      "#1e1b4b",
      '<path d="M32 5v3M14 14l2 2M50 14l-2 2M8 28h3M53 28h3" stroke="#fde047" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path d="M32 13a12 12 0 0 0-7 21.7c1.5 1.2 2 2.6 2 4.3v2h10v-2c0-1.7.5-3.1 2-4.3A12 12 0 0 0 32 13z" fill="#fde047"/>' +
        '<rect x="27" y="43" width="10" height="3" rx="1" fill="#cbd5e1"/><rect x="28" y="47" width="8" height="3" rx="1.5" fill="#94a3b8"/>',
    ),
  },
  {
    id: "bug",
    label: "Bug Hunter",
    kind: "sticker",
    svg: badge(
      "#dcfce7",
      '<path d="M23 30l-6-3M23 36h-7M24 42l-6 4M41 30l6-3M41 36h7M40 42l6 4M30 18l-3-5M34 18l3-5" stroke="#14532d" stroke-width="2.5" stroke-linecap="round"/>' +
        '<ellipse cx="32" cy="35" rx="9" ry="11" fill="#16a34a"/><circle cx="32" cy="22" r="5" fill="#14532d"/>' +
        '<path d="M32 25v21" stroke="#14532d" stroke-width="1.5"/>' +
        '<circle cx="28" cy="32" r="1.8" fill="#14532d"/><circle cx="36" cy="32" r="1.8" fill="#14532d"/><circle cx="28" cy="39" r="1.8" fill="#14532d"/><circle cx="36" cy="39" r="1.8" fill="#14532d"/>',
    ),
  },
  {
    id: "coffee",
    label: "Needs Coffee",
    kind: "sticker",
    svg: badge(
      "#ffedd5",
      '<path d="M24 21c-2-3 2-5 0-8M30 21c-2-3 2-5 0-8M36 21c-2-3 2-5 0-8" stroke="#78350f" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path d="M40 30h3a5 5 0 0 1 0 10h-3" fill="none" stroke="#78350f" stroke-width="2.5"/>' +
        '<rect x="18" y="25" width="22" height="21" rx="4" fill="#fff" stroke="#78350f" stroke-width="2.5"/>' +
        '<path d="M29 39s-4-2.5-4-5a2 2 0 0 1 4-1 2 2 0 0 1 4 1c0 2.5-4 5-4 5z" fill="#ef4444"/>' +
        '<rect x="14" y="47" width="32" height="3" rx="1.5" fill="#78350f"/>',
    ),
  },
  {
    id: "trophy",
    label: "MVP",
    kind: "sticker",
    svg: badge(
      "#312e81",
      '<path d="M22 17h-4a5 5 0 0 0 5 8M42 17h4a5 5 0 0 1-5 8" stroke="#fbbf24" stroke-width="2.5" fill="none"/>' +
        '<path d="M22 14h20v8a10 10 0 0 1-20 0z" fill="#fbbf24"/><rect x="30" y="31" width="4" height="7" fill="#f59e0b"/>' +
        '<rect x="24" y="38" width="16" height="4" rx="1" fill="#fbbf24"/><rect x="21" y="42" width="22" height="6" rx="1.5" fill="#92400e"/>' +
        '<path d="M28 18v5a4 4 0 0 0 2 3" stroke="#fde68a" stroke-width="2" fill="none" stroke-linecap="round"/>',
    ),
  },
  {
    id: "party",
    label: "Celebrate",
    kind: "sticker",
    svg: badge(
      "#fdf4ff",
      '<path d="M15 49l10-22 12 12z" fill="#a855f7"/><path d="M19.5 39l5.5 5.5M22.5 32.5l8 8" stroke="#f0abfc" stroke-width="2.5"/>' +
        '<circle cx="40" cy="18" r="2.5" fill="#ef4444"/><rect x="44" y="25" width="6" height="3" rx="1" fill="#3b82f6" transform="rotate(30 47 26.5)"/>' +
        '<circle cx="48" cy="38" r="2.5" fill="#22c55e"/><rect x="30" y="13" width="3" height="6" rx="1" fill="#f59e0b" transform="rotate(-20 31.5 16)"/>' +
        '<path d="M33 30c3-6 9-6 12-2" stroke="#ec4899" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    ),
  },
  {
    id: "happy",
    label: "Happy",
    kind: "sticker",
    svg: badge(
      "#fde047",
      '<circle cx="19" cy="37" r="3.5" fill="#fb923c" opacity=".55"/><circle cx="45" cy="37" r="3.5" fill="#fb923c" opacity=".55"/>' +
        '<ellipse cx="24" cy="26" rx="3" ry="4.5" fill="#422006"/><ellipse cx="40" cy="26" rx="3" ry="4.5" fill="#422006"/>' +
        '<path d="M20 36q12 14 24 0z" fill="#422006"/><path d="M26 42.5q6 3 12 0q-6-3.5-12 0z" fill="#f87171"/>',
    ),
  },
  {
    id: "sad",
    label: "Sad",
    kind: "sticker",
    svg: badge(
      "#93c5fd",
      '<path d="M19 22l8-4M45 22l-8-4" stroke="#1e3a8a" stroke-width="2.5" stroke-linecap="round"/>' +
        '<ellipse cx="24" cy="28" rx="3" ry="4" fill="#1e3a8a"/><ellipse cx="40" cy="28" rx="3" ry="4" fill="#1e3a8a"/>' +
        '<path d="M22 46q10-10 20 0" stroke="#1e3a8a" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M41 33c-2.5 4-2.5 7 0 7s2.5-3 0-7z" fill="#eff6ff" stroke="#1d4ed8" stroke-width="1.2"/>',
    ),
  },
  {
    id: "check",
    label: "Done",
    kind: "sticker",
    svg: badge(
      "#16a34a",
      '<circle cx="32" cy="32" r="21" fill="none" stroke="#bbf7d0" stroke-width="2" stroke-dasharray="4 3"/>' +
        '<path d="M21 33l8 8 15-16" stroke="#fff" stroke-width="6.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    ),
  },
  {
    id: "kudos-medal",
    label: "Kudos",
    kind: "sticker",
    svg: badge(
      "#f3e8ff",
      '<path d="M25 40l-6 15 6-2 4 5 3-14zM39 40l6 15-6-2-4 5-3-14z" fill="#7c3aed"/>' +
        '<circle cx="32" cy="28" r="17" fill="#c084fc" stroke="#fff" stroke-width="2" stroke-dasharray="3 2"/>' +
        '<circle cx="32" cy="28" r="13" fill="#7c3aed"/>' +
        '<polygon points="32,17.5 33.8,21.3 37.8,21.6 34.8,24.2 35.7,28.2 32,26 28.3,28.2 29.2,24.2 26.2,21.6 30.2,21.3" fill="#fde047"/>' +
        '<text x="32" y="36.5" text-anchor="middle" font-family="\'Arial Black\',Arial,sans-serif" font-weight="900" font-size="7" textLength="20" lengthAdjust="spacingAndGlyphs" fill="#fff">KUDOS</text>',
    ),
  },
  {
    id: "duck",
    label: "Rubber Duck",
    kind: "sticker",
    svg: badge(
      "#bae6fd",
      '<ellipse cx="32" cy="48" rx="22" ry="4" fill="#38bdf8"/>' +
        '<polygon points="16,38 11,30 21,34" fill="#facc15"/><ellipse cx="30" cy="40" rx="14" ry="8" fill="#facc15"/>' +
        '<rect x="35" y="29" width="9" height="9" fill="#facc15"/><circle cx="40" cy="26" r="8" fill="#facc15"/>' +
        '<path d="M47 25l8 1.5-8 3z" fill="#f97316"/><circle cx="42" cy="24" r="1.7" fill="#1e293b"/>' +
        '<path d="M23 39q7-7 13 0q-7 4-13 0z" fill="#eab308"/>',
    ),
  },
  {
    id: "dumpster-fire",
    label: "Dumpster Fire",
    kind: "sticker",
    svg: badge(
      "#1f2937",
      '<path d="M18 31c0-6 4-8 4-13 3 3 4 6 4 9 1-4 4-7 4-12 4 4 6 9 6 14 1-3 3-4 3-7 4 3 5 6 5 9z" fill="#f97316"/>' +
        '<path d="M24 31c0-3 2-4 2-7 2 2 3 4 3 6 1-2 3-4 3-6 2 2 4 4 4 7z" fill="#fde047"/>' +
        '<polygon points="14,34 50,34 46,50 18,50" fill="#16a34a"/><rect x="12" y="31" width="40" height="4" rx="1" fill="#15803d"/>' +
        '<path d="M24 39v7M32 39v7M40 39v7" stroke="#15803d" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="21" cy="52" r="2.5" fill="#0f172a" stroke="#64748b"/><circle cx="43" cy="52" r="2.5" fill="#0f172a" stroke="#64748b"/>',
    ),
  },
  {
    id: "snail",
    label: "Sooo Slow",
    kind: "sticker",
    svg: badge(
      "#ecfccb",
      '<path d="M8 32h5M6 38h6" stroke="#84cc16" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M50 31l-1-7M53 32l2-6" stroke="#4d7c0f" stroke-width="1.5"/><circle cx="49" cy="23" r="2" fill="#1e293b"/><circle cx="55" cy="25" r="2" fill="#1e293b"/>' +
        '<path d="M12 47c0-3 3-4 6-4h26c2-3 2-9 4-12 2 0 3 1 3 3l-1 10c3 1 4 2 4 3z" fill="#a3e635" stroke="#4d7c0f" stroke-width="1.5"/>' +
        '<circle cx="31" cy="33" r="12" fill="#d97706" stroke="#92400e" stroke-width="2"/>' +
        '<path d="M31 33a2 2 0 1 1 3 1.5 5 5 0 1 1-7.5-4 8 8 0 1 1 12.5 7" stroke="#fde68a" stroke-width="2" fill="none" stroke-linecap="round"/>',
    ),
  },
  {
    id: "mind-blown",
    label: "Mind Blown",
    kind: "sticker",
    svg: badge(
      "#c4b5fd",
      '<circle cx="32" cy="39" r="15" fill="#fcd34d"/>' +
        '<path d="M18 26l-4-8 7 3 2-9 5 7 4-9 3 9 6-6v8h7l-5 6z" fill="#f97316"/>' +
        '<path d="M24 25l-2-5 5 2 2-6 3 5 3-5 2 6 5-2-2 5z" fill="#fde047"/>' +
        '<circle cx="26" cy="37" r="3.5" fill="#fff"/><circle cx="38" cy="37" r="3.5" fill="#fff"/>' +
        '<circle cx="26" cy="37" r="1.5" fill="#422006"/><circle cx="38" cy="37" r="1.5" fill="#422006"/>' +
        '<ellipse cx="32" cy="46" rx="3.5" ry="4" fill="#78350f"/>',
    ),
  },
  {
    id: "melting",
    label: "Melting",
    kind: "sticker",
    svg: badge(
      "#bfdbfe",
      '<ellipse cx="32" cy="50" rx="18" ry="3.5" fill="#fbbf24"/>' +
        '<path d="M17 34a15 15 0 0 1 30 0c0 6-1 9 2 12 2 2 1 4-2 4H19c-4 0-5-2-3-4 2-3 1-6 1-12z" fill="#fcd34d"/>' +
        '<path d="M44 44q1 6 3 6" stroke="#fbbf24" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="26" cy="33" rx="2" ry="3" fill="#422006"/><ellipse cx="37" cy="31.5" rx="2" ry="3" fill="#422006"/>' +
        '<path d="M24 41q3.5 3 7 0t8-1" stroke="#422006" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    ),
  },
  {
    id: "ghost",
    label: "Ghosted",
    kind: "sticker",
    svg: badge(
      "#1e1b4b",
      '<path d="M20 48V30a12 12 0 0 1 24 0v18l-4-3-4 3-4-3-4 3-4-3z" fill="#f8fafc"/>' +
        '<ellipse cx="27.5" cy="30" rx="2.2" ry="3" fill="#1e1b4b"/><ellipse cx="36.5" cy="30" rx="2.2" ry="3" fill="#1e1b4b"/>' +
        '<ellipse cx="32" cy="38" rx="2.5" ry="3.2" fill="#1e1b4b"/>' +
        '<path d="M48 20l2-2M51 26h3M14 20l-2-2" stroke="#a5b4fc" stroke-width="2" stroke-linecap="round"/>',
    ),
  },
  {
    id: "pizza",
    label: "Pizza Party",
    kind: "sticker",
    svg: badge(
      "#fee2e2",
      '<path d="M14 19q18-8 36 0L32 52z" fill="#fbbf24"/><path d="M14 19q18-8 36 0l-2 4q-16-7-32 0z" fill="#b45309"/>' +
        '<circle cx="27" cy="27" r="3.5" fill="#dc2626"/><circle cx="37.5" cy="28" r="3" fill="#dc2626"/><circle cx="32" cy="38" r="3" fill="#dc2626"/>' +
        '<path d="M24 31q0 5 1.5 5t1.5-4" fill="#fbbf24"/>',
    ),
  },
  {
    id: "found-it",
    label: "Found It!",
    kind: "sticker",
    svg: badge(
      "#fef9c3",
      '<path d="M22 26l-4-2M22 30h-4M22 34l-3 2M32 26l4-2M32 30h4M32 34l3 2" stroke="#7f1d1d" stroke-width="1.5" stroke-linecap="round"/>' +
        '<ellipse cx="27" cy="30" rx="5" ry="6.5" fill="#dc2626"/><circle cx="27" cy="22" r="3" fill="#7f1d1d"/>' +
        '<path d="M27 24.5v12" stroke="#7f1d1d" stroke-width="1"/>' +
        '<path d="M37 37l10 10" stroke="#334155" stroke-width="6" stroke-linecap="round"/>' +
        '<circle cx="28" cy="29" r="12" fill="#e0f2fe" fill-opacity=".35" stroke="#334155" stroke-width="4"/>' +
        '<path d="M21 24a8 8 0 0 1 5-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>',
    ),
  },
  {
    id: "talk",
    label: "Let's Talk",
    kind: "sticker",
    svg: badge(
      "#e0f2fe",
      '<path d="M16 20a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H30l-8 7v-7a6 6 0 0 1-6-6z" fill="#0284c7"/>' +
        '<circle cx="25" cy="27" r="2.5" fill="#fff"/><circle cx="32" cy="27" r="2.5" fill="#fff"/><circle cx="39" cy="27" r="2.5" fill="#fff"/>',
    ),
  },
  {
    id: "congrats",
    label: "Congrats!",
    kind: "stamp",
    svg: banner("CONGRATS!", "#f59e0b", "#b45309"),
  },
  {
    id: "ship-it",
    label: "SHIP IT",
    kind: "stamp",
    svg: stamp("SHIP IT", "#16a34a"),
  },
  { id: "lgtm", label: "LGTM", kind: "stamp", svg: stamp("LGTM", "#2563eb") },
  {
    id: "plus-one",
    label: "+1",
    kind: "stamp",
    svg: stamp("+1", "#7c3aed", { fontSize: 28 }),
  },
  {
    id: "kudos",
    label: "KUDOS",
    kind: "stamp",
    svg: stamp("KUDOS", "#c026d3"),
  },
  {
    id: "blocked",
    label: "BLOCKED",
    kind: "stamp",
    svg: stamp("BLOCKED", "#dc2626"),
  },
  {
    id: "tech-debt",
    label: "TECH DEBT",
    kind: "stamp",
    svg: stamp("TECH DEBT", "#ea580c", { fontSize: 20, textLength: 88 }),
  },
  {
    id: "works-on-my-machine",
    label: "WORKS ON MY MACHINE",
    kind: "stamp",
    svg: stamp2(["WORKS ON", "MY MACHINE"], "#0891b2"),
  },
  {
    id: "not-a-bug",
    label: "NOT A BUG, IT'S A FEATURE",
    kind: "stamp",
    svg: stamp2(["NOT A BUG", "IT'S A FEATURE"], "#65a30d"),
  },
  {
    id: "email",
    label: "COULD'VE BEEN AN EMAIL",
    kind: "stamp",
    svg: stamp2(["COULD'VE BEEN", "AN EMAIL"], "#0d9488"),
  },
  {
    id: "yolo",
    label: "YOLO DEPLOY",
    kind: "stamp",
    svg: stamp("YOLO DEPLOY", "#e11d48", { fontSize: 19, textLength: 88 }),
  },
  {
    id: "wontfix",
    label: "WONTFIX",
    kind: "stamp",
    svg: stamp("WONTFIX", "#db2777"),
  },
  {
    id: "push-force",
    label: "PUSH --FORCE",
    kind: "stamp",
    svg: stamp("PUSH --FORCE", "#dc2626", { fontSize: 18, textLength: 88 }),
  },
  {
    id: "it-compiles",
    label: "IT COMPILES! SHIP IT",
    kind: "stamp",
    svg: stamp2(["IT COMPILES!", "SHIP IT"], "#4f46e5"),
  },
  {
    id: "cant-repro",
    label: "CAN'T REPRO",
    kind: "stamp",
    svg: stamp("CAN'T REPRO", "#9333ea", { fontSize: 19, textLength: 88 }),
  },
  {
    id: "passed-on-retry",
    label: "PASSED ON RETRY #3",
    kind: "stamp",
    svg: stamp2(["PASSED ON", "RETRY #3"], "#ca8a04"),
  },
  {
    id: "edge-case",
    label: "EDGE CASE",
    kind: "stamp",
    svg: stamp("EDGE CASE", "#0284c7", { fontSize: 20, textLength: 88 }),
  },
  {
    id: "not-in-scope",
    label: "THAT'S NOT IN SCOPE",
    kind: "stamp",
    svg: stamp2(["THAT'S NOT", "IN SCOPE"], "#b91c1c"),
  },
  {
    id: "one-small-change",
    label: "JUST ONE MORE SMALL CHANGE",
    kind: "stamp",
    svg: stamp2(["JUST ONE MORE", "SMALL CHANGE"], "#7c3aed"),
  },
];

export const STICKER_MAP = Object.fromEntries(STICKERS.map((s) => [s.id, s]));

export const MAX_STICKERS_PER_CARD = 30;
