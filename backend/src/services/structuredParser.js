const { GoogleGenAI, Type } = require("@google/genai");
const { z } = require("zod");
const env = require("../config/env")

const ai = env.geminiApiKey ? new GoogleGenAI({ apiKey: env.geminiApiKey }) : null;

// ─── Schema for Gemini structured output ────────────────────────────────────

const linkSchema = {
  type: Type.OBJECT,
  required: ["label", "url"],
  properties: {
    label: { type: Type.STRING },
    url:   { type: Type.STRING },
  },
};

const responseSchema = {
  type: Type.OBJECT,
  required: [
    "basics",
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
    "interests",
  ],
  properties: {
    basics: {
      type: Type.OBJECT,
      required: ["name", "title", "location", "email", "phone", "links"],
      properties: {
        name:     { type: Type.STRING },
        title:    { type: Type.STRING },
        location: { type: Type.STRING },
        email:    { type: Type.STRING },
        phone:    { type: Type.STRING },
        links:    { type: Type.ARRAY, items: linkSchema },
      },
    },

    summary: { type: Type.STRING },

    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["company", "role", "period", "bullets"],
        properties: {
          company:  { type: Type.STRING },
          role:     { type: Type.STRING },
          location: { type: Type.STRING },
          period:   { type: Type.STRING },
          bullets:  { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },

    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["degree", "school", "period"],
        properties: {
          degree:   { type: Type.STRING },
          school:   { type: Type.STRING },
          location: { type: Type.STRING },
          period:   { type: Type.STRING },
          details:  { type: Type.STRING },
        },
      },
    },

    skills: { type: Type.ARRAY, items: { type: Type.STRING } },

    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["name", "description"],
        properties: {
          name:        { type: Type.STRING },
          description: { type: Type.STRING },
          tech:        { type: Type.ARRAY, items: { type: Type.STRING } },
          links:       { type: Type.ARRAY, items: linkSchema },
        },
      },
    },

    certifications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["name"],
        properties: {
          name:   { type: Type.STRING },
          issuer: { type: Type.STRING },
          year:   { type: Type.STRING },
        },
      },
    },

    languages: { type: Type.ARRAY, items: { type: Type.STRING } },
    interests:  { type: Type.ARRAY, items: { type: Type.STRING } },
  },
};

// ─── Zod validator (runtime safety after Gemini response) ───────────────────

const validator = z.object({
  basics: z.object({
    name:     z.string().default(""),
    title:    z.string().default(""),
    location: z.string().default(""),
    email:    z.string().default(""),
    phone:    z.string().default(""),
    links:    z.array(z.object({ label: z.string(), url: z.string() })).default([]),
  }),
  summary: z.string().default(""),
  experience: z
    .array(
      z.object({
        company:  z.string().default(""),
        role:     z.string().default(""),
        location: z.string().default(""),
        period:   z.string().default(""),
        bullets:  z.array(z.string()).default([]),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        degree:   z.string().default(""),
        school:   z.string().default(""),
        location: z.string().default(""),
        period:   z.string().default(""),
        details:  z.string().default(""),
      }),
    )
    .default([]),
  skills: z.array(z.string()).default([]),
  projects: z
    .array(
      z.object({
        name:        z.string().default(""),
        description: z.string().default(""),
        tech:        z.array(z.string()).default([]),
        links:       z.array(z.object({ label: z.string(), url: z.string() })).default([]),
      }),
    )
    .default([]),
  certifications: z
    .array(
      z.object({
        name:   z.string().default(""),
        issuer: z.string().default(""),
        year:   z.string().default(""),
      }),
    )
    .default([]),
  languages: z.array(z.string()).default([]),
  interests:  z.array(z.string()).default([]),
});

// ─── Prompt builder ──────────────────────────────────────────────────────────

function buildPrompt(rawText) {
  return [
    "You are a resume parser. The input is text extracted from a PDF — lines may be jumbled or out of natural reading order.",
    "",
    "Extract structured data and return ONLY valid JSON matching the schema. Rules:",
    "",
    "- basics   : name, professional title, location, email, phone,",
    "             social links (LinkedIn / GitHub / portfolio etc.; label e.g. \"LinkedIn\", full URL).",
    "- summary  : the professional summary / objective paragraph (rejoin if split across lines).",
    "- experience: array of jobs — company, role, location, period (e.g. \"Jan 2022 – Mar 2024\"),",
    "             bullets (each achievement / responsibility as a separate string).",
    "- education : array — degree, school, location, period, details (honours / GPA if present).",
    "- skills   : flat array of skill strings (technologies, tools, soft skills, etc.).",
    "- projects  : array — name, description, tech (array of strings), links (label + url).",
    "- certifications: array — name, issuer, year.",
    "- languages : array of language strings (e.g. \"English (native)\").",
    "- interests : array of interest/hobby strings.",
    "",
    "If a field is not present in the resume, return an empty string or empty array — never null.",
    "",
    "Resume text:",
    "--------",
    rawText,
    "--------",
  ].join("\n");
}

const EMPTY = {
  basics: { name: "", title: "", location: "", email: "", phone: "", links: [] },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certification: [],
  language: [],
  interests: [],
};

// ─── Main parse function ─────────────────────────────────────────────────────

async function parseResume(rawText) {
  if (!ai) {
    console.error('[parseResume] Gemini client is null — check GEMINI_API_KEY in .env');
    return EMPTY;
  }
  if (!rawText?.trim()) return EMPTY;

  const prompt = buildPrompt(rawText);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model: env.geminiModel,
        contents: prompt,           // @google/genai expects a plain string here
        config: {
          responseMimeType: 'application/json',
          responseSchema,           // schema goes inside config for this SDK
          temperature: 0.1,
        },
      });

      const text = result.text;    // .text is a plain string property in @google/genai
      if (!text) throw new Error('Empty response from Gemini');

      const parsed = JSON.parse(text);
      return validator.parse(parsed);
    } catch (error) {
      console.error(`[parseResume] attempt ${attempt} failed:`, error);
      if (attempt === 2) return EMPTY;
      // wait 500ms before retry
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return EMPTY;
}

module.exports = { parseResume };

