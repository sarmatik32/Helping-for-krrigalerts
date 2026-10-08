import React from "react";

interface StyledTextProps {
  text: string;
  className?: string;
}

/**
 * Component that formats and styles words in text:
 * - **bold text** -> radiant amber glow bold text
 * - ==highlighted text== -> stylish amber pill badge
 * - [cyan]text[/cyan] or ^^text^^ -> glowing cyan badge
 * - [green]text[/green] -> emerald green badge
 * - [amber]text[/amber] -> warm amber badge
 * - [badge]text[/badge] -> sleek pill badge with border
 * - *italic text* -> styled italic
 * - __underlined text__ -> stylish underline
 */
export const StyledText: React.FC<StyledTextProps> = ({ text, className = "" }) => {
  if (!text) return null;

  const parseLine = (line: string, lineIndex: number) => {
    // Regex matches all styled token types
    const tokenRegex =
      /(\*\*[^*]+?\*\*|==[^=]+?==|\[cyan\].*?\[\/cyan\]|\[amber\].*?\[\/amber\]|\[green\].*?\[\/green\]|\[badge\].*?\[\/badge\]|\^\^[^^]+?\^\^|\*[^*]+?\*|__[^_]+?__)/g;

    const parts = line.split(tokenRegex);

    return (
      <span key={lineIndex} className="block my-0.5">
        {parts.map((part, partIndex) => {
          if (!part) return null;

          // **Bold Golden Glow**
          if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            const inner = part.slice(2, -2);
            return (
              <strong
                key={partIndex}
                className="font-black text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)] mx-0.5"
              >
                {inner}
              </strong>
            );
          }

          // ==Amber Highlight Pill==
          if (part.startsWith("==") && part.endsWith("==") && part.length > 4) {
            const inner = part.slice(2, -2);
            return (
              <span
                key={partIndex}
                className="inline-flex items-center px-2 py-0.5 mx-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)] text-[0.95em]"
              >
                {inner}
              </span>
            );
          }

          // [cyan]...[/cyan] or ^^...^^ Cyan Pill
          if (
            (part.startsWith("[cyan]") && part.endsWith("[/cyan]")) ||
            (part.startsWith("^^") && part.endsWith("^^") && part.length > 4)
          ) {
            const inner = part.startsWith("[cyan]")
              ? part.slice(6, -7)
              : part.slice(2, -2);
            return (
              <span
                key={partIndex}
                className="inline-flex items-center px-2 py-0.5 mx-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold shadow-[0_0_10px_rgba(6,182,212,0.25)] text-[0.95em]"
              >
                {inner}
              </span>
            );
          }

          // [amber]...[/amber]
          if (part.startsWith("[amber]") && part.endsWith("[/amber]")) {
            const inner = part.slice(7, -8);
            return (
              <span
                key={partIndex}
                className="inline-flex items-center px-2 py-0.5 mx-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)] text-[0.95em]"
              >
                {inner}
              </span>
            );
          }

          // [green]...[/green] Emerald Pill
          if (part.startsWith("[green]") && part.endsWith("[/green]")) {
            const inner = part.slice(7, -8);
            return (
              <span
                key={partIndex}
                className="inline-flex items-center px-2 py-0.5 mx-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)] text-[0.95em]"
              >
                {inner}
              </span>
            );
          }

          // [badge]...[/badge]
          if (part.startsWith("[badge]") && part.endsWith("[/badge]")) {
            const inner = part.slice(7, -8);
            return (
              <span
                key={partIndex}
                className="inline-flex items-center px-2.5 py-0.5 mx-1 rounded-full bg-slate-800 text-amber-300 border border-amber-500/50 font-mono text-xs sm:text-sm font-bold shadow-md"
              >
                {inner}
              </span>
            );
          }

          // *Italic*
          if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            const inner = part.slice(1, -1);
            return (
              <em key={partIndex} className="italic text-slate-200 font-medium mx-0.5">
                {inner}
              </em>
            );
          }

          // __Underline__
          if (part.startsWith("__") && part.endsWith("__") && part.length > 4) {
            const inner = part.slice(2, -2);
            return (
              <span
                key={partIndex}
                className="underline decoration-amber-400 decoration-2 underline-offset-4 font-semibold mx-0.5"
              >
                {inner}
              </span>
            );
          }

          // Plain text
          return <React.Fragment key={partIndex}>{part}</React.Fragment>;
        })}
      </span>
    );
  };

  const lines = text.split("\n");

  return (
    <div className={`space-y-1 ${className}`}>
      {lines.map((line, idx) => (line.trim() === "" ? <div key={idx} className="h-2" /> : parseLine(line, idx)))}
    </div>
  );
};
