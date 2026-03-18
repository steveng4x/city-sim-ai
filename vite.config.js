import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import {
  parseFlowchartJson,
  parseFlowchartSource,
  parseMermaidToFlowchartData,
} from "./src/features/tools/utils/flowchart.js";

const workspaceRoot = fileURLToPath(new URL(".", import.meta.url));

const flowchartRootDirectory = path.resolve(
  workspaceRoot,
  "src/features/tools",
);

const defaultFlowchartFolder = "json";

function isPathInsideDirectory(targetPath, rootPath) {
  const relativePath = path.relative(rootPath, targetPath);

  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
}

function normalizeFlowchartFolder(folderName = defaultFlowchartFolder) {
  const trimmedFolder = String(folderName || defaultFlowchartFolder)
    .trim()
    .replace(/\\+/g, "/")
    .replace(/^\/+|\/+$/g, "");

  if (!trimmedFolder) {
    return defaultFlowchartFolder;
  }

  const segments = trimmedFolder.split("/");

  if (!segments.every((segment) => /^[A-Za-z0-9._-]+$/.test(segment))) {
    return null;
  }

  return segments.join("/");
}

function resolveFlowchartDirectory(folderName = defaultFlowchartFolder) {
  const normalizedFolder = normalizeFlowchartFolder(folderName);

  if (!normalizedFolder) {
    return null;
  }

  const resolvedDirectory = path.resolve(
    flowchartRootDirectory,
    normalizedFolder,
  );

  if (!isPathInsideDirectory(resolvedDirectory, flowchartRootDirectory)) {
    return null;
  }

  return {
    folder: normalizedFolder,
    directory: resolvedDirectory,
  };
}

async function collectFlowchartFolders(
  currentDirectory,
  currentRelativePath = "",
  folders = new Set(),
) {
  const entries = await fs.readdir(currentDirectory, { withFileTypes: true });
  let hasFlowchartFiles = false;

  for (const entry of entries) {
    if (
      entry.isFile() &&
      (entry.name.endsWith(".json") || entry.name.endsWith(".mmd"))
    ) {
      hasFlowchartFiles = true;
      continue;
    }

    if (entry.isDirectory()) {
      const nextRelativePath = currentRelativePath
        ? `${currentRelativePath}/${entry.name}`
        : entry.name;

      await collectFlowchartFolders(
        path.join(currentDirectory, entry.name),
        nextRelativePath,
        folders,
      );
    }
  }

  if (hasFlowchartFiles && currentRelativePath) {
    folders.add(currentRelativePath);
  }

  return folders;
}

async function listAvailableFlowchartFolders() {
  await fs.mkdir(flowchartRootDirectory, { recursive: true });

  const folders = await collectFlowchartFolders(flowchartRootDirectory);

  folders.add(defaultFlowchartFolder);

  return Array.from(folders).sort((left, right) => left.localeCompare(right));
}

function normalizeFlowchartFileName(fileName = "") {
  const trimmed = String(fileName).trim();

  if (!trimmed) {
    return null;
  }

  const normalized =
    trimmed.endsWith(".json") || trimmed.endsWith(".mmd")
      ? trimmed
      : `${trimmed}.mmd`;

  if (!/^[A-Za-z0-9._-]+\.(json|mmd)$/.test(normalized)) {
    return null;
  }

  return normalized;
}

function createJsonResponse(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

async function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let rawBody = "";

    request.on("data", (chunk) => {
      rawBody += chunk;
    });

    request.on("end", () => resolve(rawBody));
    request.on("error", reject);
  });
}

function getGeminiResponseText(result) {
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Empty response from Gemini.");
  }

  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function normalizeFlowchartSource(sourceText = "", format = "mermaid") {
  const nextFormat = String(format || "mermaid")
    .trim()
    .toLowerCase();

  if (nextFormat === "json") {
    const parsedData = parseFlowchartJson(sourceText);
    return {
      format: "json",
      sourceText: `${JSON.stringify(parsedData, null, 2)}\n`,
      data: parsedData,
    };
  }

  const parsedMermaid = parseMermaidToFlowchartData(sourceText);
  return {
    format: "mermaid",
    sourceText: `${String(sourceText || "").trim()}\n`,
    direction: parsedMermaid.direction,
    data: parsedMermaid.data,
  };
}

async function callGeminiApi({ apiKey, model, body }) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Gemini request failed.");
  }

  return response.json();
}

function flowchartFileApiPlugin({ geminiApiKey, geminiModel }) {
  const handleRequest = async (request, response) => {
    const url = new URL(request.url || "/", "http://localhost");
    const requestedFolder =
      url.searchParams.get("folder") || defaultFlowchartFolder;
    const resolvedFlowchartDirectory =
      resolveFlowchartDirectory(requestedFolder);

    if (
      !url.pathname.startsWith("/api/flowcharts") &&
      url.pathname !== "/api/oracle"
    ) {
      return false;
    }

    try {
      if (
        url.pathname.startsWith("/api/flowcharts") &&
        !resolvedFlowchartDirectory
      ) {
        createJsonResponse(response, 400, {
          error:
            "Invalid source folder. Use a relative folder inside src/features/tools.",
        });
        return true;
      }

      if (
        [
          "/api/flowcharts/generate",
          "/api/flowcharts/explain",
          "/api/oracle",
        ].includes(url.pathname) &&
        !geminiApiKey
      ) {
        createJsonResponse(response, 503, {
          error: "Server Gemini API key is not configured.",
        });
        return true;
      }

      if (
        url.pathname === "/api/flowcharts/generate" &&
        request.method === "POST"
      ) {
        const requestBody = await readRequestBody(request);
        const { prompt } = JSON.parse(requestBody || "{}");

        if (!String(prompt || "").trim()) {
          createJsonResponse(response, 400, {
            error: "A prompt is required to generate a flowchart.",
          });
          return true;
        }

        const result = await callGeminiApi({
          apiKey: geminiApiKey,
          model: geminiModel,
          body: {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: {
              parts: [
                {
                  text: "You are an expert flowchart architect. Based on the user's description, generate a valid Mermaid flowchart using this exact subset: begin with 'flowchart LR'; use node ids that start with a letter and contain only letters, numbers, underscores, or dashes; use '([label])' for terminator nodes, '[label]' for process nodes, '{label}' for decision nodes, '[[label]]' for subflow nodes, '((label))' for group nodes, and '[/label/]' for note nodes. Use '-->' for links and '-->|label|' for labeled links. Keep labels short. Return ONLY Mermaid text.",
                },
              ],
            },
          },
        });

        const sourceText = getGeminiResponseText(result);
        const parsedMermaid = parseMermaidToFlowchartData(sourceText);

        createJsonResponse(response, 200, {
          data: parsedMermaid.data,
          direction: parsedMermaid.direction,
          sourceText,
          format: "mermaid",
        });
        return true;
      }

      if (
        url.pathname === "/api/flowcharts/explain" &&
        request.method === "POST"
      ) {
        const requestBody = await readRequestBody(request);
        const { flowchartMermaid } = JSON.parse(requestBody || "{}");

        if (!String(flowchartMermaid || "").trim()) {
          createJsonResponse(response, 400, {
            error: "Flowchart Mermaid is required for explanation.",
          });
          return true;
        }

        const parsedFlowchart = parseMermaidToFlowchartData(flowchartMermaid);

        const result = await callGeminiApi({
          apiKey: geminiApiKey,
          model: geminiModel,
          body: {
            contents: [
              {
                parts: [
                  {
                    text: `Explain this Mermaid flowchart clearly and step-by-step. Use the normalized structure below when reasoning about the process:\n\n${JSON.stringify(parsedFlowchart.data, null, 2)}\n\nOriginal Mermaid:\n${flowchartMermaid}`,
                  },
                ],
              },
            ],
            systemInstruction: {
              parts: [
                {
                  text: "You are a helpful process analyst. Given a Mermaid flowchart and its normalized node/link structure, write a clear, concise, and easy-to-read step-by-step explanation of the process. Highlight the start, major decisions, paths taken, and the endpoints. Keep formatting clean with bullet points.",
                },
              ],
            },
          },
        });

        createJsonResponse(response, 200, {
          content: getGeminiResponseText(result),
        });
        return true;
      }

      if (url.pathname === "/api/oracle" && request.method === "POST") {
        const prompt = `You are a fantasy historian. Create lore for a procedural world.
Respond strictly in JSON: { "name": "string", "foundingMyth": "string", "culture": "string", "notableEvent": "string", "geography": { "waterAmount": 1-10, "roughness": 1-10, "factions": 2-5 } }`;

        const result = await callGeminiApi({
          apiKey: geminiApiKey,
          model: geminiModel,
          body: {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          },
        });

        createJsonResponse(
          response,
          200,
          JSON.parse(getGeminiResponseText(result)),
        );
        return true;
      }

      const { folder: activeFolder, directory: flowchartDirectory } =
        resolvedFlowchartDirectory;
      const availableFolders = await listAvailableFlowchartFolders();

      await fs.mkdir(flowchartDirectory, { recursive: true });

      if (url.pathname === "/api/flowcharts" && request.method === "GET") {
        const files = await fs.readdir(flowchartDirectory, {
          withFileTypes: true,
        });
        const flowchartFiles = files
          .filter(
            (entry) =>
              entry.isFile() &&
              (entry.name.endsWith(".json") || entry.name.endsWith(".mmd")),
          )
          .map((entry) => entry.name)
          .sort((left, right) => left.localeCompare(right));

        createJsonResponse(response, 200, {
          folder: activeFolder,
          folders: Array.from(
            new Set([...availableFolders, activeFolder]),
          ).sort((left, right) => left.localeCompare(right)),
          files: flowchartFiles,
        });
        return true;
      }

      const encodedFileName = url.pathname.replace("/api/flowcharts/", "");
      const fileName = normalizeFlowchartFileName(
        decodeURIComponent(encodedFileName),
      );

      if (!fileName) {
        createJsonResponse(response, 400, {
          error:
            "Invalid file name. Use letters, numbers, dots, underscores, or dashes.",
        });
        return true;
      }

      const filePath = path.join(flowchartDirectory, fileName);

      if (request.method === "GET") {
        const fileContents = await fs.readFile(filePath, "utf8");
        const parsedSource = parseFlowchartSource(fileContents);

        createJsonResponse(response, 200, {
          fileName,
          data: parsedSource.data,
          ...(parsedSource.direction
            ? { direction: parsedSource.direction }
            : {}),
          format: parsedSource.format,
          sourceText: fileContents,
        });
        return true;
      }

      if (request.method === "PUT") {
        const requestBody = await readRequestBody(request);
        const { sourceText, format } = JSON.parse(requestBody || "{}");
        const normalizedSource = normalizeFlowchartSource(sourceText, format);

        await fs.writeFile(filePath, normalizedSource.sourceText, "utf8");

        createJsonResponse(response, 200, {
          message: `Saved ${fileName}`,
          fileName,
          format: normalizedSource.format,
        });
        return true;
      }

      createJsonResponse(response, 405, { error: "Method not allowed." });
      return true;
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? error.message
          : "Unexpected server error.";
      const statusCode = error && error.code === "ENOENT" ? 404 : 500;

      createJsonResponse(response, statusCode, { error: message });
      return true;
    }
  };

  return {
    name: "flowchart-file-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const handled = await handleRequest(request, response);
        if (!handled) {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const handled = await handleRequest(request, response);
        if (!handled) {
          next();
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, workspaceRoot, "");
  const geminiApiKey = env.GEMINI_API_KEY || "";
  const geminiModel = env.GEMINI_MODEL || "gemini-2.5-flash";

  return {
    base: "/",
    plugins: [
      react(),
      tailwindcss(),
      flowchartFileApiPlugin({ geminiApiKey, geminiModel }),
    ],
    resolve: {
      alias: [{ find: "@", replacement: path.resolve(workspaceRoot, "src") }],
    },
  };
});
