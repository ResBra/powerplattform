import MessagesClient from "./MessagesClient";

// 1. Statischer Export für Capacitor erzwingen
export const dynamic = "force-static";

// 2. Leere Parameter für den Build-Prozess (Voraussetzung für parameterized static export)
export function generateStaticParams() {
  return [{ chatId: "id" }];
}

export default function MessagesPage() {
  // Diese Server-Komponente dient nur als Anker
  // Die Chat-Logik liegt in MessagesClient.tsx
  return <MessagesClient />;
}
