import { animate as motionAnimate } from 'motion/mini';
import { animate as animeAnimate } from 'animejs';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/switch/switch.js';
import '@awesome.me/webawesome/dist/styles/themes/default.css';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const preferenceKey = 'applied-ai-interface-motion';
let enabled = true;
try { enabled = localStorage.getItem(preferenceKey) !== 'off'; } catch {}
let currentPage;
let entrance;
let logoSequence;
const presses = new Map();
const permitsMotion = () => enabled && !reduced.matches && !document.hidden;

function stop() {
  entrance?.cancel();
  entrance = undefined;
  const content = document.querySelector('#content');
  content?.style.removeProperty('transform');
  content?.style.removeProperty('opacity');
  logoSequence?.revert();
  logoSequence = undefined;
  for (const [button, animation] of presses) { animation.cancel(); button.style.removeProperty('transform'); }
  presses.clear();
}

function applyPreference() {
  document.documentElement.dataset.motion = permitsMotion() ? 'on' : 'off';
  const toggle = document.querySelector('#interface-motion');
  if (toggle) toggle.checked = enabled;
  const note = document.querySelector('#motion-note');
  if (note) note.textContent = reduced.matches
    ? 'Windows reduced-motion preference is active. Decorative motion is off.'
    : 'Gentle page transitions, button feedback and a brief welcome animation.';
  if (!permitsMotion()) stop();
}

function welcome() {
  if (!permitsMotion()) return;
  const mark = document.querySelector('.brand-mark');
  if (!mark) return;
  logoSequence?.revert();
  // Anime.js owns only this logo sequence; Motion owns content and button transforms.
  logoSequence = animeAnimate(mark, {
    keyframes: [
      { scale: 1.06, filter: 'brightness(1.5)', duration: 360 },
      { scale: 1, filter: 'brightness(1)', duration: 540 }
    ],
    ease: 'inOutSine',
    onComplete: () => { mark.style.removeProperty('transform'); mark.style.removeProperty('filter'); }
  });
}

function render(page) {
  const changed = page !== currentPage;
  currentPage = page;
  stop();
  applyPreference();
  if (changed && permitsMotion()) {
    entrance = motionAnimate(document.querySelector('#content'), {
      opacity: [0.75, 1], transform: ['translateY(7px)', 'translateY(0px)']
    }, { duration: 0.22, ease: 'easeOut' });
    const animation = entrance;
    animation.then(() => { if (entrance === animation) { animation.cancel(); entrance = undefined; const content = document.querySelector('#content'); content?.style.removeProperty('transform'); content?.style.removeProperty('opacity'); } });
    if (page === 'Home') welcome();
  }
}

function nativeButton(event) {
  const button = event.target.closest?.('button');
  return button && !button.disabled && !button.closest('wa-button') ? button : null;
}

function release(button) {
  const previous = presses.get(button);
  if (!previous) return;
  previous.cancel();
  presses.delete(button);
  if (!permitsMotion() || !button.isConnected) { button.style.removeProperty('transform'); return; }
  const animation = motionAnimate(button, { transform: ['scale(.975)', 'scale(1)'] }, { duration: 0.16 });
  presses.set(button, animation);
  animation.then(() => { if (presses.get(button) === animation) { animation.cancel(); button.style.removeProperty('transform'); presses.delete(button); } });
}

document.addEventListener('pointerdown', event => {
  if (!permitsMotion() || event.button !== 0) return;
  const button = nativeButton(event);
  if (!button) return;
  presses.get(button)?.cancel();
  presses.set(button, motionAnimate(button, { transform: 'scale(.975)' }, { duration: 0.08 }));
});
for (const name of ['pointerup', 'pointercancel', 'blur']) {
  window.addEventListener(name, () => { for (const button of [...presses.keys()]) release(button); });
}
document.addEventListener('change', event => {
  if (event.target.id !== 'interface-motion') return;
  enabled = event.target.checked;
  try { localStorage.setItem(preferenceKey, enabled ? 'on' : 'off'); } catch {}
  applyPreference();
});
document.addEventListener('click', event => {
  if (event.target.closest?.('#replay-motion')) welcome();
});
reduced.addEventListener('change', applyPreference);
document.addEventListener('visibilitychange', applyPreference);
window.appEffects = { render, welcome, permitsMotion };
applyPreference();
