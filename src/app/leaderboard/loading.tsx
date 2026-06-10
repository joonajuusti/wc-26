export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="divide-y divide-zinc-200">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-pulse rounded bg-zinc-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
              </div>
              <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
