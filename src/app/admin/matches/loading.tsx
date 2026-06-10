export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <div className="mb-4">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="mb-3 animate-pulse rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
        >
          <div className="mb-2 h-3 w-24 rounded bg-zinc-200" />
          <div className="flex gap-2">
            <div className="h-8 flex-1 rounded bg-zinc-100" />
            <div className="h-8 w-6 rounded bg-zinc-100" />
            <div className="h-8 flex-1 rounded bg-zinc-100" />
          </div>
          <div className="mt-2 flex gap-2">
            <div className="h-7 flex-1 rounded bg-zinc-100" />
            <div className="h-7 flex-1 rounded bg-zinc-100" />
            <div className="h-7 flex-1 rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
