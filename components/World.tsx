"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArcRotateCamera,
  Color3,
  Color4,
  DefaultRenderingPipeline,
  DirectionalLight,
  Engine,
  GlowLayer,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

type BuildingId = "santpix" | "merco" | "dropi" | "bank" | "ai";
type BuildingDef = {
  id: BuildingId;
  label: string;
  subtitle: string;
  position: [number, number, number];
  radius: number;
  accent: string;
};

const BUILDINGS: BuildingDef[] = [
  { id: "santpix", label: "SANTPIX", subtitle: "Tecnología & Ecommerce", position: [-6.3, 0, -3.8], radius: 2.8, accent: "#efe8dc" },
  { id: "merco", label: "MERCO", subtitle: "Crecimiento & Performance", position: [0, 0, -6.8], radius: 2.8, accent: "#cdb786" },
  { id: "dropi", label: "DROPI", subtitle: "Comercio & Fulfillment", position: [6.4, 0, -3.2], radius: 3.0, accent: "#a7b9aa" },
  { id: "bank", label: "BANCO", subtitle: "Capital & Crédito", position: [-5.5, 0, 5.3], radius: 2.7, accent: "#d0c7b8" },
  { id: "ai", label: "CENTRO IA", subtitle: "Análisis & Automatización", position: [5.3, 0, 5.1], radius: 2.8, accent: "#aeb9ca" },
];

function hex(value: string) {
  return Color3.FromHexString(value);
}

function makePBR(scene: Scene, name: string, color: string, metallic = 0.2, roughness = 0.55) {
  const m = new PBRMaterial(name, scene);
  m.albedoColor = hex(color);
  m.metallic = metallic;
  m.roughness = roughness;
  return m;
}

function box(scene: Scene, name: string, size: [number, number, number], pos: [number, number, number], mat: PBRMaterial | StandardMaterial, shadow?: ShadowGenerator) {
  const mesh = MeshBuilder.CreateBox(name, { width: size[0], height: size[1], depth: size[2] }, scene);
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.material = mat;
  mesh.receiveShadows = true;
  mesh.checkCollisions = true;
  shadow?.addShadowCaster(mesh);
  return mesh;
}

function createWindow(scene: Scene, name: string, pos: [number, number, number], size: [number, number, number], warm = false) {
  const m = makePBR(scene, `${name}-mat`, warm ? "#d9c79c" : "#91a7ad", 0.55, 0.16);
  m.emissiveColor = hex(warm ? "#6b5f3d" : "#33474b");
  m.emissiveIntensity = 0.55;
  return box(scene, name, size, pos, m);
}

function createTree(scene: Scene, position: Vector3, shadow: ShadowGenerator, index: number) {
  const root = new TransformNode(`tree-${index}`, scene);
  root.position.copyFrom(position);
  const trunkMat = makePBR(scene, `trunk-mat-${index}`, "#4c3d31", 0, 0.92);
  const leafMat = makePBR(scene, `leaf-mat-${index}`, index % 2 ? "#5b6955" : "#4d5f49", 0, 0.9);
  const trunk = MeshBuilder.CreateCylinder(`trunk-${index}`, { height: 1.55, diameterTop: 0.2, diameterBottom: 0.32, tessellation: 10 }, scene);
  trunk.position.y = 0.78;
  trunk.parent = root;
  trunk.material = trunkMat;
  shadow.addShadowCaster(trunk);
  [[0,1.72,0,0.74],[0.42,1.86,-0.08,0.5],[-0.35,1.9,0.15,0.46]].forEach((v, i) => {
    const crown = MeshBuilder.CreatePolyhedron(`crown-${index}-${i}`, { type: 2, size: v[3] }, scene);
    crown.position.set(v[0], v[1], v[2]);
    crown.parent = root;
    crown.material = leafMat;
    shadow.addShadowCaster(crown);
  });
  return root;
}

function createLamp(scene: Scene, position: Vector3, shadow: ShadowGenerator, index: number) {
  const metal = makePBR(scene, `lamp-metal-${index}`, "#181918", 0.75, 0.28);
  const pole = MeshBuilder.CreateCylinder(`lamp-${index}`, { height: 2.65, diameterTop: 0.06, diameterBottom: 0.1, tessellation: 10 }, scene);
  pole.position = position.add(new Vector3(0, 1.32, 0));
  pole.material = metal;
  shadow.addShadowCaster(pole);
  const bulbMat = new StandardMaterial(`bulb-mat-${index}`, scene);
  bulbMat.diffuseColor = hex("#fff1c7");
  bulbMat.emissiveColor = hex("#ffd987");
  const bulb = MeshBuilder.CreateSphere(`bulb-${index}`, { diameter: 0.24, segments: 10 }, scene);
  bulb.position = position.add(new Vector3(0, 2.67, 0));
  bulb.material = bulbMat;
}

function createBuilding(scene: Scene, def: BuildingDef, shadow: ShadowGenerator) {
  const root = new TransformNode(def.id, scene);
  root.position = new Vector3(...def.position);
  const dark = makePBR(scene, `${def.id}-dark`, "#171918", 0.34, 0.35);
  const graphite = makePBR(scene, `${def.id}-graphite`, "#292b29", 0.28, 0.42);
  const stone = makePBR(scene, `${def.id}-stone`, "#cec6b8", 0.05, 0.74);
  const accent = makePBR(scene, `${def.id}-accent`, def.accent, 0.15, 0.48);

  const addBox = (name: string, size: [number, number, number], pos: [number, number, number], mat: PBRMaterial | StandardMaterial) => {
    const m = box(scene, `${def.id}-${name}`, size, pos, mat, shadow);
    m.parent = root;
    return m;
  };

  if (def.id === "santpix") {
    addBox("tower", [2.9, 5.9, 2.9], [-0.6, 2.95, 0], dark);
    addBox("wing", [1.65, 3.7, 2.35], [1.15, 1.85, 0.25], graphite);
    [1.2,2.18,3.16,4.14,5.12].forEach((y,i) => { const w=createWindow(scene,`santpix-win-${i}`,[-0.6,y,1.47],[2.0,0.42,0.05]); w.parent=root; });
    [0.95,1.85,2.75].forEach((y,i) => { const w=createWindow(scene,`santpix-warm-${i}`,[1.15,y,1.45],[1.05,0.42,0.05],true); w.parent=root; });
    addBox("canopy", [2.5,0.16,1.2], [0.7,1.62,1.78], accent);
    [-0.95,-0.32,0.32,0.95].forEach((x,i)=>addBox(`roof-fin-${i}`,[0.07,0.8,2.5],[x-0.6,6.32,0],accent));
  } else if (def.id === "merco") {
    addBox("base", [3.6,3.6,3.0], [0,1.8,0], dark);
    addBox("top", [2.65,1.9,2.45], [0.5,4.2,-0.12], graphite);
    [0.65,1.4,2.15,2.9,3.7,4.45].forEach((y,i)=>{const w=createWindow(scene,`merco-win-${i}`,[0,y,1.52],[2.75,0.32,0.05],true);w.parent=root;});
    [-1.35,-0.8,-0.27,0.27,0.8,1.35].forEach((x,i)=>addBox(`fin-${i}`,[0.07,4.4,0.1],[x,2.25,1.58],accent));
    addBox("terrace", [2.0,0.16,1.6], [0.7,3.12,1.08], accent);
  } else if (def.id === "dropi") {
    addBox("hub", [4.7,2.8,3.5], [-0.3,1.4,0.1], graphite);
    addBox("tower", [2.0,4.9,2.2], [1.3,3.75,-0.3], dark);
    [2.3,3.12,3.94,4.76,5.58].forEach((y,i)=>{const w=createWindow(scene,`dropi-win-${i}`,[1.3,y,0.82],[1.35,0.34,0.05]);w.parent=root;});
    [-1.65,-0.3,1.05].forEach((x,i)=>{addBox(`dock-${i}`,[1.0,1.45,0.1],[x,0.78,1.88],stone);addBox(`dockcap-${i}`,[1.15,0.12,0.7],[x,1.56,2.15],accent);});
    [-1.55,-0.98,-0.4].forEach((x,i)=>{ const vent=MeshBuilder.CreateCylinder(`dropi-vent-${i}`,{height:0.55,diameter:0.36,tessellation:12},scene);vent.position.set(x,2.98,-0.1);vent.parent=root;vent.material=stone;shadow.addShadowCaster(vent); });
  } else if (def.id === "bank") {
    addBox("body", [3.8,3.2,2.9], [0,1.6,-0.1], stone);
    addBox("cornice", [4.05,0.3,3.15], [0,3.32,0], accent);
    addBox("steps", [3.2,0.42,1.25], [0,0.2,1.82], accent);
    [-1.25,-0.42,0.42,1.25].forEach((x,i)=>{const col=MeshBuilder.CreateCylinder(`bank-col-${i}`,{height:2.6,diameterTop:0.28,diameterBottom:0.36,tessellation:18},scene);col.position.set(x,1.55,1.45);col.parent=root;col.material=accent;shadow.addShadowCaster(col);});
    const door=createWindow(scene,"bank-door",[0,1.35,1.5],[0.95,1.7,0.06],true);door.parent=root;
  } else {
    const body=MeshBuilder.CreateCylinder("ai-body",{height:4.5,diameterTop:3.2,diameterBottom:3.8,tessellation:36},scene);body.position.y=2.25;body.parent=root;body.material=dark;body.checkCollisions=true;shadow.addShadowCaster(body);
    [1.05,2.05,3.05,4.05].forEach((y,i)=>{const ring=MeshBuilder.CreateTorus(`ai-ring-${i}`,{diameter:3.55,thickness:0.08,tessellation:36},scene);ring.position.y=y;ring.rotation.x=Math.PI/2;ring.parent=root;ring.material=accent;});
    [-1.15,-0.58,0,0.58,1.15].forEach((x,i)=>addBox(`blade-${i}`,[0.08,3.2,0.18],[x,2.25,1.73],accent));
  }
  return root;
}

function createPlayer(scene: Scene, shadow: ShadowGenerator) {
  const root = new TransformNode("player", scene);
  root.position = new Vector3(0, 0, 1.8);
  const suit = makePBR(scene, "player-suit", "#101111", 0.22, 0.38);
  const shirt = makePBR(scene, "player-shirt", "#e8e2d7", 0, 0.72);
  const skin = makePBR(scene, "player-skin", "#c79f82", 0, 0.74);
  const shoe = makePBR(scene, "player-shoe", "#080808", 0.35, 0.32);

  const hips = new TransformNode("hips", scene); hips.parent = root; hips.position.y = 1.03;
  const torso = MeshBuilder.CreateCapsule("torso", { radius: 0.38, height: 1.05, tessellation: 12 }, scene); torso.parent=hips; torso.position.y=0.38; torso.material=suit; shadow.addShadowCaster(torso);
  const shirtPanel = MeshBuilder.CreateBox("shirt-panel", {width:0.42,height:0.58,depth:0.05},scene); shirtPanel.parent=hips;shirtPanel.position.set(0,0.38,-0.36);shirtPanel.material=shirt;
  const head = MeshBuilder.CreateSphere("head", {diameter:0.56,segments:18}, scene); head.parent=hips;head.position.y=1.15;head.material=skin;shadow.addShadowCaster(head);

  const leftArm = new TransformNode("leftArm",scene);leftArm.parent=hips;leftArm.position.set(-0.45,0.72,0);
  const rightArm = new TransformNode("rightArm",scene);rightArm.parent=hips;rightArm.position.set(0.45,0.72,0);
  [leftArm,rightArm].forEach((arm,i)=>{const limb=MeshBuilder.CreateCapsule(`arm-${i}`,{radius:0.12,height:0.82,tessellation:10},scene);limb.parent=arm;limb.position.y=-0.3;limb.material=suit;shadow.addShadowCaster(limb);});

  const leftLeg = new TransformNode("leftLeg",scene);leftLeg.parent=root;leftLeg.position.set(-0.18,0.92,0);
  const rightLeg = new TransformNode("rightLeg",scene);rightLeg.parent=root;rightLeg.position.set(0.18,0.92,0);
  [leftLeg,rightLeg].forEach((leg,i)=>{const limb=MeshBuilder.CreateCapsule(`leg-${i}`,{radius:0.14,height:0.9,tessellation:10},scene);limb.parent=leg;limb.position.y=-0.38;limb.material=suit;shadow.addShadowCaster(limb);const foot=MeshBuilder.CreateBox(`foot-${i}`,{width:0.26,height:0.16,depth:0.48},scene);foot.parent=leg;foot.position.set(0,-0.82,0.1);foot.material=shoe;shadow.addShadowCaster(foot);});

  return { root, hips, leftArm, rightArm, leftLeg, rightLeg };
}

export default function World() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nearby, setNearby] = useState<BuildingDef | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, antialias: true }, true);
    engine.setHardwareScalingLevel(Math.min(1.35, Math.max(1, window.devicePixelRatio > 1.8 ? 1.2 : 1)));
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.65, 0.66, 0.63, 1);
    scene.fogMode = Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.018;
    scene.fogColor = new Color3(0.67, 0.68, 0.66);
    scene.collisionsEnabled = true;

    const hemi = new HemisphericLight("hemi", new Vector3(0.2, 1, 0.1), scene);
    hemi.intensity = 1.35;
    hemi.diffuse = new Color3(0.96,0.93,0.86);
    hemi.groundColor = new Color3(0.26,0.28,0.27);
    const sun = new DirectionalLight("sun", new Vector3(-0.7,-1,-0.45), scene);
    sun.position = new Vector3(12,18,10);
    sun.intensity = 3.0;
    const shadow = new ShadowGenerator(2048, sun);
    shadow.useBlurExponentialShadowMap = true;
    shadow.blurKernel = 22;
    shadow.bias = 0.0005;

    const pipeline = new DefaultRenderingPipeline("premium", true, scene, []);
    pipeline.fxaaEnabled = true;
    pipeline.samples = 4;
    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.contrast = 1.16;
    pipeline.imageProcessing.exposure = 1.08;
    pipeline.sharpenEnabled = true;
    pipeline.sharpen.edgeAmount = 0.28;
    pipeline.sharpen.colorAmount = 0.65;
    const glow = new GlowLayer("glow", scene, { blurKernelSize: 24 });
    glow.intensity = 0.28;

    const groundMat = makePBR(scene,"ground-mat","#8f918b",0,0.96);
    const ground = MeshBuilder.CreateGround("ground",{width:42,height:42},scene);ground.material=groundMat;ground.receiveShadows=true;ground.checkCollisions=true;
    const roadMat = makePBR(scene,"road-mat","#353735",0.02,0.98);
    [[0,-6.6,4.2,13.2],[0,6.6,4.2,13.2],[-6.6,0,13.2,4.2],[6.6,0,13.2,4.2]].forEach((r,i)=>{const rd=MeshBuilder.CreateGround(`road-${i}`,{width:r[2],height:r[3]},scene);rd.position.set(r[0],0.015,r[1]);rd.material=roadMat;rd.receiveShadows=true;});
    const plazaMat = makePBR(scene,"plaza-mat","#c7c1b6",0.02,0.78);
    const plaza=MeshBuilder.CreateCylinder("plaza",{height:0.06,diameter:9.8,tessellation:64},scene);plaza.position.y=0.03;plaza.material=plazaMat;plaza.receiveShadows=true;
    const fountainMat=makePBR(scene,"fountain-mat","#d8d0c2",0.05,0.6);
    const basin=MeshBuilder.CreateCylinder("fountain",{height:0.48,diameter:2.7,tessellation:48},scene);basin.position.y=0.25;basin.material=fountainMat;shadow.addShadowCaster(basin);
    const waterMat=new PBRMaterial("water",scene);waterMat.albedoColor=hex("#708e96");waterMat.metallic=0.05;waterMat.roughness=0.08;waterMat.alpha=0.8;
    const water=MeshBuilder.CreateCylinder("water",{height:0.08,diameter:2.05,tessellation:48},scene);water.position.y=0.52;water.material=waterMat;

    BUILDINGS.forEach((b)=>createBuilding(scene,b,shadow));
    [[-9,-8],[-9,1],[-9,8],[-2,8],[2,8],[9,-7],[9,1],[9,8],[-2,-9],[2,-9]].forEach((p,i)=>createTree(scene,new Vector3(p[0],0,p[1]),shadow,i));
    [[-4,-2],[4,-2],[-4,2],[4,2],[-2,-4],[2,-4],[-2,4],[2,4]].forEach((p,i)=>createLamp(scene,new Vector3(p[0],0,p[1]),shadow,i));

    const player = createPlayer(scene,shadow);
    const camera = new ArcRotateCamera("camera", Math.PI*0.74, 1.12, 8.5, player.root.position.add(new Vector3(0,1.45,0)), scene);
    camera.lowerRadiusLimit = 4.8;
    camera.upperRadiusLimit = 13.5;
    camera.lowerBetaLimit = 0.62;
    camera.upperBetaLimit = 1.42;
    camera.wheelPrecision = 28;
    camera.panningSensibility = 0;
    camera.angularSensibilityX = 750;
    camera.angularSensibilityY = 750;
    camera.inertia = 0.82;
    camera.checkCollisions = true;
    camera.collisionRadius = new Vector3(0.35,0.35,0.35);
    camera.attachControl(canvas,true);

    const keys = new Set<string>();
    const keyDown = (e: KeyboardEvent) => { keys.add(e.code); if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)) e.preventDefault(); };
    const keyUp = (e: KeyboardEvent) => keys.delete(e.code);
    window.addEventListener("keydown",keyDown,{passive:false});
    window.addEventListener("keyup",keyUp);

    let elapsed = 0;
    let currentNearby = "";
    let interactLatch = false;
    engine.runRenderLoop(() => {
      const dt = Math.min(engine.getDeltaTime()/1000,0.033);
      elapsed += dt;
      let mx=0, mz=0;
      if(keys.has("KeyW")||keys.has("ArrowUp")) mz+=1;
      if(keys.has("KeyS")||keys.has("ArrowDown")) mz-=1;
      if(keys.has("KeyA")||keys.has("ArrowLeft")) mx-=1;
      if(keys.has("KeyD")||keys.has("ArrowRight")) mx+=1;
      let running = keys.has("ShiftLeft")||keys.has("ShiftRight");
      let interact = keys.has("KeyE")||keys.has("Space");

      const pads = navigator.getGamepads?.() ?? [];
      const pad = Array.from(pads).find(Boolean);
      if(pad){
        const dz=0.16;
        const ax=Math.abs(pad.axes[0]??0)>dz?(pad.axes[0]??0):0;
        const az=Math.abs(pad.axes[1]??0)>dz?(pad.axes[1]??0):0;
        mx+=ax; mz-=az;
        const rx=Math.abs(pad.axes[2]??0)>dz?(pad.axes[2]??0):0;
        const ry=Math.abs(pad.axes[3]??0)>dz?(pad.axes[3]??0):0;
        camera.alpha += rx*dt*2.2;
        camera.beta = Math.max(camera.lowerBetaLimit!,Math.min(camera.upperBetaLimit!,camera.beta+ry*dt*1.7));
        running = running || !!pad.buttons[1]?.pressed;
        interact = interact || !!pad.buttons[0]?.pressed;
      }

      const inputLen=Math.hypot(mx,mz);
      if(inputLen>0.05){
        mx/=Math.max(1,inputLen); mz/=Math.max(1,inputLen);
        const forward=camera.getForwardRay().direction.clone();forward.y=0;forward.normalize();
        const right=new Vector3(forward.z,0,-forward.x);
        const dir=forward.scale(mz).add(right.scale(mx));if(dir.lengthSquared()>0.001)dir.normalize();
        const speed=running?6.6:4.2;
        const next=player.root.position.add(dir.scale(speed*dt));
        next.x=Math.max(-10.2,Math.min(10.2,next.x));next.z=Math.max(-10.2,Math.min(10.2,next.z));
        const blocked=BUILDINGS.some(b=>Math.hypot(next.x-b.position[0],next.z-b.position[2])<b.radius*0.64);
        if(!blocked) player.root.position.copyFrom(next);
        const targetYaw=Math.atan2(dir.x,dir.z);
        let deltaYaw=((targetYaw-player.root.rotation.y+Math.PI)%(Math.PI*2))-Math.PI;
        player.root.rotation.y+=deltaYaw*Math.min(1,dt*10);
        const cadence=running?11:7.5;const amp=running?0.82:0.55;const s=Math.sin(elapsed*cadence)*amp;
        player.leftLeg.rotation.x=s;player.rightLeg.rotation.x=-s;player.leftArm.rotation.x=-s*0.75;player.rightArm.rotation.x=s*0.75;player.hips.position.y=1.03+Math.abs(Math.sin(elapsed*cadence))*0.045;
      }else{
        const idle=Math.sin(elapsed*2.2)*0.025;player.hips.position.y=1.03+idle;player.leftLeg.rotation.x*=0.82;player.rightLeg.rotation.x*=0.82;player.leftArm.rotation.x*=0.82;player.rightArm.rotation.x*=0.82;
      }

      const target=player.root.position.add(new Vector3(0,1.45,0));camera.target=Vector3.Lerp(camera.target,target,1-Math.pow(0.002,dt));
      water.rotation.y+=dt*0.08;water.scaling.x=1+Math.sin(elapsed*1.6)*0.01;water.scaling.z=1+Math.cos(elapsed*1.3)*0.01;

      let near: BuildingDef | null=null;let best=999;
      BUILDINGS.forEach(b=>{const d=Math.hypot(player.root.position.x-b.position[0],player.root.position.z-b.position[2]);if(d<b.radius&&d<best){best=d;near=b;}});
      const id=near?.id??"";
      if(id!==currentNearby){currentNearby=id;setNearby(near);}
      if(interact&&!interactLatch&&near){setToast(`${near.label} · ${near.subtitle}`);window.setTimeout(()=>setToast(""),1800);}
      interactLatch=interact;
      scene.render();
    });

    const resize=()=>engine.resize();window.addEventListener("resize",resize);
    return()=>{window.removeEventListener("resize",resize);window.removeEventListener("keydown",keyDown);window.removeEventListener("keyup",keyUp);scene.dispose();engine.dispose();};
  },[]);

  return (
    <div className="game-stage">
      <canvas ref={canvasRef} aria-label="Ciudad 3D del juego Emprendedor" />
      <div className="location-legend">
        {BUILDINGS.map((b)=><div key={b.id} className={`legend-item ${nearby?.id===b.id?"active":""}`}><span className="legend-dot" style={{background:b.accent}}/><div><strong>{b.label}</strong><small>{b.subtitle}</small></div></div>)}
      </div>
      {nearby&&<div className="interaction-card"><span className="interaction-kicker">ESTÁS CERCA DE</span><strong>{nearby.label}</strong><small>{nearby.subtitle}</small><span className="interaction-action">E / A · ENTRAR</span></div>}
      {toast&&<div className="game-toast">{toast}</div>}
    </div>
  );
}
