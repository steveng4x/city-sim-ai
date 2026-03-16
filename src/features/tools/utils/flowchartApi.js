const FLOWCHART_API_BASE = "/api/flowcharts";
const DEFAULT_RETRIES = 3;
const DEFAULT_MAX_DELAY = 4000;
const DEFAULT_TIMEOUT_MS = 15000;

function createAbortError(message) {
  return new DOMException(message, "AbortError");
}

function joinAbortSignals(signal, controller) {
  if (!signal) {
    return () => {};
  }

  if (signal.aborted) {
    controller.abort(signal.reason);
    return () => {};
  }

  const handleAbort = () => controller.abort(signal.reason);
  signal.addEventListener("abort", handleAbort, { once: true });

  return () => signal.removeEventListener("abort", handleAbort);
}

async function waitForDelay(delay, signal) {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, delay);

    if (!signal) {
      return;
    }

    const handleAbort = () => {
      window.clearTimeout(timeoutId);
      reject(createAbortError("Request cancelled."));
    };

    if (signal.aborted) {
      handleAbort();
      return;
    }

    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

export async function fetchWithRetry(
  url,
  options = {},
  {
    retries = DEFAULT_RETRIES,
    maxDelay = DEFAULT_MAX_DELAY,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal,
  } = {},
) {
  let delay = 1000;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    const controller = new AbortController();
    const disconnectSignal = joinAbortSignals(signal, controller);
    const timeoutId = window.setTimeout(() => {
      controller.abort(createAbortError("Request timed out."));
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = await response.json().catch(async () => ({
          error: await response.text().catch(() => "Request failed."),
        }));
        throw new Error(payload.error || `HTTP error ${response.status}`);
      }

      return response.json();
    } catch (error) {
      const isAbortError = error?.name === "AbortError";

      if (isAbortError || attempt === retries - 1) {
        throw error;
      }

      await waitForDelay(Math.min(delay, maxDelay), signal);
      delay *= 2;
    } finally {
      disconnectSignal();
      window.clearTimeout(timeoutId);
    }
  }

  throw new Error("Request failed.");
}

export async function listFlowchartFiles() {
  const response = await fetch(FLOWCHART_API_BASE);

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Failed to load JSON directory.");
  }

  return response.json();
}

export async function loadFlowchartFile(fileName) {
  const response = await fetch(
    `${FLOWCHART_API_BASE}/${encodeURIComponent(fileName)}`,
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Failed to load ${fileName}.`);
  }

  return response.json();
}

export async function saveFlowchartFile(fileName, data) {
  const response = await fetch(
    `${FLOWCHART_API_BASE}/${encodeURIComponent(fileName)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Failed to save ${fileName}.`);
  }

  return response.json();
}

export async function generateFlowchartFromPrompt(prompt, options = {}) {
  return fetchWithRetry(
    `${FLOWCHART_API_BASE}/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    },
    options,
  );
}

export async function explainFlowchartJson(flowchartJson, options = {}) {
  return fetchWithRetry(
    `${FLOWCHART_API_BASE}/explain`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flowchartJson }),
    },
    options,
  );
}
