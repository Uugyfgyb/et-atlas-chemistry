"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Mode = "outer" | "inner";
type InnerCase = "cl" | "ncs";
type Atom = { x:number; y:number; z:number; c:string; r:number; label?:string };

const outerSteps = [
  ["分离的反应物","[Coᴵᴵᴵ(NH₃)₆]³⁺（低自旋 d⁶）与 [Crᴵᴵ(H₂O)₆]²⁺（d⁴）各自保留完整的八面体第一配位层。"],
  ["遭遇复合物","扩散使两种阳离子在溶剂笼中短暂接近；它们不共享配体，也不形成 Co–L–Cr 键。"],
  ["核与溶剂重组","Co–N、Cr–O 键长及溶剂极化预先调整到电子转移前后能量匹配的构型；此体系还受到较大的自旋/结构重组限制。"],
  ["跨空间电子隧穿","电子从 Cr(II) → Co(III)，在近乎垂直的 Franck–Condon 跃迁中穿过两套配位层之间的空间；没有桥联通道。"],
  ["产物分离","得到 [Coᴵᴵ(NH₃)₆]²⁺ 与 [Crᴵᴵᴵ(H₂O)₆]³⁺。NH₃ 仍属 Co，H₂O 仍属 Cr；后续 Co(II) 可能发生水解/配体取代，但不属于该 ET 基元步骤。"],
];
const innerSteps = [
  ["反应物接近","至少一个配合物必须能进行配体取代；另一个携带可桥联配体。"],
  ["桥联配体形成","Cr²⁺ 取代一分子水，与 Co–Cl 端结合，得到 Co–Cl–Cr 桥。"],
  ["桥内电子转移","电子沿桥联通道由 Cr(II) 传给 Co(III)，生成 Cr(III) 与 Co(II)。"],
  ["桥键断裂","较易变的 Co(II) 端断键，桥联氯仍留在 Cr(III) 上。"],
  ["产物分离","得到含氯的 Cr(III) 产物与 Co(II) 产物；配体转移是关键证据。"],
];
const ncsSteps = [
  ["反应物接近","惰性的低自旋 Co(III), d⁶ 携带 N 端配位的 NCS⁻；较活泼的 Cr(II), d⁴ 水合离子靠近。"],
  ["形成前驱复合物","Cr(II) 脱去一分子易交换的 H₂O，以 S 端接入 Co–N=C=S，形成 Co–N=C=S–Cr 桥联前驱复合物（总电荷 4+）。"],
  ["桥内电子转移","电子沿 N=C=S 桥由 Cr(II) → Co(III)，得到桥联的 Co(II)/Cr(III) 后继复合物；总电荷仍为 4+。"],
  ["后继复合物解离","电子转移后 Co(II), d⁷ 比 Cr(III), d³ 更易发生取代；Co–N 键断裂，NCS⁻ 以 S 端留在 Cr(III) 上，H₂O 补回 Co。"],
  ["配体转移产物","生成 [Co(NH₃)₅(H₂O)]²⁺ 与 [Cr(H₂O)₅(SCN)]²⁺。NCS⁻ 从 Co 转移到 Cr，并发生 N→S 配位端变化。"],
];

function Complex3D({mode,step,labels,innerCase}:{mode:Mode;step:number;labels:boolean;innerCase:InnerCase}){
  const [rot,setRot]=useState({x:-12,y:18}); const [zoom,setZoom]=useState(1);
  const drag=useRef<{x:number;y:number;rx:number;ry:number}|null>(null);
  const atoms=useMemo(()=>{
    const a:Atom[]=[]; const ligand=(cx:number, color:string, center:string, ligandName:string)=>{
      a.push({x:cx,y:0,z:0,c:color,r:28,label:center});
      [[0,-75,0],[0,75,0],[-56,-35,34],[-56,35,-34],[56,-35,-34],[56,35,34]].forEach((p,i)=>a.push({x:cx+p[0],y:p[1],z:p[2],c:"#9fb0c7",r:12,label:labels?(i===0?ligandName:""):undefined}));
    };
    const isNcs=mode==="inner"&&innerCase==="ncs";
    const gap=isNcs?(step===0?285:step<=2?220:step===3?235:300):(mode==="inner" && step>=1 && step<=3 ? 138 : step===0?250:190);
    const changed=(mode==="inner"&&step>=2)||(mode==="outer"&&step>=3);
    ligand(-gap/2,mode==="outer"?"#7c8cff":"#b38cff",changed?"Coᴵᴵ":"Coᴵᴵᴵ","NH₃");
    ligand(gap/2,"#34d8bd",changed?"Crᴵᴵᴵ":"Crᴵᴵ","H₂O");
    if(mode==="inner" && !isNcs && step>=1){a.push({x:0,y:0,z:0,c:"#f2cb62",r:15,label:"Cl⁻ 桥"});}
    if(isNcs){
      const ncs=step===0?[-gap/2+54,-gap/2+84,-gap/2+114]:step<=2?[-55,0,55]:[step===3?0:35,step===3?30:65,step===3?60:95];
      a.push({x:ncs[0],y:0,z:0,c:"#6ec6ff",r:13,label:"N"},{x:ncs[1],y:0,z:0,c:"#404b57",r:12,label:"C"},{x:ncs[2],y:0,z:0,c:"#f2cb62",r:15,label:"S"});
    }
    return a;
  },[mode,step,labels,innerCase]);
  const tr=`rotateX(${rot.x}deg) rotateY(${rot.y}deg) scale(${zoom})`;
  return <div className="model" onPointerDown={e=>{drag.current={x:e.clientX,y:e.clientY,rx:rot.x,ry:rot.y};(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(drag.current)setRot({x:drag.current.rx-(e.clientY-drag.current.y)*.35,y:drag.current.ry+(e.clientX-drag.current.x)*.35})}} onPointerUp={()=>drag.current=null} onWheel={e=>{e.preventDefault();setZoom(z=>Math.max(.65,Math.min(1.45,z-e.deltaY*.001)))}}>
    <div className="scene" style={{transform:tr}}>{atoms.map((a,i)=><div key={i} className="atom" style={{"--x":`${a.x}px`,"--y":`${a.y}px`,"--z":`${a.z}px`,"--s":`${a.r*2}px`,"--c":a.c} as React.CSSProperties}>{a.label&&<span>{a.label}</span>}</div>)}
      {step>=1&&<div className={`path ${mode} ${innerCase}`}>{mode==="outer"&&step===3?<b>e⁻ →</b>:mode==="inner"&&step===2?<b>e⁻ →</b>:null}</div>}
    </div>{mode==="outer"?<div className="modelFormula outerFormula"><b>{step<3?"[Coᴵᴵᴵ(NH₃)₆]³⁺ ··· [Crᴵᴵ(H₂O)₆]²⁺":"[Coᴵᴵ(NH₃)₆]²⁺ ··· [Crᴵᴵᴵ(H₂O)₆]³⁺"}</b><span>{step===0?"两套完整的第一配位层":step===1?"遭遇复合物：仅靠近，不搭桥":step===2?"键长与溶剂极化正在重组":step===3?"e⁻：Cr(II) → Co(III)，跨空间隧穿":"产物分离；NH₃/H₂O 归属不变"}</span></div>:innerCase==="ncs"&&<div className="modelFormula"><b>{step<2?"Coᴵᴵᴵ—N=C=S—Crᴵᴵ":"Coᴵᴵ ··· N=C=S—Crᴵᴵᴵ"}</b><span>{step===0?"N 端原属 Co；Cr 尚未接桥":step===1?"前驱复合物 precursor complex":step===2?"电子转移后的后继复合物":step===3?"Co–N 断裂，水分子回补":"NCS⁻ 已转移并以 S 端配位 Cr"}</span></div>}<div className="modelHint">拖动旋转 · 滚轮/触控板缩放</div>
  </div>
}

function MechanismLab(){
 const [mode,setMode]=useState<Mode>("outer"),[innerCase,setInnerCase]=useState<InnerCase>("cl"),[step,setStep]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1),[labels,setLabels]=useState(true);
 const steps=mode==="outer"?outerSteps:innerCase==="ncs"?ncsSteps:innerSteps;
 useEffect(()=>{if(!playing)return;const t=setInterval(()=>setStep(s=>s>=4?(setPlaying(false),4):s+1),1400/speed);return()=>clearInterval(t)},[playing,speed]);
 return <section id="lab" className="section lab"><div className="sectionHead"><div><span className="eyebrow">01 · 机制实验台</span><h2>把电子转移，放到眼前</h2></div><div className="seg"><button className={mode==="outer"?"on":""} onClick={()=>{setMode("outer");setStep(0);setPlaying(false)}}>外球</button><button className={mode==="inner"?"on":""} onClick={()=>{setMode("inner");setStep(0);setPlaying(false)}}>内球</button></div></div>
 <div className="casePicker"><span>选择 3D 案例</span>{mode==="outer"?<><button className="on">Co(III)/Cr(II) 外球 · 新</button><code>[Coᴵᴵᴵ(NH₃)₆]³⁺ + [Crᴵᴵ(H₂O)₆]²⁺</code></>:<><button className={innerCase==="cl"?"on":""} onClick={()=>{setInnerCase("cl");setStep(0);setPlaying(false)}}>Cl⁻ 单原子桥</button><button className={innerCase==="ncs"?"on":""} onClick={()=>{setInnerCase("ncs");setStep(0);setPlaying(false)}}>NCS⁻ 三原子桥</button><code>{innerCase==="ncs"?"[Coᴵᴵᴵ(NH₃)₅(NCS)]²⁺ + [Crᴵᴵ(H₂O)₆]²⁺":"[Coᴵᴵᴵ(NH₃)₅Cl]²⁺ + [Crᴵᴵ(H₂O)₆]²⁺"}</code></>}</div>
 <div className="labGrid"><div><Complex3D mode={mode} step={step} labels={labels} innerCase={innerCase}/><div className="controls"><button onClick={()=>setPlaying(v=>!v)}>{playing?"Ⅱ 暂停":"▶ 播放"}</button><button onClick={()=>setStep(s=>Math.min(4,s+1))}>下一步 →</button><button onClick={()=>{setStep(0);setPlaying(false)}}>↺ 重置</button><label>速度 <input type="range" min=".5" max="2" step=".5" value={speed} onChange={e=>setSpeed(+e.target.value)}/>{speed}×</label><label><input type="checkbox" checked={labels} onChange={e=>setLabels(e.target.checked)}/> 标签</label></div></div>
 <div className="stepPanel"><div className="stepCount">0{step+1} / 05</div><h3>{steps[step][0]}</h3><p>{steps[step][1]}</p><div className="timeline">{steps.map((s,i)=><button key={i} className={i===step?"active":i<step?"done":""} onClick={()=>setStep(i)}><i>{i+1}</i><span>{s[0]}</span></button>)}</div><div className="truth"><b>{mode==="outer"?"这套外球例子的判据":innerCase==="ncs"?"这套例子的关键":"内球的指纹"}</b><span>{mode==="outer"?"Cr(II) 失去一颗电子、Co(III) 得到一颗电子；六个 NH₃ 与六个 H₂O 均未跨金属交换。":innerCase==="ncs"?"Cr(II) 先失水接到 S 端；ET 后 Co–N 断裂，NCS⁻ 转移给 Cr(III)。":"短暂 M–桥–M；常可检测到配体转移。"}</span></div></div></div></section>
}

function Marcus(){const [lam,setLam]=useState(80),[dg,setDg]=useState(-35);const act=((lam+dg)**2)/(4*lam);const inv=-dg>lam;const k=Math.exp(-act/2.479);const W=560,H=260,pad=34; const xs=Array.from({length:101},(_,i)=>i/100);const y1=(x:number)=>165*(x-.27)**2+32;const shift=dg*.9;const y2=(x:number)=>165*(x-.73)**2+32+shift;const pts=(fn:(x:number)=>number)=>xs.map(x=>`${pad+x*(W-2*pad)},${Math.max(8,Math.min(H-25,fn(x)))}`).join(" ");return <section id="marcus" className="section marcus"><div className="sectionHead"><div><span className="eyebrow">02 · Marcus 控制台</span><h2>拖动参数，观察势垒如何改变</h2></div><p>经典非绝热外球电子转移的定性模型</p></div><div className="marcusGrid"><div className="chart"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Marcus 势能抛物线"><path d={`M${pad} 10V${H-24}H${W-10}`} className="axis"/><polyline points={pts(y1)} className="curve donor"/><polyline points={pts(y2)} className="curve acceptor"/><text x="85" y="34">反应物态</text><text x="425" y={Math.max(22,45+shift)}>产物态</text><text x="8" y="18">G</text><text x="470" y="253">核坐标 Q</text></svg><div className="chartLegend"><span><i className="violet"/>反应物</span><span><i className="mint"/>产物</span></div></div><div className="knobs"><label>重组能 λ <b>{lam} kJ·mol⁻¹</b><input type="range" min="20" max="160" value={lam} onChange={e=>setLam(+e.target.value)}/></label><label>标准自由能 ΔG° <b>{dg} kJ·mol⁻¹</b><input type="range" min="-180" max="100" value={dg} onChange={e=>setDg(+e.target.value)}/></label><div className="formula">ΔG‡ = (λ + ΔG°)² / 4λ</div><div className="readout"><div><small>活化自由能</small><strong>{act.toFixed(1)}</strong><em>kJ·mol⁻¹</em></div><div><small>相对速率趋势</small><strong>{k<.001?"≈ 0":k.toFixed(3)}</strong><em>任意单位</em></div></div><div className={`zone ${inv?"inverse":""}`}><b>{inv?"Marcus 倒转区":"Marcus 正常区"}</b><span>{inv?"−ΔG° > λ：继续增加驱动力，理论势垒反而升高。":"随反应变得更有利，势垒通常降低；在 −ΔG° = λ 时达无势垒点。"}</span></div></div></div><p className="fine">λ = 内球重组（M–L 键长/几何变化）+ 外球重组（溶剂极化重排）。速率还受电子耦合、温度与核频率影响；这里的“相对速率”仅展示势垒趋势。</p></section>}

const bridgeData=[['Cl⁻','强','经典 Taube 桥；易观察卤素转移'],['Br⁻','强','可双端配位，通常良好桥联'],['N₃⁻','强','线性/端基丰富，常能高效桥联'],['SCN⁻','中–强','两可配位；N/S 端连接性依体系而变'],['OH⁻','中–强','小、可形成 μ-OH 桥；pH 影响显著'],['CN⁻','强*','电子耦合好但键合很强；动力学惰性与毒性使实际行为依体系']];
function Content(){return <><section id="compare" className="section"><div className="sectionHead"><div><span className="eyebrow">03 · 结构与证据</span><h2>同样是一颗电子，两条完全不同的路</h2></div></div><div className="compare"><div className="compareHead"><span>判据</span><b>OUTER-SPHERE 外球</b><b>INNER-SPHERE 内球</b></div>{[['是否形成桥','否；仅形成遭遇复合物','是；短寿命 M–L–M 中间体'],['配体交换','第一配位层保持','常伴桥联配体转移'],['结构要求','两中心能接近且电子耦合足够','一端可取代；配体可桥联'],['速率决定因素','λ、ΔG°、电子耦合、自旋与距离','取代/成桥、桥内 ET、桥断裂'],['氧化态变化','供体 +1；受体 −1','相同，但经共价桥完成'],['实验判据','同位素示踪无配体互换；自交换动力学','示踪到桥联配体随电子转移而转移']].map((r,i)=><div className="compareRow" key={i}><span>{r[0]}</span><p>{r[1]}</p><p>{r[2]}</p></div>)}</div></section>
<section id="cases" className="section"><div className="sectionHead"><div><span className="eyebrow">04 · 经典案例</span><h2>从谱图与示踪，认出机理</h2></div></div><div className="cards"><article><span className="badge outerB">外球</span><h3>Co(III) / Cr(II)</h3><div className="rxn">[Co(NH₃)₆]³⁺ + [Cr(H₂O)₆]²⁺<br/>→ [Co(NH₃)₆]²⁺ + [Cr(H₂O)₆]³⁺</div><p>净电子由 Cr(II) → Co(III)。没有合适桥联配体；概念式强调两套配体各自保留。须注意 Co(II) 产物随后可能发生配体取代，那是 ET 后续反应。</p></article><article><span className="badge selfB">自交换</span><h3>Ru(II) / Ru(III) 同位素示踪</h3><div className="rxn">[Ru(¹⁶OH₂)₆]²⁺ + [Ru(¹⁸OH₂)₆]³⁺</div><p>电子自交换改变哪一套配位层属于 Ru(II)/Ru(III)，但 ¹⁶O 与 ¹⁸O 水配体不应因此“整套互换”。同位素的用途是辨认配体交换；不是说电子携带氧同位素。</p></article><article><span className="badge selfB">自交换</span><h3>Co(III) / Co(II)</h3><div className="rxn">[Co(NH₃)₆]³⁺ + [Co(NH₃)₆]²⁺ ⇌ 反向标记</div><p>宏观组成不变，需同位素/放射性标记或动力学方法观察。Co(III) 低自旋 d⁶ 与 Co(II) 高自旋 d⁷ 几何和键长差异大，重组能高，且自旋限制使交换慢。</p></article><article className="taube"><span className="badge innerB">Taube 内球</span><h3>氯桥与配体转移</h3><div className="rxn">[Co(NH₃)₅Cl]²⁺ + [Cr(H₂O)₆]²⁺<br/>→ [Co(NH₃)₅(H₂O)]²⁺ + [Cr(H₂O)₅Cl]²⁺</div><p>Co 是 +III、Cr 是 +II；先形成 Co–Cl–Cr。电子从 Cr(II) → Co(III)，继而 Co(II)–Cl 键断裂，Cl⁻ 留给新生的 Cr(III)。氯转移正是内球路径的经典证据。</p></article><article className="taube ncsCase"><span className="badge innerB">新增 3D 案例 · NCS⁻ 桥</span><h3>Co–N=C=S–Cr：三原子桥联通道</h3><div className="rxn">[Coᴵᴵᴵ(NH₃)₅(NCS)]²⁺ + [Crᴵᴵ(H₂O)₆]²⁺<br/>→ [Coᴵᴵ(NH₃)₅(H₂O)]²⁺ + [Crᴵᴵᴵ(H₂O)₅(SCN)]²⁺</div><p><b>成桥：</b>活泼的 Cr(II) 先失去 H₂O，再从 S 端连接 Co–NCS，形成 4+ 的前驱复合物。<b>ET：</b>电子由 Cr(II) 沿 N=C=S 桥流向 Co(III)。<b>断桥：</b>所得 Co(II) 更易取代，Co–N 断裂；Cr(III) 较惰，NCS⁻ 以 S 端保留在 Cr 上。这里既有配体转移，也有 N→S 的配位端变化。</p></article></div></section>
<section className="section"><div className="sectionHead"><div><span className="eyebrow">05 · 桥联配体图谱</span><h2>能“搭桥”，还要看动力学语境</h2></div></div><div className="bridges">{bridgeData.map((b,i)=><article key={i}><div className="bridgeIcon">M—<b>{b[0]}</b>—M</div><h3>{b[0]} <small>{b[1]}</small></h3><p>{b[2]}</p></article>)}</div><p className="fine">“桥联能力”不是固定排名：取决于金属软硬性、配位惰性、取代速率、几何、质子化状态和溶剂。强桥联不自动等于反应必走内球。</p></section></>}

const questions=[{q:'哪项最直接支持内球机理？',a:['电子转移很快','产物中检测到桥联配体转移','两种金属氧化态各变 1','形成遭遇复合物'],ok:1,e:'桥联配体从氧化剂转移到还原剂生成的金属中心，是经典内球指纹。'}, {q:'外球自交换中，宏观反应为何看似“没有变化”？',a:['没有电子移动','反应物和产物化学组成相同','配体全部交换','氧化态不变'],ok:1,e:'电子确实交换，但同一元素/同一配体集合使反应前后总组成相同，需标记或动力学观察。'}, {q:'当 −ΔG° 超过 λ 后，经典 Marcus 模型预测什么？',a:['进入倒转区，驱动力再增大反而减速','速率无限增大','λ 变成零','必然改走内球'],ok:0,e:'越过无势垒点后，反应物与产物抛物线交点重新抬高，即 Marcus 倒转区。'}, {q:'为何 [Co(NH₃)₆]³⁺/²⁺ 自交换通常慢？',a:['Co 没有 d 电子','水总会桥联','键长/自旋变化导致重组能高且有自旋限制','氧化态相同'],ok:2,e:'Co(III) 与 Co(II) 的电子组态、自旋态和 M–N 键长差别明显，结构重组及自旋要求均不利。'}];
function Quiz(){const [idx,setIdx]=useState(0),[pick,setPick]=useState<number|null>(null),[score,setScore]=useState(0);const q=questions[idx];return <section id="quiz" className="section quiz"><div><span className="eyebrow">06 · 知识检查</span><h2>你能从证据判断路径吗？</h2><p>4 题 · 立即反馈 · 含解析</p><div className="score">{questions.map((_,i)=><i key={i} className={i<idx?"done":i===idx?"now":""}/>)}</div></div><div className="quizCard"><small>问题 {idx+1} / {questions.length}</small><h3>{q.q}</h3><div className="answers">{q.a.map((a,i)=><button disabled={pick!==null} className={pick===null?"":i===q.ok?"correct":i===pick?"wrong":""} key={a} onClick={()=>{setPick(i);if(i===q.ok)setScore(s=>s+1)}}><span>{String.fromCharCode(65+i)}</span>{a}</button>)}</div>{pick!==null&&<div className="explain"><b>{pick===q.ok?'答对了':'再想一步'}</b><p>{q.e}</p>{idx<questions.length-1?<button onClick={()=>{setIdx(i=>i+1);setPick(null)}}>下一题 →</button>:<button onClick={()=>{setIdx(0);setPick(null);setScore(0)}}>完成 · {score}/{questions.length}　重新挑战</button>}</div>}</div></section>}

export default function Home(){return <main><nav><a className="brand" href="#top"><span>e⁻</span> ET ATLAS</a><div><a href="#lab">机制</a><a href="#marcus">Marcus</a><a href="#cases">案例</a><a href="#quiz">测验</a></div></nav><header id="top" className="hero"><div className="orb o1"/><div className="orb o2"/><div className="heroCopy"><span className="kicker">COORDINATION CHEMISTRY · 交互式 3D 课</span><h1>一颗电子的<br/><em>两条路径</em></h1><p>外球跨空间隧穿，内球借配体搭桥。旋转结构、逐帧播放，再用 Marcus 抛物线看清驱动力与重组能。</p><a className="cta" href="#lab">进入机制实验台 <b>↓</b></a></div><div className="heroVisual"><div className="electron">e⁻</div><div className="metal m1">Co<sup>III</sup></div><div className="metal m2">Cr<sup>II</sup></div><div className="trail"/><span className="tag t1">无配体交换</span><span className="tag t2">桥联通道</span></div><div className="heroStats"><div><b>OUTER</b><span>穿越空间</span></div><div><b>INNER</b><span>沿桥传递</span></div><div><b>λ + ΔG°</b><span>共同塑造势垒</span></div></div></header><MechanismLab/><Marcus/><Content/><Quiz/><footer><div className="brand"><span>e⁻</span> ET ATLAS</div><p>配位化学电子转移 · 单文件式离线教学体验</p><a href="#top">回到顶部 ↑</a></footer></main>}
