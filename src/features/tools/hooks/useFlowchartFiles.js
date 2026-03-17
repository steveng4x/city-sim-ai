import React from "react";
import {
  listFlowchartFiles,
  loadFlowchartFile,
  saveFlowchartFile,
} from "@/features/tools/utils/flowchartApi";
import {
  normalizeMermaidFileName,
  parseMermaidToFlowchartData,
} from "@/features/tools/utils/flowchart";

function getMermaidSaveTarget(fileName = "") {
  const trimmed = String(fileName || "").trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.endsWith(".json")) {
    return normalizeMermaidFileName(trimmed.slice(0, -5));
  }

  return normalizeMermaidFileName(trimmed);
}

export function useFlowchartFiles({
  onLoadData,
  onStatusChange,
  onErrorChange,
}) {
  const [files, setFiles] = React.useState([]);
  const [selectedFile, setSelectedFile] = React.useState("");
  const [fileName, setFileName] = React.useState("");

  const refreshFileDirectory = React.useCallback(
    async (preferredFileName = "") => {
      try {
        const { files: availableFiles } = await listFlowchartFiles();
        const nextSelectedFile =
          preferredFileName && availableFiles.includes(preferredFileName)
            ? preferredFileName
            : selectedFile && availableFiles.includes(selectedFile)
              ? selectedFile
              : availableFiles[0] || "";

        setFiles(availableFiles);
        setSelectedFile(nextSelectedFile);

        if (!fileName && nextSelectedFile) {
          setFileName(nextSelectedFile);
        }

        onStatusChange(
          availableFiles.length
            ? `Found ${availableFiles.length} flowchart file${availableFiles.length === 1 ? "" : "s"}`
            : "Flowchart directory is empty",
          availableFiles.length ? "info" : "warning",
        );
      } catch {
        onStatusChange("Flowchart directory unavailable", "warning");
      }
    },
    [fileName, onStatusChange, selectedFile],
  );

  const applySelectedFile = React.useCallback(async () => {
    const targetFile = selectedFile || fileName.trim();

    if (!targetFile) {
      onStatusChange("Select a file to apply", "warning");
      return;
    }

    try {
      const { data } = await loadFlowchartFile(targetFile);
      onLoadData(data, `Applied ${targetFile}`);
      setSelectedFile(targetFile);
      setFileName(getMermaidSaveTarget(targetFile));
      onErrorChange("");
    } catch (error) {
      onStatusChange(error.message, "error");
    }
  }, [fileName, onErrorChange, onLoadData, onStatusChange, selectedFile]);

  const saveCurrentMermaid = React.useCallback(
    async (editorMermaid) => {
      const targetFile = getMermaidSaveTarget(fileName || selectedFile);

      if (!targetFile) {
        onStatusChange("Enter a file name before saving", "warning");
        return;
      }

      try {
        parseMermaidToFlowchartData(editorMermaid);
        await saveFlowchartFile(targetFile, editorMermaid, "mermaid");
        setSelectedFile(targetFile);
        setFileName(targetFile);
        onErrorChange("");
        await refreshFileDirectory(targetFile);
        onStatusChange(`Saved ${targetFile}`, "success");
      } catch (error) {
        onStatusChange(
          error instanceof SyntaxError
            ? "Fix invalid Mermaid before saving"
            : error.message,
          "error",
        );
      }
    },
    [
      fileName,
      onErrorChange,
      onStatusChange,
      refreshFileDirectory,
      selectedFile,
    ],
  );

  React.useEffect(() => {
    let isActive = true;

    const initializeFiles = async () => {
      try {
        const { files: availableFiles } = await listFlowchartFiles();

        if (!isActive) {
          return;
        }

        setFiles(availableFiles);

        if (availableFiles.length === 0) {
          onStatusChange("Flowchart directory is empty", "warning");
          return;
        }

        const firstFile = availableFiles[0];
        setSelectedFile(firstFile);
  setFileName(getMermaidSaveTarget(firstFile));

        const { data } = await loadFlowchartFile(firstFile);

        if (!isActive) {
          return;
        }

        onLoadData(data, `Applied ${firstFile}`);
        onErrorChange("");
      } catch {
        if (!isActive) {
          return;
        }

        onStatusChange("Flowchart directory unavailable", "warning");
      }
    };

    void initializeFiles();

    return () => {
      isActive = false;
    };
  }, [onErrorChange, onLoadData, onStatusChange]);

  return {
    files,
    selectedFile,
    fileName,
    setSelectedFile,
    setFileName,
    refreshFileDirectory,
    applySelectedFile,
    saveCurrentMermaid,
    saveCurrentJson: saveCurrentMermaid,
  };
}
