/* packages/guardian/src/index.ts - minimal stub */
export function validateTask(task:any){ return { ok:true, violations:[] }; }
export function createCheckpoint(state:any){ return { id: 'cp_' + Date.now() }; }
