/* loew hero accents + action-state presentation. No Steam API calls or game actions.
 * Runs in the Library document. Samples already displayed artwork, never logos.
 * If the browser denies pixel access, retain the installed theme accent and mark
 * the fallback instead of inventing a palette or reusing the previous game's.
 */
;(() => {
  'use strict';
  if (typeof document === 'undefined') return;
  const VERSION = '2026-10-02.1';
  const previous = window.__loewHeroAccents;
  if (previous?.version === VERSION) return;
  previous?.dispose?.();
  const ROOT = 'div._2Nq6ov7A1hGcHXVOXNt_OE';
  const HERO = 'div._2gZXhRmKUk68pA28-5ZmGQ';
  const BUTTON = 'div._1FnJ6dPuknQFQ2RTpKTI16';
  const TEXT = '._33cnXIqTRgRr49_FNXIHj6';
  const props = ['--adw-accent-bg','--adw-accent-fg','--adw-accent',
    '--adw-accent-bg-rgb','--adw-accent-fg-rgb','--adw-accent-rgb'];
  const cache = new Map();
  const records = new Map();
  let timer = 0, disposed = false;
  const lum = rgb => rgb.map(v => v/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4)
    .reduce((s,v,i) => s+v*[.2126,.7152,.0722][i],0);
  const contrast = (a,b) => (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  const css = rgb => `rgb(${rgb.map(Math.round).join(', ')})`;
  function visible(el) { return !!el && el.getClientRects().length > 0; }
  function setAttr(el,key,value) { if (el.getAttribute(key)!==value) el.setAttribute(key,value); }
  function surface(root) {
    const probe = document.createElement('span');
    probe.setAttribute('data-loew-probe','1');
    probe.style.cssText='position:absolute;visibility:hidden;pointer-events:none;color:var(--loew-surface-2,var(--adw-window-bg,#242428))';
    root.append(probe);
    const value=getComputedStyle(probe).color;
    probe.remove();
    const c=document.createElement('canvas'); c.width=c.height=1;
    const ctx=c.getContext('2d',{willReadFrequently:true});
    ctx.fillStyle=value; ctx.fillRect(0,0,1,1);
    return Array.from(ctx.getImageData(0,0,1,1).data).slice(0,3);
  }
  function palette(pixels) {
    const bins=new Map();
    for (let i=0;i<pixels.length;i+=4) {
      if (pixels[i+3]<200) continue;
      const rgb=[pixels[i],pixels[i+1],pixels[i+2]];
      const hi=Math.max(...rgb), lo=Math.min(...rgb), saturation=(hi-lo)/(hi||1);
      if (hi<32 || lo>235 || saturation<.16) continue;
      const key=rgb.map(v=>v>>5).join(',');
      const b=bins.get(key)||{sum:[0,0,0],weight:0,count:0};
      const w=.4+saturation;
      b.weight+=w; b.count++;
      rgb.forEach((v,j)=>b.sum[j]+=v*w); bins.set(key,b);
    }
    if (!bins.size) {
      /* Monochrome art still produces a neutral sampled accent. */
      let sum=0,n=0;
      for(let i=0;i<pixels.length;i+=4) if(pixels[i+3]>200) {sum+=(pixels[i]+pixels[i+1]+pixels[i+2])/3;n++;}
      return Array(3).fill(Math.round(Math.max(65,Math.min(190,sum/(n||1)))));
    }
    const win=[...bins.values()].sort((a,b)=>b.weight-a.weight)[0];
    return win.sum.map(v=>Math.round(v/win.weight));
  }
  function readPixels(img) {
    const c=document.createElement('canvas'); c.width=48; c.height=32;
    const ctx=c.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(img,0,0,48,32);
    return palette(ctx.getImageData(0,0,48,32).data);
  }
  async function sample(img,src) {
    if (cache.has(src)) return cache.get(src);
    let color;
    try { color=readPixels(img); }
    catch (_) {
      /* Retry only the existing image URL using ordinary CORS, no bypass. */
      const url=new URL(src,location.href);
      if (!['https:','http:','data:','blob:','file:'].includes(url.protocol)) throw Error('Unsupported image URL');
      color=await new Promise((resolve,reject)=>{
        const clone=new Image(); clone.crossOrigin='anonymous';
        const timeout=setTimeout(()=>{clone.onload=clone.onerror=null;reject(Error('Image timeout'));},5000);
        clone.onload=()=>{clearTimeout(timeout);try{resolve(readPixels(clone));}catch(e){reject(e);}};
        clone.onerror=()=>{clearTimeout(timeout);reject(Error('Pixel access unavailable'));};
        clone.src=src;
      });
    }
    if(cache.size>=64) cache.delete(cache.keys().next().value);
    cache.set(src,color); return color;
  }
  function apply(root,color) {
    const bg=surface(root.querySelector("div._2iE-78WxX2Pj4GHbq7YJiA")||root);
    const foreground=contrast(color,[255,255,255])>=contrast(color,[0,0,0])?[255,255,255]:[0,0,0];
    /* Links need 4.5:1 against neutral surfaces, not just the button fill. */
    let link=color.slice();
    const toward=lum(bg)<.4?255:0;
    for(let i=0;i<30 && contrast(link,bg)<4.5;i++) link=link.map(v=>v+(toward-v)*.1);
    const values=[css(color),css(foreground),css(link),color.join(','),foreground.join(','),link.map(Math.round).join(',')];
    props.forEach((key,i)=>root.style.setProperty(key,values[i]));
    setAttr(root,'data-loew-palette','sampled');
    root.dispatchEvent(new CustomEvent('loew:palette',{detail:{background:color,foreground,link:link.map(Math.round)}}));
  }
  function clearPalette(root,record) {
    for(const key of props) {
      const saved=record.original.get(key);
      if(saved.value) root.style.setProperty(key,saved.value,saved.priority);
      else root.style.removeProperty(key);
    }
  }
  function updateActions(root,r) {
    const now=Date.now();
    for(const button of root.querySelectorAll(BUTTON)) {
      const label=(button.querySelector(TEXT)?.textContent||button.getAttribute('aria-label')||'').trim().toLowerCase();
      let state='ready';
      if(button.querySelector('._1I-5YnIcfTZ3hNgBuIz9u-') || /^(stopping|shutting down|force (stop|quit))\b/.test(label)) state='stopping';
      else if(/^stop$/.test(label)) state=r.intent==='stopping'?'stopping':'running';
      else if(/^(launching|starting|cancel)\b/.test(label)) state='launching';
      else if(/^(play|launch|stream)$/.test(label)) {
        if(r.intent==='launching' && now<r.until) state='launching';
        else {r.intent=null;state='ready';}
      } else if(button.classList.contains('_1Pb6PMh_3L5p5NzuUz0Pp9')) state='disabled';
      else state='other';
      setAttr(button,'data-loew-state',state);
    }
  }
  function update() {
    timer=0; if(disposed) return;
    for(const [root,r] of records) if(!root.isConnected) {clearPalette(root,r);records.delete(root);}
    for(const root of document.querySelectorAll(ROOT)) {
      if(!visible(root)) continue;
      let r=records.get(root);
      if(!r) {
        r={src:null,epoch:0,intent:null,until:0,original:new Map(props.map(k=>[k,{value:root.style.getPropertyValue(k),priority:root.style.getPropertyPriority(k)}]))};
        records.set(root,r);
      }
      setAttr(root,'data-loew-runtime','1');
      const hero=root.querySelector(HERO);
      const img=hero?.querySelector('img.HNbe3eZf6H7dtJ042x1vM, img[src*="library_hero"], img[src*="_hero."]');
      const src=img?.currentSrc||img?.src||'';
      if(src!==r.src) {
        r.src=src; r.epoch++; r.intent=null; clearPalette(root,r);
        setAttr(root,'data-loew-palette',src?'pending':'no-hero');
        if(src && img.complete && img.naturalWidth) {
          const epoch=r.epoch;
          sample(img,src).then(color=>{
            if(!disposed && root.isConnected && epoch===r.epoch) apply(root,color);
          }).catch(()=>{
            if(epoch===r.epoch) setAttr(root,'data-loew-palette','fallback');
          });
        } else if(src) r.src=null; // load event will retry; do not spin on pixels.
      }
      updateActions(root,r);
    }
  }
  function schedule() { if(!disposed && !timer) timer=setTimeout(update,100); }
  const observer=new MutationObserver(records=>{
    // Ignore our own invisible color probe and presentation attributes.
    if(records.some(r=>r.type!=='childList'||[...r.addedNodes,...r.removedNodes].some(n=>!(n.nodeType===1 && n.hasAttribute('data-loew-probe'))))) schedule();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['src','srcset','class','aria-label','disabled']});
  function onLoad(e) {if(e.target instanceof HTMLImageElement && e.target.closest(HERO)) schedule();}
  function onClick(e) {
    const button=e.target.closest?.(BUTTON),root=button?.closest(ROOT),r=records.get(root);
    if(!r||button.classList.contains('_1Pb6PMh_3L5p5NzuUz0Pp9')) return;
    const child=e.target.closest('._2AzIX5kl9k6JnxLfR5H4kX');
    if(child && child!==button.querySelector('._2AzIX5kl9k6JnxLfR5H4kX')) return; // streaming dropdown
    const label=(button.querySelector(TEXT)?.textContent||'').trim().toLowerCase();
    if(/^(play|launch|stream)$/.test(label)) {r.intent='launching';r.until=Date.now()+15000;setTimeout(schedule,15100);}
    if(label==='stop') r.intent='stopping';
    updateActions(root,r); schedule(); // Observe only; never intercept the click.
  }
  const scheme=matchMedia('(prefers-color-scheme: dark)');
  function onScheme(){for(const[root,r]of records){if(cache.has(r.src)) apply(root,cache.get(r.src));}}
  scheme.addEventListener('change',onScheme);
  document.addEventListener('load',onLoad,true);
  document.addEventListener('click',onClick,true);
  const api={version:VERSION, refresh:schedule, dispose(){disposed=true;clearTimeout(timer);observer.disconnect();scheme.removeEventListener('change',onScheme);document.removeEventListener('load',onLoad,true);document.removeEventListener('click',onClick,true);for(const[root,r]of records){clearPalette(root,r);root.removeAttribute('data-loew-runtime');root.removeAttribute('data-loew-palette');root.querySelectorAll(BUTTON).forEach(b=>b.removeAttribute('data-loew-state'));}}};
  window.__loewHeroAccents=api;
  schedule();
  console.info('[loew] Hero accent observer ready',VERSION);
})();
