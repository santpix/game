"use client";

import { useMemo, useState } from "react";
import World from "./World";
import { BUILDING_INTERIORS, INITIAL_STATS, SCENARIOS, type BuildingId, type GameStats, type Scenario } from "../lib/game/content";

type LogItem = { title:string; text:string; good:boolean };

const clamp=(v:number)=>Math.max(0,Math.min(100,v));
const money=(v:number)=>new Intl.NumberFormat("es-PY").format(Math.round(v));

export default function GameExperience(){
 const [stats,setStats]=useState<GameStats>(INITIAL_STATS);
 const [day,setDay]=useState(1);
 const [chapter,setChapter]=useState<1|2|3>(1);
 const [inside,setInside]=useState<BuildingId|null>(null);
 const [scenario,setScenario]=useState<Scenario|null>(null);
 const [done,setDone]=useState<string[]>([]);
 const [log,setLog]=useState<LogItem[]>([{title:"Día 1",text:"Tenés ₲10.000.000, un producto y 90 días para construir una empresa escalable.",good:true}]);
 const [ending,setEnding]=useState<string|null>(null);
 const health=Math.round((stats.brand+stats.operations+stats.growth+Math.min(100,stats.customers))/4);
 const completed=done.length;
 const objective=chapter===1?"CONSTRUIR":chapter===2?"CRECER":"ESCALAR";
 const available=useMemo(()=>inside?SCENARIOS.filter(s=>s.building===inside&&s.chapter<=chapter&&!done.includes(s.id)):[],[inside,chapter,done]);

 function enter(id:BuildingId){ setInside(id); const next=SCENARIOS.find(s=>s.building===id&&s.chapter<=chapter&&!done.includes(s.id)); setScenario(next||null); }
 function leave(){setInside(null);setScenario(null)}
 function decide(index:number){ if(!scenario)return; const d=scenario.decisions[index]; const next={...stats}; Object.entries(d.effect).forEach(([k,v])=>{const key=k as keyof GameStats; if(key==="cash"||key==="revenue") next[key]+=v||0; else next[key]=clamp(next[key]+(v||0));});
  const newDay=Math.min(90,day+(d.days||4)); setStats(next);setDay(newDay);setDone(x=>[...x,scenario.id]);setLog(x=>[{title:d.title,text:d.feedback,good:Object.values(d.effect).reduce((a,b)=>a+(b||0),0)>=0},...x].slice(0,6));
  const count=completed+1; let nextChapter:1|2|3=chapter; if(count>=4)nextChapter=2;if(count>=8)nextChapter=3;setChapter(nextChapter);
  const nextScenario=SCENARIOS.find(s=>s.building===scenario.building&&s.chapter<=nextChapter&&!done.includes(s.id)&&s.id!==scenario.id);setScenario(nextScenario||null);
  if(newDay>=90||count>=SCENARIOS.length){const score=Math.round((next.brand+next.operations+next.growth+Math.min(100,next.customers))/4)+(next.cash>0?10:-15)+(next.revenue>15000000?15:0);setEnding(score>85?"EMPRESA ESCALABLE · Construiste un sistema fuerte, rentable y preparado para crecer.":score>60?"NEGOCIO SOSTENIBLE · Llegaste con una base real, aunque todavía existen cuellos de botella.":"CRECIMIENTO FRÁGIL · Vendiste, pero las decisiones dejaron problemas de caja, marca u operación.");}
 }
 function restart(){setStats(INITIAL_STATS);setDay(1);setChapter(1);setInside(null);setScenario(null);setDone([]);setEnding(null);setLog([{title:"Día 1",text:"Nueva partida. Construí una empresa que sobreviva 90 días.",good:true}])}

 return <div className="experience">
  <div className="gameTopbar"><div><span className="phase">FASE {chapter} · {objective}</span><strong>DÍA {String(day).padStart(2,"0")} / 90</strong></div><div className="gameMetrics"><span>CAJA <b>₲{money(stats.cash)}</b></span><span>INGRESOS <b>₲{money(stats.revenue)}</b></span><span>SALUD <b>{health}%</b></span></div></div>
  <div className="gameBody">
   <div className="worldWrap"><World onEnter={(id)=>enter(id as BuildingId)} /></div>
   <aside className="businessPanel"><div className="panelTitle">TU EMPRESA <span>{completed}/{SCENARIOS.length}</span></div>{[["MARCA",stats.brand],["CLIENTES",Math.min(100,stats.customers)],["OPERACIÓN",stats.operations],["CRECIMIENTO",stats.growth],["INVENTARIO",stats.inventory]].map(([n,v])=><div className="statRow" key={String(n)}><div><span>{n}</span><b>{v}</b></div><i><em style={{width:`${v}%`}} /></i></div>)}<div className="mission"><small>MISIÓN ACTUAL</small><strong>{chapter===1?"Validá tu modelo de negocio":chapter===2?"Convertí demanda en crecimiento rentable":"Escalá sin romper la empresa"}</strong><p>Explorá la ciudad y entrá a los edificios. Cada decisión consume días y cambia tu empresa.</p></div><div className="decisionLog">{log.map((l,i)=><div key={i}><span className={l.good?"good":"risk"}/><p><b>{l.title}</b>{l.text}</p></div>)}</div></aside>
  </div>
  {inside&&<div className="interiorOverlay"><div className="interiorScene"><button className="closeInterior" onClick={leave}>SALIR ×</button><div className={`interiorVisual ${inside}`}><span>INTERIOR</span><h2>{BUILDING_INTERIORS[inside].name}</h2><p>{BUILDING_INTERIORS[inside].description}</p><div className="roomDecor"><i/><i/><i/><i/></div></div><div className="scenarioPanel">{scenario?<><span className="scenarioTag">DECISIÓN · DÍA {day}</span><h3>{scenario.title}</h3><p className="context">{scenario.context}</p><h4>{scenario.question}</h4><div className="choices">{scenario.decisions.map((d,i)=><button key={d.id} onClick={()=>decide(i)}><span>0{i+1}</span><div><strong>{d.title}</strong><small>{d.description}</small></div><em>{d.days||4} DÍAS</em></button>)}</div></>:<div className="emptyRoom"><span>✓</span><h3>Trabajo completado por ahora</h3><p>{available.length?"Hay nuevas decisiones disponibles.":"Seguí explorando. Nuevos desafíos aparecen cuando avanzás de fase."}</p><button onClick={leave}>VOLVER A LA CIUDAD</button></div>}</div></div></div>}
  {ending&&<div className="ending"><div><span>RESULTADO · DÍA {day}</span><h2>{ending.split(" · ")[0]}</h2><p>{ending.split(" · ")[1]}</p><div className="finalStats"><b>₲{money(stats.revenue)}<small>INGRESOS</small></b><b>{stats.customers}<small>CLIENTES</small></b><b>{health}%<small>SALUD</small></b></div><button onClick={restart}>JUGAR DE NUEVO</button></div></div>}
 </div>
}
