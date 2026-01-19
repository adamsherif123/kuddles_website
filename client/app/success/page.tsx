import { Suspense } from "react";
import SuccessClient from "@/app//success/SuccessClient";

export default function SuccessReturnPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessClient />
    </Suspense>
  );
}

function SuccessLoading() {
  return (
    <main className="min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="rounded-xl border p-8">
          <h1 className="text-2xl font-bold mb-2">Processing payment…</h1>
          <p className="text-muted-foreground">
            We’re confirming your payment and finalizing your order.
          </p>
        </div>
      </div>
    </main>
  );
}
