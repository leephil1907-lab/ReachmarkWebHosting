"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const stages=[
  {n:"01",title:"Connect your repository",body:"Bring the code you already own. Select a GitHub repository and branch, then let Reachmark prepare the deployment path.",tag:"SOURCE",lines:["github.com/your-project","branch: main","webhook: ready"]},
  {n:"02",title:"Build without the guesswork",body:"Reachmark detects the application shape, installs dependencies, builds an image, and exposes the important output instead of hiding it.",tag:"BUILD",lines:["detecting runtime...","installing dependencies","building container image"]},
  {n:"03",title:"Release a running service",body:"A successful build becomes a real service with health checks, runtime status, logs, and a deployment you can inspect.",tag:"RELEASE",lines:["image: ready","health check: passed","service: starting"]},
  {n:"04",title:"Go live with confidence",body:"Attach a domain, provision HTTPS, watch the service metrics, and keep the deployment history available for rollback.",tag:"LIVE",lines:["domain: connected","TLS: provisioned","deployment: healthy"]},
];

export function DeploymentStory(){
  const ref=useRef<HTMLElement>(null); const reduce=useReducedMotion();
  const {scrollYProgress}=useScroll({target:ref,offset:["start start","end end"]});
  const p=useSpring(scrollYProgress,{stiffness:70,damping:24});
  const rail=useTransform(p,[0,1],["0%","100%"]);
  return <section ref={ref} className="relative min-h-[260vh] bg-[#050609] text-white">
    <div className="sticky top-0 flex min-h-screen items-center overflow-hidden px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)] lg:gap-20">
        <div className="relative">
          <div className="mb-12 flex items-center gap-4"><span className="text-xs uppercase tracking-[.25em] text-cyan-300">Deployment story</span><span className="h-px flex-1 bg-white/10"/></div>
          <div className="absolute left-0 top-20 hidden h-[60%] w-px bg-white/10 sm:block"><motion.div style={{height:rail}} className="w-px origin-top bg-gradient-to-b from-cyan-300 via-violet-400 to-emerald-300"/></div>
          <div className="space-y-10 sm:pl-8">
            {stages.map((stage,i)=><StageCard key={stage.n} stage={stage} index={i} progress={p} reduced={!!reduce}/>)}
          </div>
        </div>
        <div className="hidden lg:block"><Terminal progress={p}/></div>
      </div>
    </div>
  </section>;
}

function StageCard({stage,index,progress,reduced}:{stage:(typeof stages)[number];index:number;progress:any;reduced:boolean}){
  const start=index*.25; const end=Math.min(1,start+.25);
  const opacity=useTransform(progress,[Math.max(0,start-.1),start,end,Math.min(1,end+.08)],[.32,.7,1,.38]);
  const x=useTransform(progress,[start,end],[reduced?0:24,0]);
  const scale=useTransform(progress,[start,end],[.98,1]);
  return <motion.article style={{opacity,x,scale}} className="relative max-w-2xl rounded-3xl border border-white/10 bg-white/[.035] p-6 backdrop-blur-xl sm:p-8">
    <div className="mb-7 flex items-center justify-between"><span className="font-mono text-xs text-cyan-300">{stage.n}</span><span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] tracking-[.2em] text-white/45">{stage.tag}</span></div>
    <h2 className="text-2xl tracking-[-.035em] sm:text-4xl">{stage.title}</h2>
    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">{stage.body}</p>
    <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-7 text-slate-400">
      {stage.lines.map((line,j)=><div key={line}><span className="mr-3 text-violet-400">{String(j+1).padStart(2,"0")}</span>{line}</div>)}
    </div>
  </motion.article>;
}

function Terminal({progress}:{progress:any}){
  const opacity=useTransform(progress,[0,.08,.92,1],[.45,1,1,.55]);
  return <motion.div style={{opacity}} className="rounded-3xl border border-white/10 bg-[#090b10]/80 p-4 shadow-2xl shadow-violet-950/20 backdrop-blur-xl">
    <div className="flex items-center gap-2 border-b border-white/10 px-2 pb-4"><span className="h-2 w-2 rounded-full bg-red-400/70"/><span className="h-2 w-2 rounded-full bg-amber-300/70"/><span className="h-2 w-2 rounded-full bg-emerald-400/70"/><span className="ml-auto font-mono text-[10px] text-white/35">reachmark/deploy</span></div>
    <div className="space-y-4 p-5 font-mono text-xs leading-6"><p><span className="text-cyan-300">~</span> reachmark deploy --project app</p><p className="text-white/45">Preparing deployment pipeline...</p><p><span className="text-violet-300">✓</span> Source connected</p><p><span className="text-violet-300">✓</span> Build artifact created</p><p><span className="text-violet-300">✓</span> Runtime health check passed</p><p><span className="text-emerald-300">●</span> Service healthy</p><div className="rounded-xl border border-emerald-300/10 bg-emerald-300/5 p-3 text-emerald-200/80">deployment ready — inspect logs, metrics, domains and history from your workspace.</div></div>
  </motion.div>;
}