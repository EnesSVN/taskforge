export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">ANKA Web</h1>
        <p className="text-sm text-neutral-600 mt-2">
          API URL: <code className="font-mono">{apiUrl}</code>
        </p>
      </div>
    </main>
  );
}
