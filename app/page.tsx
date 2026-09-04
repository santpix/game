"use client";

import dynamic from "next/dynamic";

const World = dynamic(() => import("../components/World"), { ssr: false });

export default function Home() {
  return (
    <main className="shell">
      <div className="hud">
        <div>
          <div className="eyebrow">ENTREPRENEUR</div>
          <h1>BUILD. GROW. SCALE.</h1>
        </div>
        <div className="stats">
          <span>DAY 01/90</span>
          <span>CASH ₲10,000,000</span>
          <span>REVENUE ₲0</span>
        </div>
      </div>
      <section className="world">
        <World />
      </section>
      <div className="footerBar">
        <span>MOVE: WASD / ARROWS</span>
        <span>SANTPIX × MERCO × DROPI · POWERED BY AI</span>
      </div>
    </main>
  );
}