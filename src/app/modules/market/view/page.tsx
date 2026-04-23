import ListingClient from "../listing/[listingId]/ListingClient";

/**
 * STATIC VIEW ANCHOR for Marketplace (Capacitor Compatibility)
 */
export const dynamic = "force-static";

export default function ListingViewPage() {
  return <ListingClient />;
}
