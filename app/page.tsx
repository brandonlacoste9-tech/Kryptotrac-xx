"use client";
import { useState } from "react";
import { HardwareContainer } from "@/components/shared/hardware-container";
import { Shield, Zap, Globe, Cpu, Radio, Fingerprint, Lock } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BlockchainInternals } from "@/components/visuals/blockchain-internals";

export default function HomePage() {
  const [transparencyMode, setTransparencyMode] = useState(false)

  return (
    <HardwareContainer>
       {/* Background Internals (Always there but revealed by transparency) */}
       {/* ⚡ Bolt: The BlockchainInternals animation is expensive. By linking its `active` state
           to `transparencyMode`, we ensure the computationally heavy canvas animation only runs
           when it's actually visible to the user, saving significant CPU cycles. */}
       <BlockchainInternals 
          active={transparencyMode}
          className={`transition-opacity duration-1000 ${transparencyMode ? "opacity-100" : "opacity-0"}`}
          opacity={0.4}
       />

      <div className={`space-y-12 relative z-10 transition-all duration-500 ${transparencyMode ? "bg-black/20 backdrop-blur-none" : ""}`}>
        
        {/* Boot Sequence / Hero */}
        <section className="text-center pt-10 pb-6 relative">
          <div className="absolute top-0 right-0">
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setTransparencyMode(!transparencyMode)}
                className={`text-[10px] font-mono border border-white/10 ${transparencyMode ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" : "text-gray-500"}`}
             >
                {transparencyMode ? "■ GLASS_MODE_ON" : "□ GLASS_MODE_OFF"}
             </Button>
          </div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.5, duration: 0.5 }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono mb-6"
          >
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
             </span>
             SYSTEM_READY_V2.0
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4 neon-text">
            POCKET<br/>SIZE<br/>POWER.
          </h1>
          
          <p className="text-muted-foreground text-sm font-mono max-w-[280px] mx-auto mb-8">
            The advanced crypto tracker that fits in your pocket. AI-powered. Hardware-grade security.
          </p>

          <div className="flex flex-col gap-4 max-w-xs mx-auto">
             <Button className="h-12 rounded-xl bg-cyan-500 text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all">
               INITIALIZE SYSTEM ($0)
             </Button>
             <p className="text-[10px] text-muted-foreground">NO CREDIT CARD REQUIRED • HARDWARE ENCRYPTION</p>
          </div>
        </section>

        {/* System Specs (Features) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-mono text-muted-foreground">SYSTEM_SPECS</h2>
            <div className="h-px bg-white/10 flex-1 ml-4" />
          </div>

          <div className="grid grid-cols-2 gap-3">
             {[
               { icon: Cpu, label: "AI Core", sub: "Neural Engine 24/7", color: "text-cyan-400" },
               { icon: Radio, label: "100+ Langs", sub: "Universal Translator", color: "text-purple-400" },
               { icon: Fingerprint, label: "DeFi Ops", sub: "Deep Chain Analysis", color: "text-green-400" },
               { icon: Lock, label: "Private", sub: "Local-First Data", color: "text-yellow-400" }
             ].map((spec, i) => (
               <Card 
                  key={i} 
                  className={`p-4 flex flex-col items-center text-center gap-2 transition-all duration-300 ${
                      transparencyMode 
                        ? "bg-black/10 border-white/5 backdrop-blur-none" 
                        : "glass-panel hover:bg-white/5"
                  }`}
               >
                 <spec.icon className={`w-6 h-6 ${spec.color}`} />
                 <span className="text-xs font-bold text-white">{spec.label}</span>
                 <span className="text-[10px] text-muted-foreground leading-tight">{spec.sub}</span>
               </Card>
             ))}
          </div>
        </section>

        {/* Pricing Interface */}
        <section className="space-y-4 pb-10">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-mono text-muted-foreground">AVAILABLE_UPGRADES</h2>
            <div className="h-px bg-white/10 flex-1 ml-4" />
          </div>

          <Card className={`relative overflow-hidden border-cyan-500/30 transition-all duration-500 ${transparencyMode ? "bg-black/20" : "bg-black/60"}`}>
             {/* Scanning Line Animation */}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-[50%] animate-scan pointer-events-none" />
             
             <div className="p-6 relative z-10">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="text-xl font-bold text-white">PRO_FIRMWARE</h3>
                   <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">EARLY ACCESS</span>
                 </div>
                 <div className="text-right">
                   <span className="text-3xl font-bold text-white text-shadow-neon">$4.99</span>
                   <span className="text-[10px] text-muted-foreground block">/ MO</span>
                 </div>
               </div>

               <div className="space-y-3 mb-6">
                 {['Unlimited AI Queries', 'Multi-Chain Tracking', 'Priority Neural Net'].map((feat) => (
                   <div key={feat} className="flex items-center gap-2 text-xs text-gray-300">
                     <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_5px_rgba(6,182,212,1)]" />
                     {feat}
                   </div>
                 ))}
               </div>

               <Button className="w-full bg-cyan-950/30 border border-cyan-500/30 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition-all duration-300 font-mono text-xs h-10 text-cyan-400">
                 INSTALL_UPDATE &gt;&gt;
               </Button>
             </div>
          </Card>
        </section>

      </div>
    </HardwareContainer>
  );
}

// Add custom animation for scanning line if not present in tailwind config
// We can assume standard tailwind setup, but 'animate-scan' might be missing. 
// Using basic classes for now or relying on motion if needed in future steps.
