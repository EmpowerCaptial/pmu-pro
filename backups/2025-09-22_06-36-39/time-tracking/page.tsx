import dynamic from "next/dynamic";

const UxTimeClock = dynamic(() => import("@/components/ux/timeclock/UxTimeClock").then(m => ({ default: m.UxTimeClock })), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4">
      <div className="p-6 text-gray-600">Loading time clock…</div>
    </div>
  )
});

export default function TimeTrackingPage() {
  return <UxTimeClock />; // if you have userId, pass it: <UxTimeClock userId={user.id} />
}
