import { createOpenAI } from '@ai-sdk/openai';

// Initialize DeepSeek provider
// Uses OpenAI-compatible API endpoint
const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

// DeepSeek V3/Chat model
export const deepseekModel = deepseek('deepseek-chat');

// DeepSeek R1 (Reasoner) model
// export const deepseekReasoner = deepseek('deepseek-reasoner');
