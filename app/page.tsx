"use client";

import dynamic from "next/dynamic";

const World = dynamic(() => import("../components/World"), { ssr: false });

export default function Home() {
  return (
    <main className="shell">
      <div className="hud">
        <div>
          <div className="eyebrow">EMPRENDEDOR</div>
          <h1>CREÁ. CRECÉ. ESCALÁ.</h1>
        </div>
        <div className="stats">
          <span>DÍA 01/90</span>
          <span>CAJA ₲10.000.000</span>
          <span>INGRESOS ₲0</span>
        </div>
      </div>

      <section className="world">
        <World />
      </section>

      <div className="footerBar">
        <span>MOVER: WASD / FLECHAS · INTERACTUAR: E / A</span>
        <span>SANTPIX × MERCO × DROPI · POTENCIADO POR IA</span>
      </div>
    </main>
  );
}
