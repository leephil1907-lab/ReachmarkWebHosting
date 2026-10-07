"use client";

import { Float, Line, MeshTransmissionMaterial, Sparkles, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Props={scrollProgress?:number; mobile?:boolean};

const services=[
  {name:"API",position:[-2.25,.85,.35] as [number,number,number],color:"#22d3ee"},
  {name:"WEB",position:[2.15,1.05,.2] as [number,number,number],color:"#8b5cf6"},
  {name:"DB",position:[-1.75,-1.15,.1] as [number,number,number],color:"#42e695"},
  {name:"WORKER",position:[1.85,-1.2,-.1] as [number,number,number],color:"#3b82f6"},
];

function CoreOrb(){
  const group=useRef<THREE.Group>(null); const orb=useRef<THREE.Mesh>(null);
  useFrame((state,delta)=>{
    if(!group.current||!orb.current)return;
    group.current.rotation.y+=delta*.12;
    group.current.rotation.x=Math.sin(state.clock.elapsedTime*.3)*.08;
    orb.current.scale.setScalar(1+Math.sin(state.clock.elapsedTime*1.7)*.025);
  });
  return <group ref={group}>
    <mesh ref={orb}><icosahedronGeometry args={[1.05,5]}/><MeshTransmissionMaterial backside samples={4} thickness={.65} roughness={.12} anisotropy={.25} chromaticAberration={.08} distortion={.22} distortionScale={.35} temporalDistortion={.08} transmission={1} color="#b9a5ff" emissive="#5425d9" emissiveIntensity={.5}/></mesh>
    <mesh scale={.78}><icosahedronGeometry args={[1,4]}/><meshBasicMaterial color="#8b5cf6" transparent opacity={.1} wireframe/></mesh>
    <pointLight color="#8b5cf6" intensity={4.2} distance={5} decay={2}/>
    <pointLight position={[.8,.5,1]} color="#22d3ee" intensity={2.5} distance={4} decay={2}/>
  </group>;
}

function OrbitRing({radius,rotation,color,speed}:{radius:number;rotation:[number,number,number];color:string;speed:number}){
  const ring=useRef<THREE.Mesh>(null);
  useFrame((_,delta)=>{if(!ring.current)return;ring.current.rotation.z+=delta*speed;ring.current.rotation.x+=delta*speed*.2});
  return <mesh ref={ring} rotation={rotation}><torusGeometry args={[radius,.012,12,160]}/><meshBasicMaterial color={color} transparent opacity={.7} blending={THREE.AdditiveBlending}/></mesh>;
}

function ServiceNode({name,position,color,mobile}:{name:string;position:[number,number,number];color:string;mobile:boolean}){
  const group=useRef<THREE.Group>(null); const node=useRef<THREE.Mesh>(null);
  useFrame(state=>{
    if(!group.current||!node.current)return;
    group.current.position.y=position[1]+Math.sin(state.clock.elapsedTime*1.2+position[0])*.08;
    node.current.rotation.x+=.004; node.current.rotation.y+=.006;
  });
  return <Float speed={1.2} rotationIntensity={.25} floatIntensity={.3}>
    <group ref={group} position={position}>
      <mesh ref={node}><octahedronGeometry args={[mobile?.18:.23,1]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} metalness={.4} roughness={.2}/></mesh>
      {!mobile&&<pointLight color={color} intensity={1.4} distance={1.2} decay={2}/>}
      {!mobile&&<Text position={[0,-.45,0]} fontSize={.12} color="#dce5f5" anchorX="center" anchorY="middle" letterSpacing={.04}>{name}</Text>}
    </group>
  </Float>;
}

export function HostingCoreScene({scrollProgress=0,mobile=false}:Props){
  const group=useRef<THREE.Group>(null);
  const count=mobile?140:520;
  const positions=useMemo(()=>{
    const p=new Float32Array(count*3);
    for(let i=0;i<count;i++){const r=2.5+Math.random()*3.5,t=Math.random()*Math.PI*2,y=(Math.random()-.5)*5;p[i*3]=Math.cos(t)*r;p[i*3+1]=y;p[i*3+2]=Math.sin(t)*r}
    return p;
  },[count]);
  useFrame((state,delta)=>{
    if(!group.current)return;
    group.current.rotation.y+=delta*.025;
    const progress=THREE.MathUtils.clamp(scrollProgress,0,1);
    group.current.rotation.x=THREE.MathUtils.lerp(group.current.rotation.x,progress*.18,.04);
  });
  return <>
    <color attach="background" args={["#050609"]}/><fog attach="fog" args={["#050609",6,13]}/>
    <ambientLight intensity={.25}/><directionalLight position={[4,5,5]} intensity={1.4} color="#b7c7ff"/>
    <group ref={group}>
      <CoreOrb/>
      <group><OrbitRing radius={1.65} rotation={[Math.PI/2.8,.1,0]} color="#8b5cf6" speed={.2}/><OrbitRing radius={1.95} rotation={[Math.PI/2,-.5,.4]} color="#22d3ee" speed={-.14}/><OrbitRing radius={2.25} rotation={[.6,.4,.8]} color="#3b82f6" speed={.1}/></group>
      <group>{services.map(s=><Line key={s.name} points={[[0,0,0],s.position]} color={s.color} transparent opacity={.42} lineWidth={1}/>)}</group>
      {!mobile&&<group position={[0,-1.65,0]}><Text fontSize={.14} color="#f8fafc" anchorX="center" anchorY="middle" letterSpacing={.08}>REACHMARK CORE</Text><Text position={[0,-.22,0]} fontSize={.085} color="#8793a8" anchorX="center" anchorY="middle">DEPLOYMENT INFRASTRUCTURE</Text></group>}
      {services.map(s=><ServiceNode key={s.name} {...s} mobile={mobile}/>)}
      {!mobile&&<Sparkles count={90} scale={[8,5,8]} size={1.8} speed={.22} noise={.7} color="#8b5cf6"/>}
      <points><bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3}/></bufferGeometry><pointsMaterial color="#22d3ee" size={mobile?.028:.018} transparent opacity={.45} sizeAttenuation blending={THREE.AdditiveBlending}/></points>
    </group>
    <ScrollCamera scrollProgress={scrollProgress}/>
  </>;
}

function ScrollCamera({scrollProgress}:{scrollProgress:number}){
  useFrame(state=>{
    const p=THREE.MathUtils.clamp(scrollProgress,0,1),c=state.camera;
    const x=Math.sin(p*Math.PI*.8)*.55,y=p*.35,z=6.2-p*.55;
    c.position.x=THREE.MathUtils.lerp(c.position.x,x,.04);
    c.position.y=THREE.MathUtils.lerp(c.position.y,y,.04);
    c.position.z=THREE.MathUtils.lerp(c.position.z,z,.04);
    c.lookAt(0,p*.15,0);
  });
  return null;
}