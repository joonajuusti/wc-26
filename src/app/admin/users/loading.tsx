export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <div className="mb-4 h-10 animate-pulse rounded-md bg-zinc-200" />
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="mb-2 animate-pulse rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
        >
          <div className="mb-1 h-4 w-24 rounded bg-zinc-200" />
          <div className="h-3 w-32 rounded bg-zinc-200" />
        </div>
      ))}
    </div>
  );
}
