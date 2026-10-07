"use client";

import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";

const HostingCoreScene=dynamic(()=>import("./hosting-core-scene").then(m=>m.HostingCoreScene),{ssr:false,loading:()=> <SceneFallback/>});

function SceneFallback(){return <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#050609]"><div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-3xl"/><div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/40 shadow-[0_0_100px_rgba(139,92,246,.45)]"/><div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full border border-cyan-400/20"/></div>}

export function HostingCoreHero(){
  const ref=useRef<HTMLElement>(null); const [progress,setProgress]=useState(0);
  const {scrollYProgress}=useScroll({target:ref,offset:["start start","end start"]});
  const smooth=useSpring(scrollYProgress,{stiffness:80,damping:24,mass:.35});
  useMotionValueEvent(smooth,"change",setProgress);
  const opacity=useTransform(smooth,[0,.72,1],[1,1,0]);
  const y=useTransform(smooth,[0,1],[0,-80]);
  return <section ref={ref} className="relative min-h-[150vh] overflow-hidden bg-[#050609] text-white">
    <div className="sticky top-0 h-screen min-h-[680px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(139,92,246,.17),transparent_27%),radial-gradient(circle_at_70%_55%,rgba(34,211,238,.09),transparent_25%)]"/>
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"/>
      <div className="absolute inset-0"><Canvas dpr={[1,1.5]} camera={{position:[0,0,6.2],fov:42,near:.1,far:100}} gl={{antialias:true,alpha:true,powerPreference:"high-performance"}} frameloop="always" fallback={<SceneFallback/>}><HostingCoreScene scrollProgress={progress}/></Canvas></div>
      <motion.div style={{opacity,y}} className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-6 pb-14 pt-28 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 shadow-[0_0_35px_rgba(139,92,246,.28)]"><span className="text-sm font-semibold text-violet-200">R</span></div><span className="text-sm font-medium tracking-wide text-white/90">Reachmark Webhosting</span></div><div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-violet-300"/>Infrastructure platform</div></div>
        <div className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center text-center">
          <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.8}} className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/5 px-4 py-2 text-xs uppercase tracking-[.24em] text-violet-200/80"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#22d3ee]"/>The calm cloud for ambitious builders</motion.div>
          <motion.h1 initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:.12,duration:.9}} className="max-w-4xl text-balance text-5xl font-medium tracking-[-.06em] sm:text-6xl lg:text-8xl">Deploy beyond<span className="block bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">the ordinary.</span></motion.h1>
          <motion.p initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.24,duration:.8}} className="mt-7 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Deploy websites, APIs, databases, and background workers from one calm, powerful cloud platform.</motion.p>
          <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.36,duration:.8}} className="mt-9 flex flex-col items-center gap-3 sm:flex-row"><a href="/signup" className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-white px-6 text-sm font-semibold text-black transition-transform duration-200 hover:-translate-y-0.5 hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-300">Start deploying <span className="transition-transform group-hover:translate-x-1">→</span></a><a href="#platform" className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/[.04] px-6 text-sm font-medium text-white/85 backdrop-blur-md hover:border-white/30 hover:bg-white/[.09]">Explore the platform</a></motion.div>
        </div>
        <div className="flex flex-col items-center justify-between gap-5 text-xs text-slate-400 sm:flex-row"><div className="flex items-center gap-5"><span>Deploy in seconds</span><span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block"/><span>Git-based workflow</span></div><div className="flex items-center gap-2 text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300"/><span>Scroll to enter the core</span><span className="ml-1 animate-bounce text-base text-white/70">↓</span></div></div>
      </motion.div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#050609] to-transparent"/>
    </div>
  </section>;
}