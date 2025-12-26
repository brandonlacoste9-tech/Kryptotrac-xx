"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HardwareContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function HardwareContainer({ children, className }: HardwareContainerProps) {
  return (
    <div className={cn("relative min-h-screen w-full bg-black p-4 md:p-8 flex items-center justify-center overflow-hidden", className)}>
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[60vw] h-[40vh] bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Device Frame */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[480px] h-[90vh] md:h-[850px] bg-background border border-white/10 rounded-[3rem] shadow-2xl shadow-primary/10 overflow-hidden flex flex-col"
        style={{
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.05),
            0 0 40px -10px rgba(var(--primary), 0.3),
            inset 0 0 60px -10px rgba(0,0,0,0.8)
          `
        }}
      >
        {/* Hardware Notch / Status Bar Area */}
        <div className="h-8 w-full bg-black/50 backdrop-blur-md flex items-center justify-between px-6 text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-b border-white/5 shrink-0 z-50">
          <span>KryptoTrac OS</span>
          <div className="flex gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>ONLINE</span>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto scrollbar-hide relative">
           {/* Grid Pattern Overlay */}
           <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />
           
           <div className="relative z-10 p-6 min-h-full">
             {children}
           </div>
        </div>

        {/* Bottom Hardware Chin / Nav Area */}
        <div className="h-16 w-full bg-background/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 shrink-0 relative z-50">
           {/* Navigation would go here, simulated by children mostly, but this is the chin */}
           <div className="w-1/3 h-1 bg-white/20 rounded-full mx-auto" />
        </div>
      </motion.div>
    </div>
  );
}
