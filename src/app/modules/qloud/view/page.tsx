import GroupClient from "../[groupId]/GroupClient";

/**
 * STATIC VIEW ANCHOR for Capacitor
 * This page is pre-rendered and exists physically in the APK.
 * It uses the GroupClient which handles dynamic data via SearchParams.
 */
export const dynamic = "force-static";

export default function QloudViewPage() {
  return <GroupClient />;
}
