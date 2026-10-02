import assert from 'node:assert/strict';
import {logoColors,hsl,rgb,hex,inkFor,contrast,readable,keyFromURL,validatePreferences} from '../adwaita/loew/appearance-core.js';
let checks=0;
function check(ok,msg){assert(ok,msg);checks++;}
function picture(groups){return Uint8ClampedArray.from(groups.flatMap(([color,n,a=255])=>Array.from({length:n},()=>[...rgb(color),a]).flat()));}
let ranked=logoColors(picture([['#DDBE7C',500],['#FF0022',8],['#FFFFFF',700],['#000000',800,0]]));
check(ranked.length===1,'tiny saturated speck is ignored');check(hsl(rgb(ranked[0]))[0]>35&&hsl(rgb(ranked[0]))[0]<50,'gold wins by area');
check(logoColors(picture([['#FFFFFF',500],['#888888',300]])).length===0,'monochrome remains neutral');
check(logoColors(picture([['#00AAFF',100,0],['#AA5522',50]])).length===1,'transparency excluded');
for(const c of ['#DDBE7C','#00EEFF','#F2242A','#112255','#8CAAEE','#FFFF00','#000000','#FFFFFF','#23834C','#A0522D']){
 check(contrast(rgb(c),inkFor(rgb(c)))>=4.5,'tinted button foreground contrast '+c);
 check(!['#000000','#ffffff'].includes(hex(inkFor(rgb(c)))),'foreground is tinted '+c);
 for(const bg of ['#242428','#444448','#FAFAFA'])check(contrast(readable(rgb(c),rgb(bg)),rgb(bg))>=4.5,'link contrast '+c+' '+bg);
}
check(keyFromURL('https://steamloopback.host/librarycache/123_library_logo.png')==='steam:123','cached game ID');
check(keyFromURL('https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_logo.png')==='steam:1091500','store game ID');
check(keyFromURL('steam://rungameid/987')==='steam:987','shortcut ID');
check(keyFromURL('https://example.org/avatar/123.jpg')===null,'never use avatar ID');
check(validatePreferences({version:1,games:{'steam:123':{mode:'custom',color:'#abcd12'}}}).games['steam:123'].color==='#ABCD12','preferences normalize');
for(const value of [{},{version:2,games:{}},{version:1,games:{'Game title':{mode:'neutral'}}},{version:1,games:{'steam:123':{mode:'custom',color:'javascript:evil'}}}]){
 let rejected=false;try{validatePreferences(value);}catch(e){rejected=true;}check(rejected,'invalid preference rejected');
}
console.log(JSON.stringify({suite:'palette / identity / preferences',passed:checks}));
