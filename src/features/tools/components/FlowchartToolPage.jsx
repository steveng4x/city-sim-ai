import React from "react";
import { useNavigate } from "react-router-dom";
import { DataEditor } from "@/features/tools/components/DataEditor";
import { ExplainModal } from "@/features/tools/components/ExplainModal";
import { ReactFlowCanvas } from "@/features/tools/components/ReactFlowCanvas";
import { GenerateModal } from "@/features/tools/components/GenerateModal";
import { Toolbar } from "@/features/tools/components/Toolbar";
import { useFlowchartAi } from "@/features/tools/hooks/useFlowchartAi";
import { useFlowchartEditor } from "@/features/tools/hooks/useFlowchartEditor";
import { useFlowchartFiles } from "@/features/tools/hooks/useFlowchartFiles";
import {
  FLOWCHART_LAYOUT_DIRECTIONS,
  sampleFlowchartData,
} from "@/features/tools/utils/flowchart";

export default function FlowchartToolPage() {
  const navigate = useNavigate();
  const workspaceRef = React.useRef(null);
  const {
    editorMermaid,
    renderedData,
    status,
    errorMessage,
    setErrorMessage,
    updateStatus,
    loadDataIntoEditor,
    applyCurrentEditorMermaid,
    handleEditorChange,
    formatEditorMermaid,
  } = useFlowchartEditor(sampleFlowchartData);
  const {
    files,
    selectedFile,
    fileName,
    setSelectedFile,
    setFileName,
    refreshFileDirectory,
    applySelectedFile,
    saveCurrentMermaid,
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
    editorMermaid,
    onApplyData: loadDataIntoEditor,
    onStatusChange: updateStatus,
    onErrorChange: setErrorMessage,
  });
  const canvasRef = React.useRef(null);
  const resetView = React.useCallback(() => canvasRef.current?.resetView(), []);
  const renderedNodeCount = renderedData?.nodes?.length || 0;
  const renderedLinkCount = renderedData?.links?.length || 0;
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isFullscreenChromeExpanded, setIsFullscreenChromeExpanded] =
    React.useState(false);
  const [isEditorVisible, setIsEditorVisible] = React.useState(true);
  const [layoutDirection, setLayoutDirection] = React.useState(
    FLOWCHART_LAYOUT_DIRECTIONS.horizontal,
  );

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

  const handleLayoutDirectionChange = React.useCallback(
    (nextDirection) => {
      setLayoutDirection(nextDirection);
      updateStatus(
        nextDirection === FLOWCHART_LAYOUT_DIRECTIONS.vertical
          ? "Vertical flow layout applied"
          : "Horizontal flow layout applied",
        "info",
      );
    },
    [updateStatus],
  );

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

      `}</style>

      <Toolbar
        status={status}
        renderedNodeCount={renderedNodeCount}
        renderedLinkCount={renderedLinkCount}
        isFullscreen={isFullscreen}
        isFullscreenChromeExpanded={isFullscreenChromeExpanded}
        isEditorVisible={isEditorVisible}
        layoutDirection={layoutDirection}
        files={files}
        selectedFile={selectedFile}
        onSelectedFileChange={handleSelectedFileChange}
        onRefresh={() => void refreshFileDirectory()}
        onApplyFile={() => void applySelectedFile()}
        fileName={fileName}
        onFileNameChange={setFileName}
        onSave={() => void saveCurrentMermaid(editorMermaid)}
        onOpenGenerate={() => setIsGenerateOpen(true)}
        onExplain={() => void handleExplainFlowchart()}
        onResetView={resetView}
        onApplyRender={applyCurrentEditorMermaid}
        onLayoutDirectionChange={handleLayoutDirectionChange}
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
              editorMermaid={editorMermaid}
              errorMessage={errorMessage}
              onChange={handleEditorChange}
              onFormatMermaid={formatEditorMermaid}
              isFullscreen={isFullscreen}
            />
          ) : null}
          <ReactFlowCanvas
            ref={canvasRef}
            data={renderedData}
            nodeCount={renderedNodeCount}
            linkCount={renderedLinkCount}
            isFullscreen={isFullscreen}
            orientation={layoutDirection}
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
