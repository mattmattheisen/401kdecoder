'use client';
import { useState } from 'react';
import UploadZone from '../components/UploadZone';
import Results from '../components/Results';

export default function Page() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(files) {
    setError('');
    setLoading(true);
    setResult(null);
    const fd = new FormData();
    for (const f of files) fd.append('files', f);
    try {
      const res = await fetch('/api/parse', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Parsing failed');
      const data = await res.json();
      setResult(data);
    } catch (e) { setError(e.message || 'Something went wrong'); }
    finally { setLoading(false); }
  }

  return (
    <main className="space-y-6">
      <section className="card p-6">
        <h2 className="text-xl font-semibold mb-2">Upload your statement</h2>
        <p className="text-sm text-slate-400 mb-4">PDF or image. We’ll estimate total costs and show your allocation.</p>
        <UploadZone onDrop={handleFiles} loading={loading} />
        {error && <p className="text-red-400 mt-3">{error}</p>}
      </section>

      {result && <Results data={result} />}
    </main>
  );
}
