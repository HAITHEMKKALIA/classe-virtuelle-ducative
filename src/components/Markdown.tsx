/** Rendu markdown léger (titres, listes, gras, italique, code) sans dépendance. */
function inline(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-sm">$1</code>');
}

export function Markdown({ content }: { content: string }) {
  const lines = (content ?? "").split("\n");
  const html: string[] = [];
  let list: string[] = [];

  const flush = () => {
    if (list.length) {
      html.push(`<ul class="my-3 list-disc space-y-1 pl-6">${list.join("")}</ul>`);
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) {
      list.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ""))}</li>`);
      continue;
    }
    flush();
    if (/^###\s+/.test(line))
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
      // Contenu généré/rédigé côté professeur, échappé par inline().
      dangerouslySetInnerHTML={{ __html: html.join("") }}
    />
  );
}
