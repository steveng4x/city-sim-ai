import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";

const workspaceRoot = fileURLToPath(new URL(".", import.meta.url));

const flowchartDirectory = path.resolve(
  workspaceRoot,
  "src/features/tools/JSON Flowchart Visualizer/json",
);

function normalizeJsonFileName(fileName = "") {
  const trimmed = String(fileName).trim();

  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.endsWith(".json") ? trimmed : `${trimmed}.json`;

  if (!/^[A-Za-z0-9._-]+\.json$/.test(normalized)) {
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

    if (
      !url.pathname.startsWith("/api/flowcharts") &&
      url.pathname !== "/api/oracle"
    ) {
      return false;
    }

    try {
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
                  text: "You are an expert flowchart architect. Based on the user's description, generate a valid JSON flowchart. The JSON must exactly contain two arrays: 'nodes' and 'links'. Nodes must have: 'id' (string), 'label' (short string), and 'type' (must be 'terminator', 'process', or 'decision'). Links must have: 'source' (node id), 'target' (node id), and optionally 'label' (string). Ensure the flow is logical and connections use valid IDs. Return ONLY the JSON object.",
                },
              ],
            },
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  nodes: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        id: { type: "STRING" },
                        label: { type: "STRING" },
                        type: {
                          type: "STRING",
                          enum: ["terminator", "process", "decision"],
                        },
                      },
                      required: ["id", "label", "type"],
                    },
                  },
                  links: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        source: { type: "STRING" },
                        target: { type: "STRING" },
                        label: { type: "STRING" },
                      },
                      required: ["source", "target"],
                    },
                  },
                },
                required: ["nodes", "links"],
              },
            },
          },
        });

        createJsonResponse(response, 200, {
          data: JSON.parse(getGeminiResponseText(result)),
        });
        return true;
      }

      if (
        url.pathname === "/api/flowcharts/explain" &&
        request.method === "POST"
      ) {
        const requestBody = await readRequestBody(request);
        const { flowchartJson } = JSON.parse(requestBody || "{}");

        if (!String(flowchartJson || "").trim()) {
          createJsonResponse(response, 400, {
            error: "Flowchart JSON is required for explanation.",
          });
          return true;
        }

        const result = await callGeminiApi({
          apiKey: geminiApiKey,
          model: geminiModel,
          body: {
            contents: [
              {
                parts: [
                  {
                    text: `Explain this flowchart process clearly and step-by-step:\n\n${flowchartJson}`,
                  },
                ],
              },
            ],
            systemInstruction: {
              parts: [
                {
                  text: "You are a helpful process analyst. Given a JSON representation of a flowchart (nodes and links), write a clear, concise, and easy-to-read step-by-step explanation of the process. Highlight the start, major decisions, paths taken, and the endpoints. Keep formatting clean with bullet points.",
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

      await fs.mkdir(flowchartDirectory, { recursive: true });

      if (url.pathname === "/api/flowcharts" && request.method === "GET") {
        const files = await fs.readdir(flowchartDirectory, {
          withFileTypes: true,
        });
        const jsonFiles = files
          .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
          .map((entry) => entry.name)
          .sort((left, right) => left.localeCompare(right));

        createJsonResponse(response, 200, { files: jsonFiles });
        return true;
      }

      const encodedFileName = url.pathname.replace("/api/flowcharts/", "");
      const fileName = normalizeJsonFileName(
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
        createJsonResponse(response, 200, {
          fileName,
          data: JSON.parse(fileContents),
        });
        return true;
      }

      if (request.method === "PUT") {
        const requestBody = await readRequestBody(request);

        const parsedBody = JSON.parse(requestBody || "{}");
        const formattedJson = `${JSON.stringify(parsedBody, null, 2)}\n`;

        await fs.writeFile(filePath, formattedJson, "utf8");

        createJsonResponse(response, 200, {
          message: `Saved ${fileName}`,
          fileName,
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
