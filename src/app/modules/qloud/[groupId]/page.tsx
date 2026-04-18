import GroupClient from "./GroupClient";

// 1. Statischer Export für Capacitor erzwingen
export const dynamic = "force-static";

// 2. Leere Parameter für den Build-Prozess (Real-time Daten werden im Client geladen)
export function generateStaticParams() {
  return [{ groupId: "id" }];
}

export default function GroupPage() {
  // Diese Server-Komponente dient nur als Anker für das Native-Packaging
  // Das gesamte Qloud-Ökosystem wird in GroupClient.tsx gerendert
  return <GroupClient />;
}
