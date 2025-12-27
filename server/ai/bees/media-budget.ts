export async function run(payload: any) {
    console.log('[Media Budget] Checking budget:', payload);
    return {
        approved: true,
        remainingBudget: 100.00,
        metadata: { model: 'mistral' }
    };
}
