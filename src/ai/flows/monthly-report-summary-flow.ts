'use server';
/**
 * @fileOverview A Genkit flow for summarizing financial reports.
 *
 * - monthlyReportSummary - A function that generates a natural language summary of a financial report.
 * - MonthlyReportSummaryInput - The input type for the monthlyReportSummary function.
 * - MonthlyReportSummaryOutput - The return type for the monthlyReportSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MonthlyReportSummaryInputSchema = z.object({
  reportType: z.enum(['monthly', 'yearly']).describe('The type of report being summarized (monthly or yearly).'),
  periodDescription: z.string().describe('A natural language description of the current report period (e.g., "January 2024" or "Fiscal Year 2023").'),
  currentPeriodData: z
    .array(
      z.object({
        category: z.string().describe('The expense category name (e.g., "Groceries", "Rent").'),
        amount: z.number().describe('The total spending in this category for the current period.'),
      })
    )
    .describe('An array of objects, each representing a spending category and its total amount for the current period.'),
  previousPeriodData: z
    .array(
      z.object({
        category: z.string().describe('The expense category name (e.g., "Groceries", "Rent").'),
        amount: z.number().describe('The total spending in this category for the previous period.'),
      })
    )
    .optional()
    .describe('Optional: An array of objects, each representing a spending category and its total amount for the previous period, for comparison.'),
});
export type MonthlyReportSummaryInput = z.infer<typeof MonthlyReportSummaryInputSchema>;

const MonthlyReportSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise, natural language summary of the financial report, including key findings and insights.'),
});
export type MonthlyReportSummaryOutput = z.infer<typeof MonthlyReportSummaryOutputSchema>;

export async function monthlyReportSummary(input: MonthlyReportSummaryInput): Promise<MonthlyReportSummaryOutput> {
  return monthlyReportSummaryFlow(input);
}

const reportSummaryPrompt = ai.definePrompt({
  name: 'reportSummaryPrompt',
  input: {schema: MonthlyReportSummaryInputSchema},
  output: {schema: MonthlyReportSummaryOutputSchema},
  prompt: `You are an expert financial analyst. Your task is to provide a concise, natural language summary of a family's financial report.

Analyze the following {{reportType}} financial data for the period of {{{periodDescription}}}.

--- Current Period Spending ---
{{#each currentPeriodData}}
- {{category}}: {{amount}}
{{/each}}

{{#if previousPeriodData}}
--- Previous Period Spending (for comparison) ---
{{#each previousPeriodData}}
- {{category}}: {{amount}}
{{/each}}
{{/if}}

Your summary should cover:
1.  Major spending categories and their respective amounts.
2.  Any significant changes in spending patterns compared to the previous period (if provided). Identify categories with notable increases or decreases.
3.  Overall financial health, including insights or potential areas for savings.

Keep the summary under 200 words and focus on actionable insights.

Generate the summary in a structured JSON format with a single 'summary' field.
`,
});

const monthlyReportSummaryFlow = ai.defineFlow(
  {
    name: 'monthlyReportSummaryFlow',
    inputSchema: MonthlyReportSummaryInputSchema,
    outputSchema: MonthlyReportSummaryOutputSchema,
  },
  async input => {
    const {output} = await reportSummaryPrompt(input);
    return output!;
  }
);
