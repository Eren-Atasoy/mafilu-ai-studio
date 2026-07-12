import { tr, type Messages } from "@/messages/tr";

// Tek aktif dil: Türkçe. Yeni dil eklemek için src/messages/<locale>.ts
// oluşturup buradaki kayda eklemek yeterli.
const messages: Record<string, Messages> = { tr };

const DEFAULT_LOCALE = "tr";

export function getMessages(locale: string = DEFAULT_LOCALE): Messages {
  return messages[locale] ?? messages[DEFAULT_LOCALE];
}

export const t = getMessages();
