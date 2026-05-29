// Tiny, dependency-free Luau syntax highlighter.
// Returns an HTML string of <span> wrapped tokens. CSS classes:
//   .cm comment  .str string  .num number  .kw keyword  .gl global/builtin  .fn function-name
import { escapeHtml } from "./utils.js";

const KEYWORDS = new Set([
  "local", "function", "return", "end", "then", "if", "else", "elseif",
  "for", "in", "do", "while", "repeat", "until", "and", "or", "not",
  "nil", "true", "false", "break", "continue", "export", "type", "self"
]);

const BUILTINS = new Set([
  "workspace", "game", "script", "setmetatable", "getmetatable", "typeof",
  "type", "pcall", "xpcall", "task", "warn", "print", "error", "assert",
  "next", "pairs", "ipairs", "tostring", "tonumber", "require",
  "Vector3", "CFrame", "Instance", "Color3", "UDim2", "Enum", "math", "table", "string"
]);

// One pass: comments, strings, numbers, then identifiers. Order matters so that
// keywords inside strings/comments are not re-highlighted.
const TOKEN = /(--\[\[[\s\S]*?\]\]|--[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+\.?\d*\b)|([A-Za-z_]\w*)/g;

export function highlightLuau(code) {
  // Escape <, >, & first so the source renders literally; quotes are kept
  // intact so the string regex still matches.
  const safe = escapeHtml(code);
  return safe.replace(TOKEN, (match, comment, string, number, ident) => {
    if (comment) return `<span class="cm">${comment}</span>`;
    if (string) return `<span class="str">${string}</span>`;
    if (number) return `<span class="num">${number}</span>`;
    if (ident) {
      if (KEYWORDS.has(ident)) return `<span class="kw">${ident}</span>`;
      if (BUILTINS.has(ident)) return `<span class="gl">${ident}</span>`;
    }
    return match;
  });
}
