import type { Metadata } from "next";
import { getPublicBookingConfig, buildBookingHref } from "@/lib/booking";
import Script from "next/script";

export const dynamic = "force-dynamic"; // ensure fresh content per handle

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const cfg = await getPublicBookingConfig(params.handle);
  return {
    title: cfg ? `${cfg.displayName} · Book` : "Book",
    robots: { index: false },
  };
}

export default async function EmbedPage({ params, searchParams }: { params: { handle: string }, searchParams: { theme?: string, parent?: string, wid?: string } }) {
  const cfg = await getPublicBookingConfig(params.handle);
  const theme = (searchParams.theme === "light" ? "light" : "dark");
  const wid = searchParams.wid ?? ""; // widget id passed from parent for precise postMessage routing
  if (!cfg) return <div style={{ padding: 16 }}>Not found.</div>;

  return (
    <div data-theme={theme} style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <div id="content" style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          {cfg.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cfg.avatarUrl} alt="" width={40} height={40} style={{ borderRadius: 12 }} />
          )}
          <h1 style={{ fontSize: 18, margin: 0 }}>{cfg.displayName}</h1>
        </header>

        {cfg.services?.length ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
            {cfg.services.map(svc => (
              <li key={svc.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {svc.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={svc.imageUrl} alt="" width={64} height={64} style={{ objectFit: "cover", borderRadius: 8 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{svc.name}</div>
                    <div style={{ color: "#6b7280", fontSize: 13 }}>
                      {svc.durationMinutes ? `${Math.round(svc.durationMinutes / 60)}h` : null}
                      {svc.durationMinutes && svc.price ? " · " : null}
                      {svc.price ? `$${svc.price}` : null}
                    </div>
                  </div>
                  <a href={buildBookingHref(cfg.handle, svc.id)} target="_top" rel="noopener noreferrer" style={{
                    background: cfg.brandColor || "#111827",
                    color: "white",
                    padding: "10px 14px",
                    borderRadius: 10,
                    fontWeight: 600,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}>Book</a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No services available.</p>
        )}
      </div>

      {/* Post content height to parent for auto-resize */}
      <Script id="pmuguide-embed-autosize" strategy="afterInteractive">
        {`
          (function(){
            var WID = ${JSON.stringify(wid)};
            function post(){
              try{
                var h = document.documentElement.scrollHeight;
                parent.postMessage({ type: 'pmuguide:embed:height', height: h, id: WID }, '*');
              }catch(e){}
            }
            new ResizeObserver(post).observe(document.documentElement);
            window.addEventListener('load', post);
            setTimeout(post, 50);
          })();
        `}
      </Script>
    </div>
  );
}
