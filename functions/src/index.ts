/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { GoogleGenAI } from "@google/genai";
import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 1 });

export const getDateFromText = onRequest(async (request, response) => {
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GEN_AI_API_KEY || "",
  });

  const { text } = request.query;

  const prompt = `Extract the date from the following text: ${text} and return it in the format of MMdd. If there is no date in the text, return an empty string.`;

  try {
    const aiModelResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    
    logger.info({ prompt, aiModelResponse: aiModelResponse.text });
    response.send({ result: aiModelResponse.text });
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) });
    response.status(500).send({ error: "Failed to process request" });
  }
  
});
