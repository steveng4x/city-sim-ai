import {
  ArrowLeft,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Maximize,
  Minimize,
  PanelLeftClose,
  PanelLeftOpen,
  FileJson,
  FolderOpen,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  getStatusClasses,
  getStatusDotClass,
} from "@/features/tools/utils/flowchart";

export function Toolbar({
  status,
  renderedNodeCount,
  renderedLinkCount,
  isFullscreen,
  isFullscreenChromeExpanded,
  isEditorVisible,
  files,
  selectedFile,
  onSelectedFileChange,
  onRefresh,
  onApplyFile,
  fileName,
  onFileNameChange,
  onSave,
  onOpenGenerate,
  onExplain,
  onResetView,
  onApplyRender,
  onToggleEditorVisibility,
  onToggleFullscreenChrome,
  onToggleFullscreen,
  onBack,
}) {
  if (isFullscreen) {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-none flex-col gap-3">
          <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/78 px-4 py-3 shadow-[0_18px_60px_rgba(2,6,23,0.48)] backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-300">
                <FileJson size={13} />
                Flowchart
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  JSON Flowchart Visualizer
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 font-medium ${getStatusClasses(status.type)}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${getStatusDotClass(status.type)}`}
                    />
                    {status.message}
                  </span>
                  <span>{renderedNodeCount} nodes</span>
                  <span>{renderedLinkCount} links</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={onToggleEditorVisibility}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
              >
                {isEditorVisible ? (
                  <PanelLeftClose size={14} />
                ) : (
                  <PanelLeftOpen size={14} />
                )}
                {isEditorVisible ? "Hide Editor" : "Show Editor"}
              </button>
              <button
                type="button"
                onClick={onToggleFullscreenChrome}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
              >
                {isFullscreenChromeExpanded ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
                {isFullscreenChromeExpanded ? "Hide Controls" : "Show Controls"}
              </button>
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
              >
                <Minimize size={14} />
                Exit Fullscreen
              </button>
            </div>
          </div>

          {isFullscreenChromeExpanded ? (
            <div className="pointer-events-auto grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/78 p-3 shadow-[0_18px_60px_rgba(2,6,23,0.48)] backdrop-blur-xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  File Source
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedFile}
                    onChange={(event) =>
                      onSelectedFileChange(event.target.value)
                    }
                    className="min-w-52 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500"
                  >
                    <option value="">Choose JSON file</option>
                    {files.map((currentFile) => (
                      <option key={currentFile} value={currentFile}>
                        {currentFile}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={onRefresh}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
                  >
                    <RefreshCw size={14} />
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={onApplyFile}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-500/15 px-3 py-2.5 text-sm font-medium text-sky-300 transition hover:bg-sky-500/25"
                  >
                    <FolderOpen size={14} />
                    Apply File
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/78 p-3 shadow-[0_18px_60px_rgba(2,6,23,0.48)] backdrop-blur-xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Save Target
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={fileName}
                    onChange={(event) => onFileNameChange(event.target.value)}
                    placeholder="flowchart-name.json"
                    className="min-w-52 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={onSave}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500/15 px-3 py-2.5 text-sm font-medium text-amber-300 transition hover:bg-amber-500/25"
                  >
                    <Save size={14} />
                    Save JSON
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/78 p-3 shadow-[0_18px_60px_rgba(2,6,23,0.48)] backdrop-blur-xl xl:min-w-[328px]">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Actions
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenGenerate}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-violet-600 hover:to-indigo-700"
                  >
                    <Sparkles size={14} />
                    Generate
                  </button>
                  <button
                    type="button"
                    onClick={onExplain}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-emerald-600 hover:to-teal-700"
                  >
                    <BrainCircuit size={14} />
                    Explain
                  </button>
                  <button
                    type="button"
                    onClick={onResetView}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
                  >
                    <RotateCcw size={14} />
                    Reset View
                  </button>
                  <button
                    type="button"
                    onClick={onApplyRender}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
                  >
                    <Wand2 size={14} />
                    Apply and Render
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-slate-800/80 bg-slate-950/75 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <header className="mx-auto flex w-full max-w-[1680px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
                  <FileJson size={14} />
                  Flowchart Tool
                </div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${getStatusClasses(status.type)}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${getStatusDotClass(status.type)}`}
                  />
                  {status.message}
                </span>
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-white sm:text-xl">
                  JSON Flowchart Visualizer
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-400">
                  Edit structured flowchart JSON, render it live, and use AI to
                  generate or explain the process without leaving the workspace.
                </p>
              </div>
            </div>
          </div>

          <div className="grid min-w-[240px] grid-cols-2 gap-3 self-stretch sm:min-w-[280px]">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Nodes
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {renderedNodeCount}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Links
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {renderedLinkCount}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              File Source
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedFile}
                onChange={(event) => onSelectedFileChange(event.target.value)}
                className="min-w-52 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500"
              >
                <option value="">Choose JSON file</option>
                {files.map((currentFile) => (
                  <option key={currentFile} value={currentFile}>
                    {currentFile}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
              <button
                type="button"
                onClick={onApplyFile}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500/15 px-3 py-2.5 text-sm font-medium text-sky-300 transition hover:bg-sky-500/25"
              >
                <FolderOpen size={14} />
                Apply File
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Save Target
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={fileName}
                onChange={(event) => onFileNameChange(event.target.value)}
                placeholder="flowchart-name.json"
                className="min-w-52 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-amber-500"
              />
              <button
                type="button"
                onClick={onSave}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500/15 px-3 py-2.5 text-sm font-medium text-amber-300 transition hover:bg-amber-500/25"
              >
                <Save size={14} />
                Save JSON
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] xl:min-w-[328px]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Actions
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenGenerate}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-violet-600 hover:to-indigo-700"
              >
                <Sparkles size={14} />
                Generate
              </button>
              <button
                type="button"
                onClick={onExplain}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-emerald-600 hover:to-teal-700"
              >
                <BrainCircuit size={14} />
                Explain
              </button>
              <button
                type="button"
                onClick={onResetView}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
              >
                <RotateCcw size={14} />
                Reset View
              </button>
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
              >
                {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>
              <button
                type="button"
                onClick={onApplyRender}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
              >
                <Wand2 size={14} />
                Apply and Render
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
