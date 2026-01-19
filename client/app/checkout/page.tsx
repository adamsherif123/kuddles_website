import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutClient />
    </Suspense>
  );
}

function CheckoutLoading() {
  return (
    <main className="min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="rounded-xl border p-8">
          <h1 className="text-2xl font-bold mb-2">Preparing checkout…</h1>
          <p className="text-muted-foreground">
            Please wait while we initialize your payment.
          </p>
        </div>
      </div>
    </main>
  );
}
