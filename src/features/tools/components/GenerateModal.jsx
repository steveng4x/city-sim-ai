import { Sparkles } from "lucide-react";
import { Modal } from "@/features/tools/components/Modal";
import { Spinner } from "@/features/tools/components/Spinner";

export function GenerateModal({
  open,
  prompt,
  isLoading,
  error,
  onPromptChange,
  onClose,
  onGenerate,
}) {
  return (
    <Modal
      open={open}
      title="Generate Flowchart"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onGenerate}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles size={14} />
            Generate
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Describe a process and the AI will generate the corresponding
          flowchart Mermaid.
        </p>
        <textarea
          rows={4}
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder="For example: user login with forgot password and verification flow"
          className="w-full resize-none rounded-lg border border-slate-300 p-3 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <Spinner accentClass="border-t-violet-600" />
            <p className="text-sm font-medium text-violet-700">
              Drafting flowchart
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
