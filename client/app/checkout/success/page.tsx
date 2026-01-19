import { Suspense } from "react";
import CheckoutSuccessClient from "@/app/checkout/success/CheckoutSuccessClient";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}

function SuccessLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--brand-blue-light)]/30 via-background to-background flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-foreground/70">Loading order status…</p>
      </div>
    </main>
  );
}
