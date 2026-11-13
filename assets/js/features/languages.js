'use strict';
// Selector de idioma, traducción y preferencias.
const LANGUAGE_KEY='faro_security_language_v1';
let appLanguage=(localStorage.getItem(LANGUAGE_KEY)||db.settings?.language||'es')==='en'?'en':'es';
const I18N_STR=I18N_DATA.strings;
const i18nReplacements=[
 [/^(\d+) tarjetas para memorizar conceptos\.$/,'$1 flashcards to memorize concepts.'],
 [/^(\d+) preguntas originales con explicación\.$/,'$1 original questions with explanations.'],
 [/^(\d+) objetivos(?: completados)?$/,'$1 objectives completed'],
 [/^(\d+) tarjetas$/,'$1 flashcards'],
 [/^(\d+) pendientes$/,'$1 due'],
 [/^(\d+) de (\d+)$/,'$1 of $2'],
 [/^(\d+)\/28 objetivos$/,'$1/28 objectives'],
 [/^(\d+)\/\d+ objetivos completados · (.*)$/,'$1 objectives completed · $2'],
 [/^(\d+)\/\d+ objetivos$/,'$1 objectives'],
 [/^(\d+)\/\d+ respuestas correctas \((\d+)%\)$/,'$1 correct answers ($2%)'],
 [/^(\d+)\/\d+ correctas$/,'$1 correct'],
 [/^(\d+) respuestas correctas$/,'$1 correct answers'],
 [/^(\d+)% de aciertos · (.*)$/,'$1% correct · $2'],
 [/^(\d+) preguntas pendientes de refuerzo\.$/,'$1 questions to review.'],
 [/^(\d+) pregunta que necesita refuerzo\.$/,'$1 question needs review.'],
 [/^(\d+) preguntas que necesitan refuerzo\.$/,'$1 questions need review.'],
 [/^Repasar (\d+) error(?:es)? pendientes$/,'Review $1 mistakes'],
 [/^Pregunta (\d+) de (\d+) · objetivo (.*)$/,'Question $1 of $2 · objective $3'],
 [/^Resultado del (mini simulacro|entrenamiento)$/,'$1 result'],
 [/^(\d+) respuestas correctas de (\d+)\. Esta puntuación no equivale a la escala de 100–900 de CompTIA\.$/,'$1 correct out of $2. This score is not comparable with CompTIA’s 100–900 score scale.'],
 [/^Respuesta: ([ABCD]) · (.*)$/,'Answer: $1 · $2'],
 [/^Estudiar dominio (\d+)$/,'Study Domain $1'],
 [/^Repasar objetivo (.*)$/,'Review objective $1'],
 [/^Dominio (\d+) · (.*)$/,'Domain $1 · $2'],
 [/^Dominio (\d+)$/,'Domain $1'],
 [/^DOMINIO (\d+) · (.*)$/,'DOMAIN $1 · $2'],
 [/^(\d+)\/(\d+) marcadas como conocidas$/,'$1/$2 marked as known'],
 [/^(\d+)\/\d+ correctas$/,'$1 correct'],
 [/^(\d+) mil caracteres$/,'$1 thousand characters'],
 [/^(\d+)\/2 correctas$/,'$1/2 correct'],
 ];
function translateEnglish(str){
 const t=String(str),original=t.trim();if(!original)return t;
 let out=I18N_STR[original];
 if(!out){
   out=original;
   // Translate source names within text that has a domain number or percentage.
   for(const d of SEC_DOMAINS){
     if(out.includes(d.name))out=out.split(d.name).join(I18N_DATA.domains[d.id]);
   }
   for(const o of SEC_OBJECTIVES){
     if(out.includes(o.name))out=out.split(o.name).join(I18N_DATA.objectives[o.code].name);
   }
   if(original.startsWith('Dominio ')&&original.includes('(')) out=out.replace(/^Dominio /,'Domain ');
   for(const [pattern,replacement] of i18nReplacements){if(pattern.test(out)){out=out.replace(pattern,replacement);break;}}
   if(out===original || out.includes('sin prácticas registradas')){
    out=out.replace('sin prácticas registradas','no practice recorded');
    if(/^([\d.]+)\/28 objetivos$/.test(out))out=out.replace(' objetivos',' objectives');
    if(/^\d+\/\d+ (objetivos|tarjetas)$/.test(out))out=out.replace(' objetivos',' objectives').replace(' tarjetas',' flashcards');
   }
 }
 if(/^Answer: [ABCD] · /.test(out)){const p=out.indexOf(' · ')+3;out=out.slice(0,p)+(I18N_STR[out.slice(p)]||out.slice(p));}
 if(/^Result of /.test(out))out=out.replace('mini simulacro','mini mock exam').replace('entrenamiento','training');
 // Preserve leading/trailing spaces used in rich text templates.
 return t.slice(0,t.indexOf(original))+out+t.slice(t.indexOf(original)+original.length);
}
function localizedText(text){return appLanguage==='en'?translateEnglish(text):text;}
function localizedNotes(t){
 if(!t)return '';
 if(appLanguage==='es')return t.notes||'';
 if(t.notesEn!==undefined)return t.notesEn;
 const original=SEC_OBJECTIVES.find(o=>'sec701-'+o.code===t.id);
 if(!original)return t.notes||'';
 if(t.notes===original.notes)return I18N_DATA.objectives[original.code].notes.join('\n');
 return String(t.notes||'').split('\n').map(line=>I18N_STR[line]||line).join('\n');
}
function localizeDOM(container){
 if(!container||appLanguage!=='en')return;
 const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const n of nodes){
   if(n.parentElement?.closest('style,script,textarea,pre,code, .material-read,[data-untranslated]'))continue;
   const next=translateEnglish(n.nodeValue);if(next!==n.nodeValue)n.nodeValue=next;
 }
 for(const e of container.querySelectorAll('[title],[placeholder],[aria-label]')){
  for(const attr of ['title','placeholder','aria-label']){const v=e.getAttribute(attr);if(v)e.setAttribute(attr,translateEnglish(v));}
 }
 // Leave editable user notes in the original language; show translated starter notes separately.
 const area=container.querySelector('#topic-notes');
 if(area){const current=topic(area.dataset.note);if(current)area.value=localizedNotes(current);}
}
// The language setting is independent of study progress and survives regular backups.
function selectStudyLanguage(next){
 appLanguage=next==='en'?'en':'es';
 document.documentElement.lang=appLanguage;
 localStorage.setItem(LANGUAGE_KEY,appLanguage);
 db.settings=db.settings||{};db.settings.language=appLanguage;
 save();render();
 const modal=document.getElementById('modal-root');
 if(modal?.querySelector('.modal'))settingsModal();
}
// A small switch stays reachable without opening Settings.
const previousRenderBilingual=render;
render=function(){
 previousRenderBilingual();document.documentElement.lang=appLanguage;
 const top=document.querySelector('.top-right');
 if(top){
   const languageControl=document.createElement('label');languageControl.className='lang-control';
   languageControl.innerHTML=`<span aria-hidden="true">🌐</span><span class="sr-only">${appLanguage==='en'?'Language':'Idioma'}</span><select id="quick-language" aria-label="${appLanguage==='en'?'Language':'Idioma'}"><option value="es" ${appLanguage==='es'?'selected':''}>Español</option><option value="en" ${appLanguage==='en'?'selected':''}>English</option></select>`;
   top.insertBefore(languageControl,top.firstChild);
 }
 localizeDOM(document.getElementById('root'));
 if(appLanguage==='en'){const b=document.querySelector('.breadcrumb');if(b)b.textContent='SECURITY+ / '+(I18N_STR[({route:'Ruta guiada',home:'Inicio',security:'Temario',practice:'Tarjetas',questions:'Preguntas',pbq:'Práctica PBQ',material:'Mis apuntes',progress:'Mi progreso'})[view]]||'Study');}
};
// New settings design keeps existing backup and reset actions, with language prominently placed.
settingsModal=function(){
 showModal(appLanguage==='en'?'Settings & backups':'Ajustes y copias de seguridad',`
 <section class="panel" style="box-shadow:none;margin-bottom:13px;border-color:#dcd7ff;background:#faf9ff">
  <div class="setting-heading"><span style="font-size:23px" aria-hidden="true">🌐</span><div><h3 style="margin-bottom:3px">${appLanguage==='en'?'App language':'Idioma de la aplicación'}</h3><p class="small muted" style="margin-bottom:0">${appLanguage==='en'?'Change the interface and built-in study content without losing your progress.':'Cambia la interfaz y el contenido de estudio incluido sin perder tu progreso.'}</p></div></div>
  <div class="language-options"><label class="language-option ${appLanguage==='es'?'chosen':''}"><input type="radio" name="app-language" value="es" ${appLanguage==='es'?'checked':''}><b>Español</b><small>ES</small></label>
  <label class="language-option ${appLanguage==='en'?'chosen':''}"><input type="radio" name="app-language" value="en" ${appLanguage==='en'?'checked':''}><b>English</b><small>EN</small></label></div>
  <p class="small muted" style="margin:10px 0 0">${appLanguage==='en'?'Your own notes and uploaded documents stay in the language in which you wrote them.':'Tus notas personales y documentos importados permanecen en el idioma en el que los escribiste.'}</p>
 </section>
 <p class="small muted" style="line-height:1.7">${appLanguage==='en'?'Your progress is stored locally in this browser. Export a backup before switching browsers or devices.':'Tu progreso se guarda localmente en el navegador. Exporta una copia antes de cambiar de navegador o dispositivo.'}</p>
 <section class="panel" style="box-shadow:none;margin-bottom:13px"><h3>${appLanguage==='en'?'Export backup':'Exportar copia'}</h3><p class="small muted">${appLanguage==='en'?'Save notes, flashcards, resources, and progress to a JSON file.':'Guarda apuntes, tarjetas, materiales y progreso en un archivo JSON.'}</p><button class="button soft" data-action="export">${icon('download')} ${appLanguage==='en'?'Download backup (.json)':'Descargar copia (.json)'}</button></section>
 <section class="panel" style="box-shadow:none;margin-bottom:13px"><h3>${appLanguage==='en'?'Import backup':'Importar copia'}</h3><p class="small muted">${appLanguage==='en'?'Importing a backup replaces the study data currently stored in this browser.':'Importar una copia reemplaza los datos de estudio guardados actualmente en este navegador.'}</p><input id="backup-input" class="input" type="file" accept=".json,application/json"></section>
 <section class="panel" style="box-shadow:none"><h3>${appLanguage==='en'?'Reset progress':'Reiniciar progreso'}</h3><p class="small muted">${appLanguage==='en'?'Remove local progress and restore the original Security+ study content.':'Elimina tu progreso local y restaura el material inicial de Security+.'}</p><button class="button danger tiny" data-action="reset-db">${appLanguage==='en'?'Delete my study data':'Borrar mis datos'}</button></section>`);
};
const previousShowModalBilingual=showModal;
showModal=function(...args){previousShowModalBilingual(...args);localizeDOM(document.getElementById('modal-root'));};
// Don't modify Spanish starter content when English notes are edited.
document.addEventListener('input',function(e){
 const n=e.target;if(appLanguage!=='en'||n.id!=='topic-notes'||!n.dataset.note?.startsWith('sec701-'))return;
 const t=topic(n.dataset.note);if(!t)return;
 t.notesEn=n.value;
 const status=document.getElementById('note-status');if(status)status.textContent='Saving…';
 clearTimeout(noteSaveTimer);noteSaveTimer=setTimeout(()=>{save();if(status)status.textContent='Saved automatically';},420);
 e.stopImmediatePropagation();
},true);
// Language controls are real form inputs, not decorative buttons.
document.addEventListener('change',function(e){
 if(e.target.matches('#quick-language, input[name="app-language"]')){
   selectStudyLanguage(e.target.value);
   e.stopImmediatePropagation();
 }
},true);
// Preserve the language after import, including imports from previous Spanish-only versions.
const previousHandleChangeBilingual=handleChange;
handleChange=function(e){previousHandleChangeBilingual(e);if(e.target.id==='backup-input'){setTimeout(()=>{db.settings.language=appLanguage;save();},600);}};
// Improve English wording in alerts generated by pre-existing actions.
const originalToastBilingual=toast;
toast=function(message,err){return originalToastBilingual(localizedText(message),err)};
// Generate English-language cards from notes entered in English.
const previousGenerateFromBilingual=generateFrom;
generateFrom=function(text,tid,max=24){
 if(appLanguage!=='en'||!tid?.startsWith('sec701-'))return previousGenerateFromBilingual(text,tid,max);
 let added=0;const existing=new Set(db.cards.filter(c=>c.topicId===tid).map(c=>norm(I18N_STR[c.front]||c.front)));
 for(const line of String(text||'').split(/\r?\n/)){
  const hit=line.trim().match(/^([^:]{3,80}):\s*(.{8,550})$/);if(!hit)continue;
  const front=/\?$/.test(hit[1])?hit[1]:`What is ${hit[1].trim()}?`,back=hit[2].trim();
  if(existing.has(norm(front)))continue;
  db.cards.push({id:id(),topicId:tid,front,back,box:0,due:today(),reps:0,createdAt:today()});existing.add(norm(front));added++;
  if(added>=max)break;
 }
 return added;
};
