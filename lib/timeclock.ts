export type UxShift = {
  id: string;
  userId: string;
  clockIn: string; // ISO
  clockOut?: string; // ISO
  breaks?: { start: string; end?: string }[];
};

export type UxClockState = {
  status: "idle" | "working" | "on_break";
  activeShift?: UxShift | null;
  today: UxShift[]; // today's shifts, newest first
};

export function fmt(t: number) {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function diffSeconds(aIso: string, bIso: string) {
  return (new Date(bIso).getTime() - new Date(aIso).getTime()) / 1000;
}

export function shiftWorkedSeconds(shift: UxShift, nowIso: string) {
  const end = shift.clockOut ?? nowIso;
  let work = diffSeconds(shift.clockIn, end);
  for (const br of shift.breaks ?? []) {
    const brEnd = br.end ?? nowIso;
    work -= diffSeconds(br.start, brEnd);
  }
  return Math.max(0, Math.floor(work));
}
