'use client';

import { useEffect, useState } from 'react';

type Conn = { 
  id: string; 
  platform: 'google'|'meta'|string; 
  accountId?: string|null; 
  accountName?: string|null; 
  updatedAt: string; 
};

export default function ConnectionsClient() {
  const [rows, setRows] = useState<Conn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/marketing/connections', { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        setRows(j);
      } else {
        console.error('Failed to load connections:', r.status, r.statusText);
        setError(`Failed to load connections: ${r.status} ${r.statusText}`);
        setRows([]);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
      setError('Error loading connections. Please check your environment variables.');
      setRows([]);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const connectGoogle = () => window.location.href = '/api/oauth/google/authorize';
  const connectMeta = () => window.location.href = '/api/oauth/meta/authorize';

  const disconnect = async (platform: string) => {
    try {
      const response = await fetch('/api/marketing/connections/disconnect', {
        method: 'POST', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify({ platform })
      });
      
      if (response.ok) {
        load(); // Reload connections
      } else {
        console.error('Failed to disconnect:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const has = (p: string) => rows.some(r => r.platform === p);

  if (loading) {
    return <div className="text-center py-8">Loading connections...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="text-red-800 font-semibold mb-2">Connection Error</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <p className="text-gray-600 text-xs">
            Please add the NEON_DATABASE_URL environment variable to your .env.local file.
          </p>
          <button 
            onClick={load}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Google Ads</div>
            <div className="text-sm opacity-70">{has('google') ? 'Connected' : 'Not connected'}</div>
          </div>
          {has('google')
            ? <button onClick={()=>disconnect('google')} className="px-4 py-2 rounded-lg border">Disconnect</button>
            : <button onClick={connectGoogle} className="px-4 py-2 rounded-lg bg-black text-white">Connect</button>}
        </div>
        <ul className="mt-4 text-sm space-y-1">
          {rows.filter(r=>r.platform==='google').map(r=>(
            <li key={r.id} className="opacity-80">Account: {r.accountId ?? '—'} · {r.accountName ?? '—'} · Updated: {new Date(r.updatedAt).toLocaleString()}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Meta (Facebook/Instagram)</div>
            <div className="text-sm opacity-70">{has('meta') ? 'Connected' : 'Not connected'}</div>
          </div>
          {has('meta')
            ? <button onClick={()=>disconnect('meta')} className="px-4 py-2 rounded-lg border">Disconnect</button>
            : <button onClick={connectMeta} className="px-4 py-2 rounded-lg bg-black text-white">Connect</button>}
        </div>
        <ul className="mt-4 text-sm space-y-1">
          {rows.filter(r=>r.platform==='meta').map(r=>(
            <li key={r.id} className="opacity-80">Account: {r.accountId ?? '—'} · {r.accountName ?? '—'} · Updated: {new Date(r.updatedAt).toLocaleString()}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
