export function Spinner({ accentClass = "border-t-violet-600" }) {
  return (
    <div
      className={`h-8 w-8 animate-spin rounded-full border-4 border-slate-200 ${accentClass}`}
      aria-hidden="true"
    />
  );
}
