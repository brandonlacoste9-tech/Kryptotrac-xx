/**
 * Ti-Guy Chat Bee
 * Uses the unified Ti-Guy system for authentic Quebec joual chat
 */

import { v3TiGuyChat } from '../../v3-swarm.js';

export async function run(payload: any) {
    const message = payload.message || payload.prompt || '';
    const history = payload.history || [];

    console.log('[Ti-Guy Chat] Processing message:', message.substring(0, 50));

    const response = await v3TiGuyChat(message, history);

    return {
        response,
        metadata: { model: 'deepseek', bee: 'ti-guy-chat' }
    };
}
