import { NextResponse } from "next/server";
import { UxShift, UxClockState } from "@/lib/timeclock";

export const dynamic = "force-dynamic";

// In-memory store for demo/dev (stateless in serverless; fine for UI wiring)
const g = global as any;
if (!g.__TC_SHIFTS__) g.__TC_SHIFTS__ = new Map<string, UxShift[]>();

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getUserId() { return "current"; } // replace with your auth if needed

export async function GET() {
  const userId = getUserId();
  const all = g.__TC_SHIFTS__.get(userId) || [];
  const active = all.find((s: UxShift) => !s.clockOut);
  const today = all.filter((s: UxShift) => s.clockIn.startsWith(todayKey())).sort((a: UxShift, b: UxShift) => (a.clockIn < b.clockIn ? 1 : -1));
  const status: UxClockState["status"] = active ? (active.breaks?.length && !active.breaks[active.breaks.length - 1].end ? "on_break" : "working") : "idle";
  return NextResponse.json({ status, activeShift: active || null, today } as UxClockState);
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const userId = getUserId();
  const nowIso = new Date().toISOString();

  const list: UxShift[] = g.__TC_SHIFTS__.get(userId) || [];
  g.__TC_SHIFTS__.set(userId, list);
  let active = list.find((s) => !s.clockOut);

  switch (action) {
    case "clockIn": {
      if (active) return NextResponse.json({ error: "already_clocked_in" }, { status: 400 });
      list.push({ id: `${Date.now()}`, userId, clockIn: nowIso, breaks: [] });
      break;
    }
    case "startBreak": {
      if (!active) return NextResponse.json({ error: "no_active_shift" }, { status: 400 });
      const last = active.breaks![active.breaks!.length - 1];
      if (last && !last.end) return NextResponse.json({ error: "already_on_break" }, { status: 400 });
      active.breaks!.push({ start: nowIso });
      break;
    }
    case "endBreak": {
      if (!active) return NextResponse.json({ error: "no_active_shift" }, { status: 400 });
      const last = active.breaks![active.breaks!.length - 1];
      if (!last || last.end) return NextResponse.json({ error: "not_on_break" }, { status: 400 });
      last.end = nowIso;
      break;
    }
    case "clockOut": {
      if (!active) return NextResponse.json({ error: "no_active_shift" }, { status: 400 });
      if (active.breaks && active.breaks.length) {
        const last = active.breaks[active.breaks.length - 1];
        if (last && !last.end) last.end = nowIso; // auto end break on clock out
      }
      active.clockOut = nowIso;
      break;
    }
    default:
      return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
