/**
 * AI Prompt Templates
 *
 * This file contains all prompt templates used for AI operations.
 * Each function returns a structured prompt for a specific AI task.
 */

// ============================================================================
// Extract Chunks Prompts
// ============================================================================

interface ExtractChunksPromptInput {
  areaTitle: string;
  intentionTitle: string;
  intentionDescription?: string;
  existingChunks?: Array<{ title: string; dod: string }>;
}

export const EXTRACT_CHUNKS_SYSTEM_PROMPT =
  "You are a helpful AI assistant that breaks down work intentions into actionable chunks. Always respond with valid JSON only.";

export function buildExtractChunksPrompt(
  input: ExtractChunksPromptInput,
): string {
  const existingChunksText = input.existingChunks?.length
    ? `\n\nExisting chunks for this intention (avoid duplicating these):\n${input.existingChunks.map((c) => `- ${c.title}: ${c.dod}`).join("\n")}`
    : "";

  return `You are an AI assistant helping to break down a high-level intention into executable work chunks.

CONTEXT:
- Area: ${input.areaTitle}
- Intention: ${input.intentionTitle}
${input.intentionDescription ? `- Description: ${input.intentionDescription}` : ""}${existingChunksText}

TASK:
Break this intention into 3-7 concrete, actionable work chunks that:
1. Are specific and executable (not vague)
2. Have a clear Definition of Done (DoD)
3. Take between 30-120 minutes each
4. Can be completed independently
5. Move the intention forward meaningfully
6. Are tagged with relevant keywords (2-4 tags per chunk)

RULES:
- Each chunk MUST have a duration between 30-120 minutes
- Each chunk MUST have a clear, measurable Definition of Done
- Avoid duplicating existing chunks
- Focus on concrete deliverables, not abstract goals
- Tags should be lowercase, single words or hyphenated (e.g., "backend", "ui", "bug-fix")

OUTPUT FORMAT (JSON):
{
  "chunks": [
    {
      "title": "Clear, action-oriented title",
      "dod": "Specific, measurable definition of done",
      "durationMin": 60,
      "tags": ["tag1", "tag2"]
    }
  ],
  "reasoning": "Brief explanation of how these chunks break down the intention"
}

Return ONLY valid JSON, no additional text.`;
}

// ============================================================================
// Build Day Plan Prompts
// ============================================================================

interface ChunkForPlan {
  id: string;
  chunkId: string;
  title: string;
  durationMin: number;
  tags: string[];
  areaTitle: string;
  areaWeight: number;
  intentionTitle?: string;
}

interface BuildDayPlanPromptInput {
  timeBudgetMin: number;
  energyMode: "deep" | "normal" | "light";
  maxTasks: number;
  availableChunks: ChunkForPlan[];
  lockedChunkIds: string[];
}

const ENERGY_MODE_DESCRIPTIONS = {
  deep: "Deep Focus - Prefer complex, challenging tasks requiring sustained concentration",
  normal: "Normal - Balanced mix of tasks with varying complexity",
  light:
    "Light Tasks - Prefer simpler, less demanding tasks for low-energy periods",
} as const;

export const BUILD_DAY_PLAN_SYSTEM_PROMPT =
  "You are a helpful AI assistant that creates optimal daily work plans. Always respond with valid JSON only.";

export function buildDayPlanPrompt(input: BuildDayPlanPromptInput): string {
  const lockedChunksText =
    input.lockedChunkIds.length > 0
      ? `\n\nLOCKED CHUNKS (must include these first):\n${input.availableChunks
          .filter((c) => input.lockedChunkIds.includes(c.id))
          .map((c) => `- ${c.title} (${c.durationMin}m) from ${c.areaTitle}`)
          .join("\n")}`
      : "";

  const availableChunksText = input.availableChunks
    .filter((c) => !input.lockedChunkIds.includes(c.id))
    .map(
      (c) =>
        `- ID: ${c.chunkId}, Title: "${c.title}", Duration: ${c.durationMin}m, Tags: [${c.tags.join(", ")}], Area: ${c.areaTitle} (weight: ${c.areaWeight})${c.intentionTitle ? `, Intention: ${c.intentionTitle}` : ""}`,
    )
    .join("\n");

  const hours = Math.floor(input.timeBudgetMin / 60);
  const minutes = input.timeBudgetMin % 60;

  return `You are an AI assistant helping to build an optimal daily work plan.

CONSTRAINTS:
- Time Budget: ${input.timeBudgetMin} minutes (${hours}h ${minutes}m)
- Energy Mode: ${input.energyMode} - ${ENERGY_MODE_DESCRIPTIONS[input.energyMode]}
- Max Tasks: ${input.maxTasks} chunks${lockedChunksText}

AVAILABLE CHUNKS:
${availableChunksText}

TASK:
Create an optimal day plan by selecting up to ${input.maxTasks} chunks that:
1. Include ALL locked chunks (if any) in their current positions
2. Fit within the time budget (can use up to 120% if needed, but prefer staying under 100%)
3. Match the energy mode (${input.energyMode})
4. Maximize productivity by:
   - Prioritizing high-weight areas
   - Grouping related chunks (similar tags)
   - Balancing task variety
   - Considering cognitive flow
5. Provide clear reasoning for each selection

SCORING CRITERIA:
- Area weight: Higher weight areas are more important
- Task clustering: Related tasks (similar tags) should be grouped
- Energy match: Tasks should match the selected energy mode
- Time optimization: Efficient use of available time
- Variety: Avoid too many tasks from same area/intention

OUTPUT FORMAT (JSON):
{
  "suggestedItems": [
    {
      "chunkId": "chunk_id_here",
      "order": 1,
      "reasoning": "Why this chunk at this position"
    }
  ],
  "totalDuration": 240,
  "reasoning": "Overall strategy and rationale for this plan",
  "energyBalance": "Assessment of how well this plan matches the energy mode"
}

IMPORTANT:
- Return ONLY valid JSON, no additional text
- Include locked chunks at their specified positions
- Ensure total chunks <= ${input.maxTasks}
- Order matters: arrange chunks for optimal flow`;
}

// ============================================================================
// Split Chunk Prompts
// ============================================================================

interface SplitChunkPromptInput {
  chunkTitle: string;
  chunkDod: string;
  originalDuration: number;
  targetDuration: number;
  tags: string[];
}

export const SPLIT_CHUNK_SYSTEM_PROMPT =
  "You are a helpful AI assistant that splits large work chunks into smaller, manageable pieces. Always respond with valid JSON only.";

export function buildSplitChunkPrompt(input: SplitChunkPromptInput): string {
  const numberOfParts = Math.ceil(input.originalDuration / input.targetDuration);

  return `You are an AI assistant helping to split an oversized work chunk into smaller, manageable pieces.

ORIGINAL CHUNK:
- Title: ${input.chunkTitle}
- Definition of Done: ${input.chunkDod}
- Original Duration: ${input.originalDuration} minutes
- Target Duration: ${input.targetDuration} minutes per part
- Tags: [${input.tags.join(", ")}]

TASK:
Split this chunk into ${numberOfParts} smaller chunks that:
1. Each take approximately ${input.targetDuration} minutes (range: 30-120 minutes)
2. Have clear, specific Definitions of Done
3. Can be completed independently
4. Together accomplish the original chunk's goal
5. Maintain relevant tags from the original

RULES:
- Each part MUST be between 30-120 minutes
- Each part should have a clear deliverable
- The sum of parts should roughly equal the original duration
- Parts should be ordered logically (1st → 2nd → 3rd)
- Preserve the original intent and scope

OUTPUT FORMAT (JSON):
{
  "parts": [
    {
      "title": "Part 1: Specific sub-task title",
      "dod": "Clear definition of done for this part",
      "durationMin": 60,
      "tags": ["tag1", "tag2"]
    }
  ],
  "reasoning": "Brief explanation of how the split maintains the original goal"
}

Return ONLY valid JSON, no additional text.`;
}
