import React from "react";
import {
  parseFlowchartJson,
  sampleFlowchartData,
} from "@/features/tools/utils/flowchart";

export function useFlowchartEditor(initialData = sampleFlowchartData) {
  const [editorJson, setEditorJson] = React.useState(
    JSON.stringify(initialData, null, 4),
  );
  const [renderedData, setRenderedData] = React.useState(initialData);
  const [status, setStatus] = React.useState({
    message: "Valid JSON",
    type: "success",
  });
  const [errorMessage, setErrorMessage] = React.useState("");

  const updateStatus = React.useCallback((message, type = "info") => {
    setStatus({ message, type });
  }, []);

  const loadDataIntoEditor = React.useCallback((data, message) => {
    setEditorJson(JSON.stringify(data, null, 4));
    setRenderedData(data);
    setErrorMessage("");
    setStatus({
      message,
      type: "success",
    });
  }, []);

  const applyCurrentEditorJson = React.useCallback(() => {
    try {
      const parsedData = parseFlowchartJson(editorJson);
      setRenderedData(parsedData);
      setErrorMessage("");
      setStatus({
        message: "Applied JSON",
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
  }, [editorJson]);

  const handleEditorChange = React.useCallback((nextValue) => {
    setEditorJson(nextValue);

    try {
      JSON.parse(nextValue);
      setErrorMessage("");
      setStatus({
        message: "Unsaved changes",
        type: "warning",
      });
    } catch {
      setStatus({
        message: "Invalid JSON",
        type: "error",
      });
    }
  }, []);

  const formatEditorJson = React.useCallback(() => {
    try {
      const parsedData = parseFlowchartJson(editorJson);
      setEditorJson(JSON.stringify(parsedData, null, 4));
      setErrorMessage("");
      setStatus({
        message: "Formatted JSON",
        type: "info",
      });
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
      setStatus({
        message: "Invalid JSON",
        type: "error",
      });
    }
  }, [editorJson]);

  return {
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
  };
}
