
type SendOpts = {
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  disablePreview?: boolean;
};

export async function sendTelegram(message: string, opts: SendOpts = {}) {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  // если не настроены — тихо выходим
  if (!token || !chatId) return;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: message,
    parse_mode: opts.parseMode ?? "HTML",
    disable_web_page_preview: opts.disablePreview ?? true,
  };

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // в Vercel/Next 14 иногда нужно явно указать no-store, чтобы не кэшировалось
      cache: "no-store",
    });
  } catch (e) {
    // не ломаем основной поток — просто лог
    console.error("TG send error:", e);
  }
}

// простая утилита для HTML-экранирования
export function esc(s: string) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
