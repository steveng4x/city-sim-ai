import React from "react";
import {
  listFlowchartFiles,
  loadFlowchartFile,
  saveFlowchartFile,
} from "@/features/tools/utils/flowchartApi";
import {
  normalizeFileName,
  parseFlowchartJson,
} from "@/features/tools/utils/flowchart";

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
            ? `Found ${availableFiles.length} JSON file${availableFiles.length === 1 ? "" : "s"}`
            : "JSON directory is empty",
          availableFiles.length ? "info" : "warning",
        );
      } catch {
        onStatusChange("JSON directory unavailable", "warning");
      }
    },
    [fileName, onStatusChange, selectedFile],
  );

  const applySelectedFile = React.useCallback(async () => {
    const targetFile = selectedFile || normalizeFileName(fileName);

    if (!targetFile) {
      onStatusChange("Select a file to apply", "warning");
      return;
    }

    try {
      const { data } = await loadFlowchartFile(targetFile);
      onLoadData(data, `Applied ${targetFile}`);
      setSelectedFile(targetFile);
      setFileName(targetFile);
      onErrorChange("");
    } catch (error) {
      onStatusChange(error.message, "error");
    }
  }, [fileName, onErrorChange, onLoadData, onStatusChange, selectedFile]);

  const saveCurrentJson = React.useCallback(
    async (editorJson) => {
      const targetFile = normalizeFileName(fileName || selectedFile);

      if (!targetFile) {
        onStatusChange("Enter a file name before saving", "warning");
        return;
      }

      try {
        const parsedData = parseFlowchartJson(editorJson);
        await saveFlowchartFile(targetFile, parsedData);
        setSelectedFile(targetFile);
        setFileName(targetFile);
        onErrorChange("");
        await refreshFileDirectory(targetFile);
        onStatusChange(`Saved ${targetFile}`, "success");
      } catch (error) {
        onStatusChange(
          error instanceof SyntaxError
            ? "Fix invalid JSON before saving"
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
          onStatusChange("JSON directory is empty", "warning");
          return;
        }

        const firstFile = availableFiles[0];
        setSelectedFile(firstFile);
        setFileName(firstFile);

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

        onStatusChange("JSON directory unavailable", "warning");
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
    saveCurrentJson,
  };
}
