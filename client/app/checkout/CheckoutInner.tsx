"use client";

import { useSearchParams } from "next/navigation";

// paste the rest of your checkout component logic here
export default function CheckoutInner() {
  const searchParams = useSearchParams();

  return (
    <main style={{ padding: 24 }}>
      {/* your checkout UI */}
      Checkout…
    </main>
  );
}
