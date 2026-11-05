import 'dotenv/config';
import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health and credentials check
app.get('/api/health', (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isSet = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0);
  res.json({
    ok: true,
    hasApiKey: isSet,
  });
});

// Idea Generation Schema
const ideaResponseSchema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: 'A punchy, memorable, affectionate name for the tiny app.',
    },
    tagline: {
      type: Type.STRING,
      description: 'One sharp, vivid sentence explaining what it is.',
    },
    targetUserAndMoment: {
      type: Type.OBJECT,
      properties: {
        who: {
          type: Type.STRING,
          description: 'A very specific, non-generic person with a concrete craft, role, or life situation.',
        },
        moment: {
          type: Type.STRING,
          description: 'The exact physical or emotional moment they open this app.',
        },
      },
      required: ['who', 'moment'],
    },
    surprisingMechanism: {
      type: Type.STRING,
      description: 'The unexpected interaction, physical constraint, or clever inversion that makes it genuinely different.',
    },
    workingFirstVersion: {
      type: Type.STRING,
      description: 'What the end-to-end first version actually does from input to real output.',
    },
    monetizationHypothesis: {
      type: Type.OBJECT,
      properties: {
        primaryModel: {
          type: Type.STRING,
          description: 'e.g. One-time license, Pay-per-output, Paid pilot, or Micro-subscription.',
        },
        whoPays: {
          type: Type.STRING,
          description: 'Who actually reaches for their card.',
        },
        whatTheyPayFor: {
          type: Type.STRING,
          description: 'The specific tangible outcome they are buying.',
        },
        whyFreeAlternativeFails: {
          type: Type.STRING,
          description: 'Why a spreadsheet or free notes app fails in this exact moment.',
        },
        cheapestTest: {
          type: Type.STRING,
          description: 'A realistic, low-cost experiment to test willingness to pay in 48 hours.',
        },
        firstUserReach: {
          type: Type.STRING,
          description: 'Where to find the first 5 real humans to test it on without ads.',
        },
      },
      required: ['primaryModel', 'whoPays', 'whatTheyPayFor', 'whyFreeAlternativeFails', 'cheapestTest', 'firstUserReach'],
    },
    biggestAssumption: {
      type: Type.STRING,
      description: 'The single most fragile hypothesis that could make this concept fail.',
    },
    decisionSummary: {
      type: Type.STRING,
      description: 'A short 2-3 sentence summary of why this odd mechanism won over ordinary ideas and what was filtered out.',
    },
  },
  required: [
    'name',
    'tagline',
    'targetUserAndMoment',
    'surprisingMechanism',
    'workingFirstVersion',
    'monetizationHypothesis',
    'biggestAssumption',
    'decisionSummary',
  ],
};

// Helper function with fallback model selection for transient 503 errors
async function generateWithRetry(ai: GoogleGenAI, params: any) {
  const primaryModel = params.model || 'gemini-3.8-flash';
  const modelsToTry = [primaryModel, 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

  let lastError: any = null;
  for (const model of modelsToTry) {
    console.log(`[Oddly Engine] Trying model: ${model}`);
    try {
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      console.log(`[Oddly Engine] Succeeded with model: ${model}`);
      return response;
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message || '');
      console.warn(`[Oddly Engine] Model ${model} unavailable (${msg.slice(0, 100)}). Falling back...`);
    }
  }
  throw lastError;
}

// Generate ONE unusual idea
app.post('/api/ideas/generate', async (req: Request, res: Response) => {
  const ai = getAiClient();
  if (!ai) {
    res.status(503).json({
      error: 'MISSING_API_KEY',
      message: 'GEMINI_API_KEY is not configured on the server. Please add your Gemini API key in the AI Studio Settings > Secrets panel.',
    });
    return;
  }

  const { world, recentIdeas = [] } = req.body;

  const promptText = `
You are the invention engine of "Oddly" — a studio that invents genuinely strange, practical micro-software for solo builders.

Your mission:
Help a builder go from "That is wonderfully strange" to "I can build this in a weekend, deploy it, and test whether someone will pay."

${world ? `The user is interested in this specific world: "${world}". Ground the concept deeply in the realities, physical textures, or rituals of this domain.` : `Pick an unexpected, vivid domain: such as antique clock repair, community seed libraries, rainy day bicycle commuters, night-shift street food vendors, sourdough baker rescue, estate sale sleuths, marine knot tying, church choir sheet-music archivism, or tool repair benches.`}

${recentIdeas.length > 0 ? `Do NOT repeat or generate variations of these recent ideas from the current session: ${recentIdeas.join(', ')}.` : ''}

CRITICAL RULES:
1. STRICT EXCLUSIONS:
   - Absolutely NO generic chatbots or "Ask AI" boxes.
   - Absolutely NO habit trackers or standard todo/productivity boards.
   - Absolutely NO generic writing tools or prompt helpers.
   - Absolutely NO two-sided marketplaces that require network effects before value exists.
   - Absolutely NO dashboards with a cosmetic AI button attached.
2. THE WORKING-PRODUCT TEST:
   - Can one person get complete value on their own on Day 1?
   - What goes in? What concrete transformation happens? What tangible output comes out?
   - Can it be built without paid external APIs, proprietary hardware, or giant scraped datasets?
3. HONESTY:
   - Treat novelty and monetization as hypotheses to test, never guaranteed facts.
   - Never claim "Nobody has ever done this".
4. GENERATION DISCIPLINE:
   - Internally brainstorm 4 candidate oddities.
   - Compare for: specific usefulness, non-obviousness, build feasibility in Vite/React, 1-player utility, and tangible willingness-to-pay.
   - Select ONLY the single strongest, most charmingly peculiar candidate and return it formatted according to the schema.
`;

  try {
    const response = await generateWithRetry(ai, {
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: 'You are Oddly, an inventor of delightfully unusual, single-purpose software tools with an engineering conscience.',
        responseMimeType: 'application/json',
        responseSchema: ideaResponseSchema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from model');
    }

    const parsed = JSON.parse(text);
    const ideaWithId = {
      ...parsed,
      id: 'idea_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      worldContext: world || undefined,
      createdAt: new Date().toISOString(),
      saved: false,
    };

    res.json({ idea: ideaWithId });
  } catch (error: any) {
    console.error('Error generating idea:', error);
    res.status(500).json({
      error: 'GENERATION_FAILED',
      message: error?.message || 'Failed to generate an unusual idea. Please try again.',
    });
  }
});

// Prompt generation schema
const promptResponseSchema = {
  type: Type.OBJECT,
  properties: {
    fullPrompt: {
      type: Type.STRING,
      description: 'The complete, copy-ready 16-section implementation prompt for Google AI Studio.',
    },
    templates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: 'One of: tiny-prototype, paid-pilot, unexpected-twist',
          },
          title: {
            type: Type.STRING,
            description: 'Tiny prototype, Paid pilot, or Unexpected twist',
          },
          tagline: {
            type: Type.STRING,
            description: 'One line explaining this scope variation.',
          },
          whatChanges: {
            type: Type.STRING,
            description: 'What is scoped out, adapted, or intensified.',
          },
          whatStays: {
            type: Type.STRING,
            description: 'The invariant core mechanism.',
          },
          coreWorkflow: {
            type: Type.STRING,
            description: 'The exact step-by-step path for this variation.',
          },
          mainRisk: {
            type: Type.STRING,
            description: 'The primary risk to test in this format.',
          },
          buildPrompt: {
            type: Type.STRING,
            description: 'A focused, copy-ready build prompt tailored to this specific scope.',
          },
        },
        required: ['id', 'title', 'tagline', 'whatChanges', 'whatStays', 'coreWorkflow', 'mainRisk', 'buildPrompt'],
      },
    },
  },
  required: ['fullPrompt', 'templates'],
};

// Generate "Build this" implementation prompt & 3 reference templates
app.post('/api/ideas/prompt', async (req: Request, res: Response) => {
  const ai = getAiClient();
  if (!ai) {
    res.status(503).json({
      error: 'MISSING_API_KEY',
      message: 'GEMINI_API_KEY is not configured on the server.',
    });
    return;
  }

  const { idea } = req.body;
  if (!idea || !idea.name) {
    res.status(400).json({ error: 'INVALID_REQUEST', message: 'Idea data is required.' });
    return;
  }

  const systemInstruction = `
You are the senior architect at Oddly. You turn unusual software concepts into bulletproof, copy-ready implementation prompts for builders working inside Google AI Studio.

CRITICAL BUILDER DIRECTIVE:
Every prompt you generate MUST include this exact verbatim sentence near the top:
"Implement the complete core workflow before polishing the interface. Do not substitute mock data, fake success messages, placeholder buttons, or simulated AI responses for required functionality."

The fullPrompt must be formatted cleanly in Markdown and MUST contain all 16 numbered sections in this exact order:
1. Product objective
2. Target user and concrete use case
3. One core workflow
4. Smallest useful feature set
5. Explicit non-goals
6. Input and output examples
7. Actual processing logic
8. Screens and interactions
9. Data model and persistence
10. AI responsibilities, if AI is genuinely necessary (if not necessary, state "None — purely deterministic local logic")
11. Required APIs and environment variables
12. Error, empty, loading, and retry states
13. Privacy and security requirements
14. Deployment requirements appropriate to the generated stack (React/Vite/Express)
15. Acceptance tests (concrete step-by-step verification)
16. First monetization experiment

In addition, provide 3 reference templates for the SAME idea (scope variants, not new ideas):
1. id: "tiny-prototype" (Title: "Tiny prototype") — The smallest possible working version buildable in 2 hours.
2. id: "paid-pilot" (Title: "Paid pilot") — A version packaged for testing with 3-5 real customers with paid output.
3. id: "unexpected-twist" (Title: "Unexpected twist") — A more inventive interaction, hardware bridge, or constraint.
`;

  const userPrompt = `
Generate the 16-section implementation prompt and the 3 reference templates for this Oddly idea:

Name: ${idea.name}
Tagline: ${idea.tagline}
Target User: ${idea.targetUserAndMoment.who} (Moment: ${idea.targetUserAndMoment.moment})
Surprising Mechanism: ${idea.surprisingMechanism}
Working First Version: ${idea.workingFirstVersion}
Primary Monetization: ${idea.monetizationHypothesis.primaryModel} (Who pays: ${idea.monetizationHypothesis.whoPays}, For: ${idea.monetizationHypothesis.whatTheyPayFor})
Biggest Assumption: ${idea.biggestAssumption}

Make sure the technical specs are realistic for a Vite + React + TypeScript single-page app with Express backend if needed. Keep the instructions strict, clear, and copy-ready.
`;

  try {
    const response = await generateWithRetry(ai, {
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: promptResponseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from model');

    const result = JSON.parse(text);
    res.json(result);
  } catch (error: any) {
    console.error('Error generating prompt:', error);
    res.status(500).json({
      error: 'PROMPT_GENERATION_FAILED',
      message: error?.message || 'Failed to craft the build prompt. Please retry.',
    });
  }
});

// Pip Logic Companion Debate schema
const chatResponseSchema = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description: 'Pip\'s direct, playful, sharp response. Max 2-3 paragraphs. Follows Pip\'s rules.',
    },
    proposedRevision: {
      type: Type.OBJECT,
      description: 'If the conversation resulted in a concrete idea modification, specify it here. Otherwise omit.',
      properties: {
        summary: {
          type: Type.STRING,
          description: 'A 1-line summary of what changes (e.g. "Simplify input to voice memo only, dropping manual text tags").',
        },
        fieldModifications: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            tagline: { type: Type.STRING },
            surprisingMechanism: { type: Type.STRING },
            workingFirstVersion: { type: Type.STRING },
            biggestAssumption: { type: Type.STRING },
          },
        },
      },
      required: ['summary', 'fieldModifications'],
    },
  },
  required: ['reply'],
};

// "Challenge it" Pip conversation endpoint
app.post('/api/chat/challenge', async (req: Request, res: Response) => {
  const ai = getAiClient();
  if (!ai) {
    res.status(503).json({
      error: 'MISSING_API_KEY',
      message: 'GEMINI_API_KEY is not configured on the server.',
    });
    return;
  }

  const { idea, messages = [], userMessage } = req.body;
  if (!idea || !userMessage) {
    res.status(400).json({ error: 'INVALID_REQUEST', message: 'Idea and message are required.' });
    return;
  }

  const systemInstruction = `
You are Pip, the mascot and resident inventor of "Oddly".
You are an enthusiastic inventor with an engineering conscience:
playful, sharp, concise, and willing to defend a good idea.

Your goal is to defend the strongest logically supportable version of the idea "${idea.name}" — not to win by pretending to be right.

When challenged, you must:
1. State your position clearly.
2. Give your strongest relevant reasoning.
3. Separate facts from assumptions.
4. Directly address what the user objected to.
5. Identify what evidence would change your mind.
6. Suggest a cheap experiment when uncertainty remains.
7. Concede gracefully when the user makes a superior point.
8. If the user asks for a revision or simplification, embrace it enthusiastically, propose the exact updated fields, and provide a proposedRevision object!

Tone rules:
- Keep it concise (2-3 punchy paragraphs max).
- Playful and warm, never defensive, condescending, or evasive.
- Never invent fake statistics or fake testimonials.
- Distinguish between a hypothesis and proven fact.
`;

  const contextPrompt = `
CURRENT IDEA BEING DISCUSSED:
Name: ${idea.name}
Tagline: ${idea.tagline}
Target User: ${idea.targetUserAndMoment.who} (Moment: ${idea.targetUserAndMoment.moment})
Surprising Mechanism: ${idea.surprisingMechanism}
Working First Version: ${idea.workingFirstVersion}
Monetization: ${idea.monetizationHypothesis.primaryModel} (Who pays: ${idea.monetizationHypothesis.whoPays}, For: ${idea.monetizationHypothesis.whatTheyPayFor})
Biggest Assumption: ${idea.biggestAssumption}

PRIOR CONVERSATION:
${messages.map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}

USER JUST ASKED / CHALLENGED:
"${userMessage}"

Respond as Pip using the JSON schema. If the user asks to modify, simplify, or adjust the idea, include a proposedRevision object with the updated fields!
`;

  try {
    const response = await generateWithRetry(ai, {
      model: 'gemini-3.8-flash',
      contents: contextPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: chatResponseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from model');

    const result = JSON.parse(text);
    res.json(result);
  } catch (error: any) {
    console.error('Error in challenge chat:', error);
    res.status(500).json({
      error: 'CHAT_FAILED',
      message: error?.message || 'Pip stumbled while formulating a response. Please try asking again.',
    });
  }
});

// Setup Vite or static serving
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Oddly server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
