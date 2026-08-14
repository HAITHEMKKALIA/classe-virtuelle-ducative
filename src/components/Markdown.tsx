/** Rendu markdown léger (titres, listes, images, citations, gras, italique, code) sans dépendance. */
function escape(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function inline(text: string) {
  return escape(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-sm">$1</code>');
}

export function Markdown({ content }: { content: string }) {
  const lines = (content ?? "").split("\n");
  const html: string[] = [];
  let ul: string[] = [];
  let ol: string[] = [];

  const flush = () => {
    if (ul.length) {
      html.push(`<ul class="my-3 list-disc space-y-1 pl-6">${ul.join("")}</ul>`);
      ul = [];
    }
    if (ol.length) {
      html.push(`<ol class="my-3 list-decimal space-y-1 pl-6">${ol.join("")}</ol>`);
      ol = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const img = line.match(/^!\[(.*?)\]\((.+?)\)\s*$/);
    if (img) {
      flush();
      html.push(
        `<img src="${escape(img[2] ?? "")}" alt="${escape(img[1] ?? "")}" loading="lazy" class="my-5 w-full rounded-2xl border border-border object-cover" />`,
      );
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      ul.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ""))}</li>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      ol.push(`<li>${inline(line.replace(/^\s*\d+\.\s+/, ""))}</li>`);
      continue;
    }
    flush();
    if (/^>\s?/.test(line))
      html.push(
        `<blockquote class="my-4 rounded-r-xl border-l-4 border-primary bg-muted/50 px-4 py-3 italic">${inline(
          line.replace(/^>\s?/, ""),
        )}</blockquote>`,
      );
    else if (/^###\s+/.test(line))
      html.push(
        `<h3 class="mt-6 font-display text-lg font-semibold">${inline(line.slice(4))}</h3>`,
      );
    else if (/^##\s+/.test(line))
      html.push(`<h2 class="mt-8 font-display text-xl font-semibold">${inline(line.slice(3))}</h2>`);
    else if (/^#\s+/.test(line))
      html.push(
        `<h2 class="mt-8 font-display text-2xl font-semibold">${inline(line.slice(2))}</h2>`,
      );
    else if (line.trim() === "") html.push("");
    else html.push(`<p class="mt-3 leading-relaxed">${inline(line)}</p>`);
  }
  flush();

  return (
    <div
      className="text-foreground"
      // Contenu rédigé côté professeur, échappé par inline().
      dangerouslySetInnerHTML={{ __html: html.join("") }}
    />
  );
}
