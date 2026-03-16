export function DataEditor({
  editorJson,
  errorMessage,
  onChange,
  onFormatJson,
  isFullscreen = false,
}) {
  return (
    <section
      className={`relative flex min-h-[420px] flex-col overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/80 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur ${isFullscreen ? "min-h-0 h-full" : ""}`}
    >
      <div className="border-b border-slate-800 bg-slate-900/90 px-5 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Data Editor
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Modify the underlying flowchart JSON and render changes when
              ready.
            </p>
          </div>
          <button
            type="button"
            onClick={onFormatJson}
            className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200 transition hover:border-violet-400/40 hover:bg-violet-500/15"
          >
            Format JSON
          </button>
        </div>
      </div>
      <div className="relative flex-1 bg-slate-950/55">
        <textarea
          value={editorJson}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          className="absolute inset-0 h-full w-full resize-none bg-transparent p-5 font-mono text-sm leading-7 text-emerald-300 outline-none"
        />
      </div>
      {errorMessage ? (
        <div className="border-t border-red-900/80 bg-red-950/60 px-5 py-4 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}
    </section>
  );
}
