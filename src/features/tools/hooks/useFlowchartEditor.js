import React from "react";
import {
  parseMermaidToFlowchartData,
  sampleFlowchartData,
  serializeFlowchartToMermaid,
} from "@/features/tools/utils/flowchart";

export function useFlowchartEditor(initialData = sampleFlowchartData) {
  const [editorMermaid, setEditorMermaid] = React.useState(
    serializeFlowchartToMermaid(initialData),
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

  const loadDataIntoEditor = React.useCallback((data, message) => {
    setEditorMermaid(serializeFlowchartToMermaid(data));
    setRenderedData(data);
    setErrorMessage("");
    setStatus({
      message,
      type: "success",
    });
  }, []);

  const applyCurrentEditorMermaid = React.useCallback(() => {
    try {
      const parsedData = parseMermaidToFlowchartData(editorMermaid).data;
      setRenderedData(parsedData);
      setErrorMessage("");
      setStatus({
        message: "Applied Mermaid",
        type: "success",
      });
      return parsedData;
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
      parseMermaidToFlowchartData(nextValue);
      setErrorMessage("");
      setStatus({
        message: "Unsaved changes",
        type: "warning",
      });
    } catch {
      setStatus({
        message: "Invalid Mermaid",
        type: "error",
      });
    }
  }, []);

  const formatEditorMermaid = React.useCallback(() => {
    try {
      const parsedData = parseMermaidToFlowchartData(editorMermaid).data;
      setEditorMermaid(serializeFlowchartToMermaid(parsedData));
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
