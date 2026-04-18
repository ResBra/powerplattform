import ListingClient from "./ListingClient";

// 1. Zwinge Next.js dazu, diese Route als statische Datei zu exportieren
export const dynamic = "force-static";

// 2. Definiere leere Parameter (Capacitor braucht nur die HTML-Struktur, IDs werden im Client geladen)
export function generateStaticParams() {
  return [{ listingId: "id" }];
}

export default function ListingPage() {
  // Diese Server-Komponente dient nur als statischer Anker für den Export
  // Die gesamte Logik und die Datenabfrage passieren in ListingClient.tsx
  return <ListingClient />;
}
