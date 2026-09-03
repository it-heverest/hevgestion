import React from "react";
import { BarChart3, Loader2 } from "lucide-react";

export function AuthLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-sm">
        <BarChart3 className="h-6 w-6 text-white" strokeWidth={2.25} />
      </div>

      <Loader2 className="h-5 w-5 animate-spin text-primary" />

      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">HevGestion DSF</p>
        <p className="text-xs text-muted-foreground">Chargement…</p>
      </div>
    </div>
  );
}
