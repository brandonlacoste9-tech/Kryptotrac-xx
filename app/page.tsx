"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function useScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const [value, setValue] = useState(0);

  useEffect(() => {
    return progress.on("change", (v) => setValue(v));
  }, [progress]);

  return value;
}

export default function HomePage() {
  const progress = useScrollProgress();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top nav */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400" />
            <span className="font-semibold tracking-tight">KOLONI</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/70">
            <span className="hidden md:inline">Scroll to descend the cat ↓</span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              {progress.toFixed(0)}% deep
            </span>
          </div>
        </div>
      </header>

      {/* Hero / long EMU strip */}
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-20">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_60%),radial-gradient(circle_at_bottom,_#06b6d422,_transparent_60%)]" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 pb-20 pt-10 md:flex-row">
          {/* Copy */}
          <div className="flex-1 space-y-6">
            <p className="inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
              Live on Vercel · EMU-style long cat scroll
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
              The cat is long.
              <span className="block text-emerald-300">
                Your feed is even longer.
              </span>
            </h1>
            <p className="max-w-xl text-sm text-white/70 md:text-base">
              Koloni turns endless scroll energy into something useful—an
              EMU-style, ultra-tall story rail for your drops, status, and
              live experiments. Built to live on one URL and never sit still.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300">
                Launch Koloni rail
              </button>
              <button className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/80 hover:border-white/40 hover:text-white">
                Watch the long-cat run
              </button>
              <p className="w-full text-xs text-white/50 md:w-auto">
                No logins. Just a link and a scroll wheel.
              </p>
            </div>
          </div>

          {/* EMU video rail */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/0 blur-3xl" />

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative mx-auto flex h-[520px] max-h-[80vh] w-[260px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#050608] shadow-[0_0_80px_rgba(0,0,0,0.8)]"
            >
              {/* “Phone” chrome */}
              <div className="flex items-center justify-between px-4 pt-4 text-[10px] text-white/40">
                <span>KOLONI LIVE</span>
                <span>EMU · LONG CAT</span>
              </div>
              <div className="mx-3 mt-2 mb-3 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Scrollable long video */}
              <div className="relative flex-1 overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#050608] to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#050608] to-transparent" />

                <video
                  className="h-full w-full translate-y-0 object-cover [transform:translate3d(0,0,0)]"
                  src="/koloni-long-cat.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                />

                {/* Fake scroll thumb synced with page progress */}
                <div className="pointer-events-none absolute right-1 top-10 flex h-[80%] w-1 flex-col rounded-full bg-white/5">
                  <div
                    className="mx-[2px] mt-0.5 h-8 rounded-full bg-emerald-400"
                    style={{
                      transform: `translateY(${progress * 0.65}%)`,
                      transition: "transform 0.15s ease-out",
                    }}
                  />
                </div>
              </div>

              {/* Bottom description */}
              <div className="border-t border-white/10 px-4 py-3">
                <p className="text-[11px] font-medium text-white/80">
                  Long Cat Rail · Koloni
                </p>
                <p className="mt-1 text-[10px] text-white/50">
                  Every scroll reveals a new clip, drop, or beat. Tune it from
                  the Koloni console and ship a new rail without redeploys.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2 – What Koloni does */}
      <section className="border-t border-white/10 bg-[#050608]">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-16 md:flex-row">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-semibold md:text-3xl">
              Built for scroll-poisoned brains.
            </h2>
            <p className="text-sm text-white/65">
              Koloni leans into EMU-style long-form: a single, absurdly tall
              canvas with stitched clips, captions, and live blocks. No feed
              ranking, no algorithm roulette—just your rail.
            </p>
          </div>
          <div className="grid flex-1 gap-4 md:grid-cols-2">
            <FeatureCard
              title="Long-cat layout"
              body="Stack scenes into one continuous rail: clips, text blocks, CTA tiles, embeds, and live drops."
            />
            <FeatureCard
              title="URL-native"
              body="One Vercel project, one path, infinite scroll. Swap content from a config or dashboard."
            />
            <FeatureCard
              title="Creator-first"
              body="Launch a rail for a season, a drop, or a tour. Kill it, fork it, or archive it in one click."
            />
            <FeatureCard
              title="EMU-ready"
              body="Optimized for tall video and EMU-style generation loops. Drop in your own training runs."
            />
          </div>
        </div>
      </section>

      {/* Section 3 – CTA */}
      <section className="border-t border-white/10 bg-gradient-to-b from-[#050608] to-black">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="flex flex-col items-start gap-6 rounded-3xl border border-emerald-400/25 bg-black/60 p-6 md:flex-row md:items-center md:p-8">
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-semibold md:text-2xl">
                Ready to push the cat to prod?
              </h3>
              <p className="max-w-xl text-sm text-white/65">
                Hook this rail into your existing Kryptotrac-xx project, wire
                the content config, and point your Vercel domain at{" "}
                <span className="font-mono text-xs text-emerald-300">
                  /koloni
                </span>{" "}
                or the root.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <button className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-400/30 hover:bg-emerald-300">
                Ship Koloni long-cat
              </button>
              <p className="text-xs text-white/45">
                Repo: <span className="font-mono">Kryptotrac-xx</span> · 95% → 100%
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 text-[11px] text-white/40">
          <span>© {new Date().getFullYear()} Koloni · BeeHive experiments</span>
          <span>Made for the long cat era 🐈‍⬛</span>
        </div>
      </footer>
    </main>
  );
}

type FeatureProps = {
  title: string;
  body: string;
};

function FeatureCard({ title, body }: FeatureProps) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm shadow-[0_0_40px_rgba(0,0,0,0.6)]">
      <h3 className="text-[13px] font-semibold text-white">{title}</h3>
      <p className="mt-2 text-[12px] text-white/60">{body}</p>
    </div>
  );
}
