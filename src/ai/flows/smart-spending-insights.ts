'use server';
/**
 * @fileOverview Provides a Genkit flow for analyzing family spending patterns
 * and suggesting personalized savings tips using AI.
 *
 * - smartSpendingInsights - A function that triggers the AI analysis of spending data.
 * - SmartSpendingInsightsInput - The input type for the smartSpendingInsights function.
 * - SmartSpendingInsightsOutput - The return type for the smartSpendingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartSpendingInsightsInputSchema = z.object({
  monthlySpending: z
    .record(z.number())
    .describe(
      'A record of spending per category for a given month, e.g., {\"Groceries\": 500, \"Rent\": 1200, ...}'
    ),
  spendingHistorySummary: z
    .string()
    .optional()
    .describe(
      'An optional summary of historical spending patterns or trends over time.'
    ),
  familyMembers: z
    .array(z.string())
    .optional()
    .describe('An optional list of family members.'),
});
export type SmartSpendingInsightsInput = z.infer<
  typeof SmartSpendingInsightsInputSchema
>;

const SmartSpendingInsightsOutputSchema = z.object({
  spendingAnalysis: z
    .string()
    .describe('A detailed analysis of the family\'s spending patterns.'),
  topSpendingCategories: z
    .array(z.string())
    .describe('A list of categories where the family spends the most.'),
  savingsTips: z
    .array(z.string())
    .describe('Personalized tips for potential savings.'),
});
export type SmartSpendingInsightsOutput = z.infer<
  typeof SmartSpendingInsightsOutputSchema
>;

export async function smartSpendingInsights(
  input: SmartSpendingInsightsInput
): Promise<SmartSpendingInsightsOutput> {
  return smartSpendingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartSpendingInsightsPrompt',
  input: {schema: SmartSpendingInsightsInputSchema},
  output: {schema: SmartSpendingInsightsOutputSchema},
  prompt: `You are an expert financial advisor specializing in family budgeting and savings.

Analyze the provided family spending data to identify patterns, highlight top spending categories, and suggest actionable, personalized savings tips.

--- Spending Data ---
Monthly Spending:
{{#each monthlySpending}}
- {{ @key }}: ${{ this }}
{{/each}}

{{#if spendingHistorySummary}}
Historical Spending Summary: {{{spendingHistorySummary}}}
{{/if}}

{{#if familyMembers}}
Family Members: {{#each familyMembers}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}

--- Instructions ---
Based on the data above, provide:
1. A detailed 'spendingAnalysis' describing the family's spending habits.
2. A 'topSpendingCategories' list identifying the areas with the highest expenditure.
3. 'savingsTips' tailored to their patterns, suggesting practical ways to reduce costs without compromising essential needs.

Ensure the output adheres strictly to the JSON schema provided for the output.
`,
});

const smartSpendingInsightsFlow = ai.defineFlow(
  {
    name: 'smartSpendingInsightsFlow',
    inputSchema: SmartSpendingInsightsInputSchema,
    outputSchema: SmartSpendingInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate spending insights.');
    }
    return output;
  }
);
