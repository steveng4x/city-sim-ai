import React from "react";
import {
  FLOWCHART_MERMAID_DEFAULT_DIRECTION,
  parseMermaidToFlowchartData,
  sampleFlowchartData,
  serializeFlowchartToMermaid,
} from "@/features/tools/utils/flowchart";

export function useFlowchartEditor(initialData = sampleFlowchartData) {
  const [mermaidDirection, setMermaidDirection] = React.useState(
    FLOWCHART_MERMAID_DEFAULT_DIRECTION,
  );
  const [editorMermaid, setEditorMermaid] = React.useState(
    serializeFlowchartToMermaid(initialData, {
      direction: FLOWCHART_MERMAID_DEFAULT_DIRECTION,
    }),
  );
  const [renderedData, setRenderedData] = React.useState(initialData);
  const [status, setStatus] = React.useState({
    message: "Valid Mermaid",
    type: "success",
  });
  const [errorMessage, setErrorMessage] = React.useState("");

  const updateStatus = React.useCallback((message, type = "info") => {
    setStatus({ message, type });
  }, []);

  const loadDataIntoEditor = React.useCallback(
    (data, message, options = {}) => {
      const nextDirection =
        options.direction || FLOWCHART_MERMAID_DEFAULT_DIRECTION;
      const canUseSourceText =
        options.sourceFormat === "mermaid" &&
        typeof options.sourceText === "string" &&
        options.sourceText.trim().length > 0;

      setMermaidDirection(nextDirection);
      setEditorMermaid(
        (canUseSourceText ? options.sourceText : null) ||
          serializeFlowchartToMermaid(data, { direction: nextDirection }),
      );
      setRenderedData(data);
      setErrorMessage("");
      setStatus({
        message,
        type: "success",
      });
    },
    [],
  );

  const applyCurrentEditorMermaid = React.useCallback(() => {
    try {
      const parsedMermaid = parseMermaidToFlowchartData(editorMermaid);
      setRenderedData(parsedMermaid.data);
      setMermaidDirection(parsedMermaid.direction);
      setErrorMessage("");
      setStatus({
        message: "Applied Mermaid",
        type: "success",
      });
      return parsedMermaid.data;
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
      setStatus({
        message: "Invalid format",
        type: "error",
      });
      return null;
    }
  }, [editorMermaid]);

  const handleEditorChange = React.useCallback((nextValue) => {
    setEditorMermaid(nextValue);

    try {
      const parsedMermaid = parseMermaidToFlowchartData(nextValue);
      setMermaidDirection(parsedMermaid.direction);
      setErrorMessage("");
      setStatus({
        message: "Unsaved changes",
        type: "warning",
      });
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
      setStatus({
        message: "Invalid Mermaid",
        type: "error",
      });
    }
  }, []);

  const formatEditorMermaid = React.useCallback(() => {
    try {
      const parsedMermaid = parseMermaidToFlowchartData(editorMermaid);
      setMermaidDirection(parsedMermaid.direction);
      setEditorMermaid(
        serializeFlowchartToMermaid(parsedMermaid.data, {
          direction: parsedMermaid.direction,
        }),
      );
      setErrorMessage("");
      setStatus({
        message: "Formatted Mermaid",
        type: "info",
      });
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
      setStatus({
        message: "Invalid Mermaid",
        type: "error",
      });
    }
  }, [editorMermaid]);

  return {
    editorMermaid,
    mermaidDirection,
    editorJson: editorMermaid,
    renderedData,
    status,
    errorMessage,
    setErrorMessage,
    updateStatus,
    loadDataIntoEditor,
    applyCurrentEditorMermaid,
    applyCurrentEditorJson: applyCurrentEditorMermaid,
    handleEditorChange,
    formatEditorMermaid,
    formatEditorJson: formatEditorMermaid,
  };
}
