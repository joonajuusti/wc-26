export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="h-16 animate-pulse rounded-lg bg-blue-50" />
        <div className="h-16 animate-pulse rounded-lg bg-blue-50" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="mb-3 animate-pulse rounded-lg border border-zinc-200 bg-white p-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 h-3 w-20 rounded bg-zinc-200" />
              <div className="h-4 w-40 rounded bg-zinc-200" />
            </div>
            <div className="h-4 w-8 rounded bg-zinc-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
