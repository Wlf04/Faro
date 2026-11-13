'use strict';
// Preparación Security+, exámenes base y PBQ.


IC.shield='<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>';
// Navigation defined in VIEWS for the simpler exam-only interface.

function securitySeed(){
 if(db.securitySeeded701) return;
 for(const d of SEC_DOMAINS){
  const sid='sec701-d'+d.id;
  if(!subject(sid))db.subjects.push({id:sid,name:`Dominio ${d.id} · ${d.name} (${d.weight}%)`,color:d.color,examDate:'',createdAt:today(),sec:true});
 }
 for(const o of SEC_OBJECTIVES){
  const tid='sec701-'+o.code;
  if(!topic(tid))db.topics.push({id:tid,subjectId:'sec701-d'+o.d,name:o.code+' · '+o.name,priority:Number(o.d)===4?3:Number(o.d)===2||Number(o.d)===5?3:2,status:'new',notes:o.notes,createdAt:today(),sec:true});
  for(const line of o.notes.split('\n')){
   const pos=line.indexOf(':'); if(pos<0)continue;
   const front='¿Qué es '+line.slice(0,pos).trim()+'?'; const back=line.slice(pos+1).trim();
   if(!db.cards.some(c=>c.topicId===tid&&c.front===front))db.cards.push({id:id(),topicId:tid,front,back,box:0,due:today(),reps:0,createdAt:today(),sec:true});
  }
 }
 db.securitySeeded701=true; db.securityAttempts=db.securityAttempts||[];
 save();
}

let secTab='map',secDomain='all',secTest=null,secClock=null,secPBQState={};
const originalHome=views.home;
views.home=function(){return `<div class="security-home" role="region" aria-label="Preparación Security+"><div><div class="sec-kicker">CERTIFICACIÓN · SY0-701</div><h2>Tu ruta para CompTIA Security+ <span style="opacity:.75">🛡️</span></h2><p>5 dominios, 28 objetivos, repasos y preguntas por escenarios. Tu progreso se guarda en este navegador.</p></div><button class="button light" data-nav="security">Ir a mi preparación ${icon('arrow')}</button></div>`+originalHome()};
views.security=renderSecurity;

function securityDomainStats(){
 return SEC_DOMAINS.map(d=>{
 const ts=topicsFor('sec701-d'+d.id),done=ts.filter(t=>t.status==='done').length;
 const attempts=(db.securityAttempts||[]).flatMap(a=>a.answers||[]).filter(a=>a.d===d.id);
 return {...d,done,count:ts.length,answered:attempts.length,correct:attempts.filter(a=>a.correct).length};
 });
}
function securityLastWrongIds(){
 const last=new Map();
 (db.securityAttempts||[]).forEach(a=>(a.answers||[]).forEach(ans=>last.set(ans.id,ans.correct)));
 return [...last.entries()].filter(([,v])=>!v).map(([k])=>k);
}
function renderSecurity(){
 const ds=securityDomainStats(),review=securityLastWrongIds().length;
 return `<div class="section-row"><div><div class="sec-kicker">FARO ESTUDIO · IT SECURITY</div><h1>CompTIA Security+ <span class="sec-pill">SY0-701</span></h1><p>Temario y práctica en español, orientados al examen Security+ V7.</p></div><div class="section-actions"><button class="button" data-action="sec-start" data-value="training">${icon('play')} Practicar ahora</button></div></div>
 <div class="sec-notice"><b>Versión del examen:</b> Este espacio cubre <b>SY0-701</b>. Se prevé que <b>SY0-801</b> se publique alrededor del <b>17 nov 2026</b>; sus objetivos y ponderaciones son diferentes. <a href="https://www.comptia.org/en-us/certifications/security/" target="_blank" rel="noopener noreferrer">Consulta CompTIA ↗</a>. Material de práctica independiente, no afiliado a CompTIA.</div>
 <div class="sec-topstats"><div><span>DOMINIOS</span><strong>5</strong><small>según objetivos oficiales</small></div><div><span>OBJETIVOS</span><strong>28</strong><small>con apuntes y tarjetas</small></div><div><span>PREGUNTAS ORIGINALES</span><strong>${SEC_QUESTIONS.length}</strong><small>con explicaciones</small></div><div><span>PARA REFORZAR</span><strong>${review}</strong><small>preguntas falladas</small></div></div>
 <div class="sec-nav" role="tablist" aria-label="Secciones de Security+"><button class="${secTab==='map'?'active':''}" role="tab" aria-selected="${secTab==='map'}" data-action="sec-tab" data-value="map">Mapa de dominios</button><button class="${secTab==='practice'?'active':''}" role="tab" aria-selected="${secTab==='practice'}" data-action="sec-tab" data-value="practice">Simulacros</button><button class="${secTab==='pbq'?'active':''}" role="tab" aria-selected="${secTab==='pbq'}" data-action="sec-tab" data-value="pbq">Laboratorio PBQ</button></div>
 ${secTab==='map'?renderSecurityMap(ds):secTab==='practice'?renderSecurityPractice():renderSecurityPBQ()}`;
}
function renderSecurityMap(ds){
 const done=ds.reduce((sum,d)=>sum+d.done,0), pctDone=Math.round(done/28*100);
 return `<div class="sec-lead"><div><h2>Tu mapa de estudio</h2><p class="muted">Marca cada objetivo como «Completado» al dominarlo. El porcentaje de la derecha es el peso del dominio en el examen, no tu nota.</p></div><div class="sec-overall"><b>${pctDone}%</b><span>${done}/28 objetivos</span></div></div>
 <div class="sec-domains">${ds.map(d=>`<section class="sec-domain"><div class="sec-domain-top"><div class="sec-domain-number" style="background:${d.color}20;color:${d.color}">${d.id}</div><div style="flex:1;min-width:0"><div class="sec-domain-title">${esc(d.name)}</div><div class="sec-domain-meta">${d.done}/${d.count} objetivos completados · ${d.answered?Math.round(d.correct/d.answered*100)+'% acierto en prácticas':'sin prácticas registradas'}</div></div><strong class="sec-weight">${d.weight}% <small>del examen</small></strong></div><div class="progress-bar"><span style="width:${d.count?100*d.done/d.count:0}%;background:${d.color}"></span></div><div class="sec-objectives">${SEC_OBJECTIVES.filter(o=>o.d===d.id).map(o=>{let t=topic('sec701-'+o.code);return `<button data-action="sec-topic" data-value="${o.code}" class="sec-objective"><span class="sec-code">${o.code}</span><span>${esc(o.name)}</span><span class="sec-check ${t?.status==='done'?'done':''}">${t?.status==='done'?'✓':'›'}</span></button>`}).join('')}</div><button class="button tiny soft" data-action="sec-study" data-value="${d.id}">Estudiar dominio ${d.id} ${icon('arrow')}</button></section>`).join('')}</div>
 <div class="sec-bottom-note">ℹ️ <b>Consejo:</b> prioriza los dominios 4 (28%) y 2 (22%) sin dejar de practicar los demás. Los porcentajes son ponderaciones oficiales, no un número fijo de preguntas.</div>`;
}
function renderSecurityPractice(){
 if(secTest)return renderSecurityTest();
 const weak=securityLastWrongIds().length; const recent=(db.securityAttempts||[]).slice(-5).reverse();
 return `<div class="sec-practice-grid"><section class="panel"><h2>Entrena con casos prácticos</h2><p class="muted" style="line-height:1.7">Preguntas originales orientadas a decisiones, diagnóstico y aplicación de conceptos. Puedes elegir un dominio o practicar la mezcla del examen.</p><div class="field" style="margin:18px 0"><label for="sec-domain-filter">Temática</label><select id="sec-domain-filter" class="input"><option value="all" ${secDomain==='all'?'selected':''}>Todos los dominios (ponderados)</option>${SEC_DOMAINS.map(d=>`<option value="${d.id}" ${secDomain===d.id?'selected':''}>${d.id}. ${esc(d.name)} (${d.weight}%)</option>`).join('')}</select></div><div class="sec-mode-grid"><button class="sec-mode" data-action="sec-start" data-value="training"><span>⚡</span><strong>Entrenamiento</strong><small>10 preguntas · retroalimentación inmediata · sin cronómetro</small></button><button class="sec-mode" data-action="sec-start" data-value="exam"><span>📝</span><strong>Mini simulacro</strong><small>20 preguntas · sin reloj · revisión al finalizar</small></button></div><button class="button ghost" style="margin-top:15px" data-action="sec-start" data-value="errors" ${!weak?'disabled':''}>${icon('refresh')} Repasar ${weak} ${weak===1?'error':'errores'} pendientes</button><div class="note" style="margin-top:17px">No es una réplica oficial. El examen SY0-701 puede incluir hasta 90 preguntas de selección y basadas en desempeño (PBQ) en 90 minutos. Este mini simulacro no predice tu nota CompTIA.</div></section><section class="panel"><h3>Resultados de prácticas</h3>${recent.length?recent.map(a=>`<div class="list-row"><span class="icon-dot" style="background:#f4f1ff">${a.score>=70?'🏅':'📘'}</span><div class="info"><div class="title">${a.mode==='exam'?'Mini simulacro':a.mode==='errors'?'Repaso de errores':'Entrenamiento'}</div><div class="sub">${esc(a.date)} · ${a.correct}/${a.total} correctas</div></div><b style="font-size:17px">${a.score}%</b></div>`).join(''):empty('📊','Todavía no hay resultados','Resuelve una tanda de preguntas y aparecerán aquí.')}${weak?`<div class="sec-signal">Tienes ${weak} ${weak===1?'pregunta que necesita':'preguntas que necesitan'} refuerzo.</div>`:''}<button class="button tiny soft" data-nav="progress" style="margin-top:13px">Ver mi progreso ${icon('arrow')}</button></section></div>`;
}
function securityPick(mode){
 const wrong=securityLastWrongIds(); let all=secDomain==='all'?SEC_QUESTIONS:SEC_QUESTIONS.filter(q=>q.d===secDomain);
 if(mode==='errors')all=all.filter(q=>wrong.includes(q.id));
 const wanted=mode==='exam'?20:mode==='errors'?10:10;
 if(secDomain==='all'&&mode!=='errors'){
  const total=Math.min(wanted,all.length), counts=total===20?[2,4,4,6,4]:[1,2,2,3,2];
  let picked=[];
  SEC_DOMAINS.forEach((d,i)=>{picked.push(...shuffle(all.filter(q=>q.d===d.id)).slice(0,counts[i]))});
  const ids=new Set(picked.map(q=>q.id)); if(picked.length<total)picked.push(...shuffle(all.filter(q=>!ids.has(q.id))).slice(0,total-picked.length));
  return shuffle(picked);
 }
 return shuffle(all).slice(0,wanted);
}
function securityStart(mode){
 const questions=securityPick(mode).map(q=>{const order=shuffle([0,1,2,3]);return {...q,a:order.map(i=>q.a[i]),c:order.indexOf(q.c)}}); if(!questions.length){toast('No hay preguntas para ese filtro. Prueba otra temática.');return}
 secTest={mode,questions,idx:0,answers:{},revealed:{},started:Date.now(),duration:0,complete:false};
 secTab='practice';
 securityStartClock();render();
}
function securityStartClock(){
 clearInterval(secClock); secClock=null;
 if(!secTest||!secTest.duration||secTest.complete)return;
 secClock=setInterval(()=>{
  if(!secTest||secTest.complete){clearInterval(secClock);secClock=null;return;}
  const left=Math.max(0,secTest.duration-Math.floor((Date.now()-secTest.started)/1000));
  const el=document.getElementById('sec-timer'); if(el)el.textContent=formatSecTime(left);
  if(left===0)securityFinish(true);
 },500);
}
function formatSecTime(sec){return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`}
function renderSecurityTest(){
 const t=secTest; if(t.complete)return renderSecurityResults();
 const q=t.questions[t.idx], chosen=t.answers[q.id], answered=Number.isInteger(chosen),seen=!!t.revealed[q.id];
 const remaining=t.duration?Math.max(0,t.duration-Math.floor((Date.now()-t.started)/1000)):null;
 return `<div class="sec-quiz"><div class="sec-test-head"><div><span class="sec-kicker">${t.mode==='exam'?'MINI SIMULACRO':t.mode==='errors'?'REPASO DE ERRORES':'ENTRENAMIENTO'}</span><div class="muted small">Pregunta ${t.idx+1} de ${t.questions.length} · objetivo ${q.o}</div></div><div class="sec-test-actions">${remaining!==null?`<span class="sec-timer">⏱ <span id="sec-timer">${formatSecTime(remaining)}</span></span>`:''}<button class="button tiny ghost" data-action="sec-exit">Salir</button></div></div><div class="progress-bar" style="margin:16px 0 22px"><span style="width:${t.idx/t.questions.length*100}%"></span></div><section class="panel"><div class="sec-subject">DOMINIO ${q.d} · ${esc(SEC_DOMAINS.find(d=>d.id===q.d).name)}</div><h2 class="sec-question">${esc(q.q)}</h2><div class="sec-answers">${q.a.map((a,i)=>`<button class="sec-answer ${chosen===i?'picked':''} ${seen?(i===q.c?'correct':chosen===i?'wrong':''):''}" data-action="sec-answer" data-value="${i}" ${seen?'disabled':''}><b>${'ABCD'[i]}</b><span>${esc(a)}</span></button>`).join('')}</div>${seen?`<div class="sec-explanation"><strong>${chosen===q.c?'✓ Correcto':'✕ Respuesta a reforzar'}</strong><p>${esc(q.why)}</p><div class="small muted">Respuesta: ${'ABCD'[q.c]} · ${esc(q.a[q.c])}</div></div>`:''}<div class="sec-question-footer"><span class="small muted">${t.mode==='exam'?'En el simulacro, las soluciones se muestran al final.':'Selecciona una respuesta para ver la explicación.'}</span><button class="button" data-action="sec-next" ${t.mode!=='exam'&&!seen?'disabled':t.mode==='exam'&&!answered?'disabled':''}>${t.idx===t.questions.length-1?'Finalizar':'Siguiente'} ${icon('arrow')}</button></div></section></div>`;
}
function securityFinish(timedOut=false){
 if(!secTest||secTest.complete)return;
 clearInterval(secClock);secClock=null;
 const t=secTest; t.complete=true;t.timedOut=timedOut;
 const answers=t.questions.map(q=>({id:q.id,o:q.o,d:q.d,chosen:Number.isInteger(t.answers[q.id])?t.answers[q.id]:null,correct:t.answers[q.id]===q.c}));
 const correct=answers.filter(a=>a.correct).length,score=Math.round(correct/answers.length*100);
 db.securityAttempts=db.securityAttempts||[];
 db.securityAttempts.push({date:today(),mode:t.mode,total:answers.length,correct,score,answers});
 if(db.securityAttempts.length>100)db.securityAttempts=db.securityAttempts.slice(-100);
 save();render();
}
function renderSecurityResults(){
 const t=secTest, answers=t.questions.map(q=>({q,selected:t.answers[q.id],correct:t.answers[q.id]===q.c}));
 const correct=answers.filter(a=>a.correct).length,score=Math.round(correct/answers.length*100);
 return `<section class="panel sec-results"><div class="sec-results-head"><div class="sec-kicker">${t.timedOut?'TIEMPO AGOTADO':'PRÁCTICA COMPLETADA'}</div><h2>Resultado del ${t.mode==='exam'?'mini simulacro':'entrenamiento'}</h2><div class="sec-resultnum">${score}%</div><p>${correct} respuestas correctas de ${answers.length}. Esta puntuación no equivale a la escala de 100–900 de CompTIA.</p><div class="sec-results-actions"><button class="button" data-action="sec-back">Volver a mis prácticas</button><button class="button ghost" data-action="sec-repeat">Practicar de nuevo ${icon('refresh')}</button></div></div><h3 style="margin-top:22px">Corrección y explicaciones</h3><div class="sec-review-list">${answers.map((a,i)=>`<details class="sec-review" ${!a.correct?'open':''}><summary><span class="sec-resultmark ${a.correct?'yes':'no'}">${a.correct?'✓':'✕'}</span><span>${i+1}. ${esc(a.q.q)}</span></summary><div class="sec-review-body"><p><b>Tu respuesta:</b> ${a.selected===undefined?'Sin responder':esc(a.q.a[a.selected])}</p><p><b>Respuesta correcta:</b> ${esc(a.q.a[a.q.c])}</p><p>${esc(a.q.why)}</p><button class="button tiny soft" data-action="sec-topic" data-value="${a.q.o}">Repasar objetivo ${a.q.o} ${icon('arrow')}</button></div></details>`).join('')}</div></section>`;
}
function securityPlan(){
 const tasks=SEC_OBJECTIVES.map((o,i)=>({id:id(),title:`Security+ ${o.code}: ${o.name}`,topicId:'sec701-'+o.code,due:shiftDay(today(),i),done:false,secPlan:true}));
 const count=db.tasks.filter(t=>t.secPlan&&!t.done).length;
 if(count&&!confirm(`Ya tienes ${count} tareas del plan Security+ sin completar. ¿Añadir otro plan de 4 semanas?`))return;
 db.tasks.push(...tasks);
 [7,14,21,27].forEach((day,i)=>db.tasks.push({id:id(),title:`Security+ · Práctica de repaso, semana ${i+1}`,topicId:'sec701-4.4',due:shiftDay(today(),day),done:false,secPlan:true}));
 save();goto('plan');toast('Plan de cuatro semanas añadido a tus tareas.');
}
function renderSecurityPBQ(){
 const s=secPBQState;
 return `<div class="sec-pbq-intro"><h2>Laboratorio: ejercicios tipo PBQ</h2><p>Práctica guiada de diagnóstico y toma de decisiones. Los PBQ reales pueden utilizar otras interfaces y tareas; estos son ejercicios originales, no oficiales.</p></div><div class="sec-pbq-grid"><section class="panel"><div class="sec-kicker">CASO 1 · ANÁLISIS DE REGISTROS</div><h3>Intentos de acceso a SSH</h3><p class="muted">Un servidor presenta estos registros:</p><pre class="sec-log">08:21:01 Failed login for admin from 198.51.100.42\n08:21:03 Failed login for admin from 198.51.100.42\n08:21:05 Failed login for admin from 198.51.100.42\n08:21:08 Accepted login for admin from 198.51.100.42</pre><div class="field"><label for="sec-pbq-attack">¿Qué patrón observas?</label><select id="sec-pbq-attack" class="input"><option value="">Elegir respuesta</option><option value="password">Posible ataque de fuerza bruta a una cuenta</option><option value="ddos">Denegación de servicio distribuida</option><option value="token">Tokenización de credenciales</option></select></div><div class="field"><label for="sec-pbq-response">¿Qué acción inicial es más apropiada?</label><select id="sec-pbq-response" class="input"><option value="">Elegir respuesta</option><option value="ignore">Ignorar: se consiguió iniciar sesión</option><option value="investigate">Investigar y contener acceso no autorizado</option><option value="disablelogs">Desactivar el registro para evitar ruido</option></select></div><button class="button" data-action="sec-pbq-check" data-value="one">Comprobar caso 1</button>${s.one?`<div class="sec-explanation"><b>${s.one.score}/2 correctas</b><p>${s.one.score===2?'Bien resuelto.':'Revisa las señales y la prioridad de respuesta.'} Múltiples fallos seguidos de éxito exigen investigación, no prueban por sí solos la identidad del atacante.</p></div>`:''}</section><section class="panel"><div class="sec-kicker">CASO 2 · SEGMENTACIÓN Y FIREWALL</div><h3>Publicar web en una DMZ</h3><p class="muted">Tu servidor público usa HTTPS y no debe permitir administración SSH desde Internet. Se necesita una regla entrante segura.</p><div class="field"><label for="sec-pbq-port">¿Qué puerto entrante permites al servidor público?</label><select id="sec-pbq-port" class="input"><option value="">Elegir respuesta</option><option value="22">TCP 22</option><option value="443">TCP 443</option><option value="3389">TCP 3389</option></select></div><div class="field"><label for="sec-pbq-rest">¿Qué tratamiento aplicas al resto del tráfico entrante no autorizado?</label><select id="sec-pbq-rest" class="input"><option value="">Elegir respuesta</option><option value="allow">Permitir cualquier origen/puerto</option><option value="deny">Denegar por defecto</option><option value="mirror">Duplicar todo hacia Internet</option></select></div><button class="button" data-action="sec-pbq-check" data-value="two">Comprobar caso 2</button>${s.two?`<div class="sec-explanation"><b>${s.two.score}/2 correctas</b><p>Permitir únicamente TCP 443 para HTTPS y denegar lo demás aplica el principio de mínimo privilegio a las reglas de red.</p></div>`:''}</section></div>`;
}
function securityPBQCheck(caseId){
 let answers=caseId==='one'?['sec-pbq-attack','sec-pbq-response']:['sec-pbq-port','sec-pbq-rest'];
 let vals=answers.map(k=>document.getElementById(k)?.value||'');
 if(vals.some(v=>!v)){toast('Responde las dos preguntas del caso.');return}
 let expected=caseId==='one'?['password','investigate']:['443','deny'];
 secPBQState[caseId]={score:vals.filter((v,i)=>v===expected[i]).length};
 render();
}
const oldAction=handleAction;
handleAction=function(el){
 const action=el.dataset.action,v=el.dataset.value;
 if(action?.startsWith('sec-')){
  switch(action){
   case 'sec-tab': if(secTest&&!secTest.complete&&v!=='practice'&&!confirm('¿Salir del simulacro actual? El intento no quedará registrado.'))return; if(v!=='practice'&&secTest&&!secTest.complete){clearInterval(secClock);secTest=null;}secTab=v;render();break;
   case 'sec-study':activeSubject='sec701-d'+v;goto('subjects');break;
   case 'sec-topic':activeTopic='sec701-'+v;activeSubject='sec701-d'+v.split('.')[0];clearInterval(secClock);secTest=null;goto('material');break;
   case 'sec-plan':securityPlan();break;
   case 'sec-start':securityStart(v);break;
   case 'sec-answer':{
    if(!secTest||secTest.complete)return;const q=secTest.questions[secTest.idx];if(secTest.revealed[q.id])return;
    secTest.answers[q.id]=Number(v);if(secTest.mode!=='exam')secTest.revealed[q.id]=true;render();break;
   }
   case 'sec-next': if(!secTest||secTest.complete)return; if(secTest.idx===secTest.questions.length-1)securityFinish();else{secTest.idx++;render();}break;
   case 'sec-exit': if(confirm('¿Abandonar esta práctica sin guardar resultados?')){clearInterval(secClock);secTest=null;render();}break;
   case 'sec-back':clearInterval(secClock);secTest=null;render();break;
   case 'sec-repeat':{const mode=secTest?.mode||'training';securityStart(mode);break;}
   case 'sec-pbq-check':securityPBQCheck(v);break;
  }return;
 }
 return oldAction(el);
};
document.addEventListener('change',e=>{if(e.target.id==='sec-domain-filter')secDomain=e.target.value});
