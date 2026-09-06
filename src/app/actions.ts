"use server";

// Keys into content.contact.messages (see en.json / ar.json) — kept as keys
// rather than final text so the message renders in whichever language the
// visitor currently has selected, without the server needing to know it.
export type ContactMessageKey = "fillFields" | "notConfigured" | "networkError" | "success";

export type ContactState = {
  status: "idle" | "success" | "error";
  messageKey: ContactMessageKey | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Requires TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in the environment — see
// the setup note in Contact.tsx. Fails with a clear message rather than a
// crash if they're not set yet, so the form stays usable during setup.
export async function sendContactMessage(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { status: "error", messageKey: "fillFields" };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { status: "error", messageKey: "notConfigured" };
  }

  const text = [
    "<b>New portfolio message</b>",
    `<b>Name:</b> ${escapeHtml(name)}`,
    `<b>Email:</b> ${escapeHtml(email)}`,
    "",
    escapeHtml(message),
  ].join("\n");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      },
    );

    if (!res.ok) {
      return { status: "error", messageKey: "networkError" };
    }

    return { status: "success", messageKey: "success" };
  } catch {
    return { status: "error", messageKey: "networkError" };
  }
}
