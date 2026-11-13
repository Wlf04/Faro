'use strict';
// 500 preguntas, preguntas adaptativas, simulacros y estadísticas.
// ================================================
// Question bank — 500 items, balanced exams,
// low-repeat adaptive selection, bilingual controls
// ================================================
const FARO_WEIGHTS={'1':12,'2':22,'3':18,'4':28,'5':20};
const FARO_TARGETS={'1':60,'2':110,'3':90,'4':140,'5':100};
const FARO_DCOUNT=Object.fromEntries(SEC_DOMAINS.map(d=>[d.id,SEC_QUESTIONS.filter(q=>q.d===d.id).length]));

function faroExposure(){if(!db.securityQuestionSeen701||typeof db.securityQuestionSeen701!=='object')db.securityQuestionSeen701={};return db.securityQuestionSeen701;}
function faroRecentlySeen(){return Object.keys(faroExposure()).filter(id=>faroExposure()[id]?.n>0).length}
function faroLeastSeen(pool,n){
 const record=faroExposure();
 return shuffle(pool).sort((a,b)=>(record[a.id]?.n||0)-(record[b.id]?.n||0)||
    (record[a.id]?.last||0)-(record[b.id]?.last||0)).slice(0,n);
}
function faroWeightedQuota(n){
 const weights=SEC_DOMAINS.map(d=>({d:d.id,raw:n*FARO_WEIGHTS[d.id]/100}));
 let counts=Object.fromEntries(weights.map(x=>[x.d,Math.floor(x.raw)]));
 let left=n-Object.values(counts).reduce((a,b)=>a+b,0);
 for(const x of [...weights].sort((a,b)=>(b.raw%1)-(a.raw%1)))if(left-->0)counts[x.d]++;
 return counts;
}
// Return a unique set. Across sessions prefer unseen, then least-reviewed items.
securityPick=function(mode,wanted=10){
 let pool=secDomain==='all'?SEC_QUESTIONS:SEC_QUESTIONS.filter(q=>q.d===secDomain);
 if(mode==='errors'){
   const wrong=new Set(securityLastWrongIds());pool=pool.filter(q=>wrong.has(q.id));
 }
 const target=Math.min(wanted,pool.length);
 if(!target)return [];
 if(secDomain!=='all'||mode==='errors')return shuffle(faroLeastSeen(pool,target));
 const quota=faroWeightedQuota(target),selected=[];
 for(const d of SEC_DOMAINS){selected.push(...faroLeastSeen(pool.filter(q=>q.d===d.id),quota[d.id]||0));}
 if(selected.length<target){
  const taken=new Set(selected.map(q=>q.id));
  selected.push(...faroLeastSeen(pool.filter(q=>!taken.has(q.id)),target-selected.length));
 }
 return shuffle(selected);
};
securityStart=function(value){
 const [mode,rawCount]=String(value||'training').split('-');
 const count=Number(rawCount)||(mode==='exam'?20:10);
 const picked=securityPick(mode,count);
 if(!picked.length){toast(pathT('No hay preguntas disponibles para este filtro.','No questions are available for this filter.'));return;}
 const questions=picked.map(q=>{const order=shuffle([0,1,2,3]);return {...q,a:order.map(i=>q.a[i]),c:order.indexOf(q.c)}});
 const exposure=faroExposure(),stamp=Date.now();
 for(const q of picked){const before=exposure[q.id]||{n:0,last:0};exposure[q.id]={n:(before.n||0)+1,last:stamp};}
 save();
 secTest={mode,questions,idx:0,answers:{},revealed:{},started:Date.now(),duration:0,complete:false};
 secTab='practice';securityStartClock();render();
};
renderSecurityPractice=function(){
 if(secTest)return renderSecurityTest();
 const weak=securityLastWrongIds().length;
 const recent=(db.securityAttempts||[]).slice(-4).reverse();
 const seen=faroRecentlySeen();
 const scopeCount=secDomain==='all'?SEC_QUESTIONS.length:SEC_QUESTIONS.filter(q=>q.d===secDomain).length;
 return `<div class="faro-questions-page">
 <div class="faro-bank-intro"><div><span class="faro-bank-eyebrow">${pathT('BANCO DE PREGUNTAS · SECURITY+ SY0-701','QUESTION BANK · SECURITY+ SY0-701')}</span><h2>${pathT('Practica a tu ritmo','Practice at your own pace')}</h2><p>${pathT('500 preguntas originales bilingües para aprender, comparar conceptos y resolver casos. Elige un dominio o una mezcla proporcional al examen.','500 original bilingual questions to review concepts, compare controls, and solve scenarios. Choose a domain or an exam-weighted mix.')}</p></div><div class="faro-bank-count"><b>500</b><span>${pathT('preguntas disponibles','questions available')}</span></div></div>
 <div class="faro-question-numbers"><div><strong>${seen}<span>/500</span></strong><small>${pathT('Preguntas vistas al menos una vez','Questions seen at least once')}</small></div><div><strong>${weak}</strong><small>${pathT('Preguntas por reforzar','Questions to review')}</small></div><div><strong>${(db.securityAttempts||[]).length}</strong><small>${pathT('Prácticas terminadas','Completed practice sets')}</small></div></div>
 <div class="faro-quiz-columns"><section class="panel faro-question-control"><h3>${pathT('1. Selecciona qué practicar','1. Choose what to practice')}</h3><div class="field"><label for="sec-domain-filter">${pathT('Dominio','Domain')}</label><select id="sec-domain-filter" class="input"><option value="all" ${secDomain==='all'?'selected':''}>${pathT('Todos los dominios · distribución ponderada','All domains · exam-weighted mix')}</option>${SEC_DOMAINS.map(d=>`<option value="${d.id}" ${secDomain===d.id?'selected':''}>${d.id}. ${esc(pathT(d.name,I18N_DATA.domains[d.id]))} · ${FARO_DCOUNT[d.id]} ${pathT('preguntas','questions')}</option>`).join('')}</select><div class="faro-available">${pathT('Disponibles en este filtro','Available in this selection')}: <b>${scopeCount}</b></div></div>
 <h3 style="margin-top:23px">${pathT('2. Elige tu práctica','2. Choose a practice set')}</h3><div class="faro-choice-grid">
 <button class="faro-choice" data-action="sec-start" data-value="training-10"><span class="faro-choice-icon">⚡</span><b>${pathT('Repaso rápido','Quick practice')}</b><strong>10 ${pathT('preguntas','questions')}</strong><small>${pathT('Solución inmediata · sin reloj','Instant feedback · untimed')}</small></button>
 <button class="faro-choice" data-action="sec-start" data-value="exam-20"><span class="faro-choice-icon">📝</span><b>${pathT('Simulacro corto','Short mock exam')}</b><strong>20 ${pathT('preguntas','questions')}</strong><small>${pathT('Explicaciones al finalizar','Explanations at the end')}</small></button>
 <button class="faro-choice" data-action="sec-start" data-value="exam-40"><span class="faro-choice-icon">📚</span><b>${pathT('Simulacro intermedio','Medium mock exam')}</b><strong>40 ${pathT('preguntas','questions')}</strong><small>${pathT('Sin límite de tiempo','No time limit')}</small></button>
 <button class="faro-choice faro-choice-featured" data-action="sec-start" data-value="exam-90"><span class="faro-choice-icon">🎯</span><b>${pathT('Simulacro completo','Full-length mock exam')}</b><strong>90 ${pathT('preguntas','questions')}</strong><small>${pathT('O hasta agotar las del dominio','Or as many as the domain contains')}</small></button>
 </div><button class="button ghost faro-error-cta" data-action="sec-start" data-value="errors-10" ${!weak?'disabled':''}>${icon('refresh')} ${pathT('Repasar mis errores','Review my mistakes')} (${weak})</button>
 <div class="faro-disclaimer">${pathT('No son preguntas filtradas ni oficiales de CompTIA. Incluyen comprobación de conceptos, comparaciones y escenarios originales. Los simulacros no contienen PBQ: practícalos en su sección específica.','These are not leaked or official CompTIA questions. They include concept checks, comparisons, and original scenarios. Mock exams here do not include PBQs; use the separate PBQ section.')}</div>
 </section><section class="panel faro-dom-breakdown"><h3>${pathT('Preguntas por dominio','Questions by domain')}</h3><p class="muted small">${pathT('Distribución alineada con los pesos de SY0-701.','Distribution aligned with SY0-701 domain weights.')}</p>${SEC_DOMAINS.map(d=>`<button class="faro-domain-breakdown" data-action="faro-focus-domain" data-value="${d.id}"><span class="faro-domain-header"><span><b>${d.id}.</b> ${esc(pathT(d.name,I18N_DATA.domains[d.id]))}</span><strong>${FARO_DCOUNT[d.id]}</strong></span><span class="faro-domain-track"><span style="width:${FARO_DCOUNT[d.id]/140*100}%;background:${d.color}"></span></span><span class="faro-domain-sub">${d.weight}% ${pathT('del examen','of exam weight')}</span></button>`).join('')}
 <div class="separator"></div><h3>${pathT('Últimos resultados','Recent results')}</h3>${recent.length?recent.map(a=>`<div class="faro-recent"><span><b>${a.score}%</b><small>${a.correct}/${a.total} ${pathT('correctas','correct')} · ${esc(a.date)}</small></span><span class="faro-score-indicator ${a.score>=80?'faro-good':''}">${a.score>=80?'✓':'↗'}</span></div>`).join(''):`<p class="muted small">${pathT('Aún no has completado una práctica.','You have not completed a practice set yet.')}</p>`}</section></div>
 </div>`;
};
const faroPreviousQuestionHandler=handleAction;
handleAction=function(el){
 if(el.dataset.action==='faro-focus-domain'){
  secDomain=el.dataset.value;secTest=null;secTab='practice';goto('questions');return;
 }
 return faroPreviousQuestionHandler(el);
};

// Fully bilingual results, including per-domain performance and detailed answer review.
renderSecurityResults=function(){
 const t=secTest;
 if(!t)return '';
 const rows=t.questions.map(q=>({q,selected:t.answers[q.id],isCorrect:t.answers[q.id]===q.c}));
 const right=rows.filter(r=>r.isCorrect).length,rate=Math.round(100*right/rows.length);
 const perDomain=SEC_DOMAINS.map(d=>{
  const here=rows.filter(r=>r.q.d===d.id);
  return {d,total:here.length,correct:here.filter(x=>x.isCorrect).length};
 }).filter(x=>x.total);
 const label=t.mode==='exam'?pathT('simulacro','mock exam'):t.mode==='errors'?pathT('repaso de errores','mistake review'):pathT('entrenamiento','practice set');
 return `<div class="faro-result-page"><section class="panel faro-results-overview">
  <div class="sec-kicker">${pathT('PRÁCTICA FINALIZADA','PRACTICE COMPLETE')}</div>
  <h2>${pathT('Resultado del','Result of the')} ${label}</h2>
  <div class="faro-result-score">${rate}%</div>
  <p>${right} ${pathT('respuestas correctas de','correct answers out of')} ${rows.length}. ${pathT('Tu porcentaje de práctica no equivale a la escala de puntuación de CompTIA.','Your practice percentage is not equivalent to the CompTIA scoring scale.')}</p>
  <div class="sec-results-actions"><button class="button" data-action="sec-back">${pathT('Volver a Questions','Back to Questions')}</button><button class="button ghost" data-action="sec-repeat">${pathT('Practicar de nuevo','Practice again')} ${icon('refresh')}</button></div>
 </section>
 <section class="panel faro-result-domains"><h3>${pathT('Resultado por dominio','Results by domain')}</h3><div class="faro-result-domain-grid">${perDomain.map(r=>`<div class="faro-result-domain"><span>${pathT('Dominio','Domain')} ${r.d.id}</span><strong>${r.correct}/${r.total}</strong><div class="faro-domain-track"><span style="width:${r.total?100*r.correct/r.total:0}%;background:${r.d.color}"></span></div></div>`).join('')}</div></section>
 <section class="panel faro-result-review"><h3>${pathT('Respuestas y explicaciones','Answers and explanations')}</h3><p class="muted small">${pathT('Abre cada pregunta para revisar el razonamiento. Los errores están desplegados.','Open any question to review the reasoning. Incorrect answers are expanded.')}</p>
 ${rows.map((r,i)=>`<details class="sec-review" ${!r.isCorrect?'open':''}><summary><span class="sec-resultmark ${r.isCorrect?'yes':'no'}">${r.isCorrect?'✓':'✕'}</span><span>${i+1}. ${esc(localizedText(r.q.q))}</span></summary><div class="sec-review-body"><p><b>${pathT('Tu respuesta','Your answer')}:</b> ${r.selected===undefined?pathT('Sin responder','Not answered'):esc(localizedText(r.q.a[r.selected]))}</p><p><b>${pathT('Respuesta correcta','Correct answer')}:</b> ${esc(localizedText(r.q.a[r.q.c]))}</p><p>${esc(localizedText(r.q.why))}</p><button class="button tiny soft" data-action="sec-topic" data-value="${r.q.o}">${pathT('Repasar objetivo','Review objective')} ${r.q.o} ${icon('arrow')}</button></div></details>`).join('')}
 </section></div>`;
};
