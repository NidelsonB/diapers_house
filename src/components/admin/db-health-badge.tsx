"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Database, Loader2 } from "lucide-react";

type HealthState =
  | { status: "checking" }
  | { status: "ok"; latencyMs: number }
  | { status: "down"; error: string };

const CHECK_INTERVAL_MS = 30_000;

export function DbHealthBadge() {
  const [state, setState] = useState<HealthState>({ status: "checking" });
  const isCheckingRef = useRef(false);

  const checkHealth = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    try {
      const response = await fetch("/api/admin/health", { method: "GET" });
      const payload = (await response.json()) as { ok?: boolean; latencyMs?: number; error?: string };

      if (response.ok && payload.ok) {
        setState({ status: "ok", latencyMs: payload.latencyMs ?? 0 });
      } else {
        setState({ status: "down", error: payload.error || "No fue posible conectar a la base de datos." });
      }
    } catch {
      setState({ status: "down", error: "No fue posible contactar al servidor." });
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void checkHealth();
    const interval = window.setInterval(() => void checkHealth(), CHECK_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [checkHealth]);

  const label = state.status === "checking" ? "Verificando…" : state.status === "ok" ? "DB OK" : "DB caída";
  const title =
    state.status === "checking"
      ? "Verificando conexión a la base de datos…"
      : state.status === "ok"
        ? `Base de datos conectada · ${state.latencyMs}ms · click para reintentar`
        : `${state.error} · click para reintentar`;

  return (
    <button
      type="button"
      onClick={() => void checkHealth()}
      title={title}
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
        state.status === "ok"
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : state.status === "down"
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-slate-100 text-slate-500"
      }`}
    >
      {state.status === "checking" ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <>
          <Database size={14} />
          <span className={`h-2 w-2 rounded-full ${state.status === "ok" ? "bg-emerald-500" : "bg-red-500"}`} />
        </>
      )}
      {label}
    </button>
  );
}
