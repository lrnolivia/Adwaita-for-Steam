/* Per-game presentation only. No game actions, Steam API calls or DOM reparenting. */
import {hex,rgb,hsl,inkFor,readable,logoColors,keyFromURL,validatePreferences} from './appearance-core.js';
const VERSION='2026-10-02.3';
if(window.__loewAppearance?.version!==VERSION) {
  window.__loewAppearance?.dispose();window.__loewHeroAccents?.dispose?.();
  const ROOT='div._2Nq6ov7A1hGcHXVOXNt_OE', DOWNLOAD='div._1bq4x9pa4-9RLY-dXWUZTp', CARD='div._1VNuYHM6BPBOJspC6zPf5r';
  const BUTTON='div._1FnJ6dPuknQFQ2RTpKTI16', LABEL='._33cnXIqTRgRr49_FNXIHj6';
  const LOGO='img._3NBxSLAZLbbbnul8KfDFjw, ._3NBxSLAZLbbbnul8KfDFjw img, img._1H3SuC0g9zjHUSMZY2T32U, ._1H3SuC0g9zjHUSMZY2T32U img, img[src*="library_logo"], img[src*="_logo."]';
  const HERO='img.HNbe3eZf6H7dtJ042x1vM, img._2NqL3nV35eJFAu56_Yu-WM, ._2NqL3nV35eJFAu56_Yu-WM img';
  const KEY='loew.appearance.v1', records=new Map(), sampled=new Map(), assets=new Map(), previews=new Map(), cleanups=[];
  let preferences={version:1,games:Object.create(null)},disposed=false,timer=0,dialog=null,updates=0;
  function load(){try {const s=localStorage.getItem(KEY);if(s)preferences=validatePreferences(JSON.parse(s));}catch(e){console.warn('[loew] Appearance preferences unavailable:',e.message);}}
  load();
  const set=(el,k,v)=>{if(el.getAttribute(k)!==v)el.setAttribute(k,v);};
  const prop=(el,k,v)=>{if(el.style.getPropertyValue(k)!==v)el.style.setProperty(k,v);};
  const source=img=>img?.getAttribute('src')||img?.currentSrc||'';
  function identify(scope) {
    for(const el of [scope,...scope.querySelectorAll('[data-appid],[data-app-id]')]) {
      const id=el.getAttribute('data-appid')||el.getAttribute('data-app-id');if(/^\d+$/.test(id||''))return 'steam:'+id;
    }
    for(const node of scope.querySelectorAll(`${LOGO}, ${HERO}, a[href], ._2pjdgFqp04LlhgtFS0rQn_ img, img._1iNIp1p3ZhPoBwZbkmdb8o`)) {
      const key=keyFromURL(node.getAttribute('href')||source(node));if(key)return key;
    }
    const drag=scope.closest('[data-rbd-draggable-id],[data-rfd-draggable-id]');
    const id=drag?.getAttribute('data-rbd-draggable-id')||drag?.getAttribute('data-rfd-draggable-id');
    return /^\d+$/.test(id||'')?'steam:'+id:null;
  }
  function pixels(img) {
    const c=document.createElement('canvas'),scale=Math.min(1,192/Math.max(img.naturalWidth,img.naturalHeight));
    c.width=Math.max(1,Math.round(img.naturalWidth*scale));c.height=Math.max(1,Math.round(img.naturalHeight*scale));
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,c.width,c.height);
    return logoColors(ctx.getImageData(0,0,c.width,c.height).data);
  }
  function sample(img,url) {
    if(sampled.has(url))return sampled.get(url);
    const task=(async()=>{
      try{return pixels(img);}catch(e){
        return await new Promise((resolve,reject)=>{
          const clone=new Image(),timeout=setTimeout(()=>{clone.onload=clone.onerror=null;reject(Error('Logo could not be read.'));},5000);
          clone.crossOrigin='anonymous';
          clone.onload=()=>{clearTimeout(timeout);try{resolve(pixels(clone));}catch(err){reject(err);}};
          clone.onerror=()=>{clearTimeout(timeout);reject(Error('Logo pixel access unavailable.'));};clone.src=url;
        });
      }
    })();
    if(sampled.size>=64)sampled.delete(sampled.keys().next().value);
    sampled.set(url,task);return task;
  }
  function background(scope) {
    const probe=document.createElement('span');probe.dataset.loewOwned='1';probe.style.cssText='position:absolute;visibility:hidden;color:var(--loew-surface-3,var(--adw-window-bg,#242428))';scope.append(probe);
    const v=getComputedStyle(probe).color;probe.remove();
    const c=document.createElement('canvas');c.width=c.height=1;const x=c.getContext('2d');
    x.fillStyle='#242428';try{x.fillStyle=v||'#242428';}catch(_){}x.fillRect(0,0,1,1);
    return Array.from(x.getImageData(0,0,1,1).data).slice(0,3);
  }
  function theme(scope,r) {
    const option=previews.get(r.key)||preferences.games[r.key]||{mode:'logo'};
    const choice=option.mode==='custom'?option.color:option.mode==='logo'?r.colors[0]:null;
    const bg=background(scope),color=choice?rgb(choice):null;
    if(color){
      prop(scope,'--loew-accent-fill',hex(color));prop(scope,'--loew-accent-ink',hex(inkFor(color)));
      prop(scope,'--loew-accent-link',hex(readable(color,bg)));set(scope,'data-loew-palette','sampled');
    } else {
      for(const k of ['--loew-accent-fill','--loew-accent-ink','--loew-accent-link'])scope.style.removeProperty(k);
      set(scope,'data-loew-palette',option.mode==='neutral'?'neutral':r.status);
    }
    set(scope,'data-loew-mode',option.mode);set(scope,'data-loew-runtime','1');
  }
  function addButton(scope,r) {
    const controls=scope.querySelector('._1EAxK56o5a9Nieu5HYkJ4k');if(!controls)return;
    let button=controls.querySelector('.loew-appearance-open');
    if(!button){button=document.createElement('button');button.type='button';button.className='loew-appearance-open';button.dataset.loewOwned='1';button.setAttribute('aria-label','Game appearance');button.title='Game appearance';
      const dot=document.createElement('span');dot.setAttribute('aria-hidden','true');button.append(dot);button.onclick=()=>openEditor(scope,r,button);controls.append(button);}
    button.disabled=!r.key;button.title=r.key?'Game appearance':'Appearance needs a known game ID';
  }
  const label=b=>(b.querySelector(LABEL)?.textContent||b.getAttribute('aria-label')||'').trim().toLowerCase();
  function state(scope,r) {
    for(const b of scope.querySelectorAll(BUTTON)) {
      const text=label(b);let value='other';
      if(b.querySelector('._1I-5YnIcfTZ3hNgBuIz9u-')||/^(stopping|shutting down|force (stop|quit))\b/.test(text))value='stopping';
      else if(text==='stop')value=r.intent==='stopping'?'stopping':'running';
      else if(b.classList.contains('_1Pb6PMh_3L5p5NzuUz0Pp9')||b.getAttribute('aria-disabled')==='true')value='disabled';
      else if(/^(launching|starting)\b/.test(text)||text==='cancel'&&r.intent==='launching')value='launching';
      else if(/^(play|launch|stream)$/.test(text))value=r.intent==='launching'&&Date.now()<r.until?'launching':'ready';
      set(b,'data-loew-state',value);
      if(!b.querySelector(':scope > .loew-action-glow')){const glow=document.createElement('span');glow.className='loew-action-glow';glow.dataset.loewOwned='1';glow.setAttribute('aria-hidden','true');b.append(glow);}
    }
  }
  function updateScope(scope,isDownload) {
    const key=identify(scope),logo=scope.querySelector(LOGO),url=source(logo),signature=(key||'?')+'|'+url;
    let r=records.get(scope);
    if(!r){r={key:null,signature:'',colors:[],status:'pending',epoch:0,intent:null,until:0};records.set(scope,r);}
    if(signature!==r.signature){
      if(dialog?.scope===scope&&key!==r.key)dialog.close();
      r.signature=signature;r.key=key;r.colors=[];r.status=url?'pending':'no-logo';r.epoch++;r.intent=null;
      theme(scope,r);
    }
    const hero=source(scope.querySelector(HERO));
    if(key&&hero){const a=assets.get(key)||{};a.hero=hero;assets.set(key,a);}
    if(isDownload){
      set(scope,'data-loew-download','1');const image=hero||assets.get(key)?.hero;
      set(scope,'data-loew-hero',image?'1':'0');
      if(image)prop(scope,'--loew-download-hero',`url(${JSON.stringify(image)})`);else scope.style.removeProperty('--loew-download-hero');
    }
    if(url&&logo.complete&&logo.naturalWidth&&r.status==='pending') {
      r.status='sampling';const epoch=r.epoch;
      sample(logo,url).then(colors=>{
        if(disposed||!scope.isConnected||epoch!==r.epoch)return;
        r.colors=colors;r.status=colors.length?'sampled':'monochrome';
        if(key){const a=assets.get(key)||{};a.colors=colors;assets.set(key,a);}
        theme(scope,r);schedule();
      }).catch(()=>{if(!disposed&&epoch===r.epoch){r.status='unreadable';theme(scope,r);}});
    }
    if(!url&&key&&assets.get(key)?.colors)r.colors=assets.get(key).colors;
    theme(scope,r);
    if(!isDownload){
      addButton(scope,r);state(scope,r);
      const icon=scope.querySelector('img._1iNIp1p3ZhPoBwZbkmdb8o, ._1iNIp1p3ZhPoBwZbkmdb8o img');
      if(icon?.complete&&icon.naturalWidth&&(!keyFromURL(source(icon))||keyFromURL(source(icon))===key)){
        prop(scope,'--loew-game-icon-image',`url(${JSON.stringify(source(icon))})`);set(scope,'data-loew-game-icon','1');
      }else{scope.style.removeProperty('--loew-game-icon-image');scope.removeAttribute('data-loew-game-icon');}
    }
  }
  function update(){timer=0;if(disposed)return;updates++;
    for(const [scope] of records)if(!scope.isConnected)records.delete(scope);
    document.querySelectorAll(ROOT).forEach(s=>updateScope(s,false));
    document.querySelectorAll(`${DOWNLOAD} ${CARD}`).forEach(s=>updateScope(s,true));
  }
  function schedule(){if(!disposed&&!timer)timer=setTimeout(update,40);}
  function owned(node){return node.nodeType===1&&!!node.closest('[data-loew-owned]');}
  const observer=new MutationObserver(mutations=>{
    const relevant=mutations.filter(m=>!owned(m.target)&&(m.type!=='childList'||[...m.addedNodes,...m.removedNodes].some(n=>!owned(n))));
    if(!relevant.length)return;
    if(relevant.some(m=>m.type==='attributes'&&['src','srcset','data-appid','data-app-id'].includes(m.attributeName)))update();else schedule();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['src','srcset','class','aria-label','aria-disabled','disabled','data-appid','data-app-id']});
  function onClick(e){const b=e.target.closest?.(BUTTON),scope=b?.closest(ROOT),r=records.get(scope);if(!r||b.getAttribute('data-loew-state')==='disabled')return;
    const half=e.target.closest('._2AzIX5kl9k6JnxLfR5H4kX');if(half&&half!==b.querySelector('._2AzIX5kl9k6JnxLfR5H4kX'))return;
    const text=label(b);if(/^(play|launch|stream)$/.test(text)){r.intent='launching';r.until=Date.now()+15000;const t=setTimeout(schedule,15100);cleanups.push(()=>clearTimeout(t));}
    if(text==='stop')r.intent='stopping';state(scope,r);
  }
  const onLoad=e=>{if(e.target instanceof HTMLImageElement&&!owned(e.target))schedule();};
  const onStorage=e=>{if(e.key===KEY){load();update();}};
  document.addEventListener('load',onLoad,true);document.addEventListener('click',onClick,true);window.addEventListener('storage',onStorage);
  const scheme=matchMedia('(prefers-color-scheme: dark)');scheme.addEventListener('change',schedule);
  function element(tag,text,className){const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e;}
  function openEditor(scope,r,trigger){
    if(!r.key)return;dialog?.close();const key=r.key,d=document.createElement('dialog');d.className='loew-appearance-dialog';d.dataset.loewOwned='1';d.scope=scope;
    d.setAttribute('aria-labelledby','loew-appearance-title');
    let draft={...(preferences.games[key]||{mode:'logo'})};
    const title=element('h2','Game appearance');title.id='loew-appearance-title';
    const hint=element('p','Colors for this game only. Green and sienna still show game state.','loew-help');
    const group=element('div',null,'loew-mode-group'), choices=[];
    for(const [mode,text]of [['logo','From logo'],['custom','Custom'],['neutral','Neutral']]){const b=element('button',text);b.type='button';b.onclick=()=>{draft={mode,...(mode==='custom'?{color:input.value}:{})};refresh();};choices.push([mode,b]);group.append(b);}
    const swatches=element('div',null,'loew-swatches');swatches.setAttribute('aria-label','Colors from logo');
    for(const color of r.colors){const b=element('button');b.type='button';b.style.background=color;b.setAttribute('aria-label',`Use logo color ${color}`);b.title=color;b.onclick=()=>{input.value=color;picker.value=color;draft={mode:'custom',color};refresh();};swatches.append(b);}
    const colorLabel=element('label','Custom color','loew-color-row'),picker=document.createElement('input'),input=document.createElement('input');
    picker.type='color';picker.setAttribute('aria-label','Choose custom color');input.type='text';input.maxLength=7;input.setAttribute('aria-label','Hex color');input.spellcheck=false;
    input.value=draft.color||r.colors[0]||'#DDBE7C';picker.value=input.value;
    colorLabel.append(picker,input);
    const preview=element('div',null,'loew-palette-preview'),sampleButton=element('button','Play'),sampleLink=element('span','Link and progress');
    sampleButton.type='button';sampleButton.tabIndex=-1;preview.append(sampleButton,sampleLink);
    const message=element('p',null,'loew-help');message.setAttribute('role','status');
    function refresh(){
      for(const[mode,b]of choices)b.setAttribute('aria-pressed',String(draft.mode===mode));
      const valid=/^#[\da-f]{6}$/i.test(input.value);input.setAttribute('aria-invalid',String(!valid));
      save.disabled=draft.mode==='custom'&&!valid;
      if(draft.mode==='custom'&&valid)draft.color=input.value.toUpperCase();
      if(!save.disabled)previews.set(key,{...draft});theme(scope,r);
      const fill=draft.mode==='neutral'?null:draft.mode==='custom'&&valid?input.value:r.colors[0];
      sampleButton.style.background=fill||'#66666b';sampleButton.style.color=fill?hex(inkFor(rgb(fill))):'#f8f8f8';
      sampleLink.style.color=fill?hex(readable(rgb(fill),background(scope))):'inherit';
      message.textContent=!valid&&draft.mode==='custom'?'Use a six-digit hex color.':!r.colors.length&&draft.mode==='logo'?'No readable colored logo yet. This game stays neutral.':'Preview only until you save.';
    }
    picker.oninput=()=>{input.value=picker.value;draft={mode:'custom',color:input.value};refresh();};
    input.oninput=()=>{draft.mode='custom';if(/^#[\da-f]{6}$/i.test(input.value))picker.value=input.value;refresh();};
    const backup=element('details'),summary=element('summary','Back up / restore colors'),backupText=document.createElement('textarea');
    backupText.setAttribute('aria-label','Appearance backup JSON');backupText.rows=5;backupText.spellcheck=false;
    const exportButton=element('button','Export colors'),importButton=element('button','Restore colors');
    exportButton.type=importButton.type='button';
    exportButton.onclick=()=>{const games={...preferences.games};if(draft.mode==='logo')delete games[key];else games[key]={...draft};backupText.value=JSON.stringify({version:1,games},null,2);backupText.focus();backupText.select();};
    importButton.onclick=()=>{try{const data=validatePreferences(JSON.parse(backupText.value));localStorage.setItem(KEY,JSON.stringify(data));preferences=data;previews.delete(key);update();message.textContent='Colors restored.';}catch(e){message.textContent='Restore stopped: '+e.message;}};
    backup.append(summary,element('p','Settings survive theme-file replacement. Clearing Steam web data can erase them; keep an exported copy.','loew-help'),backupText,exportButton,importButton);
    const actions=element('div',null,'loew-dialog-actions'),reset=element('button','Reset to logo'),cancel=element('button','Cancel'),save=element('button','Save');
    for(const b of [reset,cancel,save])b.type='button';save.className='loew-save';
    reset.onclick=()=>{draft={mode:'logo'};refresh();};cancel.onclick=()=>d.close();
    save.onclick=()=>{try{const games={...preferences.games};if(draft.mode==='logo')delete games[key];else games[key]={...draft};const data=validatePreferences({version:1,games});localStorage.setItem(KEY,JSON.stringify(data));preferences=data;d.close();}catch(e){message.textContent='Could not save. Use Export colors to keep a backup. '+e.message;}};
    d.addEventListener('close',()=>{previews.delete(key);d.remove();if(dialog===d)dialog=null;update();trigger.focus();},{once:true});
    d.addEventListener('click',e=>{if(e.target===d){const b=d.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)d.close();}});
    actions.append(reset,cancel,save);d.append(title,hint,group,swatches,colorLabel,preview,message,backup,actions);document.body.append(d);dialog=d;refresh();d.showModal();
  }
  window.__loewAppearance={version:VERSION,refresh:update,diagnostics:()=>({updates,scopes:[...records.values()].map(r=>({key:r.key,status:r.status,colors:r.colors}))}),dispose(){disposed=true;clearTimeout(timer);observer.disconnect();dialog?.close();cleanups.forEach(fn=>fn());document.removeEventListener('load',onLoad,true);document.removeEventListener('click',onClick,true);window.removeEventListener('storage',onStorage);scheme.removeEventListener('change',schedule);document.querySelectorAll('.loew-appearance-open,.loew-action-glow').forEach(e=>e.remove());}};
  update();
}
