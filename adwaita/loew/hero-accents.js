/* loew hero accents + action-state presentation.
 * Samples already displayed artwork, never calls Steam APIs or game actions.
 * Starts neutral, boosts sampled art into a bright usable accent, and exposes
 * the current game icon to Activity when Steam already has one in the DOM.
 */
;(() => {
  'use strict';
  if (typeof document === 'undefined') return;

  const VERSION = '2026-10-02.2';
  const previous = window.__loewHeroAccents;
  if (previous?.version === VERSION) return;
  previous?.dispose?.();

  const ROOT = 'div._2Nq6ov7A1hGcHXVOXNt_OE';
  const HERO = 'div._2gZXhRmKUk68pA28-5ZmGQ';
  const BUTTON = 'div._1FnJ6dPuknQFQ2RTpKTI16';
  const TEXT = '._33cnXIqTRgR49_FNXIHj6, ._33cnXIqTRgRr49_FNXIHj6';
  const GAME_ICON = '._1iNIp1p3ZhPoBwZbkmdb8o';

  const props = [
    '--adw-accent-bg','--adw-accent-fg','--adw-accent',
    '--adw-accent-bg-rgb','--adw-accent-fg-rgb','--adw-accent-rgb'
  ];

  const NEUTRAL_BG = [92,95,104];
  const NEUTRAL_FG = [255,255,255];
  const NEUTRAL_LINK = [198,201,210];

  const cache = new Map();
  const records = new Map();
  let timer = 0;
  let disposed = false;

  const lum = rgb => rgb
    .map(v => v / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
    .reduce((s,v,i) => s + v * [.2126,.7152,.0722][i], 0);

  const contrast = (a,b) =>
    (Math.max(lum(a), lum(b)) + .05) / (Math.min(lum(a), lum(b)) + .05);

  const css = rgb => `rgb(${rgb.map(Math.round).join(', ')})`;

  function visible(el) {
    return !!el && el.getClientRects().length > 0;
  }

  function setAttr(el, key, value) {
    if (el.getAttribute(key) !== value) el.setAttribute(key, value);
  }

  function rgbToHsl(rgb) {
    let [r,g,b] = rgb.map(v => v / 255);
    const max = Math.max(r,g,b);
    const min = Math.min(r,g,b);
    const d = max - min;
    let h = 0;
    const l = (max + min) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

    if (d !== 0) {
      if (max === r) h = 60 * (((g - b) / d) % 6);
      else if (max === g) h = 60 * (((b - r) / d) + 2);
      else h = 60 * (((r - g) / d) + 4);
    }

    if (h < 0) h += 360;
    return [h,s,l];
  }

  function hslToRgb([h,s,l]) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let p = [0,0,0];

    if (h < 60) p = [c,x,0];
    else if (h < 120) p = [x,c,0];
    else if (h < 180) p = [0,c,x];
    else if (h < 240) p = [0,x,c];
    else if (h < 300) p = [x,0,c];
    else p = [c,0,x];

    return p.map(v => Math.round((v + m) * 255));
  }

  function vivid(rgb) {
    let [h,s,l] = rgbToHsl(rgb);

    /* Truly monochrome art stays neutral rather than inventing a random hue. */
    if (s < .10) return [116,119,128];

    s = Math.min(.94, Math.max(.70, s * 1.30));
    l = Math.min(.63, Math.max(.52, l < .46 ? l + .16 : l + .06));

    return hslToRgb([h,s,l]);
  }

  function surface(root) {
    const probe = document.createElement('span');
    probe.setAttribute('data-loew-probe','1');
    probe.style.cssText =
      'position:absolute;visibility:hidden;pointer-events:none;' +
      'color:var(--loew-surface-2,var(--adw-window-bg,#242428))';

    root.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();

    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const ctx = c.getContext('2d', {willReadFrequently:true});
    ctx.fillStyle = value;
    ctx.fillRect(0,0,1,1);

    return Array.from(ctx.getImageData(0,0,1,1).data).slice(0,3);
  }

  function palette(pixels) {
    const bins = new Map();

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i+3] < 200) continue;

      const rgb = [pixels[i], pixels[i+1], pixels[i+2]];
      const hi = Math.max(...rgb);
      const lo = Math.min(...rgb);
      const saturation = (hi - lo) / (hi || 1);

      if (hi < 32 || lo > 235 || saturation < .16) continue;

      const key = rgb.map(v => v >> 5).join(',');
      const b = bins.get(key) || {sum:[0,0,0], weight:0};
      const w = .4 + saturation;
      b.weight += w;
      rgb.forEach((v,j) => b.sum[j] += v * w);
      bins.set(key,b);
    }

    if (!bins.size) {
      let sum = 0;
      let n = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i+3] > 200) {
          sum += (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
          n++;
        }
      }
      return Array(3).fill(Math.round(Math.max(65, Math.min(190, sum / (n || 1)))));
    }

    const win = [...bins.values()].sort((a,b) => b.weight - a.weight)[0];
    return win.sum.map(v => Math.round(v / win.weight));
  }

  function readPixels(img) {
    const c = document.createElement('canvas');
    c.width = 48;
    c.height = 32;
    const ctx = c.getContext('2d', {willReadFrequently:true});
    ctx.drawImage(img, 0, 0, 48, 32);
    return palette(ctx.getImageData(0,0,48,32).data);
  }

  async function sample(img, src) {
    if (cache.has(src)) return cache.get(src);

    let color;
    try {
      color = readPixels(img);
    } catch (_) {
      const url = new URL(src, location.href);
      if (!['https:','http:','data:','blob:','file:'].includes(url.protocol))
        throw Error('Unsupported image URL');

      color = await new Promise((resolve,reject) => {
        const clone = new Image();
        clone.crossOrigin = 'anonymous';

        const timeout = setTimeout(() => {
          clone.onload = clone.onerror = null;
          reject(Error('Image timeout'));
        }, 5000);

        clone.onload = () => {
          clearTimeout(timeout);
          try { resolve(readPixels(clone)); }
          catch (e) { reject(e); }
        };

        clone.onerror = () => {
          clearTimeout(timeout);
          reject(Error('Pixel access unavailable'));
        };

        clone.src = src;
      });
    }

    color = vivid(color);

    if (cache.size >= 64) cache.delete(cache.keys().next().value);
    cache.set(src,color);
    return color;
  }

  function applyValues(root, bg, fg, link) {
    const values = [
      css(bg), css(fg), css(link),
      bg.map(Math.round).join(','),
      fg.map(Math.round).join(','),
      link.map(Math.round).join(',')
    ];
    props.forEach((key,i) => root.style.setProperty(key, values[i]));
  }

  function applyNeutral(root, state='pending') {
    applyValues(root, NEUTRAL_BG, NEUTRAL_FG, NEUTRAL_LINK);
    setAttr(root, 'data-loew-palette', state);
  }

  function apply(root, color) {
    const bg = surface(root.querySelector('div._2iE-78WxX2Pj4GHbq7YJiA') || root);
    const foreground =
      contrast(color,[255,255,255]) >= contrast(color,[0,0,0])
        ? [255,255,255] : [0,0,0];

    let link = color.slice();
    const toward = lum(bg) < .4 ? 255 : 0;

    for (let i = 0; i < 30 && contrast(link,bg) < 4.5; i++)
      link = link.map(v => v + (toward - v) * .1);

    applyValues(root, color, foreground, link.map(Math.round));
    setAttr(root, 'data-loew-palette', 'sampled');

    root.dispatchEvent(new CustomEvent('loew:palette', {
      detail: {background:color, foreground, link:link.map(Math.round)}
    }));
  }

  function clearPalette(root, record) {
    for (const key of props) {
      const saved = record.original.get(key);
      if (saved.value) root.style.setProperty(key, saved.value, saved.priority);
      else root.style.removeProperty(key);
    }
  }

  function updateGameIcon(root) {
    const icon = root.querySelector(GAME_ICON);
    if (!icon) {
      root.style.removeProperty('--loew-game-icon-image');
      root.removeAttribute('data-loew-game-icon');
      return;
    }

    const src =
      (icon instanceof HTMLImageElement && (icon.currentSrc || icon.src)) ||
      getComputedStyle(icon).backgroundImage;

    if (!src || src === 'none') {
      root.style.removeProperty('--loew-game-icon-image');
      root.removeAttribute('data-loew-game-icon');
      return;
    }

    const imageValue = src.startsWith('url(') ? src : `url(${JSON.stringify(src)})`;
    root.style.setProperty('--loew-game-icon-image', imageValue);
    setAttr(root, 'data-loew-game-icon', '1');
  }

  function updateActions(root, r) {
    const now = Date.now();

    for (const button of root.querySelectorAll(BUTTON)) {
      const label =
        (button.querySelector(TEXT)?.textContent ||
         button.getAttribute('aria-label') || '')
        .trim().toLowerCase();

      let state = 'ready';

      if (
        button.querySelector('._1I-5YnIcfTZ3hNgBuIz9u-') ||
        /^(stopping|shutting down|force (stop|quit))\b/.test(label)
      ) state = 'stopping';
      else if (/^stop$/.test(label))
        state = r.intent === 'stopping' ? 'stopping' : 'running';
      else if (/^(launching|starting|cancel)\b/.test(label))
        state = 'launching';
      else if (/^(play|launch|stream)$/.test(label)) {
        if (r.intent === 'launching' && now < r.until) state = 'launching';
        else {
          r.intent = null;
          state = 'ready';
        }
      } else if (button.classList.contains('_1Pb6PMh_3L5p5NzuUz0Pp9'))
        state = 'disabled';
      else
        state = 'other';

      setAttr(button, 'data-loew-state', state);
    }
  }

  function update() {
    timer = 0;
    if (disposed) return;

    for (const [root,r] of records) {
      if (!root.isConnected) {
        clearPalette(root,r);
        records.delete(root);
      }
    }

    for (const root of document.querySelectorAll(ROOT)) {
      if (!visible(root)) continue;

      let r = records.get(root);

      if (!r) {
        r = {
          src:null,
          epoch:0,
          intent:null,
          until:0,
          original:new Map(props.map(k => [
            k,
            {
              value:root.style.getPropertyValue(k),
              priority:root.style.getPropertyPriority(k)
            }
          ]))
        };
        records.set(root,r);
        applyNeutral(root);
      }

      setAttr(root,'data-loew-runtime','1');
      updateGameIcon(root);

      const hero = root.querySelector(HERO);
      const img = hero?.querySelector(
        'img.HNbe3eZf6H7dtJ042x1vM, img[src*="library_hero"], img[src*="_hero."]'
      );
      const src = img?.currentSrc || img?.src || '';

      if (src !== r.src) {
        r.src = src;
        r.epoch++;
        r.intent = null;
        applyNeutral(root, src ? 'pending' : 'neutral');

        if (src && img.complete && img.naturalWidth) {
          const epoch = r.epoch;
          sample(img,src).then(color => {
            if (!disposed && root.isConnected && epoch === r.epoch)
              apply(root,color);
          }).catch(() => {
            if (epoch === r.epoch) applyNeutral(root,'fallback');
          });
        } else if (src) {
          r.src = null;
        }
      }

      updateActions(root,r);
    }
  }

  function schedule() {
    if (!disposed && !timer) timer = setTimeout(update,100);
  }

  const observer = new MutationObserver(records => {
    if (records.some(r =>
      r.type !== 'childList' ||
      [...r.addedNodes,...r.removedNodes]
        .some(n => !(n.nodeType === 1 && n.hasAttribute('data-loew-probe')))
    )) schedule();
  });

  observer.observe(document.documentElement, {
    subtree:true,
    childList:true,
    characterData:true,
    attributes:true,
    attributeFilter:['src','srcset','class','aria-label','disabled','style']
  });

  function onLoad(e) {
    if (e.target instanceof HTMLImageElement &&
        (e.target.closest(HERO) || e.target.matches(GAME_ICON)))
      schedule();
  }

  function onClick(e) {
    const button = e.target.closest?.(BUTTON);
    const root = button?.closest(ROOT);
    const r = records.get(root);

    if (!r || button.classList.contains('_1Pb6PMh_3L5p5NzuUz0Pp9')) return;

    const child = e.target.closest('._2AzIX5kl9k6JnxLfR5H4kX');
    if (child && child !== button.querySelector('._2AzIX5kl9k6JnxLfR5H4kX')) return;

    const label = (button.querySelector(TEXT)?.textContent || '').trim().toLowerCase();

    if (/^(play|launch|stream)$/.test(label)) {
      r.intent = 'launching';
      r.until = Date.now() + 15000;
      setTimeout(schedule,15100);
    }

    if (label === 'stop') r.intent = 'stopping';

    updateActions(root,r);
    schedule();
  }

  const scheme = matchMedia('(prefers-color-scheme: dark)');

  function onScheme() {
    for (const [root,r] of records) {
      if (cache.has(r.src)) apply(root,cache.get(r.src));
      else applyNeutral(root, r.src ? 'pending' : 'neutral');
    }
  }

  scheme.addEventListener('change',onScheme);
  document.addEventListener('load',onLoad,true);
  document.addEventListener('click',onClick,true);

  const api = {
    version:VERSION,
    refresh:schedule,
    dispose() {
      disposed = true;
      clearTimeout(timer);
      observer.disconnect();
      scheme.removeEventListener('change',onScheme);
      document.removeEventListener('load',onLoad,true);
      document.removeEventListener('click',onClick,true);

      for (const [root,r] of records) {
        clearPalette(root,r);
        root.removeAttribute('data-loew-runtime');
        root.removeAttribute('data-loew-palette');
        root.removeAttribute('data-loew-game-icon');
        root.style.removeProperty('--loew-game-icon-image');
        root.querySelectorAll(BUTTON)
          .forEach(b => b.removeAttribute('data-loew-state'));
      }
    }
  };

  window.__loewHeroAccents = api;

  /* First pass is synchronous so the system accent never gets a chance to flash. */
  update();
  console.info('[loew] Hero accent observer ready', VERSION);
})();
