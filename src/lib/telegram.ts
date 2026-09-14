/**
 * Telegram Notification Service for CineTrack
 * Sends instant alerts on user registrations and incoming requests.
 */

export function escapeTelegramHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing."
    );
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Telegram API sendMessage error:", errText);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to send Telegram notification:", err);
    return false;
  }
}

export async function notifyNewUserRegistration({
  email,
  method = "Email & Password",
  username,
}: {
  email?: string | null;
  method?: string;
  username?: string | null;
}): Promise<boolean> {
  const timeStr = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const lines = [
    `👤 <b>New CineTrack Account!</b>`,
    ``,
    `<b>Email:</b> ${escapeTelegramHtml(email || "N/A")}`,
    username ? `<b>Username:</b> @${escapeTelegramHtml(username)}` : null,
    `<b>Method:</b> ${escapeTelegramHtml(method)}`,
    `<b>Date:</b> ${timeStr} UTC`,
  ].filter(Boolean) as string[];

  return sendTelegramMessage(lines.join("\n"));
}

export async function notifyNewRequest({
  title,
  description,
  category = "feature",
  email,
  username,
}: {
  title: string;
  description: string;
  category?: string;
  email?: string | null;
  username?: string | null;
}): Promise<boolean> {
  const timeStr = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const sender = username
    ? `@${username}`
    : email
    ? email
    : "Anonymous";

  const lines = [
    `📬 <b>New CineTrack Request!</b>`,
    ``,
    `<b>Category:</b> #${escapeTelegramHtml(category.toUpperCase())}`,
    `<b>Title:</b> <b>${escapeTelegramHtml(title)}</b>`,
    ``,
    `<b>Description:</b>`,
    `<i>${escapeTelegramHtml(description)}</i>`,
    ``,
    `<b>From:</b> ${escapeTelegramHtml(sender)}`,
    `<b>Date:</b> ${timeStr} UTC`,
  ];

  return sendTelegramMessage(lines.join("\n"));
}
