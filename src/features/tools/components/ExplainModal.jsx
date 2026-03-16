import ReactMarkdown from "react-markdown";
import { Modal } from "@/features/tools/components/Modal";
import { Spinner } from "@/features/tools/components/Spinner";

export function ExplainModal({ open, content, error, isLoading, onClose }) {
  return (
    <Modal
      open={open}
      title="Process Explanation"
      maxWidth="max-w-3xl"
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Close
          </button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <Spinner accentClass="border-t-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">
            Analyzing flowchart
          </p>
        </div>
      ) : null}

      {!isLoading && content ? (
        <div className="prose prose-slate max-w-none text-sm leading-relaxed prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-li:text-slate-700">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}
    </Modal>
  );
}
