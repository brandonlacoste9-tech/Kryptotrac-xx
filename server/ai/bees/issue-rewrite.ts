export async function run(payload: any) {
    console.log('[Issue Rewrite] Rewriting issue:', payload);
    return {
        rewritten: "Fix the navigation bar glitch on mobile devices.",
        metadata: { model: 'deepseek' }
    };
}
