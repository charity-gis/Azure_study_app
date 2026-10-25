import { ShieldAlert } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="flex items-center justify-center gap-2 bg-warning px-4 py-2 text-center text-xs font-semibold text-warning-foreground">
      <ShieldAlert className="h-4 w-4 shrink-0" />
      Unofficial Study Tool - Not affiliated with Microsoft.
    </div>
  );
}
