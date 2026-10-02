/* Pure palette and preference helpers. No Steam APIs, network or DOM mutation. */
export const VERSION = 1;
export const clamp = (v,a,b) => Math.min(b,Math.max(a,v));
export const hex = rgb => '#'+rgb.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
export function rgb(value) {
  if(!/^#[\da-f]{6}$/i.test(value||'')) throw Error('Use a six-digit hex color, such as #DDBE7C.');
  return [1,3,5].map(i=>parseInt(value.slice(i,i+2),16));
}
export function hsl(c) {
  const [r,g,b]=c.map(v=>v/255), hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo,l=(hi+lo)/2;
  let h=d===0?0:hi===r?((g-b)/d)%6:hi===g?(b-r)/d+2:(r-g)/d+4;
  return [(h*60+360)%360,d===0?0:d/(1-Math.abs(2*l-1)),l];
}
export function fromHsl([h,s,l]) {
  const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
  const v=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
  return v.map(n=>Math.round((n+m)*255));
}
export const luminance = c => c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
export const contrast = (a,b) => (Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
/* Keep the hue. Use same-hue ink or a same-hue light tint, not pure black/white. */
export function inkFor(fill) {
  const [h,s]=hsl(fill), a=fromHsl([h,Math.min(s,.40),.055]),b=fromHsl([h,Math.min(s,.35),.985]);
  return contrast(fill,a)>=contrast(fill,b)?a:b;
}
export function readable(color,surface) {
  let [h,s,l]=hsl(color),direction=luminance(surface)<.35?1:-1;
  for(let i=0;i<100;i++) {
    const candidate=fromHsl([h,s,l]);
    if(contrast(candidate,surface)>=4.5) return candidate;
    l=clamp(l+direction*.01,.01,.99);
  }
  return inkFor(surface);
}
export function vibrant(color) {
  let [h,s,l]=hsl(color);
  if(s<.16) return color;
  return fromHsl([h,clamp(s,.50,.90),clamp(l,.53,.72)]);
}
/* Area is primary; saturation only breaks close ties. Tiny saturated specks
 * cannot beat a substantial gold/teal region. Alpha is part of occupied area. */
export function logoColors(pixels) {
  const bins=[];
  let total=0;
  for(let i=0;i<pixels.length;i+=4) {
    const alpha=pixels[i+3]/255, c=Array.from(pixels.slice(i,i+3)),[h,s,l]=hsl(c);
    if(alpha<.35||s<.18||l<.09||l>.93) continue;
    let bin=bins.find(b=>Math.min(Math.abs(b.h-h),360-Math.abs(b.h-h))<18);
    if(!bin){bin={h,area:0,sum:[0,0,0],sat:0};bins.push(bin);}
    bin.area+=alpha;bin.sat+=s*alpha;total+=alpha;c.forEach((v,j)=>bin.sum[j]+=v*alpha);
  }
  return bins.filter(b=>b.area>=Math.max(2,total*.04)).sort((a,b)=>b.area*(.9+.1*b.sat/b.area)-a.area*(.9+.1*a.sat/a.area))
    .slice(0,5).map(b=>hex(vibrant(b.sum.map(v=>v/b.area))));
}
/* Exact ID paths only. Never key settings to a game title or an arbitrary digit. */
export function keyFromURL(value) {
  if(typeof value!=='string') return null;
  const patterns=[/steam:\/\/(?:rungameid|run)\/(\d+)(?:[/?#]|$)/i,/steam:\/\/nav\/games\/details\/(\d+)(?:[/?#]|$)/i,
    /\/(?:apps|app)\/(\d+)(?:[/?#]|$)/i,/\/librarycache\/(\d+)(?:\/|_(?:hero|logo|icon|library)|\.[a-z])/i,
    /\/grid\/(\d+)_(?:hero|logo|icon)\./i];
  for(const p of patterns){const m=value.match(p);if(m)return 'steam:'+m[1];}
  return null;
}
export function validatePreferences(input) {
  if(!input||input.version!==VERSION||!input.games||Array.isArray(input.games)||typeof input.games!=='object') throw Error('This is not a supported appearance backup.');
  const entries=Object.entries(input.games);if(entries.length>2048)throw Error('This backup contains too many games.');
  const games=Object.create(null);
  for(const [key,v] of entries) {
    if(!/^steam:\d+$/.test(key)||!v||!['custom','neutral'].includes(v.mode)) throw Error('Invalid game preference.');
    if(v.mode==='custom') rgb(v.color);
    games[key]=v.mode==='custom'?{mode:'custom',color:v.color.toUpperCase()}:{mode:'neutral'};
  }
  return {version:VERSION,games};
}
