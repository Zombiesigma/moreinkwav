'use server';
/**
 * @fileOverview A Genkit flow for generating unique, evocative mood descriptions or 'liner notes' for each song.
 *
 * - aiGeneratedTrackNarratives - A function that generates AI-powered track narratives.
 * - AiGeneratedTrackNarrativesInput - The input type for the aiGeneratedTrackNarratives function.
 * - AiGeneratedTrackNarrativesOutput - The return type for the aiGeneratedTrackNarratives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiGeneratedTrackNarrativesInputSchema = z.object({
  songTitle: z.string().describe('The title of the song.'),
  artistName: z.string().describe('The name of the artist.'),
  albumTitle:
    z.string().optional().describe('The title of the album the song belongs to.'),
  genre: z.string().optional().describe('The genre of the song.'),
  lyricsExcerpt:
    z
      .string()
      .optional()
      .describe(
        'A short excerpt from the song lyrics to provide additional context.'
      ),
});
export type AiGeneratedTrackNarrativesInput = z.infer<
  typeof AiGeneratedTrackNarrativesInputSchema
>;

const AiGeneratedTrackNarrativesOutputSchema = z.object({
  narrative:
    z.string().describe('The AI-generated mood description or liner notes for the song.'),
});
export type AiGeneratedTrackNarrativesOutput = z.infer<
  typeof AiGeneratedTrackNarrativesOutputSchema
>;

export async function aiGeneratedTrackNarratives(
  input: AiGeneratedTrackNarrativesInput
): Promise<AiGeneratedTrackNarrativesOutput> {
  return aiGeneratedTrackNarrativesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrackNarrativePrompt',
  input: {schema: AiGeneratedTrackNarrativesInputSchema},
  output: {schema: AiGeneratedTrackNarrativesOutputSchema},
  prompt: `You are a sophisticated music critic and storyteller, tasked with crafting evocative and unique 'liner notes' or mood descriptions for a song. Your goal is to enhance the listener's experience by providing a rich, immersive narrative that captures the essence, emotion, and atmosphere of the track.

Consider the following details about the song:
Title: "{{{songTitle}}}"
Artist: "{{{artistName}}}"
{{#if albumTitle}}Album: "{{{albumTitle}}}"{{/if}}
{{#if genre}}Genre: "{{{genre}}}"{{/if}}
{{#if lyricsExcerpt}}
Lyrics Excerpt:
"{{{lyricsExcerpt}}}"
{{/if}}

Based on these details, write a compelling and imaginative narrative (around 100-200 words) that describes the song's mood, emotional journey, and sonic landscape. Avoid simply summarizing the lyrics; instead, focus on painting a vivid picture for the listener.
`,
});

const aiGeneratedTrackNarrativesFlow = ai.defineFlow(
  {
    name: 'aiGeneratedTrackNarrativesFlow',
    inputSchema: AiGeneratedTrackNarrativesInputSchema,
    outputSchema: AiGeneratedTrackNarrativesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
