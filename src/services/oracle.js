export async function fetchOracleLore() {
  const apiKey = "AIzaSyDsZXA9z0UsZeGtSCZvjDl8nMNEGSxUC5Q"; // Provide a valid key

  const prompt = `You are a fantasy historian. Create lore for a procedural world.
  Respond strictly in JSON: { "name": "string", "foundingMyth": "string", "culture": "string", "notableEvent": "string", "geography": { "waterAmount": 1-10, "roughness": 1-10, "factions": 2-5 } }`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );

  if (!response.ok) throw new Error("API Error");

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("Empty response from Oracle");

  return JSON.parse(
    text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim(),
  );
}
