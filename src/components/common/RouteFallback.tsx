export function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" aria-label="Loading" />
    </div>
  );
}
