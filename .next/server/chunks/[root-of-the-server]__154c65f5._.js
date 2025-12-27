module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},38636,e=>{"use strict";let t=process.env.COINGECKO_API_KEY||"",r=new Map;async function o(e){let o,a=`price-${e}`,i=(o=r.get(a))&&Date.now()-o.timestamp<6e4?o.data:null;if(i)return i;try{let o,i=await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${e}&vs_currencies=usd`,{headers:(o={Accept:"application/json"},t&&(o["x-cg-pro-api-key"]=t),o)});if(!i.ok)throw Error("Failed to fetch price");let n=await i.json(),s=n[e]?.usd||0;return r.set(a,{data:s,timestamp:Date.now()}),s}catch(e){throw console.error("[v0] CoinGecko price error:",e),e}}e.s(["getCoinPrice",()=>o])},28575,e=>{"use strict";async function t(e,t){if(!process.env.RESEND_API_KEY)return console.log("[v0] Email would be sent in production:",{to:e,subject:t.subject}),!0;try{let r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.RESEND_API_KEY}`},body:JSON.stringify({from:"KryptoTrac <noreply@kryptotrac.app>",to:[e],subject:t.subject,html:t.html})});if(!r.ok){let e=await r.text();return console.error("[v0] Failed to send email:",e),!1}return!0}catch(e){return console.error("[v0] Error sending email:",e),!1}}function r(e){let t=e.change24h>=0,r=t?"+":"",o=`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000000;
            color: #ffffff;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(0, 0, 0, 0.8));
            border-radius: 12px;
            border: 2px solid rgba(239, 68, 68, 0.3);
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(to right, #ef4444, #dc2626);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          .stats {
            background: rgba(20, 20, 20, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
          }
          .mover {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: rgba(30, 30, 30, 0.6);
            border-radius: 8px;
            margin-bottom: 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 32px;
            background: linear-gradient(to right, #dc2626, #ef4444);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
          }
          .insight-box {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0, 0, 0, 0.6));
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚡ KryptoTrac</div>
            <p style="margin: 0; color: rgba(255, 255, 255, 0.8);">Your ${e.isPro?"Daily":"Weekly"} Portfolio Snapshot</p>
          </div>
          
          <div style="padding: 20px; text-align: center;">
            <p style="font-size: 18px; color: rgba(255, 255, 255, 0.8); margin: 0;">
              Hey ${e.userName}, here's how your portfolio is performing:
            </p>
          </div>

          <div class="stats">
            <h3 style="margin-top: 0; color: rgba(255, 255, 255, 0.9);">Portfolio Value</h3>
            <div style="font-size: 36px; font-weight: bold; margin: 15px 0;">
              $${e.totalValue.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
            </div>
            <div style="font-size: 22px; color: ${t?"#22c55e":"#ef4444"}; font-weight: 600;">
              ${r}$${Math.abs(e.change24h).toFixed(2)} (${r}${e.changePercent24h.toFixed(2)}%) 24h
            </div>
          </div>

          ${e.topMovers.length>0?`
            <div class="stats">
              <h3 style="margin-top: 0; color: rgba(255, 255, 255, 0.9);">Top Movers in Your Portfolio</h3>
              ${e.topMovers.map(e=>`
                <div class="mover">
                  <div>
                    <div style="font-weight: 600; font-size: 16px;">${e.name}</div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">${e.symbol.toUpperCase()}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="color: ${e.changePercent>=0?"#22c55e":"#ef4444"}; font-weight: 600; font-size: 18px;">
                      ${e.changePercent>=0?"+":""}${e.changePercent.toFixed(2)}%
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                      $${e.value.toFixed(2)}
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          `:""}

          ${e.isPro&&e.insights.summary?`
            <div class="insight-box">
              <h3 style="margin-top: 0; color: rgba(255, 255, 255, 0.9);">💡 AI Insight ${e.isPro?"(Pro)":""}</h3>
              <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 10px 0;">
                ${e.insights.summary}
              </p>
              ${e.insights.keyTrends.length>0?`
                <div style="margin-top: 15px;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: rgba(255, 255, 255, 0.9);">Key Trends:</div>
                  ${e.insights.keyTrends.map(e=>`
                    <div style="padding: 6px 0; color: rgba(255, 255, 255, 0.7);">• ${e}</div>
                  `).join("")}
                </div>
              `:""}
            </div>
          `:!e.isPro?`
            <div class="insight-box">
              <h3 style="margin-top: 0; color: rgba(255, 255, 255, 0.9);">💡 Unlock AI Insights with Pro</h3>
              <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 10px 0;">
                Upgrade to Pro for daily digests with personalized AI-powered portfolio analysis, risk assessment, and actionable recommendations.
              </p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL||"https://kryptotrac.app"}/pricing" class="button" style="display: inline-block; margin-top: 10px;">Upgrade to Pro</a>
            </div>
          `:""}

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL||"https://kryptotrac.app"}" class="button">View Full Dashboard</a>
          </div>
          
          <div style="text-align: center; padding: 30px 20px 20px; color: rgba(255, 255, 255, 0.5); font-size: 14px; border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 30px;">
            <p style="margin: 5px 0;">KryptoTrac - Track your crypto portfolio with real-time insights</p>
            <p style="margin: 5px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL||"https://kryptotrac.app"}/settings" style="color: #ef4444; text-decoration: none;">Manage Email Preferences</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;return{subject:`${t?"📈":"📉"} Your Portfolio: ${r}${e.changePercent24h.toFixed(2)}% (${e.isPro?"Daily":"Weekly"} Update)`,html:o}}async function o(e,r){return t(e,{subject:"Welcome to KryptoTrac!",html:`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000000;
            color: #ffffff;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(0, 0, 0, 0.8));
            border-radius: 12px;
            border: 2px solid rgba(239, 68, 68, 0.3);
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(to right, #ef4444, #dc2626);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          .content {
            padding: 30px 20px;
            background: rgba(20, 20, 20, 0.6);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 32px;
            background: linear-gradient(to right, #dc2626, #ef4444);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚡ KryptoTrac</div>
            <p style="margin: 0; color: rgba(255, 255, 255, 0.8);">Welcome to the future of crypto tracking</p>
          </div>
          
          <div class="content">
            <h2 style="margin-top: 0;">Welcome${r?`, ${r}`:""}!</h2>
            <p>Thanks for signing up for KryptoTrac. You're now ready to track your crypto portfolio with real-time insights and advanced analytics.</p>
            
            <p><strong>Get started by:</strong></p>
            <ul>
              <li>Adding coins to your watchlist</li>
              <li>Creating your first portfolio</li>
              <li>Setting up price alerts</li>
              <li>Exploring advanced analytics (Pro)</li>
            </ul>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL||"https://kryptotrac.app"}" class="button">Go to Dashboard</a>
          </div>
          
          <div class="footer">
            <p>KryptoTrac - Track your crypto portfolio with real-time insights</p>
            <p>You're receiving this email because you signed up for KryptoTrac.</p>
          </div>
        </div>
      </body>
    </html>
  `})}async function a(e,r,o,a,i,n){let s="above"===n?"risen above":"fallen below",l=`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000000;
            color: #ffffff;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .alert-box {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(0, 0, 0, 0.8));
            border: 2px solid rgba(239, 68, 68, 0.5);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
          }
          .coin-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .price {
            font-size: 36px;
            font-weight: bold;
            color: #ef4444;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 32px;
            background: linear-gradient(to right, #dc2626, #ef4444);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="alert-box">
            <div style="font-size: 48px; margin-bottom: 20px;">🔔</div>
            <h2 style="margin: 0;">Price Alert Triggered!</h2>
            
            <div class="coin-name">${r} (${o.toUpperCase()})</div>
            <div class="price">$${a.toFixed(2)}</div>
            
            <p style="font-size: 18px; color: rgba(255, 255, 255, 0.8);">
              has ${s} your target price of <strong>$${i.toFixed(2)}</strong>
            </p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL||"https://kryptotrac.app"}/market" class="button">View Market</a>
          </div>
          
          <div style="text-align: center; padding: 20px; color: rgba(255, 255, 255, 0.5); font-size: 14px;">
            <p>KryptoTrac Price Alerts</p>
          </div>
        </div>
      </body>
    </html>
  `;return t(e,{subject:`🔔 ${r} Alert: Price ${s} $${i}`,html:l})}e.s(["createDailyDigestEmail",()=>r,"sendEmail",()=>t,"sendPriceAlertEmail",()=>a,"sendWelcomeEmail",()=>o])},51046,e=>{"use strict";var t=e.i(85625),r=e.i(64296),o=e.i(44397),a=e.i(29438),i=e.i(60850),n=e.i(85968),s=e.i(41442),l=e.i(49323),d=e.i(67576),p=e.i(25032),c=e.i(94944),g=e.i(90682),u=e.i(17435),h=e.i(57970),f=e.i(19531),m=e.i(45387),x=e.i(93695);e.i(29238);var y=e.i(25166),b=e.i(55786),v=e.i(44738),w=e.i(28575),k=e.i(38636),E=e.i(41744);async function R(e){try{if(e.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`)return b.NextResponse.json({error:"Unauthorized"},{status:401});let t=await (0,v.createClient)(),r=new Date,o=r.getDay();console.log("[v0] Starting digest cron job");let{data:a,error:i}=await t.from("digest_preferences").select(`
        *,
        subscriptions (plan, status)
      `).eq("digest_enabled",!0).in("digest_frequency",["daily","weekly"]);if(i)return console.error("[v0] Error fetching preferences:",i),b.NextResponse.json({error:"Failed to fetch preferences"},{status:500});console.log(`[v0] Found ${a?.length||0} users with digests enabled`);let n=0,s=0;for(let e of a||[])try{let a=e.subscriptions?.plan==="pro"&&e.subscriptions?.status==="active";if(!("daily"===e.digest_frequency&&a||"weekly"===e.digest_frequency&&1===o||"daily"===e.digest_frequency&&!e.last_sent_at)){console.log(`[v0] Skipping user ${e.user_id} - not scheduled for today`);continue}if(e.last_sent_at){let t=new Date(e.last_sent_at);if((r.getTime()-t.getTime())/36e5<20){console.log(`[v0] Skipping user ${e.user_id} - already sent in last 20 hours`);continue}}let{data:i,error:l}=await t.auth.admin.getUserById(e.user_id);if(l||!i.user){console.error("[v0] Error fetching user:",l);continue}let d=i.user.email,p=i.user.user_metadata?.name||d.split("@")[0],{data:c,error:g}=await t.from("user_portfolios").select("*").eq("user_id",e.user_id);if(g||!c||0===c.length){console.log(`[v0] No holdings for user ${e.user_id}, skipping`);continue}let u=[...new Set(c.map(e=>e.coin_id))],h={};for(let e of u){let t=await (0,k.getCoinPrice)(e);t&&(h[e]=t)}let f=0,m=0,x=c.map(e=>{let t=h[e.coin_id]||0,r=e.quantity*t,o=e.quantity*e.purchase_price,a=r-o,i=o>0?a/o*100:0;return f+=r,m+=o,{name:e.coin_name,symbol:e.coin_symbol,value:r,change:a,changePercent:i}}),y=f-m,b=m>0?y/m*100:0,v=x.sort((e,t)=>Math.abs(t.changePercent)-Math.abs(e.changePercent)).slice(0,3),E=a?{summary:"Your portfolio shows strong momentum with balanced diversification across major crypto assets.",riskLevel:"moderate",keyTrends:["Bitcoin maintaining support levels","Altcoins showing recovery signals","Overall market sentiment improving"]}:{summary:"",riskLevel:"moderate",keyTrends:[]},R={userName:p,totalValue:f,change24h:y,changePercent24h:b,topMovers:v,insights:E,isPro:a},_=(0,w.createDailyDigestEmail)(R);await (0,w.sendEmail)(d,_)?(await t.from("digest_preferences").update({last_sent_at:r.toISOString()}).eq("user_id",e.user_id),n++,console.log(`[v0] Sent digest to ${d}`)):(s++,console.error(`[v0] Failed to send digest to ${d}`))}catch(t){s++,console.error(`[v0] Error processing user ${e.user_id}:`,t)}return console.log(`[v0] Digest cron complete: ${n} sent, ${s} errors`),b.NextResponse.json({success:!0,sent:n,errors:s,total:a?.length||0})}catch(e){return console.error("[v0] Digest cron error:",e),b.NextResponse.json({error:"Internal server error"},{status:500})}}process.env.CRON_SECRET&&(0,E.taintUniqueValue)("CRON_SECRET must not be sent to the client",process.env.CRON_SECRET),e.s(["GET",()=>R,"dynamic",0,"force-dynamic","runtime",0,"nodejs"],53650);var _=e.i(53650);let P=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/cron/send-digests/route",pathname:"/api/cron/send-digests",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/Kryptotrac-xx-1/app/api/cron/send-digests/route.ts",nextConfigOutput:"",userland:_}),{workAsyncStorage:$,workUnitAsyncStorage:C,serverHooks:T}=P;function A(){return(0,o.patchFetch)({workAsyncStorage:$,workUnitAsyncStorage:C})}async function S(e,t,o){P.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let b="/api/cron/send-digests/route";b=b.replace(/\/index$/,"")||"/";let v=await P.prepare(e,t,{srcPage:b,multiZoneDraftMode:!1});if(!v)return t.statusCode=400,t.end("Bad Request"),null==o.waitUntil||o.waitUntil.call(o,Promise.resolve()),null;let{buildId:w,params:k,nextConfig:E,parsedUrl:R,isDraftMode:_,prerenderManifest:$,routerServerContext:C,isOnDemandRevalidate:T,revalidateOnlyGenerated:A,resolvedPathname:S,clientReferenceManifest:N,serverActionsManifest:U}=v,j=(0,l.normalizeAppPath)(b),D=!!($.dynamicRoutes[j]||$.routes[S]),I=async()=>((null==C?void 0:C.render404)?await C.render404(e,t,R,!1):t.end("This page could not be found"),null);if(D&&!_){let e=!!$.routes[S],t=$.dynamicRoutes[j];if(t&&!1===t.fallback&&!e){if(E.experimental.adapterPath)return await I();throw new x.NoFallbackError}}let O=null;!D||P.isDev||_||(O="/index"===(O=S)?"/":O);let q=!0===P.isDev||!D,M=D&&!q;U&&N&&(0,n.setReferenceManifestsSingleton)({page:b,clientReferenceManifest:N,serverActionsManifest:U,serverModuleMap:(0,s.createServerModuleMap)({serverActionsManifest:U})});let F=e.method||"GET",K=(0,i.getTracer)(),z=K.getActiveScopeSpan(),H={params:k,prerenderManifest:$,renderOpts:{experimental:{authInterrupts:!!E.experimental.authInterrupts},cacheComponents:!!E.cacheComponents,supportsDynamicResponse:q,incrementalCache:(0,a.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:E.cacheLife,waitUntil:o.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,o)=>P.onRequestError(e,t,o,C)},sharedContext:{buildId:w}},L=new d.NodeNextRequest(e),B=new d.NodeNextResponse(t),Y=p.NextRequestAdapter.fromNodeNextRequest(L,(0,p.signalFromNodeResponse)(t));try{let n=async e=>P.handle(Y,H).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=K.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let o=r.get("next.route");if(o){let t=`${F} ${o}`;e.setAttributes({"next.route":o,"http.route":o,"next.span_name":t}),e.updateName(t)}else e.updateName(`${F} ${b}`)}),s=!!(0,a.getRequestMeta)(e,"minimalMode"),l=async a=>{var i,l;let d=async({previousCacheEntry:r})=>{try{if(!s&&T&&A&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await n(a);e.fetchMetrics=H.renderOpts.fetchMetrics;let l=H.renderOpts.pendingWaitUntil;l&&o.waitUntil&&(o.waitUntil(l),l=void 0);let d=H.renderOpts.collectedTags;if(!D)return await (0,u.sendResponse)(L,B,i,H.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,h.toNodeOutgoingHttpHeaders)(i.headers);d&&(t[m.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==H.renderOpts.collectedRevalidate&&!(H.renderOpts.collectedRevalidate>=m.INFINITE_CACHE)&&H.renderOpts.collectedRevalidate,o=void 0===H.renderOpts.collectedExpire||H.renderOpts.collectedExpire>=m.INFINITE_CACHE?void 0:H.renderOpts.collectedExpire;return{value:{kind:y.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:o}}}}catch(t){throw(null==r?void 0:r.isStale)&&await P.onRequestError(e,t,{routerKind:"App Router",routePath:b,routeType:"route",revalidateReason:(0,g.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:T})},C),t}},p=await P.handleResponse({req:e,nextConfig:E,cacheKey:O,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:$,isRoutePPREnabled:!1,isOnDemandRevalidate:T,revalidateOnlyGenerated:A,responseGenerator:d,waitUntil:o.waitUntil,isMinimalMode:s});if(!D)return null;if((null==p||null==(i=p.value)?void 0:i.kind)!==y.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==p||null==(l=p.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});s||t.setHeader("x-nextjs-cache",T?"REVALIDATED":p.isMiss?"MISS":p.isStale?"STALE":"HIT"),_&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,h.fromNodeOutgoingHttpHeaders)(p.value.headers);return s&&D||c.delete(m.NEXT_CACHE_TAGS_HEADER),!p.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,f.getCacheControlHeader)(p.cacheControl)),await (0,u.sendResponse)(L,B,new Response(p.value.body,{headers:c,status:p.value.status||200})),null};z?await l(z):await K.withPropagatedContext(e.headers,()=>K.trace(c.BaseServerSpan.handleRequest,{spanName:`${F} ${b}`,kind:i.SpanKind.SERVER,attributes:{"http.method":F,"http.target":e.url}},l))}catch(t){if(t instanceof x.NoFallbackError||await P.onRequestError(e,t,{routerKind:"App Router",routePath:j,routeType:"route",revalidateReason:(0,g.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:T})}),D)throw t;return await (0,u.sendResponse)(L,B,new Response(null,{status:500})),null}}e.s(["handler",()=>S,"patchFetch",()=>A,"routeModule",()=>P,"serverHooks",()=>T,"workAsyncStorage",()=>$,"workUnitAsyncStorage",()=>C],51046)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__154c65f5._.js.map