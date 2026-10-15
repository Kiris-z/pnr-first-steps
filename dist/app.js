'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
const svgText = (x, y, text, fill = '#56677f', size = 12, extra = '') => '<text x="' + x + '" y="' + y + '" fill="' + fill + '" font-size="' + size + '" ' + extra + '>' + text + '</text>';
const rect = (x, y, w, h, fill, extra = '') => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '" ' + extra + '/>';
const path = (d, color, width = 2, extra = '') => '<path d="' + d + '" stroke="' + color + '" stroke-width="' + width + '" fill="none" ' + extra + '/>';
const num = n => Number(n).toLocaleString('zh-CN', { maximumFractionDigits: 0 });
function activate(selector, attr, value) { $$(selector).forEach(b => { const yes = b.getAttribute(attr) === value; b.classList.toggle('active', yes); b.setAttribute('aria-pressed', String(yes)); }); }
function readStore(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function writeStore(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Private/file browsing can disable persistence. */ } }

// Original vector illustration: cells and routes, intentionally not a mask layout.
function hero() {
 let s = '<defs><pattern id="chip-dots" width="17" height="17" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#7f9bbd" opacity=".4"/></pattern></defs>';
 s += rect(42, 28, 350, 292, '#dce8f8', 'rx="6" stroke="#7696c2" stroke-width="1.5"');
 s += rect(57, 43, 320, 262, 'url(#chip-dots)', 'stroke="#a1b7d5"');
 for (let i = 0; i < 17; i++) { s += path('M' + (63 + i * 19) + ' 15v13M' + (63 + i * 19) + ' 320v13', '#6a8fbb', 3); }
 for (let i = 0; i < 13; i++) { s += path('M29 ' + (49 + i * 20) + 'h13M392 ' + (49 + i * 20) + 'h13', '#6a8fbb', 3); }
 for (let y = 0; y < 8; y++) for (let x = 0; x < 11; x++) { if (x > 7 && y < 4) continue; const w = 14 + ((x + y) % 3) * 4; s += rect(68 + x * 27, 57 + y * 29, w, 14, ((x * 3 + y) % 8 === 0) ? '#48bcd4' : '#7e9fc7', 'rx="1" opacity=".85"'); }
 s += rect(287, 57, 75, 100, '#254b82', 'rx="2"');
 for (let y = 0; y < 10; y++) s += path('M296 ' + (65 + y * 9) + 'h56', '#7ca8d5', .7);
 s += svgText(309, 117, 'SRAM', '#f0f7ff', 10);
 ['M38 83H180V197H351V321','M83 28V133H245V285H392','M42 258H153V97H286','M204 320V226H325V158'].forEach(d => s += path(d, '#36b5d6', 3, 'stroke-linecap="round"'));
 ['M42 168H116V286H299V320','M122 28V72H230V176H393','M44 290H83V229H267V108H286'].forEach(d => s += path(d, '#8d75d4', 2.5, 'stroke-linecap="round"'));
 [[180,133],[153,229],[245,197],[267,97],[204,226],[230,72]].forEach(p => s += rect(p[0]-3,p[1]-3,6,6,'#ffffff','stroke="#2779c3" stroke-width="1.5"'));
 $('#hero-chip').innerHTML = s;
}
hero();

// Logic gate exercise.
let gate = 'AND', a = 1, b = 0;
function updateGate() {
 const out = gate === 'NOT' ? 1 - a : gate === 'AND' ? a & b : a | b;
 $('#input-a b').textContent = a; $('#input-b b').textContent = b;
 $('#input-a').setAttribute('aria-pressed', String(Boolean(a))); $('#input-b').setAttribute('aria-pressed', String(Boolean(b)));
 $('#input-b').hidden = gate === 'NOT'; $('#gate-symbol').textContent = gate;
 $('#gate-output').textContent = 'Y = ' + out; $('#gate-output').classList.toggle('on', out === 1);
 $('#gate-caption').textContent = gate === 'NOT' ? '非门只有一个输入：A = ' + a + '，取反后 Y = ' + out + '。' : (gate === 'AND' ? '两个输入都为 1，输出才为 1。' : '至少一个输入为 1，输出就为 1。') + '当前 Y = ' + out + '。';
 activate('[data-gate]', 'data-gate', gate);
}
$$('[data-gate]').forEach(el => el.addEventListener('click', () => { gate = el.dataset.gate; updateGate(); }));
$('#input-a').addEventListener('click', () => { a = 1-a; updateGate(); }); $('#input-b').addEventListener('click', () => { b = 1-b; updateGate(); }); updateGate();

const inputData = {
 netlist: ['NETLIST / 谁和谁连接','电路网表：元件清单 + 引脚连接','网表说明使用哪些单元，以及哪些引脚属于同一个网络。逻辑综合把 RTL 功能描述映射到具体单元。','例如：U1 的输出、U2 的输入 A 属于同一个网络 n1。'],
 lef: ['PHYSICAL ABSTRACT / 多大，在哪里接线','LEF：单元尺寸、引脚与物理抽象','技术 LEF 描述层、轨道相关规则等信息；单元 LEF 描述单元外形、引脚形状和障碍。布局布线使用抽象信息，不需要始终显示每个晶体管。','例如：一个单元宽 2.8 µm、高 1.4 µm；输入引脚位于指定金属层和形状。'],
 lib: ['LIBERTY / 信号通过要多久','时序库：不同条件下的电气特性','描述单元功能、延迟、转换时间、功耗和时序要求等。延迟与输入转换速度、输出负载及工艺电压温度条件有关。','相同逻辑功能可以有不同驱动能力的单元；更强驱动通常也有面积、功耗代价。'],
 sdc: ['CONSTRAINTS / 需要达到什么目标','设计约束：时钟与外部接口的时间要求','指定时钟、输入输出时序、负载及路径例外等。工具根据这些条件判断哪些路径需要优化。','create_clock -name clk -period 10 [get_ports clk]（周期单位以所用库／工具时间单位为准）'],
 pdk: ['PROCESS DESIGN KIT / 工艺边界','PDK：对应制造工艺的设计资料集合','工艺资料包含层与规则、模型和相关技术文件。标准单元库及存储器宏还需要配套匹配，不能任意混用不同工艺的文件。','完整任务还要记录工艺与库版本、分析角、工具版本和检查要求。']
};
function showInput(key) { const d=inputData[key]; $('#input-detail').innerHTML='<span class="input-kind">'+d[0]+'</span><h3>'+d[1]+'</h3><p>'+d[2]+'</p><div class="input-example">'+d[3]+'</div>'; activate('[data-input]','data-input',key); }
$$('[data-input]').forEach(el=>el.addEventListener('click',()=>showInput(el.dataset.input))); showInput('netlist');
const stages=[
 ['规划','划定区域，安排宏单元、引脚与放置行。','输入：网表、物理库、尺寸与约束。输出：初始空间规划。'],
 ['电源','生成电源、地的环、条带、供电轨与连接。','输入：电源规划、层与规则。输出：电源分配网络。'],
 ['布局','先优化整体位置，再合法化和详细调整。','输入：规划与连接关系。输出：合法单元位置。'],
 ['时钟树','分发时钟，安排缓冲、分支并优化时钟关系。','输入：布局和时钟定义。输出：时钟分发网络。'],
 ['全局布线','规划引导区域与层，分析资源与拥塞。','输入：单元位置和网络。输出：布线引导与资源分析。'],
 ['详细布线','确定具体金属线和通孔，处理局部规则。','输入：引脚、引导区域与工艺规则。输出：详细连接几何。'],
 ['提取检查','提取互连寄生参数，分析时序和制造规则。','输入：物理结果与模型。输出：报告、违规与待优化项。'],
 ['完成交付','按目标工艺和项目要求执行检查并生成交付数据。','输出可能包含 GDS/OASIS 等版图文件；完整签核按项目要求进行。']
];
$('#pipeline').innerHTML=stages.map((d,i)=>'<button data-stage="'+i+'" aria-pressed="false"><span>0'+(i+1)+'</span>'+d[0]+'</button>').join('');
function showStage(i){const d=stages[i];$('#pipeline-info').innerHTML='<strong>'+d[0]+'：'+d[1]+'</strong>'+d[2];activate('[data-stage]','data-stage',String(i));}
$$('[data-stage]').forEach(el=>el.addEventListener('click',()=>showStage(Number(el.dataset.stage))));showStage(0);

// Utilization: 100 cells of fixed area, with a consistently scaled square core.
function floorplan(){
 const u=Number($('#utilization').value),area=6000/(u/100),size=Math.sqrt(area)*2.1,x=(580-size)/2,y=(310-size)/2,cw=8*2.1,ch=7.5*2.1,cols=Math.floor(size/cw),rows=Math.ceil(100/cols);
 let s=rect(75,7,430,320,'#f1f5fc','stroke="#b4c5dd"')+rect(x,y,size,size,'#e4edfb','stroke="#4c76ac" stroke-width="1.5"');
 for(let i=0;i<=rows;i++)s+=path('M'+x+' '+(y+i*size/rows)+'h'+size,'#bfcee2',.65);
 for(let i=0;i<100;i++){const cx=x+(i%cols)*size/cols+(size/cols-cw)/2,cy=y+Math.floor(i/cols)*size/rows+(size/rows-ch)/2;s+=rect(cx,cy,cw,ch,i%11===0?'#5ba8d6':'#6b96cc','rx="1"');}
 s+=svgText(87,28,'固定比例下的芯片边界','#56677f',10)+svgText(290,348,'核心区：'+num(area)+' µm² · 单元总面积保持 6,000 µm²','#245fbd',12,'text-anchor="middle"');
 $('#floor-svg').innerHTML=s;$('#util-value').textContent=u+'%';$('#core-area').textContent=num(area)+' µm²';
 $('#floor-feedback').textContent=u>=75?'核心区缩小，单元之间可调整的余量减少。实际是否拥塞，要运行布线资源分析后判断。':u<=45?'核心区更宽松，位置调整余量更多；部分连接也可能更长。面积扩大不保证时序一定改善。':'当前为适中的教学算例。工程中需要同时比较面积、拥塞、时序和功耗，没有通用的最佳利用率。';
}
$('#utilization').addEventListener('input',floorplan);floorplan();

// Placement demo: a fixed small graph, three explanatory states and live editing.
const placeStates={initial:[[65,66],[530,192],[240,64],[470,60],[175,216],[610,225]],global:[[85,116],[210,120],[315,123],[373,121],[246,136],[565,122]],legal:[[60,112],[190,112],[320,112],[450,112],[320,164],[580,112]]};
const names=['FF_A','U1','U2','U3','U4','FF_B'],edges=[[0,1],[1,2],[2,3],[3,5],[1,4],[4,2]];
let placeMode='initial',nodes=[],drag=null;
function setPlace(mode){placeMode=mode;nodes=placeStates[mode].map(p=>p.slice());activate('[data-place]','data-place',mode);renderPlace();}
function renderPlace(){
 let s=rect(30,28,680,245,'#f1f5fc','stroke="#bdcce0"');
 [60,112,164,216].forEach((y,i)=>{s+=rect(41,y,657,26,'#e7eef9');s+=svgText(10,y+18,String(i+1),'#8297b3',10);for(let x=42;x<700;x+=13)s+=path('M'+x+' '+y+'v26','#c4d0e1',.45);});
 let length=0,overlap=0;
 edges.forEach(([a,b])=>{const ax=nodes[a][0]+35,ay=nodes[a][1]+13,bx=nodes[b][0]+35,by=nodes[b][1]+13;length+=Math.abs(ax-bx)+Math.abs(ay-by);s+=path('M'+ax+' '+ay+'H'+bx+'V'+by,'#3977db',1.7,'opacity=".8"');});
 nodes.forEach((p,i)=>{for(let j=i+1;j<nodes.length;j++){const q=nodes[j];if(p[0]<q[0]+70&&p[0]+70>q[0]&&p[1]<q[1]+26&&p[1]+26>q[1])overlap++;}s+='<g class="movable" data-node="'+i+'" tabindex="0" role="button" aria-label="单元 '+names[i]+'，可拖动或用方向键移动">'+rect(p[0],p[1],70,26,i===0||i===5?'#245fbd':'#7c9bc7','rx="2" stroke="#ffffff" stroke-width="1.5"')+svgText(p[0]+35,p[1]+17,names[i],'#ffffff',11,'text-anchor="middle" pointer-events="none"')+'</g>';});
 s+=svgText(42,297,'横线是放置行；蓝线表示连接关系，尚未真实布线。','#56677f',11);
 $('#place-svg').innerHTML=s;$('#place-length').textContent=Math.round(length)+' 示意单位';$('#place-overlaps').textContent=overlap;
 $('#place-caption').textContent=placeMode==='initial'?'初始位置较分散。拖动任一单元，看总连接距离如何变化；也可用 Tab 选中单元后按方向键移动。':placeMode==='global'?'这个预设状态把相关单元拉近，但仍有重叠和未对齐的位置。全局位置还需要合法化。':'预设单元已对齐到放置行且不重叠。继续手动移动会改变状态，点“重置当前布局”恢复。';
}
$$('[data-place]').forEach(el=>el.addEventListener('click',()=>setPlace(el.dataset.place)));$('#place-reset').addEventListener('click',()=>setPlace(placeMode));
function svgPoint(e){const svg=$('#place-svg'),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;return pt.matrixTransform(svg.getScreenCTM().inverse());}
$('#place-svg').addEventListener('pointerdown',e=>{const g=e.target.closest('[data-node]');if(!g)return;e.preventDefault();const p=svgPoint(e),i=Number(g.dataset.node);drag={i,dx:p.x-nodes[i][0],dy:p.y-nodes[i][1]};$('#place-svg').setPointerCapture(e.pointerId);});
$('#place-svg').addEventListener('pointermove',e=>{if(!drag)return;const p=svgPoint(e);nodes[drag.i]=[Math.max(42,Math.min(628,p.x-drag.dx)),Math.max(34,Math.min(245,p.y-drag.dy))];renderPlace();});
$('#place-svg').addEventListener('pointerup',()=>{drag=null;});$('#place-svg').addEventListener('pointercancel',()=>{drag=null;});
$('#place-svg').addEventListener('keydown',e=>{const g=e.target.closest('[data-node]');if(!g||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const i=Number(g.dataset.node),step=e.shiftKey?13:4;nodes[i][0]=Math.max(42,Math.min(628,nodes[i][0]+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0)));nodes[i][1]=Math.max(34,Math.min(245,nodes[i][1]+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0)));renderPlace();$('[data-node="'+i+'"]').focus();});setPlace('initial');

// Clock demo: explicitly stated Manhattan wire delay + fixed buffer delay.
let clockMode='direct';
function renderClock(){
 const leaves=[140,260,380,500],times=leaves.map(x=>clockMode==='direct'?(Math.abs(320-x)+155)*.01:3.33);
 let s=svgText(320,22,'时钟源','#245fbd',12,'text-anchor="middle"')+rect(305,32,30,21,'#245fbd','rx="2"');
 if(clockMode==='direct'){leaves.forEach((x,i)=>s+=path('M320 53V'+(75+i*10)+'H'+x+'V208',['#3977db','#8d75d4','#3c9db8','#8565c3'][i],2));}
 else{[200,440].forEach(x=>{s+=path('M320 53V108H'+x+'V122','#245fbd',2.5);s+='<path d="M'+(x-10)+' 122h20l-10 17z" fill="#3977db"/>';});leaves.forEach((x,i)=>{const root=i<2?200:440;s+=path('M'+root+' 139V167H'+x+'V208','#8d75d4',2);});}
 leaves.forEach((x,i)=>{s+=rect(x-29,208,58,30,'#e6effc','stroke="#245fbd" rx="2"')+svgText(x,228,'FF_'+(i+1),'#245fbd',11,'text-anchor="middle"')+svgText(x,261,times[i].toFixed(2)+' ns','#56677f',11,'text-anchor="middle"');});
 $('#clock-svg').innerHTML=s;$('#clock-times').innerHTML=times.map((t,i)=>'<div><span>FF_'+(i+1)+' 到达</span><b>'+t.toFixed(2)+' ns</b></div>').join('');$('#clock-skew').textContent=(Math.max(...times)-Math.min(...times)).toFixed(2)+' ns';
 $('#clock-feedback').textContent=clockMode==='direct'?'模型中，距离不同导致到达时间不同。真实情况还受负载、缓冲器与线路电气特性影响。':'路径被构造成等长并各经过一个缓冲器，因此本教学模型得到相同到达时间。真实设计还要检查最大延迟与其他约束。';
 activate('[data-clock]','data-clock',clockMode);
}
$$('[data-clock]').forEach(el=>el.addEventListener('click',()=>{clockMode=el.dataset.clock;renderClock();}));renderClock();

let routeMode='global';
function renderRoute(){
 const demand=Number($('#demand').value),capacity=$('#blocked').checked?6:10,ratio=demand/capacity,colors=['#47769b','#86a87c','#dfb961','#c65336'];
 let s=rect(25,27,590,289,'#f1f5fc','stroke="#b5c7df"');
 for(let x=40;x<615;x+=35)s+=path('M'+x+' 28v287','#c9d6e7',.6);for(let y=42;y<315;y+=25)s+=path('M25 '+y+'h590','#c9d6e7',.6);
 s+=rect(260,137,115,130,'#d0dced','stroke="#879fbd"')+svgText(317,198,'阻挡区域','#56677f',12,'text-anchor="middle"')+svgText(317,216,'部分金属层','#56677f',10,'text-anchor="middle"');
 s+=rect(65,175,75,40,'#245fbd','rx="2"')+rect(480,185,75,40,'#245fbd','rx="2"')+svgText(102,200,'单元 A','#ffffff',12,'text-anchor="middle"')+svgText(517,210,'单元 B','#ffffff',12,'text-anchor="middle"');
 if(routeMode==='global'){
  s+=path('M140 194H215V96H433V204H480','#589adb',38,'opacity=".3" stroke-linejoin="round"');s+=path('M140 194H215V96H433V204H480','#3977db',2,'stroke-dasharray="7 6"');
  s+=svgText(320,69,'引导区域：从障碍上方绕过','#3977db',12,'text-anchor="middle"');
 }else if(routeMode==='detail'){
  if($('#show-m1').checked)s+=path('M140 194H213M213 92H434M434 204H480','#3977db',4);
  if($('#show-m2').checked)s+=path('M213 194V92M434 92V204','#8d75d4',4);
  if($('#show-via').checked)[[213,194],[213,92],[434,92],[434,204]].forEach(p=>s+=rect(p[0]-5,p[1]-5,10,10,'#ffffff','stroke="#245fbd" stroke-width="2"'));
  s+=svgText(320,62,'蓝色 M1 · 紫色 M2 · 方框为通孔','#56677f',11,'text-anchor="middle"');
 }else{
  const color=colors[Math.min(3,Math.floor(ratio*2.3))];s+=rect(207,68,230,56,color,'opacity=".55" stroke="'+color+'"');
  const n=Math.min(demand,16);for(let i=0;i<n;i++)s+=path('M180 '+(73+i*3)+'H459',i>=capacity?'#ba3c52':'#245fbd',1.7);
  s+=svgText(320,55,'同一示意通道：容量 '+capacity+'，使用量 '+demand,'#56677f',11,'text-anchor="middle"');
  if($('#blocked').checked)s+=rect(260,70,64,53,'#607b9e','opacity=".7"');
 }
 s+=svgText(320,345,routeMode==='global'?'较宽的引导区域给后续详细布线提供参考':routeMode==='detail'?'只在金属层正确连接并设置通孔时，信号才能连续通过':'超过容量的需求需分流、改变层或调整空间','#56677f',11,'text-anchor="middle"');
 $('#route-svg').innerHTML=s;$('#layer-controls').hidden=routeMode!=='detail';$('#capacity-controls').hidden=routeMode!=='congestion';
 const descriptions={global:['先规划一条走廊','全局布线使用较粗的网格，选择经过区域和层，考虑线长、资源与拥塞。引导区域还没有把每段金属固定到具体轨道。'],detail:['连接具体引脚','详细布线安排线段、换层点与通孔，并处理线宽、间距等规则。切换显示层观察：隐藏只是改变画面，不会删除连线。'],congestion:['看需求与容量的比值','拖动线数或加入障碍，观察使用率。此处固定几何通道，用显式数字演示资源关系，不运行真实布线算法。']};
 $('#route-title').textContent=descriptions[routeMode][0];$('#route-description').textContent=descriptions[routeMode][1];$('#demand-value').textContent=demand;
 $('#capacity-metric').innerHTML='使用量 '+demand+' ÷ 容量 '+capacity+'<b style="color:'+(ratio>1?'#c23d52':'#245fbd')+'">'+(ratio*100).toFixed(0)+'%</b>'+(ratio>1?'需求超过估计容量。':'尚未超过估计容量，局部引脚仍可能难接。');
 activate('[data-route]','data-route',routeMode);
}
$$('[data-route]').forEach(el=>el.addEventListener('click',()=>{routeMode=el.dataset.route;renderRoute();}));['show-m1','show-m2','show-via','demand','blocked'].forEach(id=>$('#'+id).addEventListener('input',renderRoute));renderRoute();

function timing(){
 const t=Number($('#period').value),l=Number($('#logic-delay').value),w=Number($('#wire-delay').value),arrival=.2+l+w,required=t-.2,slack=required-arrival;
 $('#period-value').textContent=t.toFixed(1)+' ns';$('#logic-value').textContent=l.toFixed(1)+' ns';$('#wire-value').textContent=w.toFixed(1)+' ns';
 const scale=91,start=36;let s=path('M36 90H785','#a9bcd5',1);
 for(let i=0;i<=8;i++)s+=path('M'+(start+i*scale)+' 86v8','#a9bcd5',1)+svgText(start+i*scale,115,i+' ns','#56677f',10,'text-anchor="middle"');
 s+=rect(start,36,.2*scale,34,'#7da7d7')+rect(start+.2*scale,36,l*scale,34,'#245fbd')+rect(start+(.2+l)*scale,36,w*scale,34,'#8d75d4');
 s+=path('M'+(start+required*scale)+' 17v65','#3977db',2,'stroke-dasharray="4 3"')+svgText(start+required*scale,13,'要求 '+required.toFixed(2),'#3977db',10,'text-anchor="middle"');
 s+=svgText(start+arrival*scale,82,'到达 '+arrival.toFixed(2),slack>=-1e-8?'#245fbd':'#c23d52',10,'text-anchor="middle"');
 $('#timing-svg').innerHTML=s;
 $('#timing-results').innerHTML='<div><span>要求到达 Required</span><b>'+required.toFixed(2)+' <small>ns</small></b></div><div><span>实际到达 Arrival</span><b>'+arrival.toFixed(2)+' <small>ns</small></b></div><div class="'+(slack>=-1e-8?'pass':'fail')+'"><span>裕量 Slack</span><b>'+(slack>=0?'+':'')+slack.toFixed(2)+' <small>ns</small></b><small>'+(slack>=-1e-8?'满足这个简化 Setup 条件':'到达过晚，需要优化')+'</small></div>';
}
['period','logic-delay','wire-delay'].forEach(id=>$('#'+id).addEventListener('input',timing));timing();

// Screenshot atlas: unchanged official screenshots; numbered markers are HTML overlays.
const tutorial='https://openroad-flow-scripts.readthedocs.io/en/latest/tutorials/FlowTutorial.html';
const scenes=[
 {id:'floor',tab:'01 芯片规划',file:'absolute_die',title:'先读边界、核心区和尺度',kind:'FLOORPLAN / 规划',anchor:'floorplan-initialization-based-on-core-and-die-area',take:'先确认芯片与核心区的尺寸，再判断单元放置空间。绿色区域不是一个巨大的逻辑门。',points:[
  [93,9,'芯片边界 Die','外侧灰色矩形标出整个芯片范围。该官方例子从 (0,0) 到 (1000,1000) 微米。','读坐标时，用右上角减左下角得到宽、高。'],
  [50,44,'核心区与放置行','绿色区域对应核心区及密集显示的放置行。示例核心区从 (100,100) 到 (900,900)，宽高各 800 微米。','标准单元按允许的行和位置排列。'],
  [42,90,'尺子与数字','浅蓝色线是测量尺，1000 是示例的一条边长，单位为微米。边缘留白是核心区外的空间。','1000 微米等于 1 毫米。'],
  [8,96,'缩放参考','左下角的短刻度帮助把屏幕长度换成物理尺寸。放大、缩小会改变屏幕比例，不改变芯片数据。','先读单位，再比较图中距离。']
 ]},
 {id:'density',tab:'02 单元密度',file:'ibex_pl_60',title:'布局上叠加的是局部密度',kind:'PLACEMENT / 布局',anchor:'defining-placement-density',take:'每个彩色采样块不是一个逻辑门。颜色表达密度，具体单元类型需要选中对象查看。',points:[
  [54,47,'局部密度热力图','彩色块是局部单元密度的可视化。底下仍然叠加着单元与放置区域的几何显示。','这张截图没有完整色标，不能从颜色读出精确百分比。'],
  [22,9,'边缘条带','深浅条带反映底层几何与占用显示。要确认某块是空位、行还是单元，应关闭热力图并检查对象属性。','仅靠颜色和形状，不把它认定为某种存储器。'],
  [60,3,'边界引脚标记','边界上的小三角是引脚位置标记，帮助观察输入输出分布。它们是界面符号，不表示封装外壳的金属脚。','查看引脚名称，才能知道它属于哪个信号。'],
  [7,96,'测量与缩放','尺子、尺度给出物理距离。布局密度和布线拥塞使用不同的统计量。','本视图看单元面积占用；拥塞视图看连线资源。']
 ]},
 {id:'routed',tab:'03 布线结果',file:'ibex_final_db',title:'金属层、层次结构与运行日志',kind:'ROUTED DESIGN / 布线后',anchor:'viewing-layout-results',take:'先按层筛选，再高亮网络。整体彩色线网适合看分布，具体连接需要放大追踪。',points:[
  [11,26,'左侧 Layers','met1 到 met5 是不同金属层。此截图 met1 为红、met2 为绿、met3 为淡黄绿、met4 为紫红、met5 为浅蓝；via 类别是层间结构。','这里红色表示层，不表示拥塞。眼睛列控制显示，手形列控制可选。'],
  [44,39,'多层金属叠加','中心窗口把多层版图叠成俯视图，看起来像密集线网。规则、层和通孔共同决定实际连接。','只保留一两层，或高亮一条 Net，会更容易看清。'],
  [81,19,'层次浏览器','右侧当前是 Hierarchy Browser。Instance 是层次名称，Master 是类型，Instances 是数量；截图的 Leaf instances 为 14,958。','Physical only 单列辅助物理单元；Area 是相应面积统计。'],
  [39,83,'脚本与日志','下方 Scripting 显示加载、运行信息和警告；底部 TCL commands 是命令输入处。','日志中的警告要结合上下文，不能只凭版图颜色判断。']
 ]},
 {id:'drc',tab:'04 短路检查',file:'view_violation',title:'从错误属性定位一个局部问题',kind:'DRC / 规则检查',anchor:'drc-viewer',take:'这一帧日志报告 5 个违规。选中的是 met1 上 net51 与 net53 的短路；数量以对应运行结果为准。',points:[
  [43,42,'选中的违规位置','黄色斜线框和白色局部框高亮当前问题位置。周围大面积红色是可见几何显示，不等于整片都发生短路。','选择错误列表的一项，再局部放大。'],
  [82,20,'右侧 Inspector','Type = DRC，Name = Short，Layer = met1。它说明这是第一金属层上的短路问题。','先读错误类型和所在层，再看几何关系。'],
  [81,28,'涉及对象与坐标','Sources 列出 net51、net53 两个网络；BBox 是违规区域的矩形坐标范围。','不同网络在同层错误接触，可能改变电路功能。'],
  [36,86,'检查日志','底部写有 Number of DRC violations = 5。教程中的其他运行阶段可能有不同数量。','复跑后比较同一阶段的报告；这只是当前工具报告，不等于完整工艺签核。']
 ]},
 {id:'macro',tab:'05 宏单元',file:'with_halo',title:'大模块的位置决定通道形状',kind:'MACRO PLACEMENT / 宏布局',anchor:'macro-placement-with-halo-spacing',take:'Halo 是宏周围的放置预留，不是画面上全部留白。宏的确切功能由名称与库决定。',points:[
  [70,16,'三个橙色大矩形','右侧三块是宏单元。它们是较大的预先设计模块；这个显示尺度下看不到每个内部器件。','先看大块之间、与边界之间是否形成狭窄通道。'],
  [61,60,'中间的小红矩形','这些是较小的单元实例。它们需要与其他单元、宏引脚和边界信号连接。','只有选中读类型，才能知道具体是什么逻辑单元。'],
  [20,49,'四周三角标记','边界三角表示引脚位置。红绿等显示颜色应结合对象属性判断，不用颜色推断信号功能。','关注引脚位置与相关模块的相对距离。'],
  [44,30,'留白与 Halo','留白是当前可见单元没有覆盖的空间。示例设置了宏周围 Halo，预留小单元放置余量；它不一定有显眼的单独边框。','金属能否经过宏上方，还由相应层的障碍规则决定。']
 ]},
 {id:'power',tab:'06 电源网络',file:'gcd_pdn_gui',title:'从外围到放置行的供电层次',kind:'POWER DISTRIBUTION / 供电',anchor:'power-planning-and-analysis',take:'电源与地是不同网络。交叉是否连接由层与通孔决定；图中没有完整网络图例，不能仅凭颜色认定 VDD/VSS。',points:[
  [26,8,'外围粗金属环','较粗的环形结构构成外围电源分配的一部分，向内部网络供电。','选中对象检查它属于电源还是地网络。'],
  [48,34,'内部供电条带','重复条带把电分送到不同位置，再通过更细的结构送到单元。','供电网络要检查连通、电流与电压降。'],
  [36,63,'行级细分配结构','密集细线形成行级等供电结构。多个层级分担从大范围分配到局部接入的任务。','隐藏部分层后，观察不同层级怎样连接。'],
  [77,80,'层间连接','不同层的金属通过合法通孔连接。俯视的横竖交叉不能单独作为接通的证据。','要同时确认网络名称、层和通孔。']
 ]},
 {id:'clock',tab:'07 时钟树',file:'ibex_clock_tree',title:'左看物理分布，右看树与时间',kind:'CLOCK TREE / 时钟分发',anchor:'tracing-the-clock-tree',take:'右侧的横向排布用来展开树，不代表芯片距离。纵轴是时间；约 3 ns 的叶端位置不能直接当成时钟周期。',points:[
  [45,38,'版图上的时钟分支','灰色背景是单元布局，彩色高亮展示时钟网络或分支在空间上的分布。','这是高亮配色，不直接套用金属层配色。'],
  [81,32,'时钟树根与分叉','右侧查看 core_clock。树根表示时钟分发起点，中间节点与分叉表达缓冲和分发层次。','沿一条分支追到接收端，理解它经过哪些层级。'],
  [66,52,'纳秒时间轴','右侧左边标有 0.00 ns、1.00 ns 等刻度，表达时钟传播的时间信息。','区分传播延迟、接收端时间差和时钟周期。'],
  [79,78,'末端接收节点','末端是时钟接收端。应在需要比较的接收组内分析到达差异，并结合真实时钟约束。','仅凭图中两簇高低不同，不直接判定设计失败。']
 ]},
 {id:'timing',tab:'08 时序路径',file:'clock_path_update',title:'Required − Arrival = Setup Slack',kind:'TIMING / 路径分析',anchor:'viewing-timing-report',take:'截图选中行：12.000 − 13.288 = −1.288 ns，表示这个 Setup 检查晚到 1.288 ns。',points:[
  [43,46,'高亮路径','红色和浅蓝色线是当前时序检查涉及的高亮连接。数据与时钟部分要结合右侧 Data Path Details 和 Capture Path Details 确认。','先选报告中的路径，再回到版图看位置。'],
  [81,30,'上半部路径列表','Required 是要求到达时间，Arrival 是计算到达时间，Slack 是裕量；Start、End 是起终点。第一行 12.000、13.288、−1.288。','本例 End 是输出 instr_addr_o[31]，终点并不总是寄存器。'],
  [82,67,'下半部逐段详情','Pin 是引脚，Fanout 是接收端数量，Time 是累计时间，Delay 是本段增加的延迟，Slew 是转换时间，Load 是负载。','沿路径找出主要延迟来源，再决定改门、位置还是线路。'],
  [75,23,'Setup 与 Hold 标签','Setup 检查晚到；Hold 检查过早变化。二者的裕量定义和修复目标不同，不能把同一个减法直接套到所有检查。','降低延迟前，也要留意是否损害 Hold。']
 ]},
 {id:'congestion',tab:'09 布线拥塞',file:'routing_heatmap',title:'确认当前颜色对应的是哪种指标',kind:'CONGESTION / 资源压力',anchor:'using-heat-maps',take:'这张图没有完整色标，只能结合设置定位相对热点，不能单凭红色就断言超过 100%。',points:[
  [12,65,'当前勾选 Routing Congestion','左侧 Heat Maps 展开后，Routing Congestion 被勾选。它说明叠加颜色来自布线资源分析。','先核对选项，避免把密度图当成拥塞图。'],
  [48,43,'彩色资源区域','软件按网格统计使用量与容量，再把比值映射为颜色。方向与金属层选项会影响统计视图。','定位热点后，再检查网络需求和通道容量。'],
  [37,18,'底下仍有实际版图','热力图可以叠在单元和金属之上。看到的格子属于统计显示，不是每一格对应一个门。','关闭热力图，才能清楚检查底下对象。'],
  [82,19,'右侧仍是层次浏览器','右侧显示模块和实例统计，没有展示完整拥塞色标。','没有图例时，不把某种红色换算成确定的使用率。']
 ]}
];
let sceneIndex=0,pointIndex=0;
$('#atlas-tabs').innerHTML=scenes.map((d,i)=>'<button data-scene="'+i+'" aria-pressed="false">'+d.tab+'</button>').join('');
function showScene(i){
 sceneIndex=i;pointIndex=0;const d=scenes[i];$('#atlas-kicker').textContent=d.kind;$('#atlas-title').textContent=d.title;
 const img=$('#screenshot');img.removeAttribute('width');img.removeAttribute('height');img.src='assets/'+d.file+'.webp';img.alt='OpenROAD 真实截图：'+d.title;
 $('#atlas-source').href=tutorial+'#'+d.anchor;$('#atlas-takeaway').textContent=d.take;
 $('#hotspots').innerHTML=d.points.map((p,j)=>'<button class="hotspot" data-point="'+j+'" style="left:'+p[0]+'%;top:'+p[1]+'%" aria-label="编号 '+(j+1)+'：'+p[2]+'" aria-pressed="false">'+(j+1)+'</button>').join('');
 $('#hotspot-list').innerHTML=d.points.map((p,j)=>'<button class="hotspot-item" data-point="'+j+'" aria-pressed="false"><span>'+(j+1)+'</span>'+p[2]+'</button>').join('');
 activate('[data-scene]','data-scene',String(i));showPoint(0);
}
function showPoint(i){pointIndex=i;const p=scenes[sceneIndex].points[i];$('#hotspot-detail').innerHTML='<h4>'+String(i+1).padStart(2,'0')+' / '+p[2]+'</h4><p>'+p[3]+'</p><p class="reading-task">读图动作：'+p[4]+'</p>';activate('[data-point]','data-point',String(i));}
$('#atlas-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-scene]');if(b)showScene(Number(b.dataset.scene));});
$('.atlas-shell').addEventListener('click',e=>{const b=e.target.closest('[data-point]');if(b)showPoint(Number(b.dataset.point));});showScene(0);
const dialog=$('#image-dialog');$('#zoom-image').addEventListener('click',()=>{const d=scenes[sceneIndex];$('#dialog-title').textContent=d.title;$('#dialog-image').src='assets/'+d.file+'.webp';$('#dialog-image').alt=$('#screenshot').alt;$('#dialog-caption').textContent='OpenROAD 官方教程原图，无导读标记。窄屏可在图片区域横向滚动查看细节。';dialog.showModal();});$('#close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});

const questions=[
 ['布局和布线分别决定什么？',['布局决定单元位置，布线决定金属连接','布局决定逻辑功能，布线决定程序'],0,'逻辑功能已经由设计与网表确定。物理实现需要保持要求的电路行为，同时优化位置和连接。'],
 ['整体利用率 60%，右上角拥塞，先做什么？',['立即扩大整个芯片','检查局部网络需求和可用通道'],1,'先定位原因。拥塞可能来自需求集中，也可能来自宏、障碍或层限制导致的容量不足。'],
 ['全局布线得到引导区域，意味着什么？',['后续详细布线一定成功','已经有大致路线，还要安排具体几何'],1,'引脚接入、通孔和间距等局部问题仍可能导致困难。'],
 ['Setup：Required 12，Arrival 13.288，结果是？',['Slack = −1.288，晚到','Slack = +1.288，满足'],0,'该 Setup 检查用 Required − Arrival，得到 −1.288。负裕量表示未满足要求。'],
 ['两根线在俯视图上交叉，是否接通？',['一定接通','需要看网络、金属层和通孔'],1,'不同层没有通孔时可以彼此跨过；同层不同网络的错误接触可能形成短路。'],
 ['DRC 报告零违规，能否直接证明连接完全正确？',['可以，它检查一切','还需要连接一致性等相应检查'],1,'几何规则和电路连接是不同检查维度。完整签核应符合目标工艺与项目的要求。']
];
let answers=readStore('pnr-quiz-v1',{});if(!answers||typeof answers!=='object'||Array.isArray(answers))answers={};
function renderQuiz(){
 $('#quiz').innerHTML=questions.map((q,i)=>{const ans=Number.isInteger(answers[i])&&answers[i]>=0&&answers[i]<q[1].length?answers[i]:null;return '<article class="quiz-card"><h4><span>0'+(i+1)+'</span>'+q[0]+'</h4><div class="quiz-options">'+q[1].map((v,j)=>'<button data-question="'+i+'" data-answer="'+j+'" aria-pressed="'+(ans===j)+'" class="'+(ans===j?'selected '+(j===q[2]?'correct':'incorrect'):'')+'">'+v+'</button>').join('')+'</div><p class="quiz-answer" aria-live="polite">'+(ans===null?'选择一个答案，查看解释。':(ans===q[2]?'✓ 回答正确。':'再想一想。')+q[3])+'</p></article>';}).join('');
 const answered=questions.filter((_,i)=>Number.isInteger(answers[i])).length,correct=questions.filter((q,i)=>answers[i]===q[2]).length;$('#quiz-score').textContent=answered+' / 6 已答 · '+correct+' 题正确';
}
$('#quiz').addEventListener('click',e=>{const b=e.target.closest('[data-question]');if(!b)return;answers[Number(b.dataset.question)]=Number(b.dataset.answer);writeStore('pnr-quiz-v1',answers);const id=Number(b.dataset.question),answer=Number(b.dataset.answer);renderQuiz();$('[data-question="'+id+'"][data-answer="'+answer+'"]').focus({preventScroll:true});});renderQuiz();
const terms=[
 ['标准单元','Standard Cell','预先设计好的逻辑门、触发器、缓冲器等小电路。'],['宏单元','Macro','SRAM 等较大的预先设计模块，有固定外形与引脚。'],['实例','Instance','某个单元类型在电路中的一次具体使用。'],['网表','Netlist','单元清单及各引脚之间的连接关系。'],['网络','Net','应该电气连通的一组引脚。'],['引脚','Pin','信号或电源接入、接出单元的位置。'],['芯片边界','Die','整颗芯片对应的物理范围。'],['核心区','Core','主要电路单元的放置区域。'],['放置行','Row','标准单元允许排列的行。'],['放置位置','Site','放置行中的基本位置单位。'],['利用率','Utilization','单元面积与相应可放置区域面积的比值，具体口径需看工具定义。'],['预留间隔','Halo','宏单元周围为放置和连接保留的间隔。'],['轨道','Track','安排布线的参考网格线。'],['通孔','Via','连接不同金属层的结构。'],['全局布线网格','GCell','用于粗粒度路径和资源分析的网格区域。'],['拥塞','Congestion','连线需求相对可用布线资源的紧张程度。'],['时钟树','CTS','向时钟接收端分发时钟的分支与缓冲网络。'],['时钟偏斜','Skew','需要比较的接收端之间的时钟到达时间差。'],['时间裕量','Slack','对应时序检查中，距离违反要求还剩多少时间余量。'],['建立时间','Setup','接收时钟有效边沿前，数据需要稳定的时间。'],['保持时间','Hold','接收时钟有效边沿后，数据还需要保持稳定的时间。'],['物理抽象','LEF','层、单元外形、引脚和障碍等物理抽象信息。'],['单元时序库','Liberty','单元功能、电气特性、延迟与时序要求等资料。'],['设计约束','SDC','时钟、接口时序、例外等约束的表达。'],['设计交换','DEF','描述设计中的位置、连接与布线等物理信息的格式。'],['版图数据','GDS / OASIS','用于交换版图层与几何形状等信息的格式。'],['规则检查','DRC','检查线宽、间距、通孔等几何制造规则。'],['连接一致性','LVS','比较从版图提取的电路与参考电路。'],['电压降','IR Drop','电流流过供电网络电阻造成的电压下降。'],['寄生提取','RC Extraction','从物理几何估计互连电阻、电容等电气参数。']
];
function renderGlossary(){const query=$('#glossary-search').value.trim().toLowerCase();const list=terms.filter(d=>d.join(' ').toLowerCase().includes(query));$('#glossary').innerHTML=list.map(d=>'<article class="glossary-item"><b>'+d[0]+'</b><span>'+d[1]+'</span><p>'+d[2]+'</p></article>').join('');$('#glossary-empty').hidden=list.length>0;}
$('#glossary-search').addEventListener('input',renderGlossary);renderGlossary();

const chapterIds=$$('.chapter').map(el=>el.id);let completed=readStore('pnr-completed-v1',[]);if(!Array.isArray(completed))completed=[];completed=completed.filter(id=>chapterIds.includes(id));
function renderCompleted(){
 $$('.complete').forEach(el=>{const yes=completed.includes(el.dataset.complete);el.textContent=yes?'已学完 · 点击撤销':'标记已学 ✓';el.classList.toggle('is-complete',yes);el.setAttribute('aria-pressed',String(yes));});
 $$('.sidebar nav a').forEach(el=>el.classList.toggle('done',completed.includes(el.getAttribute('href').slice(1))));$('#saved-progress').textContent='已完成 '+completed.length+' / '+chapterIds.length+' 章';
}
$$('.complete').forEach(el=>el.addEventListener('click',()=>{const id=el.dataset.complete;completed=completed.includes(id)?completed.filter(x=>x!==id):completed.concat(id);writeStore('pnr-completed-v1',completed);renderCompleted();}));renderCompleted();
$('#reset-progress').addEventListener('click',()=>{completed=[];answers={};writeStore('pnr-completed-v1',completed);writeStore('pnr-quiz-v1',answers);renderCompleted();renderQuiz();$('#reset-progress').textContent='本地学习记录已清除';});
let scrollPending=false;
function updateReading(){if(document.body.classList.contains('workspace-mode')){window.dispatchEvent(new Event('pnr:reading'));scrollPending=false;return;}const max=document.documentElement.scrollHeight-innerHeight,pct=max>0?Math.min(100,Math.max(0,scrollY/max*100)):0;$('#read-percent').textContent=Math.round(pct)+'%';$('#read-progress').style.width=pct+'%';let current='';$$('.chapter').forEach(el=>{if(el.getBoundingClientRect().top<190)current=el.id;});$$('.sidebar nav a').forEach(el=>{const active=el.getAttribute('href')==='#'+current;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','location');else el.removeAttribute('aria-current');});scrollPending=false;}
addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(updateReading);}},{passive:true});addEventListener('resize',updateReading);addEventListener('load',updateReading);updateReading();
