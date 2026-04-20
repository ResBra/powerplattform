"use client";

import { CartProvider } from "./CartContext";

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
