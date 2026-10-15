(function () {
  'use strict';
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const saved = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
  const lessons = [
    ['basics','从逻辑门到版图','基础与准备','认识标准单元、宏单元与连接网络。','floor'],
    ['inputs','设计任务与输入','基础与准备','分清网表、LEF、Liberty、SDC 与 PDK。','routed'],
    ['floorplan','芯片规划与利用率','基础与准备','理解芯片边界、核心区和面积余量。','floor'],
    ['placement','全局布局与合法化','布局到布线','拖动单元，观察线长与位置合法性的取舍。','density'],
    ['clock','时钟树与到达时间','布局到布线','把时钟送到接收端，比较传播时间。','clock'],
    ['routing','全局与详细布线','布局到布线','区分引导区域、实际金属连接和拥塞。','congestion'],
    ['timing','时序、DRC 与 LVS','布局到布线','读懂负裕量，分清不同维度的检查。','timing'],
    ['atlas','真实软件截图导读','读图与工程实践','9 张截图，36 个编号区域逐项讲解。','routed'],
    ['ai','工程师与 AI','读图与工程实践','把建议变成可比较、可复现的实验。','drc'],
    ['start','实践、练习与术语','读图与工程实践','完成小设计，检查理解并查阅术语。','routed'],
    ['pcb','PCB：BGA 与电源布局','板级设计拓展','从 BGA 扇出到 DCDC 电源，认识板级布局的约束。',null]
  ];
  const signoffLessons = [{"id": "standards", "title": "什么叫“签核通过”", "desc": "工艺规则、芯片规格与项目标准", "group": "验收框架"}, {"id": "flow", "title": "最终版本与验证流程", "desc": "GDS、网表、寄生参数和报告的版本对应", "group": "验收框架"}, {"id": "physical", "title": "DRC、天线与密度", "desc": "制造几何规则与金属填充", "group": "物理与逻辑"}, {"id": "lvs", "title": "LVS 与逻辑等价性", "desc": "开短路、缓冲器、ECO 与 LEC", "group": "物理与逻辑"}, {"id": "timing", "title": "STA 与时序裕量", "desc": "Setup、hold、WNS、TNS 与多角分析", "group": "性能与供电"}, {"id": "constraints", "title": "约束、串扰与后仿真", "desc": "SDC、SI、CDC 和检查覆盖", "group": "性能与供电"}, {"id": "power", "title": "IR drop、EM 与功耗", "desc": "电源压降、金属电迁移与可靠性", "group": "性能与供电"}, {"id": "reports", "title": "报告怎么看、问题怎么定位", "desc": "时序、DRC 和 IR 报告的逐项导读", "group": "报告与交付"}, {"id": "checklist", "title": "验收清单与交付包", "desc": "12 项可导出的验收核对记录", "group": "报告与交付"}, {"id": "practice", "title": "自测、术语与模拟芯片差异", "desc": "常见误区、模拟与 RF 签核", "group": "报告与交付"}];
  const byId = Object.fromEntries(lessons.map((l,i) => [l[0], {id:l[0], title:l[1], group:l[2], desc:l[3], scene:l[4], index:i}]));
  const labs = [
    ['basics','逻辑门输入与输出','切换 0 和 1，观察 AND、OR、NOT。','数字电路 / 入门','gate'],
    ['floorplan','核心区利用率','改变区域面积，保持单元总面积不变。','空间规划 / 面积','floor'],
    ['placement','可拖动的单元布局','移动单元，比较距离与重叠数量。','位置优化 / 约束','place'],
    ['clock','时钟分发与到达差异','比较直接分发和对称分支的简化模型。','时钟树 / 时间','clock'],
    ['routing','金属层、通孔与拥塞','查看布线层，并改变通道需求与容量。','布线资源 / 层','route'],
    ['timing','Setup 时间预算','调整周期和延迟，观察时序裕量。','时序分析 / 预算','timing'],
    ['pcb','BGA 焊盘间的通道','在两焊盘之间检查线宽与间距。','PCB 拓展 / 几何','pcb']
  ];
  const videoData = [
    {bvid:'BV1Za411x7E5', title:'数字IC布局布线的基本流程', author:'皮特派', duration:1493, cid:1059592695, kind:'芯片内部 / 流程概览', related:[['inputs','任务输入与流程'],['routing','全局与详细布线']],
      guide:{before:['先读第 02 节，知道工具接收什么资料。','回想布局移动的是单元，布线规划的是金属连接。'],during:['记录出现的流程名称，区分输入、操作与输出。','留意哪些步骤修改单元，哪些步骤修改连线。','遇到时序或规则报告时，记下它在检查什么。'],after:['用自己的话列出规划、布局、时钟树、布线与检查的关系。','打开第 06 节，把全局规划与详细连接对照起来。']}},
    {bvid:'BV19R4y1F7X9', title:'拿到新项目该如何入手', author:'皮特派', duration:1976, cid:1059595155, kind:'芯片工程 / 项目准备', related:[['inputs','设计输入资料'],['ai','工程师的实验闭环']],
      guide:{before:['先认识网表、物理库、时序库与约束文件的分工。','准备一张“已知条件 / 未知问题”清单。'],during:['记录项目开始时需要确认哪些输入和限制。','把操作分成准备资料、运行工具、读取报告三类。','记下你不认识的文件与术语，之后再查。'],after:['为一个假想小电路写一份输入清单。','选一个参数，说明要保留什么基线，怎样比较修改效果。']}},
    {bvid:'BV1opXLBTENV', title:'BGA芯片PCB布线技巧', author:'星辰大海启行', duration:389, cid:37053662952, kind:'PCB / BGA 板级拓展', related:[['pcb','BGA / PCB 基础讲义'],['pcb/lab','焊盘通道几何实验']],
      guide:{before:['先读板级拓展，分清裸芯片、封装接点和 PCB 焊盘。','认识焊盘、走线、过孔与扇出，知道这个视频属于板级设计。'],during:['观察画面中的焊盘与过孔，记下你如何辨认它们。','留意线怎样离开密集区域，以及何处改变布线层。','遇到具体尺寸或规则时，记录其适用条件，不直接套用。'],after:['画出一条“焊盘 → 短线 → 过孔 → 其他层”的示意。','在本站改变焊盘间距，解释局部通道为什么会变窄。','把还需要从器件规格、层叠与板厂确认的条件列出来。']}}
,
    {bvid:'BV1m6ht6qELt', title:'20分钟，学透 DCDC 模块设计！含12个布局布线技巧！', author:'嘉立创EDA', duration:1226, cid:42134014027, kind:'PCB / DCDC 电源模块', materials:'https://oshwhub.com/course-examples/project_qmgkkzeo', related:[['pcb/pcb-dcdc','DCDC 电源布局图解'],['pcb','板级布局基础']],
      guide:{before:['先读 DCDC 图解，认识输入电容 CIN、电感 L、输出电容 COUT 和反馈 FB。','把“电源从哪来、能量送到哪、输出怎样被检测”画成三条路径。'],during:['在画面中找输入电容、功率器件、电感和反馈电阻，观察相对位置。','老师调整器件或铜线时，记录它在解决回路、噪声、载流还是制造问题。','把标题中的技巧逐项写进笔记；具体尺寸和接地方式同时记录适用器件与条件。'],after:['在自己的草图上标出输入高频回路、SW 节点和反馈取样路径。','解释为什么总线长短，并不足以判断电源布局好坏。','打开作者提供的学习资料，对照器件手册的 Layout 示例检查自己的观察。']}}
  ];
  q('#video-count').textContent=videoData.length+' 段已核实资料';
  q('#search-video-count').textContent=videoData.length;
  const duration = seconds => Math.floor(seconds/60).toString().padStart(2,'0') + ':' + (seconds%60).toString().padStart(2,'0');
  let current = '', currentHash = '', pendingNavigation = false, localHeadings = [], selectedVideo = videoData[3].bvid, videoTab = 'before';
  const positions = new Map();
  const doneIds = () => { const v = saved('pnr-completed-v1', []); return Array.isArray(v) ? v.filter(x=>byId[x]) : []; };
  let notes = saved('pnr-video-notes-v1', {}); if (!notes || typeof notes !== 'object' || Array.isArray(notes)) notes = {};
  let watched = saved('pnr-video-watched-v1', []); if (!Array.isArray(watched)) watched = [];

  function mini(kind) {
    const line = (d,c='#5c8fcf',w=2) => '<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'"/>';
    let art = '';
    if(kind==='gate') art='<rect x="110" y="32" width="65" height="58" rx="17" fill="#d7e7fd" stroke="#709bd2"/>'+line('M42 48h68M42 75h68M175 61h67')+'<circle cx="43" cy="48" r="8" fill="#89b6e9"/><circle cx="43" cy="75" r="8" fill="#c5d9f1"/><circle cx="242" cy="61" r="10" fill="#4789d5"/>';
    if(kind==='floor'||kind==='place') { art='<rect x="42" y="18" width="216" height="88" rx="3" fill="#e4eefb" stroke="#a9c3e4"/>'; for(let y=0;y<4;y++)for(let x=0;x<7;x++)art+='<rect x="'+(52+x*28)+'" y="'+(27+y*19)+'" width="'+(x%3===0?22:17)+'" height="12" rx="2" fill="'+(y===2&&x>3?'#4e91d7':'#98b7df')+'"/>'; if(kind==='place')art+=line('M64 33H147V71H229','#3876c8'); }
    if(kind==='clock') art=line('M150 18v25M80 43h140M80 43v26M220 43v26M49 69h62M189 69h62M49 69v30M111 69v30M189 69v30M251 69v30')+'<circle cx="150" cy="18" r="7" fill="#4c8bd0"/>'; 
    if(kind==='route') art=line('M35 87H93V30H220V87H267','#5489d1',3)+line('M93 87V30M220 30V87','#9488d0',3)+'<rect x="120" y="56" width="71" height="44" rx="3" fill="#cbdaf0"/>'+[[93,87],[93,30],[220,30],[220,87]].map(p=>'<rect x="'+(p[0]-4)+'" y="'+(p[1]-4)+'" width="8" height="8" fill="white" stroke="#5c8fcf"/>').join('');
    if(kind==='timing') art=line('M33 94H270','#bacbe1',1)+'<rect x="35" y="40" width="58" height="29" rx="2" fill="#9bbde5"/><rect x="93" y="40" width="108" height="29" fill="#548acf"/><rect x="201" y="40" width="41" height="29" rx="2" fill="#a092d1"/>'+line('M222 18v70','#c27b91',2);
    if(kind==='pcb') { for(let y=0;y<4;y++)for(let x=0;x<6;x++)art+='<circle cx="'+(75+x*30)+'" cy="'+(25+y*24)+'" r="7" fill="'+(y===1&&x===2?'#4b8ad1':'#a3bcdf')+'"/>';art+=line('M135 49l16 14v41','#3977cb',3)+'<circle cx="151" cy="65" r="5" fill="white" stroke="#3977cb"/>'; }
    return '<svg viewBox="0 0 300 124" aria-hidden="true">'+art+'</svg>';
  }
  function renderPaths() {
    const done = doneIds();
    const groups = [['01','基础与准备',[0,1,2],'认识对象，读懂输入资料。'],['02','布局到布线',[3,4,5,6],'让空间、连线和时间相互配合。'],['03','读图与工程实践',[7,8,9],'在真实画面中找到可验证的证据。'],['04','从芯片到电路板',[10],'认识 BGA 扇出与 DCDC 电源布局。']];
    q('#path-grid').innerHTML=groups.map(g=>'<article class="path-card'+(g[0]==='04'?' extension':'')+'"><div class="path-card-heading"><b>'+g[0]+'</b><div><h3>'+g[1]+'</h3><p>'+g[3]+'</p></div><span>'+g[2].filter(i=>done.includes(lessons[i][0])).length+' / '+g[2].length+'</span></div>'+g[2].map(i=>'<a class="path-lesson'+(done.includes(lessons[i][0])?' done':'')+'" href="#'+lessons[i][0]+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+lessons[i][1]+'<small>'+(done.includes(lessons[i][0])?'已学 ✓':'进入 →')+'</small></a>').join('')+'</article>').join('');
    q('#featured-experiments').innerHTML=[2,4,5].map(i=>{const l=labs[i];return '<a class="experiment-mini" href="#'+l[0]+'/lab">'+mini(l[4])+'<span>'+l[3]+'</span><h3>'+l[1]+' ↗</h3><p>'+l[2]+'</p></a>';}).join('');
    q('#experiment-hub').innerHTML=labs.map((l,i)=>'<article class="experiment-card">'+mini(l[4])+'<div class="experiment-card-body"><span>LAB '+String(i+1).padStart(2,'0')+' / '+l[3]+'</span><h3>'+l[1]+'</h3><p>'+l[2]+'</p><a href="#'+l[0]+'/lab">进入配套实验 <span>→</span></a></div></article>').join('');
    q('#experiment-hub').insertAdjacentHTML('beforeend', [['physical/drc','DRC 间距检查','移动两条金属线，对比实际间距与规则。','floor'],['timing/sta','Setup 与 Hold','同时观察最早与最晚到达要求。','timing'],['power/ir','电源压降关系','改变电流和电阻，观察局部电压。','route']].map((l,i)=>'<article class="experiment-card">'+mini(l[3])+'<div class="experiment-card-body"><span>进阶 LAB '+String(i+1).padStart(2,'0')+' / 签核与验收</span><h3>'+l[1]+'</h3><p>'+l[2]+'</p><a href="signoff/index.html#'+l[0]+'">进入签核实验 <span>→</span></a></div></article>').join(''));
    q('#course-progress').style.width=(done.length/lessons.length*100)+'%';
    const last=saved('pnr-last-lesson-v1','');const next=byId[last]&&!done.includes(last)?byId[last]:lessons.map(l=>byId[l[0]]).find(l=>!done.includes(l.id))||byId.basics;
    q('#continue-learning').href='#'+next.id;q('#continue-learning').innerHTML=(last||done.length?'继续学习':'开始第一节')+'<span>→</span>';
    q('#dashboard-status-title').textContent=done.length?'已完成 '+done.length+' / 11 节，下一站：'+next.title:'建议从「从逻辑门到版图」开始';
    q('#dashboard-status-copy').textContent=done.length?'学习记录保存在本浏览器，随时可以返回任何章节。':'先学会辨认对象，再进入布局、时钟树和布线。';
  }
  renderPaths();
  function renderSignoff() {
    const progress=saved('signoff-v1-done',[]),done=Array.isArray(progress)?progress.filter(id=>signoffLessons.some(l=>l.id===id)):[];
    q('#signoff-check-map').innerHTML=window.SignoffCheckMap.render('signoff/index.html');
    q('#signoff-progress').textContent='已完成 '+done.length+' / 10 节签核课程';
    q('#signoff-curriculum').innerHTML=signoffLessons.map((l,i)=>'<a class="signoff-lesson" href="signoff/index.html#'+l.id+'"><span>'+String(i+1).padStart(2,'0')+'</span><div><small>'+esc(l.group)+'</small><h3>'+esc(l.title)+'</h3><p>'+esc(l.desc)+'</p></div><b>'+(done.includes(l.id)?'✓':'→')+'</b></a>').join('');
  }
  renderSignoff();

  function openMenu() { document.body.classList.add('menu-open');q('#sidebar-scrim').hidden=false;q('#menu-toggle').setAttribute('aria-expanded','true');q('#main').inert=true;q('.sidebar a.active, .sidebar-overview').focus(); }
  function closeMenu(focus=false) { document.body.classList.remove('menu-open');q('#sidebar-scrim').hidden=true;q('#menu-toggle').setAttribute('aria-expanded','false');q('#main').inert=false;if(focus)q('#menu-toggle').focus(); }
  q('#menu-toggle').addEventListener('click',()=>document.body.classList.contains('menu-open')?closeMenu(true):openMenu());
  q('#sidebar-scrim').addEventListener('click',()=>closeMenu(true));
  addEventListener('resize',()=>{if(innerWidth>820)closeMenu();});
  q('#reader-width').addEventListener('click',()=>{const active=document.body.classList.toggle('reader-wide');q('#reader-width').setAttribute('aria-pressed',String(active));q('#reader-width').textContent=active?'标准阅读 ↔':'宽屏阅读 ↔';});

  function tableOfContents(id) {
    const section=q('#'+id),meta=byId[id];localHeadings=[];
    if(id==='atlas'){q('#lesson-toc').hidden=true;return;}
    const targets=qa('h3',section).filter(h=>!h.closest('#glossary')&&!h.closest('#quiz')&&!h.closest('.lab'));
    const lab=q('.lab',section);if(lab)targets.push(lab);
    targets.sort((a,b)=>a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1);
    localHeadings=targets.slice(0,9).map((el,i)=>{el.id=el.id||id+'--part-'+i;return {id:el.id,el,label:el===lab?'交互实验':el.textContent.trim()};});
    q('#local-toc').innerHTML='<a href="#'+id+'" data-local-top="true">本节概览</a>'+localHeadings.map(h=>'<a href="#'+id+'/'+h.id+'" data-toc-target="'+h.id+'">'+esc(h.label)+'</a>').join('');
    const companion=meta.scene?'<span>配套图解</span><a href="#atlas/'+meta.scene+'">'+esc(scenes.find(s=>s.id===meta.scene)?.title||'软件截图')+'<small>查看真实软件图鉴 →</small></a>':'';
    const vid=id==='pcb'?videoData[2]:id==='inputs'||id==='ai'?videoData[1]:videoData[0];
    q('#lesson-companion').innerHTML=companion+'<span>视频导学</span><a href="#videos/'+vid.bvid+'">'+esc(vid.title)+'<small>'+duration(vid.duration)+' · '+esc(vid.author)+' ↗</small></a>';
    q('#lesson-toc').hidden=false;
  }
  function pagination(id) {
    const i=byId[id].index,prev=i>0?lessons[i-1]:null,next=i<lessons.length-1?lessons[i+1]:null;
    q('#lesson-pagination').innerHTML=(prev?'<a href="#'+prev[0]+'"><span>← 上一节</span><b>'+prev[1]+'</b></a>':'<a href="#top"><span>← 学习路径</span><b>回到课程总览</b></a>')+(next?'<a href="#'+next[0]+'"><span>下一节 →</span><b>'+next[1]+'</b></a>':'<a href="#experiments"><span>继续实践 →</span><b>进入交互实验室</b></a>');
  }
  function go(hash) { pendingNavigation=true;if(location.hash===hash)route();else location.hash=hash; }
  document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(!link||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;const href=link.getAttribute('href');if(href==='#main'){event.preventDefault();q('#main').focus({preventScroll:true});return;}event.preventDefault();go(href==='#'?'#top':href);});

  function route() {
    if(currentHash)positions.set(currentHash,scrollY);
    let hash=location.hash||'#top',parts;
    try{parts=decodeURIComponent(hash.slice(1)).split('/');}catch{parts=['top'];}
    let id=parts[0]||'top',detail=parts[1]||'';
    if(!byId[id]&&!['top','experiments','videos','signoff'].includes(id)){id='top';detail='';hash='#top';history.replaceState(null,'',hash);}
    if(current==='videos'&&id!=='videos')stopPlayer();
    current=id;currentHash=hash;closeMenu();
    qa('.chapter,.workspace-page').forEach(el=>el.hidden=el.id!==id);
    const lesson=byId[id],view=lesson?(id==='atlas'?'atlas':'lesson'):id==='top'?'home':id;
    document.body.dataset.view=view;
    q('#reading-bar').hidden=!lesson;q('#lesson-pagination').hidden=!lesson;q('#lesson-toc').hidden=true;
    qa('.sidebar nav a').forEach(a=>{const yes=a.getAttribute('href')==='#'+id;a.classList.toggle('active',yes);if(yes){a.setAttribute('aria-current','page');const group=a.closest('details');if(group)group.open=true;}else a.removeAttribute('aria-current');});
    qa('[data-nav]').forEach(a=>{const target=view==='lesson'?(detail==='lab'?'experiments':'home'):view;a.classList.toggle('active',a.dataset.nav===target);if(a.dataset.nav===target)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    if(lesson){save('pnr-last-lesson-v1',id);q('#breadcrumbs').innerHTML='<a href="#top">课程</a><span>/</span><span>'+lesson.group+'</span><span>/</span><b>'+lesson.title+'</b>';tableOfContents(id);pagination(id);}
    if(id==='atlas'){const i=scenes.findIndex(d=>d.id===detail);if(i>=0)showScene(i);}
    if(id==='videos'){if(videoData.some(v=>v.bvid===detail))selectedVideo=detail;selectVideo(selectedVideo);}
    if(id==='top')renderPaths();
    if(id==='signoff')renderSignoff();
    document.title=lesson?lesson.title+' · 布局布线学习室':id==='signoff'?'签核与验收 · 布局布线学习室':id==='videos'?'视频导学 · 布局布线学习室':id==='experiments'?'交互实验 · 布局布线学习室':'布局布线学习室 · 从芯片到电路板';
    let target=null;
    if(lesson&&detail==='lab')target=q('.lab',document.getElementById(id));
    else if(id==='start'&&detail==='glossary')target=q('#glossary-search').closest('.section-subhead');
    else if(lesson&&detail&&localHeadings.some(h=>h.id===detail))target=document.getElementById(detail);
    const position=!pendingNavigation&&positions.has(hash)?positions.get(hash):0;
    pendingNavigation=false;
    requestAnimationFrame(()=>{if(target){target.scrollIntoView({block:'start',behavior:'instant'});target.classList.remove('focus-pulse');void target.offsetWidth;target.classList.add('focus-pulse');}else scrollTo({top:position,behavior:'instant'});reading();});
  }

  function reading() {
    if(!current)return;
    const max=Math.max(0,document.documentElement.scrollHeight-innerHeight),pct=max?Math.max(0,Math.min(100,scrollY/max*100)):0;
    q('#read-percent').textContent=Math.round(pct)+'%';q('#read-progress').style.width=pct+'%';
    if(byId[current]&&current!=='atlas'){
      let active='';localHeadings.forEach(h=>{if(h.el.getBoundingClientRect().top<190)active=h.id;});
      qa('#local-toc a').forEach(a=>a.classList.toggle('active',active?a.dataset.tocTarget===active:a.dataset.localTop==='true'));
    }
  }
  addEventListener('pnr:reading',reading);addEventListener('hashchange',route);addEventListener('resize',reading);
  qa('.complete').forEach(button=>button.addEventListener('click',()=>{renderPaths();}));
  q('#reset-progress').textContent='清除章节与答题记录';
  q('#reset-progress').addEventListener('click',()=>{renderPaths();q('#reset-progress').textContent='章节与答题记录已清除';});
  q('#atlas-tabs').addEventListener('click',event=>{const button=event.target.closest('[data-scene]');if(button&&current==='atlas'){currentHash='#atlas/'+scenes[Number(button.dataset.scene)].id;history.replaceState(null,'',currentHash);}});

  function currentVideo() { return videoData.find(v=>v.bvid===selectedVideo)||videoData[2]; }
  function watchedState() {
    const yes=watched.includes(selectedVideo);q('#mark-watched').textContent=yes?'已观看 · 点击撤销':'标记已观看 ✓';q('#mark-watched').setAttribute('aria-pressed',String(yes));
    q('#video-playlist').innerHTML=videoData.map((v,i)=>'<button class="video-item'+(v.bvid===selectedVideo?' active':'')+'" data-video="'+v.bvid+'" aria-pressed="'+(v.bvid===selectedVideo)+'"><span>0'+(i+1)+'</span><div><b>'+esc(v.title)+'</b><small>'+duration(v.duration)+' · '+esc(v.author)+'</small></div>'+(watched.includes(v.bvid)?'<i class="video-seen">✓</i>':'')+'</button>').join('');
  }
  function guide() {
    const v=currentVideo(),labels={before:'先建立观看的坐标',during:'带着这些问题观察',after:'把观察变成自己的解释'};
    q('#video-guide-content').innerHTML='<h3>'+labels[videoTab]+'</h3><ul>'+v.guide[videoTab].map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul>';
    qa('[data-video-tab]').forEach(b=>{const yes=b.dataset.videoTab===videoTab;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});
  }
  function stopPlayer() {
    const frame=q('iframe',q('#video-player'));if(frame)frame.remove();
  }
  function selectVideo(bvid) {
    selectedVideo=bvid;stopPlayer();const v=currentVideo();
    q('#video-placeholder').hidden=false;q('#video-placeholder').innerHTML='<span class="video-preview-label">BILIBILI / ORIGINAL VIDEO</span><button class="video-play-button" id="load-video" aria-label="载入 '+esc(v.title)+' 的 Bilibili 播放器">▶</button><h3>'+esc(v.title)+'</h3><p>'+esc(v.author)+' · '+duration(v.duration)+' · '+esc(v.kind)+'</p><a href="https://www.bilibili.com/video/'+v.bvid+'/" target="_blank" rel="noopener">也可以直接在原站观看 ↗</a>';
    q('#video-label').textContent=v.kind;q('#video-title').textContent=v.title;q('#video-meta').textContent=v.author+' · '+duration(v.duration)+' · '+v.bvid;
    q('#video-original').href='https://www.bilibili.com/video/'+v.bvid+'/';q('#video-notes').value=typeof notes[v.bvid]==='string'?notes[v.bvid]:'';q('#note-status').textContent='笔记仅保存在本浏览器';
    q('#video-related').innerHTML=v.related.map(r=>'<a href="#'+r[0]+'">'+r[1]+' →</a>').join('')+(v.materials?'<a href="'+esc(v.materials)+'" target="_blank" rel="noopener">作者提供的学习资料 ↗</a>':'');
    watchedState();guide();
    q('#load-video').addEventListener('click',()=>{q('#video-placeholder').hidden=true;const frame=document.createElement('iframe');frame.title=v.title+' · Bilibili 原站播放器';frame.src='https://player.bilibili.com/player.html?bvid='+v.bvid+'&cid='+v.cid+'&page=1&autoplay=0';frame.allow='fullscreen; picture-in-picture; encrypted-media';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';q('#video-player').append(frame);});
  }
  q('#video-playlist').addEventListener('click',e=>{const b=e.target.closest('[data-video]');if(b)go('#videos/'+b.dataset.video);});
  qa('[data-video-tab]').forEach(b=>b.addEventListener('click',()=>{videoTab=b.dataset.videoTab;guide();}));
  q('#video-notes').maxLength=10000;
  q('#video-notes').addEventListener('input',()=>{notes[selectedVideo]=q('#video-notes').value;const ok=save('pnr-video-notes-v1',notes);q('#note-status').textContent=ok?'已保存到本浏览器':'当前浏览器无法保存，请复制笔记留存';});
  q('#mark-watched').addEventListener('click',()=>{watched=watched.includes(selectedVideo)?watched.filter(x=>x!==selectedVideo):watched.concat(selectedVideo);save('pnr-video-watched-v1',watched);watchedState();});
  selectVideo(selectedVideo);

  function pcb() {
    const pitch=Number(q('#pcb-pitch').value),clearance=Number(q('#pcb-clearance').value),diameter=.35,width=.10,available=pitch-diameter,needed=width+2*clearance,pass=available+1e-9>=needed,scale=260,cx=320,cy=165,pr=diameter*scale/2;
    const x1=cx-pitch*scale/2,x2=cx+pitch*scale/2;
    let s='<rect x="25" y="20" width="590" height="285" rx="5" fill="#edf3fc" stroke="#c3d4eb"/>';
    for(let x=40;x<610;x+=24)s+='<path d="M'+x+' 21v282" stroke="#dde7f5" stroke-width=".6"/>';
    for(let y=37;y<302;y+=24)s+='<path d="M26 '+y+'h588" stroke="#dde7f5" stroke-width=".6"/>';
    s+='<rect x="'+(cx-(width/2+clearance)*scale)+'" y="80" width="'+((width+2*clearance)*scale)+'" height="170" fill="'+(pass?'#c1dcee':'#eed2dc')+'" opacity=".7"/>';
    s+='<rect x="'+(cx-width*scale/2)+'" y="80" width="'+(width*scale)+'" height="170" fill="'+(pass?'#4284c9':'#c86d84')+'"/>';
    [x1,x2].forEach(x=>s+='<circle cx="'+x+'" cy="'+cy+'" r="'+pr+'" fill="#adc7e9" stroke="#6a96cd" stroke-width="2"/>');
    s+='<path d="M'+x1+' 62H'+x2+'M'+x1+' 56v13M'+x2+' 56v13" fill="none" stroke="#7698c0"/>';
    s+='<text x="320" y="49" text-anchor="middle" font-size="12" fill="#6c8bb1">中心间距 P = '+pitch.toFixed(2)+' mm</text>';
    s+='<text x="'+x1+'" y="170" text-anchor="middle" font-size="12" fill="#3f6492">焊盘</text><text x="'+x2+'" y="170" text-anchor="middle" font-size="12" fill="#3f6492">焊盘</text>';
    s+='<text x="320" y="280" text-anchor="middle" font-size="11" fill="#6c8bb1">中间实色带 = 走线；两侧淡色带 = 要求间距</text>';
    s+='<text x="320" y="330" text-anchor="middle" font-size="11" fill="#829bb9">教学尺寸，无过孔与工艺公差</text>';
    q('#pcb-svg').innerHTML=s;q('#pcb-pitch-value').textContent=pitch.toFixed(2)+' mm';q('#pcb-clearance-value').textContent=clearance.toFixed(2)+' mm';q('#pcb-result').className='pcb-result '+(pass?'pass':'fail');
    q('#pcb-result').innerHTML='净空 '+available.toFixed(2)+' mm / 需要 '+needed.toFixed(2)+' mm<b>'+(pass?'局部条件满足':'局部间距不足')+'</b>'+(pass?'只表示这条直线通道的几何条件成立。':'可用宽度放不下走线及两侧要求间距。');
  }
  q('#pcb-pitch').addEventListener('input',pcb);q('#pcb-clearance').addEventListener('input',pcb);pcb();

  const searchDialog=q('#search-dialog'),searchInput=q('#course-search');
  const searchItems=lessons.map(l=>({kind:'讲义',title:l[1],desc:l[3],hash:'#'+l[0]})).concat(
    terms.map(t=>({kind:'术语',title:t[0]+' / '+t[1],desc:t[2],hash:'#start/glossary',term:t[0]})),
    scenes.map(s=>({kind:'截图',title:s.title,desc:s.kind,hash:'#atlas/'+s.id})),
    videoData.map(v=>({kind:'视频',title:v.title,desc:v.author+' · '+v.kind,hash:'#videos/'+v.bvid})),
    signoffLessons.map(l=>({kind:'签核进阶',title:l.title,desc:l.desc,url:'signoff/index.html#'+l.id})),
    [{kind:'签核进阶',title:'ERC 电气连接与规则',desc:'电源地、器件连接、浮空、电压域及电气过应力',url:'signoff/index.html#power/erc'},{kind:'签核进阶',title:'ESD 静电保护路径',desc:'保护结构、路径电阻、金属与过孔的瞬态电流承载',url:'signoff/index.html#power/esd'},{kind:'签核进阶',title:'签核检查地图',desc:'DRC LVS LEC STA SI 密度填充 IR drop EM 功耗 ERC ESD',url:'signoff/index.html#standards/check-map'}, {kind:'真实案例',title:'签核：短路、负裕量与电源报告',desc:'DRC、STA、IR 真实工程截图与编号解读',url:'signoff/index.html#cases'}]
  );
  let searchMatches=[];
  function search(){const text=searchInput.value.trim().toLowerCase();searchMatches=(text?searchItems.filter(i=>(i.title+' '+i.desc).toLowerCase().includes(text)):searchItems.slice(0,7)).slice(0,18);q('#search-results').innerHTML=searchMatches.length?searchMatches.map((i,n)=>'<button class="search-result" data-result="'+n+'"><span>'+i.kind+'</span><div><b>'+esc(i.title)+'</b><small>'+esc(i.desc)+'</small></div></button>').join(''):'<div class="search-empty">没有找到匹配项。可以试试“时序”“BGA”或“通孔”。</div>';}
  function openSearch(){search();if(!searchDialog.open)searchDialog.showModal();searchInput.focus();searchInput.select();}
  q('#open-search').addEventListener('click',openSearch);q('#close-search').addEventListener('click',()=>searchDialog.close());searchInput.addEventListener('input',search);
  q('#search-results').addEventListener('click',e=>{const b=e.target.closest('[data-result]');if(!b)return;const item=searchMatches[Number(b.dataset.result)];searchDialog.close();if(item.url){location.href=item.url;return;}if(item.term){q('#glossary-search').value=item.term;q('#glossary-search').dispatchEvent(new Event('input',{bubbles:true}));}go(item.hash);});
  searchInput.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();q('.search-result')?.focus();}else if(e.key==='Enter'&&searchMatches.length){e.preventDefault();q('.search-result').click();}});
  q('#search-results').addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp'].includes(e.key))return;const results=qa('.search-result'),i=results.indexOf(document.activeElement);e.preventDefault();if(e.key==='ArrowUp'&&i<=0)searchInput.focus();else results[Math.max(0,Math.min(results.length-1,i+(e.key==='ArrowDown'?1:-1)))]?.focus();});
  addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}if(e.key==='Escape'){if(searchDialog.open){e.preventDefault();searchDialog.close();}if(document.body.classList.contains('menu-open'))closeMenu(true);}});
  searchDialog.addEventListener('click',e=>{if(e.target===searchDialog){const r=searchDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)searchDialog.close();}});
  q('#main').tabIndex=-1;
  document.body.classList.add('workspace-mode');
  route();
})();
