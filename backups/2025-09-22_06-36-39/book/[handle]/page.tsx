import type { Metadata } from "next";
import { getPublicBookingConfig, buildBookingHref } from "@/lib/booking";

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const cfg = await getPublicBookingConfig(params.handle);
  return {
    title: cfg ? `${cfg.displayName} · Book` : "Book",
    description: cfg ? `Book with ${cfg.displayName} on The PMU Guide.` : undefined,
  };
}

export default async function PublicBookingPage({ params }: { params: { handle: string } }) {
  const cfg = await getPublicBookingConfig(params.handle);
  if (!cfg) return <div className="mx-auto max-w-xl p-6">Not found.</div>;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="flex items-center gap-3 mb-4">
        {cfg.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cfg.avatarUrl} alt="" width={48} height={48} className="rounded-xl" />
        )}
        <h1 className="text-xl font-semibold">{cfg.displayName}</h1>
      </header>

      <ul className="grid gap-3">
        {cfg.services?.map(svc => (
          <li key={svc.id} className="border border-black/10 rounded-xl p-3">
            <div className="flex items-center gap-3">
              {svc.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={svc.imageUrl} alt="" width={72} height={72} className="rounded-lg object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold truncate">{svc.name}</div>
                <div className="text-sm text-neutral-500">
                  {svc.durationMinutes ? `${Math.round(svc.durationMinutes / 60)}h` : null}
                  {svc.durationMinutes && svc.price ? " · " : null}
                  {svc.price ? `$${svc.price}` : null}
                </div>
              </div>
              <a href={buildBookingHref(cfg.handle, svc.id)} className="px-3 py-2 rounded-lg text-white font-semibold" style={{ background: cfg.brandColor || "#111827" }}>
                Book
              </a>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
