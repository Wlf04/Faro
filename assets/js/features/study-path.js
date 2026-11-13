'use strict';
// Ruta guiada: lección, tarjetas, examen y progreso.
// ===== RUTA GUIADA SY0-701: estudiar -> tarjetas -> examen por objetivo =====
VIEWS.unshift(['route','Ruta guiada','book-open']);
I18N_STR['Ruta guiada']='Study Path';
I18N_STR['Ruta']='Path';
I18N_STR['Aprender']='Learn';
I18N_STR['Lección']='Lesson';
I18N_STR['Examen por objetivo']='Objective exam';
const PATH_PASS_SCORE=80;
let pathDomain='1',pathCode=null,pathStep='learn',pathCardIndex=0,pathCardFlipped=false,pathExam=null;
function pathT(es,en){return appLanguage==='en'?en:es}
function pathData(){db.routeProgress=db.routeProgress&&typeof db.routeProgress==='object'?db.routeProgress:{};db.routeAttempts=Array.isArray(db.routeAttempts)?db.routeAttempts:[];return db.routeProgress}
function pathState(code){let p=pathData();if(!p[code])p[code]={read:false,reviewed:[],passed:false,best:null,attempts:0};if(!Array.isArray(p[code].reviewed))p[code].reviewed=[];return p[code]}
function pathObjective(code){return SEC_OBJECTIVES.find(x=>x.code===code)}
function pathObjectiveTitle(code){const o=pathObjective(code);if(!o)return code;return appLanguage==='en'?(I18N_DATA.objectives?.[code]?.name||o.name):o.name}
function pathDomainTitle(d){return appLanguage==='en'?I18N_DATA.domains[d.id]:d.name}
function pathDomainList(did){return SEC_OBJECTIVES.filter(o=>o.d===did)}
function pathScopedCards(code){return db.cards.filter(c=>c.topicId==='sec701-'+code)}
function pathRequiredCards(code){return Math.min(2,pathScopedCards(code).length)}
function pathReviewedCount(code){const ids=new Set(pathScopedCards(code).map(c=>c.id));return pathState(code).reviewed.filter(id=>ids.has(id)).length}
function pathReady(code){const p=pathState(code);return p.read&&pathReviewedCount(code)>=pathRequiredCards(code)}
function pathNextCode(){return SEC_OBJECTIVES.find(o=>!pathState(o.code).passed)?.code||SEC_OBJECTIVES[0].code}
function pathPassedCount(){return SEC_OBJECTIVES.filter(o=>pathState(o.code).passed).length}
function pathStatus(code){let p=pathState(code);return p.passed?pathT('Aprobado','Passed'):pathReady(code)?pathT('Listo para examen','Ready for exam'):p.read?pathT('En repaso','Reviewing'):pathT('Sin empezar','Not started')}
function pathStatusClass(code){let p=pathState(code);return p.passed?'pass':pathReady(code)?'ready':p.read?'review':''}
function pathStart(code){if(!ROUTE_LESSONS[code])return;pathCode=code;pathDomain=pathObjective(code).d;pathCardIndex=0;pathCardFlipped=false;pathExam=null;const p=pathState(code);pathStep=p.read?(pathReady(code)?'exam':'cards'):'learn';goto('route')}
function pathPill(code){return `<span class="path-pill ${pathStatusClass(code)}">${pathState(code).passed?'✓ ':''}${esc(pathStatus(code))}</span>`}
function pathOverview(){
 const completed=pathPassedCount(),next=pathNextCode(),p=Math.round(100*completed/28),d=SEC_DOMAINS.find(x=>x.id===pathDomain)||SEC_DOMAINS[0];
 return `<div class="path-heading"><div><div class="path-overline">🛡️ SECURITY+ SY0-701 · ${pathT('RUTA DE APRENDIZAJE','LEARNING PATH')}</div><h1>${pathT('Aprende, repasa y aprueba cada objetivo','Learn, review, and pass each objective')}</h1><p>${pathT('28 objetivos del resumen V7 organizados en una ruta sin horarios. Estudia la teoría, practica tarjetas y haz un examen corto por cada parte.','All 28 V7 objectives in a self-paced path. Learn the material, review flashcards, then take a short exam for each objective.')}</p></div><div class="path-ring"><b>${completed}<small>/28</small></b><span>${pathT('aprobados','passed')}</span></div></div>
 <div class="path-progress"><div class="progress-bar"><span style="width:${p}%"></span></div><span>${p}%</span></div>
 <div class="path-call"><div class="path-call-mark">${icon('layers')}</div><div><b>${pathT('Próxima lección sugerida','Suggested next lesson')} · ${next}</b><p>${esc(pathObjectiveTitle(next))}</p></div><button class="button" data-action="path-open" data-value="${next}">${pathT('Continuar','Continue')} ${icon('arrow')}</button></div>
 <div class="path-how"><div><span>1</span><b>${pathT('Estudia','Learn')}</b><small>${pathT('Explicaciones y conceptos clave','Explanations and key concepts')}</small></div><div><span>2</span><b>${pathT('Repasa','Review')}</b><small>${pathT('Tarjetas del objetivo','Topic flashcards')}</small></div><div><span>3</span><b>${pathT('Examínate','Take the exam')}</b><small>${pathT('5 preguntas · 80% para aprobar','5 questions · 80% to pass')}</small></div></div>
 <div class="path-section-title"><div><h2>${pathT('Dominios del examen','Exam domains')}</h2><p>${pathT('Selecciona un dominio y abre cualquiera de sus objetivos. Puedes avanzar a tu ritmo.','Select a domain, then open any objective. Progress at your own pace.')}</p></div><span class="pill gray">${pathT('Total: 5 dominios','Total: 5 domains')}</span></div>
 <div class="path-domtabs">${SEC_DOMAINS.map(d=>{const objs=pathDomainList(d.id),passed=objs.filter(o=>pathState(o.code).passed).length;return `<button class="path-domtab ${pathDomain===d.id?'on':''}" data-action="path-domain" data-value="${d.id}" style="--dom:${d.color}"><span class="path-tabnumber">${d.id}</span><b>${pathT('Dominio','Domain')} ${d.id}</b><small>${passed}/${objs.length} · ${d.weight}%</small></button>`}).join('')}</div>
 <section class="path-domain-panel"><div class="path-domhead"><span class="path-domain-badge" style="background:${d.color}16;color:${d.color}">${d.id}</span><div><h2>${esc(pathDomainTitle(d))}</h2><p>${d.weight}% ${pathT('del examen ·','of the exam ·')} ${pathDomainList(d.id).length} ${pathT('objetivos','objectives')}</p></div></div>
 <div class="path-objlist">${pathDomainList(d.id).map(o=>{const p=pathState(o.code);return `<button class="path-obj" data-action="path-open" data-value="${o.code}"><span class="path-number">${o.code}</span><span class="path-obj-main"><b>${esc(pathObjectiveTitle(o.code))}</b><small>${esc(pathT(ROUTE_LESSONS[o.code].es,ROUTE_LESSONS[o.code].en))}</small></span>${pathPill(o.code)}<span class="path-go">${icon('arrow')}</span></button>`}).join('')}</div></section>
 <p class="path-disclaimer">${pathT('Material independiente de práctica, no afiliado a CompTIA. Los mini exámenes son educativos y no predicen la puntuación de la certificación.','Independent practice material, not affiliated with CompTIA. These educational mini exams do not predict your certification score.')}</p>`;
}
function pathStepNav(code){const p=pathState(code),cardsReady=pathReviewedCount(code)>=pathRequiredCards(code);return `<div class="path-steps">
 <button data-action="path-step" data-value="learn" class="${pathStep==='learn'?'current':''}"><span>1</span>${pathT('Estudiar','Learn')} ${p.read?'✓':''}</button>
 <button data-action="path-step" data-value="cards" class="${pathStep==='cards'?'current':''}" ${!p.read?'disabled':''}><span>2</span>${pathT('Tarjetas','Flashcards')} ${cardsReady?'✓':''}</button>
 <button data-action="path-step" data-value="exam" class="${pathStep==='exam'||pathStep==='results'?'current':''}" ${!pathReady(code)?'disabled':''}><span>3</span>${pathT('Examen','Exam')} ${p.passed?'✓':''}</button></div>`}
function pathLesson(code){const lesson=ROUTE_LESSONS[code],p=pathState(code),notes=pathObjective(code),fact=lesson.facts;
 return `<div class="path-content"><div class="path-lesson-intro"><div class="path-label">${pathT('QUÉ DEBES SABER','WHAT YOU NEED TO KNOW')}</div><p>${esc(pathT(lesson.es,lesson.en))}</p></div>
 <h3>${pathT('Conceptos esenciales','Essential concepts')}</h3><div class="path-facts">${fact.map((f,i)=>`<div class="path-fact"><span>${String(i+1).padStart(2,'0')}</span><div><b>${esc(pathT(f[0],f[1]))}</b><p>${esc(pathT(f[2],f[3]))}</p></div></div>`).join('')}</div>
 <details class="path-extra"><summary>${pathT('Ver los apuntes originales de este objetivo','View original notes for this objective')}</summary><div>${(appLanguage==='en'?(I18N_DATA.objectives?.[code]?.notes||[]):notes.notes.split('\n')).map(x=>`<p>• ${esc(x)}</p>`).join('')}</div></details>
 <div class="path-learn-footer"><div><b>${p.read?pathT('Ya marcaste esta lección como estudiada.','You have marked this lesson as studied.'):pathT('¿Ya entiendes estos conceptos?','Do you understand these concepts?')}</b><p>${pathT('Después podrás repasar las tarjetas del tema y hacer su examen.','Next you can review topic flashcards and take the exam.')}</p></div><button class="button" data-action="path-learn-complete">${p.read?pathT('Ir a las tarjetas','Go to flashcards'):pathT('He estudiado este objetivo','I studied this objective')} ${icon('arrow')}</button></div></div>`}
function pathCardLang(card,field){const txt=card[field]||'';if(appLanguage==='es')return txt;return I18N_STR[txt]||translateEnglish(txt)}
function pathCards(code){const cards=pathScopedCards(code),p=pathState(code),reviewed=pathReviewedCount(code),need=pathRequiredCards(code);
 if(!cards.length)return `<section class="path-content"><h2>${pathT('Tarjetas de repaso','Review flashcards')}</h2><p>${pathT('Este objetivo no tiene tarjetas guardadas. Puedes pasar al examen después de estudiar.','This objective has no saved flashcards. You can go to the exam after studying.')}</p><button class="button" data-action="path-step" data-value="exam">${pathT('Ir al examen','Go to exam')}</button></section>`;
 pathCardIndex=Math.min(pathCardIndex,cards.length-1);const c=cards[pathCardIndex],isReviewed=p.reviewed.includes(c.id);
 return `<section class="path-content"><div class="path-studyhead"><div><h2>${pathT('Repasa con tarjetas','Review with flashcards')}</h2><p>${pathT('Toca la tarjeta para ver la respuesta. Repasa al menos dos tarjetas distintas para habilitar el examen.','Tap the card to reveal its answer. Review at least two different cards to unlock the exam.')}</p></div><span class="path-pill ${reviewed>=need?'pass':'review'}">${reviewed}/${need} ${pathT('necesarias','required')}</span></div>
 <div class="path-card-progress">${pathT('Tarjeta','Card')} ${pathCardIndex+1} ${pathT('de','of')} ${cards.length} ${isReviewed?'· ✓ '+pathT('revisada','reviewed'):''}</div>
 <button class="path-flash ${pathCardFlipped?'back':''}" data-action="path-card-flip"><span>${pathCardFlipped?pathT('RESPUESTA','ANSWER'):pathT('PREGUNTA','QUESTION')}</span><strong>${esc(pathCardLang(c,pathCardFlipped?'back':'front'))}</strong><small>${pathT('Toca para girar','Tap to flip')}</small></button>
 <div class="path-card-actions"><button class="button ghost" data-action="path-card-prev" ${pathCardIndex===0?'disabled':''}>${icon('arrow')} ${pathT('Anterior','Previous')}</button><button class="button ghost" data-action="path-card-next" ${pathCardIndex===cards.length-1?'disabled':''}>${pathT('Siguiente','Next')} ${icon('arrow')}</button></div>
 <div class="path-review-footer"><span>${reviewed>=need?pathT('¡Repaso completado! Ya puedes hacer el examen.','Review complete! You can now take the exam.'):pathT(`Te faltan ${need-reviewed} tarjeta(s) por descubrir.`,`Reveal ${need-reviewed} more card(s).`)}</span><button class="button" data-action="path-step" data-value="exam" ${!pathReady(code)?'disabled':''}>${pathT('Ir al examen','Go to exam')} ${icon('arrow')}</button></div></section>`;
}
function pathQuestionPool(code){
 const originals=SEC_QUESTIONS.filter(x=>x.o===code).map(q=>{const en=I18N_DATA.questions[q.id]||{};return {id:q.id,mode:'case',q:{es:q.q,en:en.q||q.q},opts:q.a.map((a,i)=>({es:a,en:en.a?.[i]||a})),correct:q.c,why:{es:q.why,en:en.why||q.why}}});
 const facts=ROUTE_LESSONS[code].facts;
 const extra=facts.map((f,i)=>{
  const wrong=shuffle(facts.filter((_,j)=>j!==i)).slice(0,3);
  const opts=shuffle([f,...wrong]);
  return {id:`path-${code}-${i}`,mode:'concept',q:{es:`¿Qué concepto corresponde a esta situación o definición? ${f[2]}`,en:`Which security concept fits this definition or situation? ${f[3]}`},opts:opts.map(x=>({es:x[0],en:x[1]})),correct:opts.indexOf(f),why:{es:`${f[0]}: ${f[2]}`,en:`${f[1]}: ${f[3]}`}};
 });
 return {originals,extra};
}
function pathCreateExam(code){const pool=pathQuestionPool(code),origCount=Math.min(2,pool.originals.length),items=[...shuffle(pool.originals).slice(0,origCount),...shuffle(pool.extra).slice(0,5-origCount)];return {code,idx:0,items:shuffle(items),answers:{},complete:false,recorded:false}}
function pathExamPanel(code){if(pathExam?.code===code){return pathExam.complete?pathResults(code):pathLiveExam(code)}
 const s=pathState(code),n=(db.routeAttempts||[]).filter(x=>x.code===code).length;
 return `<div class="path-content path-exam-start"><span class="path-exam-emblem">📝</span><h2>${pathT('Examen del objetivo','Objective exam')} ${code}</h2><p>${pathT('Responde 5 preguntas sin límite de tiempo. Necesitas acertar 4 de 5 (80%) para aprobar. Al terminar verás las respuestas correctas y sus explicaciones.','Answer 5 untimed questions. You need 4 out of 5 correct (80%) to pass. At the end you will see the correct answers and explanations.')}</p><div class="path-exam-specs"><span>✦ 5 ${pathT('preguntas','questions')}</span><span>✓ 80% ${pathT('para aprobar','to pass')}</span><span>↻ ${pathT('intentos ilimitados','unlimited retries')}</span></div>${n?`<p class="small muted">${pathT('Intentos anteriores','Previous attempts')}: ${n} · ${pathT('Mejor puntuación','Best score')}: ${s.best}%</p>`:''}<button class="button" data-action="path-exam-start">${pathT('Comenzar examen','Start exam')} ${icon('arrow')}</button></div>`;
}
function pathLiveExam(code){const t=pathExam,number=t.idx+1,q=t.items[t.idx],answer=t.answers[t.idx];return `<div class="path-content path-test"><div class="path-test-top"><span class="path-pill review">${pathT('EXAMEN DEL OBJETIVO','OBJECTIVE EXAM')} ${code}</span><b>${number} / ${t.items.length}</b></div><div class="progress-bar"><span style="width:${Math.round((number-1)*100/t.items.length)}%"></span></div><h2>${esc(pathT(q.q.es,q.q.en))}</h2><div class="path-options">${q.opts.map((o,i)=>`<button class="path-opt ${answer===i?'chosen':''}" data-action="path-answer" data-value="${i}"><span>${'ABCD'[i]}</span>${esc(pathT(o.es,o.en))}</button>`).join('')}</div><div class="path-test-bottom"><button class="button ghost tiny" data-action="path-exam-abandon">${pathT('Salir del examen','Exit exam')}</button><button class="button" data-action="path-exam-next" ${!Number.isInteger(answer)?'disabled':''}>${number===t.items.length?pathT('Ver resultados','See results'):pathT('Siguiente pregunta','Next question')} ${icon('arrow')}</button></div></div>`}
function pathFinishExam(){const t=pathExam;if(!t||t.complete)return;const correct=t.items.filter((q,i)=>t.answers[i]===q.correct).length;const score=Math.round(correct/t.items.length*100),p=pathState(t.code);t.complete=true;t.correct=correct;t.score=score;t.passed=score>=PATH_PASS_SCORE;p.attempts=(p.attempts||0)+1;p.best=p.best==null?score:Math.max(p.best,score);p.passed=p.passed||t.passed;p.last=score;
 if(t.passed){const obj=topic('sec701-'+t.code);if(obj)obj.status='done'}
 db.routeAttempts.push({id:id(),date:today(),code:t.code,correct,total:t.items.length,score,passed:t.passed,questions:t.items.map((q,i)=>({id:q.id,correct:t.answers[i]===q.correct}))});save();pathStep='results';render()}
function pathResults(code){const t=pathExam,p=pathState(code),next=SEC_OBJECTIVES.find((o,i,arr)=>o.code===code&&arr[i+1])?SEC_OBJECTIVES[SEC_OBJECTIVES.findIndex(o=>o.code===code)+1].code:null;
 return `<div class="path-content"><div class="path-result-top ${t.passed?'success':'retry'}"><div class="path-score">${t.score}%</div><div><h2>${t.passed?pathT('¡Objetivo aprobado!','Objective passed!'):pathT('Sigue practicando','Keep practicing')}</h2><p>${t.correct}/${t.items.length} ${pathT('respuestas correctas.','correct answers.')} ${t.passed?pathT('El siguiente objetivo te espera.','The next objective is ready.'):pathT('Revisa las explicaciones, repasa las tarjetas y vuelve a intentarlo.','Review the explanations, revisit flashcards, and try again.')}</p></div></div>
 <div class="path-result-actions"><button class="button soft" data-action="path-exam-retry">${icon('refresh')} ${pathT('Repetir examen','Retake exam')}</button><button class="button ghost" data-action="path-step" data-value="learn">${pathT('Revisar teoría','Review lesson')}</button>${next&&t.passed?`<button class="button" data-action="path-open" data-value="${next}">${pathT('Siguiente objetivo','Next objective')} ${icon('arrow')}</button>`:''}</div>
 <h3>${pathT('Revisión de respuestas','Answer review')}</h3><div class="path-result-questions">${t.items.map((q,i)=>{const ok=t.answers[i]===q.correct,selected=t.answers[i];return `<div class="path-result-item ${ok?'correct':'incorrect'}"><div class="path-result-name"><span>${ok?'✓':'×'}</span><b>${i+1}. ${esc(pathT(q.q.es,q.q.en))}</b></div><p><b>${pathT('Tu respuesta','Your answer')}:</b> ${esc(pathT(q.opts[selected]?.es||'',q.opts[selected]?.en||''))}</p>${!ok?`<p><b>${pathT('Correcta','Correct')}:</b> ${esc(pathT(q.opts[q.correct].es,q.opts[q.correct].en))}</p>`:''}<p class="path-explanation">${esc(pathT(q.why.es,q.why.en))}</p></div>`}).join('')}</div><p class="path-disclaimer">${pathT('Este porcentaje corresponde a un mini examen educativo de 5 preguntas, no a una calificación del examen de certificación.','This score comes from a 5-question educational quiz, not a certification exam grade.')}</p></div>`}
function renderRoute(){pathData();if(pathCode&&!ROUTE_LESSONS[pathCode])pathCode=null;if(!pathCode)return pathOverview();const code=pathCode,p=pathState(code),d=SEC_DOMAINS.find(d=>d.id===pathObjective(code).d);return `<div class="path-lesson"><button class="path-back" data-action="path-map">${icon('arrow')} ${pathT('Volver a la ruta','Back to path')}</button>
 <div class="path-lesson-heading"><div><div class="path-overline">${pathT('DOMINIO','DOMAIN')} ${d.id} · ${esc(pathDomainTitle(d))} · ${d.weight}%</div><h1><span>${code}</span> ${esc(pathObjectiveTitle(code))}</h1><p>${esc(pathT(ROUTE_LESSONS[code].es,ROUTE_LESSONS[code].en))}</p></div>${pathPill(code)}</div>
 ${pathStepNav(code)}${pathStep==='learn'?pathLesson(code):pathStep==='cards'?pathCards(code):pathExamPanel(code)}
 <div class="path-footnav"><button class="button ghost tiny" data-action="path-map">${pathT('Ver todos los objetivos','See all objectives')}</button><button class="button ghost tiny" data-action="path-notes">${icon('file-text')} ${pathT('Mis apuntes de este objetivo','My notes for this objective')}</button></div></div>`}
views.route=renderRoute;
// Prominent entry on the existing home dashboard; all prior resources remain available.
const pathPreviousHome=views.home;
views.home=function(){return `<div class="path-home-call"><div><b>🧭 ${pathT('Tu ruta de aprendizaje SY0-701','Your SY0-701 Learning Path')}</b><p>${pathPassedCount()}/28 ${pathT('objetivos aprobados · lecciones, tarjetas y mini exámenes sin horarios.','objectives passed · lessons, flashcards, and untimed mini exams.')}</p></div><button class="button" data-nav="route">${pathT('Abrir ruta','Open path')} ${icon('arrow')}</button></div>`+pathPreviousHome()};
const pathPreviousAction=handleAction;
handleAction=function(el){const action=el.dataset.action,v=el.dataset.value;switch(action){
 case 'path-map':pathCode=null;pathExam=null;goto('route');return;
 case 'path-domain':pathDomain=v;render();return;
 case 'path-open':pathStart(v);return;
 case 'path-learn-complete':{let p=pathState(pathCode);p.read=true;save();pathStep='cards';pathCardIndex=0;pathCardFlipped=false;render();return}
 case 'path-step':{if(v==='cards'&&!pathState(pathCode).read)return;if(v==='exam'&&!pathReady(pathCode))return;if(pathExam&&!pathExam.complete&&pathStep==='exam'&&v!=='exam'){if(!confirm(pathT('¿Salir del examen sin guardar este intento?','Leave this exam without saving this attempt?')))return;pathExam=null}pathStep=v;render();return}
 case 'path-card-flip':{const cards=pathScopedCards(pathCode),c=cards[pathCardIndex];if(!c)return;pathCardFlipped=!pathCardFlipped;if(pathCardFlipped&&!pathState(pathCode).reviewed.includes(c.id)){pathState(pathCode).reviewed.push(c.id);save()}render();return}
 case 'path-card-next':pathCardIndex=Math.min(pathScopedCards(pathCode).length-1,pathCardIndex+1);pathCardFlipped=false;render();return;
 case 'path-card-prev':pathCardIndex=Math.max(0,pathCardIndex-1);pathCardFlipped=false;render();return;
 case 'path-exam-start':if(!pathReady(pathCode))return;pathExam=pathCreateExam(pathCode);pathStep='exam';render();return;
 case 'path-answer':if(!pathExam||pathExam.complete)return;pathExam.answers[pathExam.idx]=Number(v);render();return;
 case 'path-exam-next':if(!pathExam||pathExam.complete||!Number.isInteger(pathExam.answers[pathExam.idx]))return;if(pathExam.idx===pathExam.items.length-1){pathFinishExam()}else{pathExam.idx++;render()}return;
 case 'path-exam-abandon':if(confirm(pathT('¿Abandonar este examen sin guardar resultados?','Leave this exam without saving results?'))){pathExam=null;render()}return;
 case 'path-exam-retry':pathExam=pathCreateExam(pathCode);pathStep='exam';render();return;
 case 'path-notes':activeTopic='sec701-'+pathCode;goto('material');return;
 default:return pathPreviousAction(el);
 }};
// Switch to the new route on launch. Existing browser progress, notes and language are retained.
