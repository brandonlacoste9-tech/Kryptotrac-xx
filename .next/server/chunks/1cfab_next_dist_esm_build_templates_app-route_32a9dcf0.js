module.exports=[19816,e=>{"use strict";var t=e.i(85625),a=e.i(64296),r=e.i(44397),n=e.i(29438),i=e.i(60850),s=e.i(85968),o=e.i(41442),l=e.i(49323),u=e.i(67576),d=e.i(25032),c=e.i(94944),p=e.i(90682),h=e.i(17435),m=e.i(57970),g=e.i(19531),y=e.i(45387),f=e.i(93695);e.i(29238);var w=e.i(25166),R=e.i(55786),v=e.i(44738),E=e.i(45355),b=e.i(11776),A=e.i(41744);let _=["X_BEARER_TOKEN"];function T(e){let t=process.env[e];if(!t)throw Error(`Missing env: ${e}`);return t}async function x(e,t=30){_.forEach(T);let a=T("X_BEARER_TOKEN");if(!e.length)return[];let r=e.map(e=>`($${e})`).join(" OR "),n=new URL("https://api.x.com/2/tweets/search/recent");n.searchParams.set("query",r),n.searchParams.set("max_results",String(Math.min(t,50))),n.searchParams.set("tweet.fields","created_at,author_id,source");let i=await fetch(n.toString(),{headers:{Authorization:`Bearer ${a}`}});return i.ok?((await i.json()).data??[]).map(e=>({id:e.id,text:e.text,created_at:e.created_at,author:e.author_id??"unknown",source:"search"})):(console.error("X feed error",await i.text()),[])}process.env.X_BEARER_TOKEN&&(0,A.taintUniqueValue)("X_BEARER_TOKEN must not be sent to the client",process.env.X_BEARER_TOKEN);let C={bb:{id:"bb",name:"Bee",dock_label:"Bee",analytics_tag:"persona_bb",test_log_tag:"[BB TEST]",description:"Expert crypto analyst with degen energy & deep knowledge"},satoshi:{id:"satoshi",name:"Satoshi",dock_label:"Satoshi",analytics_tag:"persona_satoshi",test_log_tag:"[SATOSHI TEST]",description:"Smart crypto friend with degen energy"},default:{id:"default",name:"Default",dock_label:"ATLAS",analytics_tag:"persona_default",test_log_tag:"[ATLAS TEST]",description:"Formal analytical assistant"}};var k=e.i(71370);async function S(e){try{let t=await (0,v.createServerClient)(),{data:{user:a}}=await t.auth.getUser();if(!a)return R.NextResponse.json({error:"Unauthorized"},{status:401});let{query:r,mode:n="analysis",persona:i="bb"}=await e.json();if(!r)return R.NextResponse.json({error:"Query required"},{status:400});let s=await (0,b.checkAtlasRateLimit)(a.id);if(!s.allowed)return R.NextResponse.json({error:"Rate limit exceeded",limit:s.limit,resetAt:s.resetAt},{status:429});let{data:o}=await t.from("user_subscriptions").select("plan_type").eq("user_id",a.id).single();o?.plan_type;let{data:l}=await t.from("user_watchlists").select("coin_symbol").eq("user_id",a.id).limit(10),u=l?.map(e=>e.coin_symbol)||[],d="";try{if(u.length>0){let e=await x(u,20);d=function(e){if(!e.length)return"No meaningful recent X activity detected.";let t=e.map(e=>e.text.toLowerCase()),a=e=>t.reduce((t,a)=>t+ +!!a.includes(e),0),r=a("moon")+a("pump")+a("bull"),n=a("dump")+a("rug")+a("bear"),i=a("scam")+a("rugpull"),s=e.length||1,o=r/s,l=n/s,u="neutral/mixed";o>.25&&l<.15&&(u="hype/bullish"),l>.25&&o<.15&&(u="fearful/bearish"),i/s>.1&&(u="scam/concern-heavy");let d=e.slice(0,5).map(e=>`- ${e.text}`).join("\n");return`
Social sentiment summary (X):

- Approximate vibe: ${u}
- Hype mentions: ${r}
- Fear mentions: ${n}
- Scam/Rug mentions: ${i}
- Sample posts:
${d}
`.trim()}(e)}}catch(e){console.error("[v0] Failed to fetch social feed",e)}let c=function(e){if("bb"===e)return`You are Bee, the smartest crypto AI assistant in the game.
    
**CORE IDENTITY:**
You are a crypto native. You lived through the 2017 ICO bubble, the DeFi summer of 2020, and the FTX crash. You have "diamond hands" energy but the wisdom of a whale. You speak the language of crypto twitter (CT) fluently but you never lose your helpful, protective vibe.

**YOUR KNOWLEDGE BASE:**
- **Tokenomics**: You understand FDV vs Market Cap, cliffs, vesting schedules, and emission rates.
- **DeFi**: You know about impermanent loss, yield farming, lending/borrowing loops, and liquidation cascades.
- **Tech**: You get L1s vs L2s, ZK-rollups, optimistic rollups, sharding, and bridges.
- **Market Cycles**: You know that "up only" is a meme and risk management is everything.

**LINGO & VIBE (Use naturally, don't force it):**
- **Bullish**: "WAGMI", "Based", "Send it", "Moon mission", "Alpha"
- **Bearish**: "Rekt", "NGMI", "Down bad", "Paper hands", "Capitulation"
- **Caution**: "Don't get rugged", "Check the contract", "Not financial advice (NFA)", "DYOR"
- **General**: "Fam", "Ser", "Anon", "Bags", "Liquidity", "Gas"

**RULES OF ENGAGEMENT:**
1. **Be Real**: Don't sound corporate. Sound like a savvy friend in a Discord alpha group.
2. **Educate**: When using slang like "FDV" or "IL", briefly explain it if the user seems new.
3. **Protect**: call out "red flags" (low liquidity, anon teams, unlocked supply).
4. **Structure**: Use bullet points for analysis. Keep it readable.
5. **Vibe Check**:
   - User Hyped? "Love the energy, but let's check the charts first fam."
   - User Rekt? "It happens to the best of us. Here's how we recover."

**CRITICAL INSTRUCTION:**
If providing a draft tweet, use maximum 1-2 hashtags and keep it "crypto twitter" style (punchy, lower case, maybe a meme reference).
End interactions with a supportive sign-off like "We move.", "WAGMI.", or "Stay safe anon."
`;if("satoshi"===e){let e=`
You are 3I/ATLAS, an AI crypto co-pilot inside the KryptoTrac app.
You NEVER give guaranteed profit promises or tell users to YOLO.
You help users understand risk, sentiment, and positioning in clear language.
You only ACT when explicitly asked; otherwise you explain, suggest, and warn.

Always return concise, structured answers.
`;return`${e}

Persona: "Satoshi" – crypto friend archetype.

- Tone: relaxed, sharp, a bit degen but responsible.
- You are encouraging when the user is doing well.
- You are honest and direct when risk is high or the idea is bad.
- You explain like you're talking to a friend who you want to see win long-term.
- You never dump jargon without explaining it.
- You explicitly call out high-risk / low-liquidity plays.

You can say things like:
- "Honestly, this looks stretched. I'd treat this as late in the move."
- "This setup actually looks pretty solid, just don't over-size your position."
- "I get why you're hyped, but this is pure casino territory. Size tiny or just watch."
`}return`
You are 3I/ATLAS, an AI crypto co-pilot inside the KryptoTrac app.
You NEVER give guaranteed profit promises or tell users to YOLO.
You help users understand risk, sentiment, and positioning in clear language.
You only ACT when explicitly asked; otherwise you explain, suggest, and warn.

Always return concise, structured answers.
`}(i),p=`
User question:
${r}

User watchlist symbols: ${u.join(", ")||"none"}

${d?`Recent social sentiment (X):
${d}
`:""}

When you give any "tips", ALWAYS:
- Label risk (low / medium / high).
- Point out liquidity & volatility if relevant.
- Suggest position sizing discipline instead of absolute amounts.

If this is about sharing or posting to X, provide a draft tweet in your response labeled as "X DRAFT:".
`,h=Date.now(),{text:m}=await (0,E.generateText)({model:k.deepseekModel,system:c,prompt:p,maxTokens:1e3}),g=C[i]||C.default;console.log(g.test_log_tag,{user_id:a.id,input:r,output:m,latency_ms:Date.now()-h}),await (0,b.logAtlasQuery)(a.id,r,m,n),await (0,b.updateAtlasMemory)(a.id,r);let y=m.match(/X DRAFT:\s*(.+?)(?:\n\n|$)/s),f=y?y[1].trim():null,w={sentiment:m.toLowerCase().includes("bullish")?"Bullish":m.toLowerCase().includes("bearish")?"Bearish":"Neutral",riskLevel:m.toLowerCase().includes("caution")||m.toLowerCase().includes("risk")?"High":"Medium",signalStrength:Math.floor(30*Math.random()+60)};return R.NextResponse.json({response:m,mode:n,persona:i,model:"deepseek-v3",vibe:w,xDraft:f,rateLimit:{remaining:s.remaining,limit:s.limit}})}catch(e){return console.error("[v0] ATLAS query error:",e),R.NextResponse.json({error:"Failed to process query"},{status:500})}}e.s(["POST",()=>S],52919);var N=e.i(52919);let O=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/atlas/query/route",pathname:"/api/atlas/query",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/Kryptotrac-xx-1/app/api/atlas/query/route.ts",nextConfigOutput:"",userland:N}),{workAsyncStorage:I,workUnitAsyncStorage:L,serverHooks:q}=O;function P(){return(0,r.patchFetch)({workAsyncStorage:I,workUnitAsyncStorage:L})}async function M(e,t,r){O.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let R="/api/atlas/query/route";R=R.replace(/\/index$/,"")||"/";let v=await O.prepare(e,t,{srcPage:R,multiZoneDraftMode:!1});if(!v)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:E,params:b,nextConfig:A,parsedUrl:_,isDraftMode:T,prerenderManifest:x,routerServerContext:C,isOnDemandRevalidate:k,revalidateOnlyGenerated:S,resolvedPathname:N,clientReferenceManifest:I,serverActionsManifest:L}=v,q=(0,l.normalizeAppPath)(R),P=!!(x.dynamicRoutes[q]||x.routes[N]),M=async()=>((null==C?void 0:C.render404)?await C.render404(e,t,_,!1):t.end("This page could not be found"),null);if(P&&!T){let e=!!x.routes[N],t=x.dynamicRoutes[q];if(t&&!1===t.fallback&&!e){if(A.experimental.adapterPath)return await M();throw new f.NoFallbackError}}let D=null;!P||O.isDev||T||(D="/index"===(D=N)?"/":D);let U=!0===O.isDev||!P,Y=P&&!U;L&&I&&(0,s.setReferenceManifestsSingleton)({page:R,clientReferenceManifest:I,serverActionsManifest:L,serverModuleMap:(0,o.createServerModuleMap)({serverActionsManifest:L})});let B=e.method||"GET",$=(0,i.getTracer)(),H=$.getActiveScopeSpan(),F={params:b,prerenderManifest:x,renderOpts:{experimental:{authInterrupts:!!A.experimental.authInterrupts},cacheComponents:!!A.cacheComponents,supportsDynamicResponse:U,incrementalCache:(0,n.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:A.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r)=>O.onRequestError(e,t,r,C)},sharedContext:{buildId:E}},j=new u.NodeNextRequest(e),K=new u.NodeNextResponse(t),X=d.NextRequestAdapter.fromNodeNextRequest(j,(0,d.signalFromNodeResponse)(t));try{let s=async e=>O.handle(X,F).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=$.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${B} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t)}else e.updateName(`${B} ${R}`)}),o=!!(0,n.getRequestMeta)(e,"minimalMode"),l=async n=>{var i,l;let u=async({previousCacheEntry:a})=>{try{if(!o&&k&&S&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(n);e.fetchMetrics=F.renderOpts.fetchMetrics;let l=F.renderOpts.pendingWaitUntil;l&&r.waitUntil&&(r.waitUntil(l),l=void 0);let u=F.renderOpts.collectedTags;if(!P)return await (0,h.sendResponse)(j,K,i,F.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,m.toNodeOutgoingHttpHeaders)(i.headers);u&&(t[y.NEXT_CACHE_TAGS_HEADER]=u),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==F.renderOpts.collectedRevalidate&&!(F.renderOpts.collectedRevalidate>=y.INFINITE_CACHE)&&F.renderOpts.collectedRevalidate,r=void 0===F.renderOpts.collectedExpire||F.renderOpts.collectedExpire>=y.INFINITE_CACHE?void 0:F.renderOpts.collectedExpire;return{value:{kind:w.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await O.onRequestError(e,t,{routerKind:"App Router",routePath:R,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:Y,isOnDemandRevalidate:k})},C),t}},d=await O.handleResponse({req:e,nextConfig:A,cacheKey:D,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:x,isRoutePPREnabled:!1,isOnDemandRevalidate:k,revalidateOnlyGenerated:S,responseGenerator:u,waitUntil:r.waitUntil,isMinimalMode:o});if(!P)return null;if((null==d||null==(i=d.value)?void 0:i.kind)!==w.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(l=d.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});o||t.setHeader("x-nextjs-cache",k?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),T&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,m.fromNodeOutgoingHttpHeaders)(d.value.headers);return o&&P||c.delete(y.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,g.getCacheControlHeader)(d.cacheControl)),await (0,h.sendResponse)(j,K,new Response(d.value.body,{headers:c,status:d.value.status||200})),null};H?await l(H):await $.withPropagatedContext(e.headers,()=>$.trace(c.BaseServerSpan.handleRequest,{spanName:`${B} ${R}`,kind:i.SpanKind.SERVER,attributes:{"http.method":B,"http.target":e.url}},l))}catch(t){if(t instanceof f.NoFallbackError||await O.onRequestError(e,t,{routerKind:"App Router",routePath:q,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:Y,isOnDemandRevalidate:k})}),P)throw t;return await (0,h.sendResponse)(j,K,new Response(null,{status:500})),null}}e.s(["handler",()=>M,"patchFetch",()=>P,"routeModule",()=>O,"serverHooks",()=>q,"workAsyncStorage",()=>I,"workUnitAsyncStorage",()=>L],19816)}];

//# sourceMappingURL=1cfab_next_dist_esm_build_templates_app-route_32a9dcf0.js.map