'use strict';
// Interfaz de estudio sin calendario.
// ==================== MODO SIMPLE: TODO A TU RITMO ====================
let cardDomain='all',cardStatus='all',cardIndex=0,cardRevealed=false;
let noteDomain='1';
const examTopics=()=>db.topics.filter(t=>t.id.startsWith('sec701-'));
const examCards=()=>db.cards.filter(c=>topic(c.topicId)?.id.startsWith('sec701-'));
function simpleCardItems(){return examCards().filter(c=>(cardDomain==='all'||topic(c.topicId)?.subjectId==='sec701-d'+cardDomain)&&(cardStatus==='all'||!c.simpleKnown));}
function simpleHeader(heading,subtitle,right=''){
 return `<div class="simple-head"><div><h1>${heading}</h1><p>${subtitle}</p></div>${right}</div>`;
}
function renderSimpleHome(){
 const ds=securityDomainStats(),finished=ds.reduce((n,d)=>n+d.done,0),known=examCards().filter(c=>c.simpleKnown).length;
 const weak=securityLastWrongIds().length, attempts=db.securityAttempts||[];
 const last=attempts[attempts.length-1];
 return `<div class="study-hero"><div class="copy"><div class="study-eyebrow">🛡️ FARO SECURITY+ <span class="study-chip">SY0-701</span></div><h1>Tu espacio para dominar Security+</h1><p>Todo lo que necesitas en un mismo lugar: aprende los conceptos, repasa con tarjetas, resuelve preguntas y practica ejercicios PBQ. Sin calendario ni sesiones obligatorias.</p><button class="button light" data-nav="security">${icon('book-open')} Explorar temario</button><button class="button" data-nav="questions" style="background:#ffffff20;border-color:#ffffff58">${icon('play')} Empezar preguntas</button></div></div>
 <div class="study-section"><div><h2>¿Qué quieres estudiar?</h2><p>Elige cualquier recurso y continúa a tu ritmo.</p></div></div>
 <div class="study-grid">
 <button class="study-tile" data-nav="security"><span class="glyph">📘</span><b>Temario</b><small>5 dominios y 28 objetivos explicados.</small></button>
 <button class="study-tile" data-nav="practice"><span class="glyph">🗂️</span><b>Tarjetas</b><small>${examCards().length} tarjetas para memorizar conceptos.</small></button>
 <button class="study-tile" data-nav="questions"><span class="glyph">✅</span><b>Preguntas</b><small>${SEC_QUESTIONS.length} preguntas originales con explicación.</small></button>
 <button class="study-tile" data-nav="pbq"><span class="glyph">🧩</span><b>Práctica PBQ</b><small>Casos de registros y reglas de firewall.</small></button>
 </div>
 <div class="study-overview"><section class="panel"><div class="panel-head"><h3>Tu avance por dominio</h3><button class="link-btn" data-nav="progress">Ver detalles ${icon('arrow')}</button></div><div class="study-stat-grid"><div class="study-mini-stat"><b>${finished}/28</b><span>Objetivos dominados</span></div><div class="study-mini-stat"><b>${known}/${examCards().length}</b><span>Tarjetas conocidas</span></div><div class="study-mini-stat"><b>${attempts.length}</b><span>Prácticas completadas</span></div></div>${ds.map(d=>`<button class="study-domain-row" data-action="simple-open-domain" data-value="${d.id}"><span class="dot" style="color:${d.color};background:${d.color}20">${d.id}</span><span class="domain-text">${esc(d.name)}</span><span class="domain-progress">${d.done}/${d.count}</span>${icon('arrow')}</button>`).join('')}</section>
 <section class="panel"><h3>Continúa por donde prefieras</h3><p class="study-subheading">No necesitas cumplir horarios. Puedes repetir los temas tantas veces como necesites.</p><div class="study-callout"><b>💡 Sugerencia para principiantes</b><br>Empieza por el dominio 1 y apóyate en redes y conceptos básicos. Después haz una práctica corta para detectar lo que aún no comprendes.</div><div class="study-mini-actions"><button class="button soft" data-nav="material">${icon('file-text')} Mis apuntes</button><button class="button ghost" data-nav="practice">${icon('layers')} Abrir tarjetas</button></div><div class="separator"></div><h3>Tu última práctica</h3>${last?`<div class="list-row"><span class="icon-dot" style="background:#f3f2ff">🏅</span><div class="info"><div class="title">${last.correct}/${last.total} respuestas correctas</div><div class="sub">${last.score}% de aciertos · ${niceDate(last.date)}</div></div></div>`:`<p class="muted small" style="line-height:1.7">Todavía no has realizado ninguna práctica. Empieza con 10 preguntas sin cronómetro.</p>`}${weak?`<p class="small" style="color:#a16b27">${weak} preguntas pendientes de refuerzo.</p>`:''}<button class="button tiny ghost" data-nav="questions" style="margin-top:10px">Practicar ahora ${icon('arrow')}</button></section></div>
 <p class="simple-exam-note">Contenido de práctica independiente para SY0-701; no es una plataforma oficial de CompTIA. La puntuación de esta app no equivale al resultado de certificación. <a href="https://www.comptia.org/en-us/certifications/security/" target="_blank" rel="noopener noreferrer" style="color:#5f55ca;text-decoration:underline">Consulta los objetivos oficiales</a>.</p>`;
}
function renderSimpleSyllabus(){
 const ds=securityDomainStats(),done=ds.reduce((a,d)=>a+d.done,0);
 return simpleHeader('Temario Security+','Estudia cualquiera de los cinco dominios y marca los objetivos que domines. Sin fechas ni orden obligatorio.',`<span class="pill">${done}/28 objetivos</span>`)
 +renderSecurityMap(ds);
}
function renderSimpleCards(){
 const cards=simpleCardItems();if(cardIndex>=cards.length)cardIndex=Math.max(0,cards.length-1);
 const c=cards[cardIndex], mastered=examCards().filter(c=>c.simpleKnown).length;
 return simpleHeader('Tarjetas de memoria','Recuerda la respuesta antes de girar la tarjeta. Marca lo que ya sabes o lo que necesitas reforzar.',`<button class="button ghost" data-action="add-card">${icon('plus')} Crear tarjeta</button>`)
 +`<div class="simple-controls"><div class="field"><label for="simple-card-domain">Dominio</label><select id="simple-card-domain"><option value="all">Todos los dominios</option>${SEC_DOMAINS.map(d=>`<option value="${d.id}" ${cardDomain===d.id?'selected':''}>Dominio ${d.id} · ${esc(d.name)}</option>`).join('')}</select></div><div class="field"><label for="simple-card-status">Mostrar</label><select id="simple-card-status"><option value="all" ${cardStatus==='all'?'selected':''}>Todas las tarjetas</option><option value="review" ${cardStatus==='review'?'selected':''}>Por reforzar</option></select></div><span class="card-count">${mastered}/${examCards().length} marcadas como conocidas</span></div>`
 +(c?`<div class="simple-flash-wrap"><div class="simple-meta"><span>${esc(topic(c.topicId)?.name||'Conceptos de Security+')}</span><b>${cardIndex+1} de ${cards.length}</b></div><button type="button" class="simple-flash" data-action="simple-flip" aria-label="${cardRevealed?'Ver pregunta':'Ver respuesta'}"><span class="tiny-tag">${c.simpleKnown?'✓ Ya la sé':'Para practicar'}</span><span class="subtle">${cardRevealed?'RESPUESTA':'PREGUNTA'}</span><span class="big">${esc(cardRevealed?c.back:c.front)}</span><span class="tap">${cardRevealed?'Pulsa para volver a la pregunta':'Pulsa para descubrir la respuesta'}</span></button><div class="simple-buttons"><button class="button ghost" data-action="simple-prev" ${cardIndex===0?'disabled':''}>← Anterior</button>${cardRevealed?`<button class="button danger" data-action="simple-mark" data-value="again">Reforzar</button><button class="button" data-action="simple-mark" data-value="known">✓ Ya la sé</button>`:`<button class="button soft" data-action="simple-flip">Mostrar respuesta</button>`}<button class="button ghost" data-action="simple-next">Siguiente →</button></div></div>`:`<div class="panel">${empty('🎉','No hay tarjetas en este filtro','Prueba mostrar todas las tarjetas o añade una nueva.')}</div>`)
 +`<p class="simple-exam-note">Puedes elegir un dominio, girar cualquier tarjeta y decidir qué necesitas repasar. Los avances se guardan en este navegador. También puedes <button class="link-btn" data-nav="material">crear tarjetas desde tus apuntes</button>.</p>`;
}
function renderSimpleQuestions(){
 return simpleHeader('Preguntas de examen','Practica con escenarios de Security+ en español, recibe explicaciones y repasa tus errores. Sin límite de tiempo.')+renderSecurityPractice();
}
function renderSimplePBQ(){return simpleHeader('Ejercicios prácticos PBQ','Entrena decisiones de seguridad con dos casos guiados originales, sin cronómetro.')+renderSecurityPBQ();}
function simpleNotes(){
 if(!activeTopic||!topic(activeTopic)||!activeTopic.startsWith('sec701-'))activeTopic='sec701-1.1';
 const t=topic(activeTopic);if(!t)return '<div class="empty">No se encontraron objetivos de Security+.</div>';
 noteDomain=t.subjectId.replace('sec701-d','');
 const s=subject(t.subjectId),objs=topicsFor(t.subjectId),files=db.materials.filter(m=>m.topicId===t.id);
 return simpleHeader('Apuntes y recursos','Cada objetivo tiene sus apuntes. Añade tus notas, PDF, Word y materiales, o genera tarjetas de tus definiciones.',`<button class="button" data-action="add-material">${icon('upload')} Añadir material</button>`)
 +`<div class="simple-material"><section class="panel"><h3>Elegir un tema</h3><div class="field" style="margin-top:14px"><label for="simple-note-domain">Dominio</label><select id="simple-note-domain">${SEC_DOMAINS.map(d=>`<option value="${d.id}" ${noteDomain===d.id?'selected':''}>${d.id}. ${esc(d.name)}</option>`).join('')}</select></div><div class="simple-topic-list">${objs.map(x=>`<button class="simple-topic-choice ${x.id===activeTopic?'active':''}" data-action="simple-topic" data-id="${x.id}"><span class="code">${esc(x.name.split(' · ')[0])}</span><span class="label">${esc(x.name.split(' · ').slice(1).join(' · '))}</span>${x.status==='done'?'<span class="check">✓</span>':''}</button>`).join('')}</div></section>
 <section class="panel"><div class="panel-head"><div><p class="small muted" style="margin:0 0 6px">${esc(s?.name||'')}</p><h2 style="margin:0">${esc(t.name)}</h2></div><button class="button tiny ${t.status==='done'?'soft':'ghost'}" data-action="simple-toggle-topic">${t.status==='done'?'✓ Dominado':'Marcar dominado'}</button></div>
 <h3 style="margin-top:20px">Tus apuntes</h3><div class="muted small" style="margin:5px 0 10px" id="note-status">Se guardan automáticamente</div><textarea id="topic-notes" data-note="${t.id}" class="editor" placeholder="Escribe aquí explicaciones, ejemplos y conceptos...">${esc(t.notes||'')}</textarea><div class="study-callout" style="margin-top:13px">Para generar tarjetas, usa líneas del tipo <b>Concepto: explicación</b>.</div><div class="simple-buttons" style="justify-content:flex-start"><button class="button soft tiny" data-action="generate-cards">${icon('star')} Crear tarjetas de mis apuntes</button><button class="button ghost tiny" data-action="add-card">${icon('plus')} Nueva tarjeta</button></div>
 <div class="separator"></div><div class="panel-head"><h3>Documentos de este tema</h3><button class="button ghost tiny" data-action="add-material">${icon('plus')} Añadir</button></div>${files.length?files.map(m=>`<div class="material-item"><div class="doc-icon">${icon('file-text')}</div><div class="doc-info"><h4>${esc(m.title)}</h4><p>${esc(m.kind||'Texto')} · ${Math.round((m.text||'').length/1000*10)/10} mil caracteres</p></div><button class="button tiny ghost" data-action="read-material" data-id="${m.id}">Abrir</button><button class="button tiny danger" data-action="delete-material" data-id="${m.id}" aria-label="Eliminar documento">${icon('trash')}</button></div>`).join(''):`<p class="small muted">Aún no has añadido documentos a este tema.</p>`}
 <div class="separator"></div><div class="panel-head"><h3>Tarjetas de este objetivo</h3><span class="pill gray">${allTopicCards(t.id).length} tarjetas</span></div>${allTopicCards(t.id).slice(0,5).map(c=>`<div class="list-row"><span class="icon-dot" style="background:#eeedff">${icon('layers')}</span><div class="info"><div class="title">${esc(c.front)}</div><div class="sub">${esc(c.back.slice(0,100))}</div></div><button class="button tiny ghost" data-action="edit-card" data-id="${c.id}">${icon('edit')}</button></div>`).join('')||'<p class="muted small">Este tema aún no tiene tarjetas.</p>'}</section></div>`;
}
function renderSimpleProgress(){
 const stats=securityDomainStats(),all=db.securityAttempts||[],answers=all.flatMap(x=>x.answers||[]),right=answers.filter(a=>a.correct).length;
 const known=examCards().filter(c=>c.simpleKnown).length,done=stats.reduce((a,d)=>a+d.done,0),weak=securityLastWrongIds().length;
 return simpleHeader('Tu progreso','Mira tus puntos fuertes y qué temas conviene practicar más. No se mide el tiempo de estudio.',`<button class="button ghost" data-action="export">${icon('download')} Exportar datos</button>`)
 +`<div class="progress-metrics"><div class="panel"><small>Objetivos dominados</small><b>${done}/28</b></div><div class="panel"><small>Tarjetas conocidas</small><b>${known}/${examCards().length}</b></div><div class="panel"><small>Prácticas realizadas</small><b>${all.length}</b></div><div class="panel"><small>Respuestas acertadas</small><b>${answers.length?Math.round(100*right/answers.length)+'%':'—'}</b></div></div>
 <div class="study-overview"><section class="panel"><div class="panel-head"><h3>Los cinco dominios</h3><span class="pill gray">SY0-701</span></div>${stats.map(d=>`<div class="bar-item" style="padding:11px 0;border-top:1px solid var(--line)"><div class="bar-head"><strong>${d.id}. ${esc(d.name)}</strong><span>${d.done}/${d.count} objetivos</span></div><div class="progress-bar"><span style="width:${d.count?d.done/d.count*100:0}%;background:${d.color}"></span></div><div class="muted small" style="margin-top:8px">${d.answered?`${d.correct}/${d.answered} respuestas correctas (${Math.round(d.correct/d.answered*100)}%)`:'Aún sin preguntas respondidas'}</div></div>`).join('')}</section>
 <section class="panel"><h3>Preguntas para reforzar</h3><p class="study-subheading">Se consideran pendientes las preguntas falladas más recientemente. Al responderlas correctamente, dejan de aparecer como error.</p><div class="study-mini-stat"><b>${weak}</b><span>Preguntas que requieren repaso</span></div><div class="study-mini-actions"><button class="button soft" data-action="simple-errors" ${!weak?'disabled':''}>${icon('refresh')} Repasar errores</button><button class="button ghost" data-nav="questions">Todas las preguntas</button></div><div class="separator"></div><h3>Últimos resultados</h3>${all.length?all.slice(-5).reverse().map(a=>`<div class="list-row"><span class="icon-dot" style="background:#f1efff">📝</span><div class="info"><div class="title">${a.mode==='exam'?'Mini simulacro':a.mode==='errors'?'Repaso de fallos':'Entrenamiento'}</div><div class="sub">${niceDate(a.date)} · ${a.correct}/${a.total} correctas</div></div><b>${a.score}%</b></div>`).join(''):'<p class="small muted">Todavía no hay resultados guardados.</p>'}</section></div>
 <p class="simple-exam-note">Los resultados son orientativos y no representan una puntuación oficial ni una predicción de aprobación.</p>`;
}
views.home=renderSimpleHome;
views.security=renderSimpleSyllabus;
views.practice=renderSimpleCards;
views.questions=renderSimpleQuestions;
views.pbq=renderSimplePBQ;
views.material=simpleNotes;
views.progress=renderSimpleProgress;
const priorSimpleAction=handleAction;
handleAction=function(el){
 const act=el.dataset.action,val=el.dataset.value;
 if(act==='simple-open-domain'){activeTopic='sec701-'+val+'.1';goto('material');return;}
 if(act==='simple-topic'){activeTopic=el.dataset.id;render();return;}
 if(act==='simple-toggle-topic'){const t=topic(activeTopic);if(t){t.status=t.status==='done'?'studying':'done';save();render();}return;}
 if(act==='simple-flip'){cardRevealed=!cardRevealed;render();return;}
 if(act==='simple-next'||act==='simple-prev'){const len=simpleCardItems().length;if(len){cardIndex=(cardIndex+(act==='simple-next'?1:-1)+len)%len;cardRevealed=false;render();}return;}
 if(act==='simple-mark'){
   const items=simpleCardItems(),c=items[cardIndex];if(!c)return;
   c.simpleKnown=val==='known';c.reps=(c.reps||0)+1;c.due=val==='known'?shiftDay(today(),3):today();c.box=val==='known'?Math.max(1,c.box||0):0;
   save();cardRevealed=false;const next=simpleCardItems();cardIndex=next.length?cardStatus==='all'?(cardIndex+1)%next.length:Math.min(cardIndex,next.length-1):0;render();return;
 }
 if(act==='simple-errors'){secDomain='all';goto('questions');securityStart('errors');return;}
 if(act==='sec-study'){activeTopic='sec701-'+val+'.1';goto('material');return;}
 if(act==='sec-topic'){activeTopic='sec701-'+val;goto('material');return;}
 if(act==='reset-db'){priorSimpleAction(el);securitySeed();render();return;}
 return priorSimpleAction(el);
};
document.addEventListener('change',e=>{
 if(e.target.id==='simple-card-domain'){cardDomain=e.target.value;cardIndex=0;cardRevealed=false;render();}
 if(e.target.id==='simple-card-status'){cardStatus=e.target.value;cardIndex=0;cardRevealed=false;render();}
 if(e.target.id==='simple-note-domain'){activeTopic='sec701-'+e.target.value+'.1';render();}
});
// Strip template demo content, never ask user to create an unrelated academic subject.
settingsModal=function(){showModal('Tus datos y copias de seguridad',`<p class="small muted" style="line-height:1.8">Faro funciona en tu navegador y guarda tu progreso localmente. Para cambiar de archivo, navegador o dispositivo, exporta una copia e impórtala en la otra versión.</p><div class="panel" style="box-shadow:none;margin-bottom:13px"><h3>Guardar copia</h3><p class="small muted">Exporta apuntes, tarjetas, temas y resultados a un archivo JSON.</p><button class="button soft" data-action="export">${icon('download')} Exportar mis datos</button></div><div class="panel" style="box-shadow:none;margin-bottom:13px"><h3>Recuperar o migrar datos</h3><p class="small muted">Importar una copia reemplaza los datos guardados actualmente en este navegador.</p><input id="backup-input" class="input" type="file" accept=".json,application/json"></div><div class="panel" style="box-shadow:none"><h3>Reiniciar progreso</h3><p class="small muted">Elimina tus resultados y apuntes locales y restaura el temario inicial de Security+.</p><button class="button danger tiny" data-action="reset-db">Borrar mis datos</button></div>`)};

securitySeed();
