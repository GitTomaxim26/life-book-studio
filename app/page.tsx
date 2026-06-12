// app/page.tsx
import Shell from "@/components/Shell";
import { mockBook } from "@/lib/mock";

export default function Page() {
  return <Shell initialBook={mockBook} />;
}
