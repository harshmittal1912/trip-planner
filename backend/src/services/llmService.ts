import { AppError } from "../utils/AppError";
import { BudgetType, IDay, IBudgetEstimate, IHotelSuggestion } from "../models/Trip";

// @google/genai ships as an ES module. This backend runs as CommonJS (for
// broad tooling compatibility), and Node's `require()` cannot load a pure
// ESM package - only `import()` can, even from CJS code. So instead of a
// static top-level import, we lazily create the client on first use via a
// dynamic import and cache it, so the rest of the file can stay ordinary
// CommonJS/TypeScript with no build config changes.
let clientPromise: Promise<any> | null = null;

async function getClient() {
  if (!clientPromise) {
    clientPromise = import("@google/genai").then(
      ({ GoogleGenAI }) => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    );
  }
  return clientPromise;
}

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

interface TripBrief {
  destination: string;
  numberOfDays: number;
  budgetType: BudgetType;
  interests: string[];
}

/**
 * Gemini's JSON mode (responseMimeType: "application/json") returns clean JSON
 * without markdown fences, but we still guard with a try/catch in case the
 * model ever returns something that doesn't parse - a bad response should
 * surface as a normal API error, not crash the request.
 */
function parseJsonResponse<T>(raw: string): T {
  try {
    return JSON.parse(raw.trim()) as T;
  } catch (err) {
    throw new AppError("The AI agent returned an unexpected response format", 502);
  }
}

async function callAgent(systemInstruction: string, prompt: string): Promise<string> {
  try {
    const ai = await getClient();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        maxOutputTokens: 2048,
      },
    });

    const text = response.text;
    if (!text) {
      throw new AppError("The AI agent did not return any content", 502);
    }
    return text;
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("Gemini API error:", err);
    throw new AppError("The AI agent is temporarily unavailable", 502);
  }
}

const JSON_ONLY_SYSTEM_PREFIX =
  "You are a meticulous travel-planning assistant embedded in a product. " +
  "Respond with ONLY valid JSON matching the requested schema - no prose, " +
  "no markdown fences, no explanation before or after the JSON.";

export async function generateItinerary(brief: TripBrief): Promise<IDay[]> {
  const system = `${JSON_ONLY_SYSTEM_PREFIX}
Schema: an array of day objects: [{ "dayNumber": number, "activities": [{ "title": string, "description": string }] }].
Include 2-4 activities per day that make geographic sense to cluster together, matching the traveler's interests and budget level.`;

  const prompt = `Create a ${brief.numberOfDays}-day itinerary for ${brief.destination}.
Budget level: ${brief.budgetType}.
Traveler interests: ${brief.interests.join(", ") || "general sightseeing"}.
Return JSON only.`;

  const raw = await callAgent(system, prompt);
  return parseJsonResponse<IDay[]>(raw);
}

export async function regenerateDay(
  brief: TripBrief,
  dayNumber: number,
  instruction: string
): Promise<IDay> {
  const system = `${JSON_ONLY_SYSTEM_PREFIX}
Schema: a single day object: { "dayNumber": number, "activities": [{ "title": string, "description": string }] }.`;

  const prompt = `Trip context: ${brief.numberOfDays}-day trip to ${brief.destination}, budget level ${brief.budgetType}, interests: ${brief.interests.join(", ") || "general sightseeing"}.
Regenerate day ${dayNumber} of this trip according to this instruction: "${instruction}".
Keep the dayNumber as ${dayNumber}. Return JSON only.`;

  const raw = await callAgent(system, prompt);
  return parseJsonResponse<IDay>(raw);
}

export async function estimateBudget(brief: TripBrief): Promise<IBudgetEstimate> {
  const system = `${JSON_ONLY_SYSTEM_PREFIX}
Schema: { "flights": number, "accommodation": number, "food": number, "activities": number, "total": number, "currency": string }.
All values are USD estimates unless the destination strongly implies otherwise. "total" must equal the sum of the other four fields.`;

  const prompt = `Estimate a realistic travel budget for a ${brief.numberOfDays}-day trip to ${brief.destination}
at a ${brief.budgetType} budget level, based on typical current travel costs. Return JSON only.`;

  const raw = await callAgent(system, prompt);
  return parseJsonResponse<IBudgetEstimate>(raw);
}

export async function suggestHotels(brief: TripBrief): Promise<IHotelSuggestion[]> {
  const system = `${JSON_ONLY_SYSTEM_PREFIX}
Schema: an array of exactly 3 objects: [{ "name": string, "tier": "Budget Friendly" | "Mid Range" | "Luxury", "notes": string }].`;

  const prompt = `Suggest 3 hotels in ${brief.destination} - one Budget Friendly, one Mid Range, one Luxury -
suitable for a traveler with a ${brief.budgetType} overall budget and interests in ${brief.interests.join(", ") || "general sightseeing"}.
Base suggestions on well-known, plausible options for the destination. Return JSON only.`;

  const raw = await callAgent(system, prompt);
  return parseJsonResponse<IHotelSuggestion[]>(raw);
}

/**
 * CUSTOM FEATURE: Smart Packing List.
 * Generates a packing list that accounts for the destination's likely climate,
 * the trip's activity mix (from interests), and length of stay - something a
 * generic checklist can't do. See README "Creative Feature" section for the
 * reasoning behind this addition.
 */
export async function generatePackingList(brief: TripBrief): Promise<string[]> {
  const system = `${JSON_ONLY_SYSTEM_PREFIX}
Schema: an array of 8-14 short strings, each a single packing item (e.g. "Lightweight rain jacket").
Tailor items to the destination's likely climate for a typical visit, the trip length, and the traveler's interests
(e.g. hiking boots for Adventure, an extra outfit for Nightlife, adapter/voltage notes if relevant to the region).
Avoid generic filler like "clothes" or "toiletries" - be specific enough to be useful.`;

  const prompt = `Build a packing list for a ${brief.numberOfDays}-day trip to ${brief.destination}.
Budget level: ${brief.budgetType}. Interests: ${brief.interests.join(", ") || "general sightseeing"}.
Return JSON only.`;

  const raw = await callAgent(system, prompt);
  return parseJsonResponse<string[]>(raw);
}
