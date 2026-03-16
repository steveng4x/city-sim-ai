import React from "react";
import {
  explainFlowchartJson,
  generateFlowchartFromPrompt,
} from "@/features/tools/utils/flowchartApi";

export function useFlowchartAi({
  editorJson,
  onApplyData,
  onStatusChange,
  onErrorChange,
}) {
  const [isGenerateOpen, setIsGenerateOpen] = React.useState(false);
  const [generatePrompt, setGeneratePrompt] = React.useState("");
  const [isGenerateLoading, setIsGenerateLoading] = React.useState(false);
  const [generateError, setGenerateError] = React.useState("");
  const [isExplainOpen, setIsExplainOpen] = React.useState(false);
  const [isExplainLoading, setIsExplainLoading] = React.useState(false);
  const [explainContent, setExplainContent] = React.useState("");
  const [explainError, setExplainError] = React.useState("");
  const generateAbortRef = React.useRef(null);
  const explainAbortRef = React.useRef(null);

  const handleGenerateFlowchart = React.useCallback(async () => {
    const prompt = generatePrompt.trim();

    if (!prompt) {
      return;
    }

    generateAbortRef.current?.abort();
    const controller = new AbortController();
    generateAbortRef.current = controller;

    setIsGenerateLoading(true);
    setGenerateError("");

    try {
      const result = await generateFlowchartFromPrompt(prompt, {
        signal: controller.signal,
      });

      onApplyData(result.data, "Generated and applied flowchart");
      onErrorChange("");
      setGeneratePrompt("");
      setIsGenerateOpen(false);
      onStatusChange("Generated and applied flowchart", "success");
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      setGenerateError(`Failed to generate flowchart. ${error.message}`);
    } finally {
      if (generateAbortRef.current === controller) {
        generateAbortRef.current = null;
      }

      setIsGenerateLoading(false);
    }
  }, [generatePrompt, onApplyData, onErrorChange, onStatusChange]);

  const handleExplainFlowchart = React.useCallback(async () => {
    explainAbortRef.current?.abort();
    const controller = new AbortController();
    explainAbortRef.current = controller;

    setIsExplainOpen(true);
    setIsExplainLoading(true);
    setExplainContent("");
    setExplainError("");

    try {
      const result = await explainFlowchartJson(editorJson, {
        signal: controller.signal,
      });
      setExplainContent(result.content);
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      setExplainError(`Failed to explain flowchart. ${error.message}`);
    } finally {
      if (explainAbortRef.current === controller) {
        explainAbortRef.current = null;
      }

      setIsExplainLoading(false);
    }
  }, [editorJson]);

  React.useEffect(() => {
    return () => {
      generateAbortRef.current?.abort();
      explainAbortRef.current?.abort();
    };
  }, []);

  return {
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
  };
}
