"use client";
import dynamic from "next/dynamic";
const GameExperience=dynamic(()=>import("../components/GameExperience"),{ssr:false});
export default function Home(){return <main className="shell fullGame"><GameExperience/></main>}
