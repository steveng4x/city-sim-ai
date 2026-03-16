export async function fetchOracleLore() {
  const response = await fetch("/api/oracle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "API Error");
  }

  return response.json();
}
