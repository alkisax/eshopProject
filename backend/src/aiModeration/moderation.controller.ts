import type { Request, Response, NextFunction } from 'express';
import { handleControllerError } from '../utils/errorHnadler';
import { getGPTResponse } from './gpt.service';

export const moderationResult = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(404).json({ status: false, message: 'ENV not found' });
  }

  // για καποιο λόγο κόβει ελληνικές φράσει που θα έπρεπε να περνάνε
  const gpt_prompt = `
    You are a strict but fair content moderator.
    Check the following user comment ONLY for profanity, insults, hate speech, or highly offensive/sexual words.

    Rules:
    - If the text contains insults, profanity, hate speech, or sexual vulgarity → return "false"
    - If the text is neutral, positive, or harmless (even if unusual) → return "true"
    - check for multiple languages
    - Pay special attention to Greek text and dont be too strict on greek.
    - Words like "πουτσο", "μαλάκας", "βλάκας", "ηλίθιος" and similar should always → "false".
    - Neutral or positive Greek phrases → "true".
    - Do NOT mark positive Greek sentences (e.g. compliments, kind words, or neutral expressions) as false.

    Return ONLY one lowercase word: "true" or "false".
    Text to check:
  `;

  const { commentToCheck } = req.body;

  if (!commentToCheck) {
    return res.status(404).json({ status: false, message: 'Comment not found' });
  }

  try {
    console.log('entered Ai moderation control for: ', commentToCheck);

    const gptResponse = await getGPTResponse(
      commentToCheck,
      gpt_prompt,
      apiKey
    );

    // normalize σε boolean
    const isSafe = gptResponse.trim().toLowerCase().startsWith('true');

    return res.status(200).json({ status: true, data: isSafe });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const aiModerationController = {
  moderationResult,
};
