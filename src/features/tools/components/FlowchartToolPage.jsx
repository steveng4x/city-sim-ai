import React from "react";
import { useNavigate } from "react-router-dom";
import { DataEditor } from "@/features/tools/components/DataEditor";
import { ExplainModal } from "@/features/tools/components/ExplainModal";
import { FlowchartCanvas } from "@/features/tools/components/FlowchartCanvas";
import { GenerateModal } from "@/features/tools/components/GenerateModal";
import { Toolbar } from "@/features/tools/components/Toolbar";
import { useD3Graph } from "@/features/tools/hooks/useD3Graph";
import { useFlowchartAi } from "@/features/tools/hooks/useFlowchartAi";
import { useFlowchartEditor } from "@/features/tools/hooks/useFlowchartEditor";
import { useFlowchartFiles } from "@/features/tools/hooks/useFlowchartFiles";
import { sampleFlowchartData } from "@/features/tools/utils/flowchart";

export default function FlowchartToolPage() {
  const navigate = useNavigate();
  const workspaceRef = React.useRef(null);
  const {
    editorJson,
    renderedData,
    status,
    errorMessage,
    setErrorMessage,
    updateStatus,
    loadDataIntoEditor,
    applyCurrentEditorJson,
    handleEditorChange,
    formatEditorJson,
  } = useFlowchartEditor(sampleFlowchartData);
  const {
    files,
    selectedFile,
    fileName,
    setSelectedFile,
    setFileName,
    refreshFileDirectory,
    applySelectedFile,
    saveCurrentJson,
  } = useFlowchartFiles({
    onLoadData: loadDataIntoEditor,
    onStatusChange: updateStatus,
    onErrorChange: setErrorMessage,
  });
  const {
    isGenerateOpen,
    setIsGenerateOpen,
    generatePrompt,
    setGeneratePrompt,
    isGenerateLoading,
    generateError,
    setGenerateError,
    isExplainOpen,
    setIsExplainOpen,
    isExplainLoading,
    explainContent,
    explainError,
    handleGenerateFlowchart,
    handleExplainFlowchart,
  } = useFlowchartAi({
    editorJson,
    onApplyData: loadDataIntoEditor,
    onStatusChange: updateStatus,
    onErrorChange: setErrorMessage,
  });
  const { containerRef, resetView } = useD3Graph(renderedData);
  const renderedNodeCount = renderedData?.nodes?.length || 0;
  const renderedLinkCount = renderedData?.links?.length || 0;
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isFullscreenChromeExpanded, setIsFullscreenChromeExpanded] =
    React.useState(false);
  const [isEditorVisible, setIsEditorVisible] = React.useState(true);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const nextIsFullscreen =
        document.fullscreenElement === workspaceRef.current;

      setIsFullscreen(nextIsFullscreen);
      setIsFullscreenChromeExpanded(false);
      setIsEditorVisible(!nextIsFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleSelectedFileChange = React.useCallback(
    (nextFile) => {
      setSelectedFile(nextFile);

      if (nextFile) {
        setFileName(nextFile);
      }
    },
    [setFileName, setSelectedFile],
  );

  const handleToggleFullscreen = React.useCallback(async () => {
    if (!document.fullscreenEnabled || !workspaceRef.current) {
      return;
    }

    if (document.fullscreenElement === workspaceRef.current) {
      await document.exitFullscreen();
      return;
    }

    await workspaceRef.current.requestFullscreen();
  }, []);

  const handleToggleFullscreenChrome = React.useCallback(() => {
    setIsFullscreenChromeExpanded((currentValue) => !currentValue);
  }, []);

  const handleToggleEditorVisibility = React.useCallback(() => {
    setIsEditorVisible((currentValue) => !currentValue);
  }, []);

  return (
    <div
      ref={workspaceRef}
      className={`min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-slate-100 ${isFullscreen ? "flex h-screen flex-col overflow-hidden bg-slate-950" : ""}`}
    >
      <style>{`
        textarea::-webkit-scrollbar {
          width: 8px;
        }
        textarea::-webkit-scrollbar-track {
          background: #1f2937;
        }
        textarea::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 9999px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        .node {
          cursor: grab;
        }
        .node:active {
          cursor: grabbing;
        }
        .node-shape {
          transition: filter 0.2s ease;
        }
        .node:hover .node-shape {
          filter: brightness(0.95) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
        }
        .link-path {
          transition: stroke-width 0.2s ease;
        }
        .link-group:hover .link-path {
          stroke-width: 3px;
          stroke: #64748b;
        }
      `}</style>

      <Toolbar
        status={status}
        renderedNodeCount={renderedNodeCount}
        renderedLinkCount={renderedLinkCount}
        isFullscreen={isFullscreen}
        isFullscreenChromeExpanded={isFullscreenChromeExpanded}
        isEditorVisible={isEditorVisible}
        files={files}
        selectedFile={selectedFile}
        onSelectedFileChange={handleSelectedFileChange}
        onRefresh={() => void refreshFileDirectory()}
        onApplyFile={() => void applySelectedFile()}
        fileName={fileName}
        onFileNameChange={setFileName}
        onSave={() => void saveCurrentJson(editorJson)}
        onOpenGenerate={() => setIsGenerateOpen(true)}
        onExplain={() => void handleExplainFlowchart()}
        onResetView={resetView}
        onApplyRender={applyCurrentEditorJson}
        onToggleEditorVisibility={handleToggleEditorVisibility}
        onToggleFullscreenChrome={handleToggleFullscreenChrome}
        onToggleFullscreen={() => void handleToggleFullscreen()}
        onBack={() => navigate("/")}
      />

      <main
        className={`mx-auto flex w-full flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8 ${isFullscreen ? "max-w-none overflow-hidden py-4 pt-20" : "min-h-[calc(100vh-164px)] max-w-[1680px]"}`}
      >
        <div
          className={`grid flex-1 gap-5 ${isFullscreen ? (isEditorVisible ? "min-h-0 xl:grid-cols-[minmax(380px,460px)_minmax(0,1fr)]" : "min-h-0 grid-cols-[minmax(0,1fr)]") : "xl:grid-cols-[minmax(360px,440px)_minmax(0,1fr)]"}`}
        >
          {!isFullscreen || isEditorVisible ? (
            <DataEditor
              editorJson={editorJson}
              errorMessage={errorMessage}
              onChange={handleEditorChange}
              onFormatJson={formatEditorJson}
              isFullscreen={isFullscreen}
            />
          ) : null}
          <FlowchartCanvas
            containerRef={containerRef}
            nodeCount={renderedNodeCount}
            linkCount={renderedLinkCount}
            isFullscreen={isFullscreen}
          />
        </div>
      </main>

      <GenerateModal
        open={isGenerateOpen}
        prompt={generatePrompt}
        isLoading={isGenerateLoading}
        error={generateError}
        onPromptChange={setGeneratePrompt}
        onClose={() => {
          setIsGenerateOpen(false);
          setGenerateError("");
        }}
        onGenerate={() => void handleGenerateFlowchart()}
      />

      <ExplainModal
        open={isExplainOpen}
        content={explainContent}
        error={explainError}
        isLoading={isExplainLoading}
        onClose={() => setIsExplainOpen(false)}
      />
    </div>
  );
}
