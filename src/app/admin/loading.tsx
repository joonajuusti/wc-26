export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <div className="mb-6 grid grid-cols-2 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
          />
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}
