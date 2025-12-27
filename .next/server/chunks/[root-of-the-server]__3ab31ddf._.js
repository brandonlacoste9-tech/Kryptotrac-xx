module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},28575,e=>{"use strict";async function t(e,t){if(!process.env.RESEND_API_KEY)return console.log("[v0] Email would be sent in production:",{to:e,subject:t.subject}),!0;try{let r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.RESEND_API_KEY}`},body:JSON.stringify({from:"KryptoTrac <noreply@kryptotrac.app>",to:[e],subject:t.subject,html:t.html})});if(!r.ok){let e=await r.text();return console.error("[v0] Failed to send email:",e),!1}return!0}catch(e){return console.error("[v0] Error sending email:",e),!1}}function r(e){let t=e.change24h>=0,r=t?"+":"",o=`
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
  `;return t(e,{subject:`🔔 ${r} Alert: Price ${s} $${i}`,html:l})}e.s(["createDailyDigestEmail",()=>r,"sendEmail",()=>t,"sendPriceAlertEmail",()=>a,"sendWelcomeEmail",()=>o])},94707,e=>{"use strict";var t=e.i(85625),r=e.i(64296),o=e.i(44397),a=e.i(29438),i=e.i(60850),n=e.i(85968),s=e.i(41442),l=e.i(49323),d=e.i(67576),p=e.i(25032),c=e.i(94944),g=e.i(90682),u=e.i(17435),h=e.i(57970),x=e.i(19531),f=e.i(45387),m=e.i(93695);e.i(29238);var b=e.i(25166),y=e.i(28575),v=e.i(44738),w=e.i(55786);async function R(e){try{let{email:t,name:r}=await e.json();if(!t)return w.NextResponse.json({error:"Email is required"},{status:400});let o=await (0,v.createServerClient)(),{data:{user:a}}=await o.auth.getUser();if(!a)return w.NextResponse.json({error:"Unauthorized"},{status:401});if(console.log("[v0] Sending welcome email to:",t),(await (0,y.sendWelcomeEmail)({to:t,name:r})).success)return w.NextResponse.json({success:!0});return w.NextResponse.json({error:"Failed to send email"},{status:500})}catch(e){return console.error("[v0] Welcome email API error:",e),w.NextResponse.json({error:"Internal server error"},{status:500})}}e.s(["POST",()=>R],66452);var P=e.i(66452);let k=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/auth/welcome/route",pathname:"/api/auth/welcome",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/Kryptotrac-xx-1/app/api/auth/welcome/route.ts",nextConfigOutput:"",userland:P}),{workAsyncStorage:E,workUnitAsyncStorage:$,serverHooks:T}=k;function C(){return(0,o.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:$})}async function A(e,t,o){k.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let y="/api/auth/welcome/route";y=y.replace(/\/index$/,"")||"/";let v=await k.prepare(e,t,{srcPage:y,multiZoneDraftMode:!1});if(!v)return t.statusCode=400,t.end("Bad Request"),null==o.waitUntil||o.waitUntil.call(o,Promise.resolve()),null;let{buildId:w,params:R,nextConfig:P,parsedUrl:E,isDraftMode:$,prerenderManifest:T,routerServerContext:C,isOnDemandRevalidate:A,revalidateOnlyGenerated:_,resolvedPathname:U,clientReferenceManifest:N,serverActionsManifest:S}=v,j=(0,l.normalizeAppPath)(y),I=!!(T.dynamicRoutes[j]||T.routes[U]),O=async()=>((null==C?void 0:C.render404)?await C.render404(e,t,E,!1):t.end("This page could not be found"),null);if(I&&!$){let e=!!T.routes[U],t=T.dynamicRoutes[j];if(t&&!1===t.fallback&&!e){if(P.experimental.adapterPath)return await O();throw new m.NoFallbackError}}let D=null;!I||k.isDev||$||(D="/index"===(D=U)?"/":D);let M=!0===k.isDev||!I,F=I&&!M;S&&N&&(0,n.setReferenceManifestsSingleton)({page:y,clientReferenceManifest:N,serverActionsManifest:S,serverModuleMap:(0,s.createServerModuleMap)({serverActionsManifest:S})});let K=e.method||"GET",q=(0,i.getTracer)(),z=q.getActiveScopeSpan(),H={params:R,prerenderManifest:T,renderOpts:{experimental:{authInterrupts:!!P.experimental.authInterrupts},cacheComponents:!!P.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,a.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:P.cacheLife,waitUntil:o.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,o)=>k.onRequestError(e,t,o,C)},sharedContext:{buildId:w}},L=new d.NodeNextRequest(e),B=new d.NodeNextResponse(t),W=p.NextRequestAdapter.fromNodeNextRequest(L,(0,p.signalFromNodeResponse)(t));try{let n=async e=>k.handle(W,H).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=q.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let o=r.get("next.route");if(o){let t=`${K} ${o}`;e.setAttributes({"next.route":o,"http.route":o,"next.span_name":t}),e.updateName(t)}else e.updateName(`${K} ${y}`)}),s=!!(0,a.getRequestMeta)(e,"minimalMode"),l=async a=>{var i,l;let d=async({previousCacheEntry:r})=>{try{if(!s&&A&&_&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await n(a);e.fetchMetrics=H.renderOpts.fetchMetrics;let l=H.renderOpts.pendingWaitUntil;l&&o.waitUntil&&(o.waitUntil(l),l=void 0);let d=H.renderOpts.collectedTags;if(!I)return await (0,u.sendResponse)(L,B,i,H.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,h.toNodeOutgoingHttpHeaders)(i.headers);d&&(t[f.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==H.renderOpts.collectedRevalidate&&!(H.renderOpts.collectedRevalidate>=f.INFINITE_CACHE)&&H.renderOpts.collectedRevalidate,o=void 0===H.renderOpts.collectedExpire||H.renderOpts.collectedExpire>=f.INFINITE_CACHE?void 0:H.renderOpts.collectedExpire;return{value:{kind:b.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:o}}}}catch(t){throw(null==r?void 0:r.isStale)&&await k.onRequestError(e,t,{routerKind:"App Router",routePath:y,routeType:"route",revalidateReason:(0,g.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:A})},C),t}},p=await k.handleResponse({req:e,nextConfig:P,cacheKey:D,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:T,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:_,responseGenerator:d,waitUntil:o.waitUntil,isMinimalMode:s});if(!I)return null;if((null==p||null==(i=p.value)?void 0:i.kind)!==b.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==p||null==(l=p.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});s||t.setHeader("x-nextjs-cache",A?"REVALIDATED":p.isMiss?"MISS":p.isStale?"STALE":"HIT"),$&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,h.fromNodeOutgoingHttpHeaders)(p.value.headers);return s&&I||c.delete(f.NEXT_CACHE_TAGS_HEADER),!p.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,x.getCacheControlHeader)(p.cacheControl)),await (0,u.sendResponse)(L,B,new Response(p.value.body,{headers:c,status:p.value.status||200})),null};z?await l(z):await q.withPropagatedContext(e.headers,()=>q.trace(c.BaseServerSpan.handleRequest,{spanName:`${K} ${y}`,kind:i.SpanKind.SERVER,attributes:{"http.method":K,"http.target":e.url}},l))}catch(t){if(t instanceof m.NoFallbackError||await k.onRequestError(e,t,{routerKind:"App Router",routePath:j,routeType:"route",revalidateReason:(0,g.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:A})}),I)throw t;return await (0,u.sendResponse)(L,B,new Response(null,{status:500})),null}}e.s(["handler",()=>A,"patchFetch",()=>C,"routeModule",()=>k,"serverHooks",()=>T,"workAsyncStorage",()=>E,"workUnitAsyncStorage",()=>$],94707)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__3ab31ddf._.js.map