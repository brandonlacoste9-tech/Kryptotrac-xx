/**
 * Analytics Summarizer Bee
 * Summarizes platform metrics using DeepSeek
 */

import OpenAI from 'openai';

const deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
});

export async function run(payload: any) {
    const metrics = payload.metrics || payload;
    const period = payload.period || 'today';

    console.log('[Analytics Summarizer] Summarizing metrics for:', period);

    if (!process.env.DEEPSEEK_API_KEY) {
        return {
            summary: `Analytics summary for ${period}: Service unavailable`,
            metadata: { model: 'none', bee: 'analytics-summarizer' }
        };
    }

    try {
        const completion = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: `You are an analytics assistant for Zyeuté, a Quebec social media app. 
                    Summarize the provided metrics in a clear, actionable way. 
                    Highlight trends and notable changes. Keep it concise.`
                },
                {
                    role: 'user',
                    content: `Summarize these metrics for ${period}:\n${JSON.stringify(metrics, null, 2)}`
                }
            ],
            max_tokens: 256,
            temperature: 0.3,
        });

        return {
            summary: completion.choices[0]?.message?.content || 'No summary available',
            metadata: { model: 'deepseek', bee: 'analytics-summarizer' }
        };

    } catch (error: any) {
        console.error('[Analytics Summarizer] Error:', error.message);
        return {
            summary: `Analytics summary unavailable: ${error.message}`,
            metadata: { model: 'deepseek', bee: 'analytics-summarizer', error: true }
        };
    }
}
