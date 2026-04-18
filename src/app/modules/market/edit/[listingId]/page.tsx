import EditListingClient from "./EditListingClient";

// 1. Statischer Export für Capacitor erzwingen
export const dynamic = "force-static";

// 2. Leere Parameter für den Build-Prozess
export function generateStaticParams() {
  return [{ listingId: "id" }];
}

export default function EditListingPage() {
  // Diese Server-Komponente dient nur als Anker
  // Die Bearbeitungs-Logik liegt in EditListingClient.tsx
  return <EditListingClient />;
}
