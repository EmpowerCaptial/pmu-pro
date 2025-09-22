// app/dashboard/marketing/connections/page.tsx
import { Suspense } from 'react';
import ConnectionsClient from './ConnectionsClient';

export default function ConnectionsPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Marketing Connections</h1>
      <p className="opacity-80 mb-6">Connect your Google Ads and Meta accounts to run campaigns inside PMU Guide.</p>
      <Suspense><ConnectionsClient /></Suspense>
    </main>
  );
}

