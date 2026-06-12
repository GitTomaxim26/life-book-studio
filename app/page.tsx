"use client";

// app/page.tsx
import AuthGate from "@/components/AuthGate";
import Shell from "@/components/Shell";

export default function Page() {
  return <AuthGate render={(book) => <Shell initialBook={book} />} />;
}
