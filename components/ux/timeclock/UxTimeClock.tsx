"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { UxTimeTicker } from "./UxTimeTicker";
import type { UxClockState, UxShift } from "@/lib/timeclock";
import { UxRequestTimeOff } from "./UxRequestTimeOff";
import { shiftWorkedSeconds, fmt } from "@/lib/timeclock";
import { useDemoAuth } from "@/hooks/use-demo-auth";

async function api(action: string, body?: Record<string, any>) {
  const res = await fetch(`/api/timeclock${action ? `?action=${action}` : ""}`, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function UxTimeClock({ userId }: { userId?: string }) {
  const router = useRouter();
  const { currentUser } = useDemoAuth();
  const [state, setState] = React.useState<UxClockState | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Check if user has Enterprise access
  const hasEnterpriseAccess = currentUser?.subscription === 'enterprise' || 
                              currentUser?.features?.includes('all') ||
                              currentUser?.role === 'owner';

  async function load() {
    setError(null);
    try {
      const data = await api("");
      setState(data as UxClockState);
    } catch (e: any) {
      setError(e.message ?? "Failed to load");
    }
  }

  React.useEffect(() => { 
    if (hasEnterpriseAccess) {
      load(); 
    }
  }, [hasEnterpriseAccess]);

  async function doAction(action: "clockIn" | "startBreak" | "endBreak" | "clockOut") {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const body: any = { userId };
      // Geolocation ONLY when clocking in; runs client-side after user click.
      if (action === "clockIn" && typeof window !== "undefined" && "geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 })
          );
          body.lat = pos.coords.latitude;
          body.lng = pos.coords.longitude;
        } catch (geoError) {
          // Continue without location if permission denied
          console.log("Geolocation not available:", geoError);
        }
      }
      await api(action, body);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Action failed");
    } finally {
      setLoading(false);
    }
  }

  // Show upgrade prompt for non-Enterprise users
  if (!hasEnterpriseAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.back()}
              className="h-9 w-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              ←
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Time Clock</h1>
            <div className="h-9 w-9" />
          </div>

          {/* Enterprise Required Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-lavender/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Feature</h2>
            <p className="text-gray-600 mb-4">
              Time Clock is available for Enterprise subscription users only.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/billing')}
                className="w-full bg-lavender hover:bg-lavender-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Upgrade to Enterprise
              </button>
              <button 
                onClick={() => router.back()}
                className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4">
        <div className="p-6 text-gray-600">Loading time clock…</div>
      </div>
    );
  }

  const active = state.activeShift ?? undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between bg-white border-b border-gray-200">
        <button 
          onClick={() => router.back()}
          className="h-9 w-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          ←
        </button>
        <div className="text-[20px] font-semibold text-gray-900">Time Clock</div>
        <div className="h-9 w-9" />
      </div>

      {/* Status card */}
      <div className="px-4 pt-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Status</div>
            <div className={`text-xs px-3 py-1 rounded-full font-medium ${
              state.status === "idle" ? "bg-gray-100 text-gray-700" : 
              state.status === "working" ? "bg-green-100 text-green-700" : 
              "bg-amber-100 text-amber-700"
            }`}>
              {state.status === "idle" ? "Idle" : state.status === "working" ? "Working" : "On Break"}
            </div>
          </div>

          <div className="mt-4 text-4xl font-semibold text-gray-900">
            {active ? (
              <UxTimeTicker startIso={active.clockIn} />
            ) : (
              <span className="font-mono">00:00:00</span>
            )}
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            {state.status === "idle" && (
              <button 
                onClick={() => doAction("clockIn")} 
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-60 transition-colors"
              >
                Clock In
              </button>
            )}

            {state.status === "working" && (
              <>
                <button 
                  onClick={() => doAction("startBreak")} 
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold disabled:opacity-60 transition-colors"
                >
                  Start Break
                </button>
                <button 
                  onClick={() => doAction("clockOut")} 
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold disabled:opacity-60 transition-colors"
                >
                  Clock Out
                </button>
              </>
            )}

            {state.status === "on_break" && (
              <>
                <button 
                  onClick={() => doAction("endBreak")} 
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold disabled:opacity-60 transition-colors"
                >
                  End Break
                </button>
                <button 
                  onClick={() => doAction("clockOut")} 
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold disabled:opacity-60 transition-colors"
                >
                  Clock Out
                </button>
              </>
            )}
          </div>

          {error ? <div className="mt-4 text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{error}</div> : null}

          {/* PTO Request (Enterprise feature) */}
          <div className="mt-6">
            <UxRequestTimeOff />
          </div>
        </div>
      </div>

      {/* Today's shifts */}
      <div className="px-4 mt-6">
        <div className="text-sm text-gray-600 mb-3 font-medium">Today's Shifts</div>
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          {(state.today ?? []).length === 0 ? (
            <div className="px-4 py-6 text-gray-500 text-center">No shifts yet today.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {state.today.map((s) => (
                <li key={s.id} className="px-4 py-4">
                  <UxShiftRow shift={s} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function UxShiftRow({ shift }: { shift: UxShift }) {
  const inTime = new Date(shift.clockIn).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const outTime = shift.clockOut ? new Date(shift.clockOut).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Active";
  const worked = shiftWorkedSeconds(shift, new Date().toISOString());
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-900">
          {inTime} - {outTime}
        </div>
        <div className="text-xs text-gray-500">
          {shift.breaks?.length ? `${shift.breaks.length} break${shift.breaks.length > 1 ? 's' : ''}` : 'No breaks'}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-gray-900">
          {fmt(worked)}
        </div>
        <div className="text-xs text-gray-500">worked</div>
      </div>
    </div>
  );
}
