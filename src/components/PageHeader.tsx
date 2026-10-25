import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function PageHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-3 py-4">
      <Link to="/" aria-label="Back to dashboard" className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-card">
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <h1 className="flex-1 text-lg font-semibold">{title}</h1>
      {right}
    </header>
  );
}
