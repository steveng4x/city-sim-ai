import React from "react";
import {
  listFlowchartFiles,
  loadFlowchartFile,
  saveFlowchartFile,
} from "@/features/tools/utils/flowchartApi";
import {
  normalizeMermaidFileName,
  parseFlowchartSource,
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

const DEFAULT_SOURCE_FOLDER = "json";
const LOCAL_SOURCE_PREFIX = "__local__::";

function isLocalSourceFolder(folderName = "") {
  return String(folderName || "").startsWith(LOCAL_SOURCE_PREFIX);
}

function getLocalSourceValue(directoryName = "") {
  return `${LOCAL_SOURCE_PREFIX}${String(directoryName || "Local folder")}`;
}

function getSourceFolderLabel(folderName = "") {
  const normalizedFolderName = String(folderName || "").trim();

  if (!normalizedFolderName) {
    return DEFAULT_SOURCE_FOLDER;
  }

  if (isLocalSourceFolder(normalizedFolderName)) {
    return `Local: ${normalizedFolderName.slice(LOCAL_SOURCE_PREFIX.length)}`;
  }

  return normalizedFolderName;
}

function buildFolderOptions(workspaceFolders = [], localFolder = "") {
  const uniqueFolders = Array.from(
    new Set([
      ...workspaceFolders.filter(Boolean),
      ...(localFolder ? [localFolder] : []),
    ]),
  );

  return uniqueFolders.map((folder) => ({
    value: folder,
    label: getSourceFolderLabel(folder),
  }));
}

async function getLocalFlowchartEntries(directoryHandle) {
  const fileHandles = new Map();
  const fileNames = [];

  for await (const entry of directoryHandle.values()) {
    if (
      entry.kind === "file" &&
      (entry.name.endsWith(".json") || entry.name.endsWith(".mmd"))
    ) {
      fileHandles.set(entry.name, entry);
      fileNames.push(entry.name);
    }
  }

  fileNames.sort((left, right) => left.localeCompare(right));

  return {
    fileNames,
    fileHandles,
  };
}

export function useFlowchartFiles({
  onLoadData,
  onStatusChange,
  onErrorChange,
}) {
  const [workspaceFolders, setWorkspaceFolders] = React.useState([
    DEFAULT_SOURCE_FOLDER,
  ]);
  const [localFolder, setLocalFolder] = React.useState("");
  const [selectedFolder, setSelectedFolder] = React.useState(
    DEFAULT_SOURCE_FOLDER,
  );
  const [files, setFiles] = React.useState([]);
  const [selectedFile, setSelectedFile] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const localDirectoryHandleRef = React.useRef(null);
  const localFileHandlesRef = React.useRef(new Map());
  const folderOptions = React.useMemo(
    () => buildFolderOptions(workspaceFolders, localFolder),
    [localFolder, workspaceFolders],
  );

  const refreshFileDirectory = React.useCallback(
    async (preferredFileName = "", preferredFolder = selectedFolder) => {
      if (isLocalSourceFolder(preferredFolder)) {
        const localDirectoryHandle = localDirectoryHandleRef.current;

        if (!localDirectoryHandle) {
          onStatusChange(
            "Local flowchart folder is no longer available",
            "warning",
          );
          return;
        }

        try {
          const { fileNames, fileHandles } =
            await getLocalFlowchartEntries(localDirectoryHandle);
          const nextSelectedFile =
            preferredFileName && fileNames.includes(preferredFileName)
              ? preferredFileName
              : selectedFile && fileNames.includes(selectedFile)
                ? selectedFile
                : fileNames[0] || "";

          localFileHandlesRef.current = fileHandles;
          setSelectedFolder(preferredFolder);
          setFiles(fileNames);
          setSelectedFile(nextSelectedFile);

          if (!fileName && nextSelectedFile) {
            setFileName(nextSelectedFile);
          }

          onStatusChange(
            fileNames.length
              ? `Found ${fileNames.length} flowchart file${fileNames.length === 1 ? "" : "s"} in ${getSourceFolderLabel(preferredFolder)}`
              : `${getSourceFolderLabel(preferredFolder)} is empty`,
            fileNames.length ? "info" : "warning",
          );
        } catch (error) {
          onStatusChange(
            error.message || "Unable to read the local flowchart folder",
            "error",
          );
        }

        return;
      }

      try {
        const {
          files: availableFiles,
          folders: availableFolders = [DEFAULT_SOURCE_FOLDER],
          folder: activeFolder = preferredFolder,
        } = await listFlowchartFiles(preferredFolder);
        const nextSelectedFile =
          preferredFileName && availableFiles.includes(preferredFileName)
            ? preferredFileName
            : selectedFile && availableFiles.includes(selectedFile)
              ? selectedFile
              : availableFiles[0] || "";

        setWorkspaceFolders(availableFolders);
        setSelectedFolder(activeFolder);
        setFiles(availableFiles);
        setSelectedFile(nextSelectedFile);

        if (!fileName && nextSelectedFile) {
          setFileName(nextSelectedFile);
        }

        onStatusChange(
          availableFiles.length
            ? `Found ${availableFiles.length} flowchart file${availableFiles.length === 1 ? "" : "s"} in ${activeFolder}`
            : `Flowchart directory is empty in ${activeFolder}`,
          availableFiles.length ? "info" : "warning",
        );
      } catch {
        onStatusChange("Flowchart directory unavailable", "warning");
      }
    },
    [fileName, onStatusChange, selectedFile, selectedFolder],
  );

  const applySelectedFile = React.useCallback(async () => {
    const targetFile = selectedFile || fileName.trim();

    if (!targetFile) {
      onStatusChange("Select a file to apply", "warning");
      return;
    }

    try {
      if (isLocalSourceFolder(selectedFolder)) {
        const fileHandle = localFileHandlesRef.current.get(targetFile);

        if (!fileHandle) {
          throw new Error(`Failed to load ${targetFile}.`);
        }

        const sourceText = await (await fileHandle.getFile()).text();
        const { data, direction, format } = parseFlowchartSource(sourceText);

        onLoadData(
          data,
          `Applied ${getSourceFolderLabel(selectedFolder)}/${targetFile}`,
          {
            sourceText: format === "mermaid" ? sourceText : "",
            sourceFormat: format,
            direction,
          },
        );
        setSelectedFile(targetFile);
        setFileName(getMermaidSaveTarget(targetFile));
        onErrorChange("");
        return;
      }

      const { data, sourceText, direction, format } = await loadFlowchartFile(
        targetFile,
        selectedFolder,
      );
      onLoadData(
        data,
        `Applied ${getSourceFolderLabel(selectedFolder)}/${targetFile}`,
        {
          sourceText: format === "mermaid" ? sourceText : "",
          sourceFormat: format,
          direction,
        },
      );
      setSelectedFile(targetFile);
      setFileName(getMermaidSaveTarget(targetFile));
      onErrorChange("");
    } catch (error) {
      onStatusChange(error.message, "error");
    }
  }, [
    fileName,
    onErrorChange,
    onLoadData,
    onStatusChange,
    selectedFile,
    selectedFolder,
  ]);

  const chooseLocalFolder = React.useCallback(async () => {
    if (typeof window === "undefined" || !window.showDirectoryPicker) {
      onStatusChange(
        "Local folder picking is not supported in this browser.",
        "warning",
      );
      return;
    }

    try {
      const directoryHandle = await window.showDirectoryPicker({
        mode: "readwrite",
      });
      const nextLocalFolder = getLocalSourceValue(directoryHandle.name);

      localDirectoryHandleRef.current = directoryHandle;
      setLocalFolder(nextLocalFolder);
      setSelectedFolder(nextLocalFolder);
      setSelectedFile("");
      setFileName("");
      await refreshFileDirectory("", nextLocalFolder);
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      onStatusChange(
        error?.message || "Unable to open the local flowchart folder.",
        "error",
      );
    }
  }, [onStatusChange, refreshFileDirectory]);
  const changeSelectedFolder = React.useCallback(
    async (nextFolder) => {
      const normalizedFolder =
        String(nextFolder || "").trim() || DEFAULT_SOURCE_FOLDER;
      setSelectedFolder(normalizedFolder);
      setSelectedFile("");
      setFileName("");
      await refreshFileDirectory("", normalizedFolder);
    },
    [refreshFileDirectory],
  );

  const saveCurrentMermaid = React.useCallback(
    async (editorMermaid) => {
      const targetFile = getMermaidSaveTarget(fileName || selectedFile);

      if (!targetFile) {
        onStatusChange("Enter a file name before saving", "warning");
        return;
      }

      try {
        parseMermaidToFlowchartData(editorMermaid);

        if (isLocalSourceFolder(selectedFolder)) {
          const localDirectoryHandle = localDirectoryHandleRef.current;

          if (!localDirectoryHandle) {
            onStatusChange(
              "Local flowchart folder is no longer available",
              "warning",
            );
            return;
          }

          const writableFileHandle = await localDirectoryHandle.getFileHandle(
            targetFile,
            { create: true },
          );
          const writable = await writableFileHandle.createWritable();

          await writable.write(`${String(editorMermaid || "").trim()}\n`);
          await writable.close();

          localFileHandlesRef.current.set(targetFile, writableFileHandle);
          setSelectedFile(targetFile);
          setFileName(targetFile);
          onErrorChange("");
          await refreshFileDirectory(targetFile, selectedFolder);
          onStatusChange(
            `Saved ${getSourceFolderLabel(selectedFolder)}/${targetFile}`,
            "success",
          );
          return;
        }

        await saveFlowchartFile(
          targetFile,
          editorMermaid,
          "mermaid",
          selectedFolder,
        );
        setSelectedFile(targetFile);
        setFileName(targetFile);
        onErrorChange("");
        await refreshFileDirectory(targetFile, selectedFolder);
        onStatusChange(
          `Saved ${getSourceFolderLabel(selectedFolder)}/${targetFile}`,
          "success",
        );
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
      selectedFolder,
    ],
  );

  React.useEffect(() => {
    let isActive = true;

    const initializeFiles = async () => {
      try {
        const {
          files: availableFiles,
          folders: availableFolders = [DEFAULT_SOURCE_FOLDER],
          folder: activeFolder = DEFAULT_SOURCE_FOLDER,
        } = await listFlowchartFiles(DEFAULT_SOURCE_FOLDER);

        if (!isActive) {
          return;
        }

        setWorkspaceFolders(availableFolders);
        setSelectedFolder(activeFolder);
        setFiles(availableFiles);

        if (availableFiles.length === 0) {
          onStatusChange(
            `Flowchart directory is empty in ${activeFolder}`,
            "warning",
          );
          return;
        }

        const firstFile = availableFiles[0];
        setSelectedFile(firstFile);
        setFileName(getMermaidSaveTarget(firstFile));

        const { data, sourceText, direction, format } = await loadFlowchartFile(
          firstFile,
          activeFolder,
        );

        if (!isActive) {
          return;
        }

        onLoadData(data, `Applied ${activeFolder}/${firstFile}`, {
          sourceText: format === "mermaid" ? sourceText : "",
          sourceFormat: format,
          direction,
        });
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
    folderOptions,
    selectedFolder,
    files,
    selectedFile,
    fileName,
    chooseLocalFolder,
    changeSelectedFolder,
    setSelectedFile,
    setFileName,
    refreshFileDirectory,
    applySelectedFile,
    saveCurrentMermaid,
    saveCurrentJson: saveCurrentMermaid,
  };
}
