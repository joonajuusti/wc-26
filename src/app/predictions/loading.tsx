export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-6">
          <div className="mb-3 h-4 w-32 animate-pulse rounded bg-zinc-200" />
          <div className="space-y-8">
            <div className="animate-pulse rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex gap-3">
                <div className="h-10 flex-1 rounded-md bg-zinc-100" />
                <div className="h-10 flex-1 rounded-md bg-zinc-100" />
                <div className="h-10 flex-1 rounded-md bg-zinc-100" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
