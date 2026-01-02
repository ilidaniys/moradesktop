import OpenAI from "openai";
import { env } from "~/env";

export const aiClient = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const DEFAULT_MODEL = env.GEMINI_MODEL;
