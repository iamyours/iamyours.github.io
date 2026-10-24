// demo-mode.js - Showcase animation controller for embed mode (?embed=1)

const sceneScript =
  document.querySelector('script[src*="prompt-panel.js"][data-id]') ||
  document.querySelector('script[src*="prompt-panel.js"]') ||
  document.querySelector('script[data-id]');
const sceneId = (sceneScript && sceneScript.dataset && sceneScript.dataset.id) || '';
const baseId = sceneId.replace(/-(?:web|flash|deepseek|kiro-opus|opus)$/, '');

const DEFAULT_BY_BASE = {
  earth: { camera: 'zoom' },
  'cartoon-planet': { camera: 'zoom' },
  'black-hole': { camera: 'zoom', amp: 0.15 }
};

const CONFIG = {
  // jet-engine: cycle explode/assemble
  'jet-engine': { cycle: { period: 6000, steps: [[{ click: '#explode-btn' }], [{ click: '#explode-btn' }]] } },
  'jet-engine-deepseek': { cycle: { period: 6000, steps: [[{ click: '#toggleBtn' }], [{ click: '#toggleBtn' }]] } },
  'jet-engine-kiro-opus': { cycle: { period: 6000, steps: [[{ click: '#explode' }], [{ click: '#explode' }]] } },
  'jet-engine-web': { cycle: { period: 6000, steps: [[{ click: '#explode-btn' }], [{ click: '#explode-btn' }]] } },

  // inline-four: cycle explode/assemble
  'inline-four-deepseek': { cycle: { period: 6000, steps: [[{ click: '#explode-btn' }], [{ click: '#explode-btn' }]] } },
  'inline-four-flash': { cycle: { period: 6000, steps: [[{ click: '#explode-btn' }], [{ click: '#explode-btn' }]] } },
  'inline-four-kiro-opus': { cycle: { period: 6000, steps: [[{ click: '#btnExplode' }], [{ click: '#btnExplode' }]] } },
  'inline-four-web': { cycle: { period: 6000, steps: [[{ click: '#btn-explode' }], [{ click: '#btn-explode' }]] } },

  // lego-ferrari: sweep explode slider
  'lego-ferrari-deepseek': { sweep: { range: '#explodeRange', min: 0, max: 100, period: 6000 } },
  'lego-ferrari-kiro-opus': { sweep: { range: '#sExplode', min: 0, max: 1, period: 6000 } },
  'lego-ferrari-web': { sweep: { range: '#slider-explode', min: 0, max: 100, period: 6000 } },

  // f1-car: ignition and voxel disassemble
  'f1-car-kiro-opus': { start: [{ click: '#btnEngine' }] },
  'f1-car-web': { cycle: { period: 6000, steps: [[{ click: '#btn-explode' }], [{ click: '#btn-explode' }]] } },

  // raptor: ignition and explode
  'raptor-kiro-opus': { start: [{ click: '#btnFire' }], cycle: { period: 6000, steps: [[{ click: '#btnExplode' }], [{ click: '#btnExplode' }]] } },
  'raptor-web': { start: [{ click: '#btn-ignite' }], sweep: { range: '#explode-slider', min: 0, max: 100, period: 6000 } },

  // starship: disassemble view
  'starship-kiro-opus': { cycle: { period: 6000, steps: [[{ click: '#btnExplode' }], [{ click: '#btnExplode' }]] } },

  // temple: cycle explode/reassemble
  'temple': { cycle: { period: 6000, steps: [[{ click: '#btnExplode' }], [{ click: '#btnExplode' }]] } },
  'temple-deepseek': { cycle: { period: 6000, steps: [[{ click: '#btnExplode' }], [{ click: '#btnExplode' }]] } },
  'temple-kiro-opus': { cycle: { period: 6000, steps: [[{ click: '#btnExplode' }], [{ click: '#btnExplode' }]] } },
  'temple-web': { cycle: { period: 6000, steps: [[{ click: '#btn-explode' }], [{ click: '#btn-explode' }]] } },

  // optimus: cycle transform between truck and robot
  'optimus-deepseek': { cycle: { period: 6000, steps: [[{ click: '#morphBtn' }], [{ click: '#morphBtn' }]] } },
  'optimus-kiro-opus': { cycle: { period: 6000, steps: [[{ click: '#btnT' }], [{ click: '#btnT' }]] } },
  'optimus-web': { cycle: { period: 8000, steps: [[{ click: '#btn-transform' }], [{ click: '#btn-transform' }]] } },

  // skyraider: engine on and cycle folding wings
  'skyraider-kiro-opus': { start: [{ click: '#btnEngine' }], cycle: { period: 6000, steps: [[{ click: '#btnFold' }], [{ click: '#btnFold' }]] } },

  // pelican: follow camera mode
  'pelican': { camera: 'own' },
  'pelican-deepseek': { camera: 'own' },
  'pelican-kiro-opus': { camera: 'own', start: [{ click: '#followBtn' }], stop: [{ click: '#followBtn' }] },
  'pelican-opus': { camera: 'own', start: [{ click: '#followBtn' }], stop: [{ click: '#followBtn' }] },
  'pelican-web': { camera: 'own' },

  // sky-arc-train: own cinematic camera
  'sky-arc-train-deepseek': { camera: 'own' },
  'sky-arc-train-kiro-opus': { camera: 'own' },

  // steam-train: follow moving train
  'steam-train-deepseek': { camera: 'follow' },
  'steam-train-kiro-opus': { camera: 'own', start: [{ click: '#followBtn' }], stop: [{ click: '#followBtn' }] },

  // soccer: follow ball or scene follow cam
  'soccer-deepseek': { camera: 'follow' },
  'soccer-kiro-opus': { camera: 'own' },
  'soccer-web': { camera: 'own', start: [{ click: '#btn-cam' }], stop: [{ click: '#btn-cam' }] },

  // sunset-voxel: own gliding fly-through mode
  'sunset-voxel': { camera: 'own', start: [{ click: '#glideToggleBtn' }], stop: [{ click: '#glideToggleBtn' }] },
  // sunset-voxel-deepseek / -web: glide camera stares into the sun (washed-out tile) -> plain orbit

  'sunset-voxel-kiro-opus': { camera: 'own', start: [{ click: '#glideBtn' }], stop: [{ click: '#glideBtn' }] },

  // jp-garden-web: follow flying dragon
  'jp-garden-web': { camera: 'own', start: [{ click: '#btn-dragon-cam' }], stop: [{ click: '#btn-dragon-cam' }] },

  // ice-rink: drop a puck
  'ice-rink-kiro-opus': { camera: 'none', start: [{ text: 'Drop a puck' }], cycle: { period: 7000, steps: [[{ click: '#bRight' }]] } },

  // peashooter: mute audio and activate auto fire
  'peashooter-kiro-opus': { start: [{ click: '#btnSound' }, { click: '#btnAuto' }] },

  // steam-engine: cycle cutaway view
  'steam-engine-kiro-opus': { cycle: { period: 6000, steps: [[{ click: '#btnCut' }], [{ click: '#btnCut' }]] } },
  'steam-engine-web': { cycle: { period: 6000, steps: [[{ click: '#btn-cutaway' }], [{ click: '#btn-cutaway' }]] } },

  // ship-bottle: cycle shake bottle wave effect
  'ship-bottle-kiro-opus': { cycle: { period: 8000, steps: [[{ click: '#btnShake' }]] } },
  'ship-bottle-web': { cycle: { period: 8000, steps: [[{ click: '#shakeBottleBtn' }]] } }
};

const sceneConfig = CONFIG[sceneId] || {};
const baseDefault = DEFAULT_BY_BASE[baseId] || { camera: 'orbit' };
const config = Object.assign({ camera: 'orbit' }, baseDefault, sceneConfig);

let THREE;
try {
  THREE = await import('three');
} catch (e) {}

if (THREE) {
  // three r160 defines WebGLRenderer.render and OrbitControls.update per instance (inside the
  // constructors), so prototype patches of those never run. Use prototype hooks that do exist:
  //  - Scene.prototype.onBeforeRender: called by renderer.render(scene, camera) right before drawing
  //    (after the camera matrices were updated) -> per-frame camera hook;
  //  - EventDispatcher.prototype.dispatchEvent: OrbitControls dispatch 'change'/'start'/'end' ->
  //    lets us find the controls instance (target, autoRotate, min/maxDistance).
  const controlsList = [];
  let probing = false;
  const isControls = (o) => o && o.object && o.object.isCamera && o.target && o.target.isVector3;
  const ED = THREE.EventDispatcher && THREE.EventDispatcher.prototype;
  if (ED && ED.dispatchEvent) {
    const origDispatch = ED.dispatchEvent;
    ED.dispatchEvent = function (event) {
      if (isControls(this)) {
        if (!controlsList.includes(this)) controlsList.push(this);
        // our synthetic probe wheel must not reach the scene's own 'start'/'end' listeners
        if (probing && event && (event.type === 'start' || event.type === 'end')) return;
      }
      return origDispatch.call(this, event);
    };
  }
  // controls that never dispatch on their own (no damping, idle): a zero-delta wheel makes
  // OrbitControls dispatch 'start' without moving the camera.
  function probeControls(canvas) {
    if (controlsList.length || !canvas) return;
    const r = canvas.getBoundingClientRect();
    const init = { deltaY: 0, deltaX: 0, bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
    probing = true;
    try {
      canvas.dispatchEvent(new WheelEvent('wheel', init));
      const top = document.elementFromPoint(init.clientX, init.clientY);
      if (!controlsList.length && top && top !== canvas) top.dispatchEvent(new WheelEvent('wheel', init));
    } catch (e) {}
    probing = false;
  }
  let mainCamera = null;
  let probed = false;
  let firstFrameAt = 0;
  const needsCamera = () => config.camera !== 'own' && config.camera !== 'none';

  // read-only state for tests / debugging
  const debug = { sceneId, mode: config.camera, active: true, frames: 0, ticks: 0, controls: false, cycles: 0, cam: null };
  window.__demoDebug = debug;

  let frameId = 0;
  function onRaf() {
    frameId++;
    requestAnimationFrame(onRaf);
  }
  requestAnimationFrame(onRaf);

  let lastTickFrameId = -1;

  const _offset = new THREE.Vector3();
  const _dir = new THREE.Vector3();
  const _subPos = new THREE.Vector3();
  const _oldTarget = new THREE.Vector3();
  const _targetDelta = new THREE.Vector3();
  const WORLD_Y = new THREE.Vector3(0, 1, 0);

  let pivot = null;
  let baseRadius = null;
  let lastTickTime = null;
  let demoTime = 0;
  let zoomTime = 0;
  let pausedAutoRotate = null;
  let sweepTime = 0;
  let lastSweepStamp = 0;
  let lastSweepTime = 0;
  let isActive = true;

  let startTimer = null;
  let cycleTimer = null;
  let cycleInterval = null;
  let resumeTimer = null;

  function executeAction(act) {
    if (!act) return;
    if (act.click) {
      const el = document.querySelector(act.click);
      if (el) el.click();
    } else if (act.text) {
      const candidates = document.querySelectorAll('button, [role="button"], .btn, label, a.btn, div.btn');
      for (const el of candidates) {
        if (el.textContent && el.textContent.includes(act.text)) {
          el.click();
          break;
        }
      }
    } else if (act.key) {
      const evInit = {
        code: act.key,
        key: act.k || act.key,
        bubbles: true,
        cancelable: true
      };
      const down = new KeyboardEvent('keydown', evInit);
      const up = new KeyboardEvent('keyup', evInit);
      window.dispatchEvent(down);
      document.dispatchEvent(down);
      window.dispatchEvent(up);
      document.dispatchEvent(up);
    } else if (act.range) {
      const el = document.querySelector(act.range);
      if (el) {
        el.value = act.value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else if (act.call) {
      const args = act.args || [];
      if (window.__sceneDemo && typeof window.__sceneDemo[act.call] === 'function') {
        window.__sceneDemo[act.call](...args);
      } else if (typeof window[act.call] === 'function') {
        window[act.call](...args);
      }
    }
  }

  function runActions(actions) {
    if (!actions) return;
    debug.cycles++;
    const list = Array.isArray(actions) ? actions : [actions];
    for (const a of list) {
      try {
        executeAction(a);
      } catch (e) {
        console.warn('[demo-mode] action failed:', a, e);
      }
    }
  }

  function orbitStep(camera, target, speed, dt) {
    _offset.subVectors(camera.position, target);
    _offset.applyAxisAngle(WORLD_Y, speed * dt);
    camera.position.addVectors(target, _offset);
    camera.lookAt(target);
  }

  function followSubject() {
    let subject = window.__sceneDemo && window.__sceneDemo.follow;
    if (typeof subject === 'function') {
      try { subject = subject(); } catch (e) { subject = null; }
    }
    if (!subject) return false;
    if (typeof subject.getWorldPosition === 'function') { subject.getWorldPosition(_subPos); return true; }
    if (typeof subject.x === 'number' && typeof subject.y === 'number' && typeof subject.z === 'number') { _subPos.copy(subject); return true; }
    return false;
  }

  // returns true when the camera was moved (caller refreshes its matrices)
  function tick(camera, controls) {
    if (!isActive || document.hidden) {
      lastTickTime = null;
      return false;
    }
    const now = performance.now() / 1000;
    if (lastTickTime === null) {
      lastTickTime = now;
      return false;
    }
    const dt = Math.min(Math.max(now - lastTickTime, 0), 0.1);
    lastTickTime = now;
    demoTime += dt;
    debug.ticks++;
    debug.controls = !!controls;

    if (config.sweep) runSweep();

    const mode = config.camera || 'orbit';
    if (mode === 'own' || mode === 'none') return false;

    let target;
    if (controls && controls.target) {
      target = controls.target;
    } else {
      if (!pivot) {
        // no OrbitControls: orbit around the point of the view ray closest to the world origin
        camera.getWorldDirection(_dir);
        const s = -camera.position.dot(_dir);
        pivot = camera.position.clone().addScaledVector(_dir, s > 0 ? s : 20);
      }
      target = pivot;
    }

    if (mode === 'follow' && followSubject()) {
      _oldTarget.copy(target);
      target.lerp(_subPos, 1 - Math.exp(-4 * dt));
      _targetDelta.subVectors(target, _oldTarget);
      camera.position.add(_targetDelta);
      orbitStep(camera, target, config.speed !== undefined ? config.speed : 0.12, dt);
      debug.cam = 'follow';
      return true;
    }

    if (mode === 'zoom') {
      _offset.subVectors(camera.position, target);
      if (baseRadius === null) baseRadius = Math.max(_offset.length(), 1e-4);
      const amp = config.amp !== undefined ? config.amp : 0.3;
      const period = config.period !== undefined ? config.period : 16;
      // start at the base distance, zoom in first, then out
      let r = baseRadius * (1 - amp * Math.sin((2 * Math.PI * zoomTime) / period));
      zoomTime += dt;
      if (controls) {
        if (isFinite(controls.minDistance) && controls.minDistance > 0) r = Math.max(r, controls.minDistance);
        if (isFinite(controls.maxDistance) && controls.maxDistance > 0) r = Math.min(r, controls.maxDistance);
      }
      _offset.applyAxisAngle(WORLD_Y, (config.speed !== undefined ? config.speed : 0.18) * dt);
      _offset.setLength(r);
      camera.position.addVectors(target, _offset);
      camera.lookAt(target);
      debug.cam = 'zoom';
      return true;
    }

    // 'orbit' (and 'follow' without a subject)
    if (controls && controls.autoRotate) {
      // the scene's own auto-rotate is frame-based (slow when many tiles share the GPU):
      // pause it during the demo and orbit time-based instead; restored on stop
      controls.autoRotate = false;
      pausedAutoRotate = controls;
    }
    orbitStep(camera, target, config.speed !== undefined ? config.speed : 0.22, dt);
    debug.cam = 'orbit';
    return true;
  }

  function runSweep() {
    const nowMs = performance.now();
    if (nowMs - lastSweepTime < 48) return;
    lastSweepTime = nowMs;
    const { range, min, max, period = 6000 } = config.sweep;
    const el = document.querySelector(range);
    if (!el) return;
    const minVal = min !== undefined ? min : (el.min !== '' ? parseFloat(el.min) : 0);
    const maxVal = max !== undefined ? max : (el.max !== '' ? parseFloat(el.max) : 1);
    sweepTime += (nowMs - (lastSweepStamp || nowMs)) / 1000;
    lastSweepStamp = nowMs;
    const v = minVal + (maxVal - minVal) * (0.5 - 0.5 * Math.cos((2 * Math.PI * sweepTime) / (period / 1000)));
    el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  const SP = THREE.Scene && THREE.Scene.prototype;
  if (SP) {
    const origBefore = SP.onBeforeRender; // inherited no-op from Object3D
    SP.onBeforeRender = function (renderer, scene, camera, renderTarget) {
      try {
        if (camera && camera.isCamera && !(camera.parent && camera.parent.isCubeCamera)) {
          let controls = null;
          for (let i = 0; i < controlsList.length; i++) if (controlsList[i].object === camera) { controls = controlsList[i]; break; }
          // main camera: the OrbitControls' camera, else the first perspective camera rendered
          // (composer scenes render the main pass into a render target, so don't require null)
          if (controls) mainCamera = camera;
          else if (!mainCamera && camera.isPerspectiveCamera) mainCamera = camera;
          if (camera === mainCamera && frameId !== lastTickFrameId) {
            lastTickFrameId = frameId;
            // wait ~30 frames (scene intro / controls set up), then look for the controls once
            if (!probed) {
              if (!firstFrameAt) firstFrameAt = performance.now();
              if (debug.frames++ < 30 && performance.now() - firstFrameAt < 2500) return origBefore && origBefore.apply(this, arguments);
              probed = true;
              if (needsCamera()) probeControls(renderer && renderer.domElement);
              for (let i = 0; i < controlsList.length; i++) if (controlsList[i].object === camera) { controls = controlsList[i]; break; }
            }
            if (tick(camera, controls)) camera.updateMatrixWorld();
          }
        }
      } catch (err) {
        // a demo bug must never break the scene's render
      }
      if (origBefore) return origBefore.apply(this, arguments);
    };
  }

  function startCycles() {
    clearTimeout(cycleTimer);
    clearInterval(cycleInterval);
    cycleTimer = null;
    cycleInterval = null;

    if (config.cycle && config.cycle.steps && config.cycle.steps.length > 0) {
      let cycleIndex = 0;
      const period = config.cycle.period || 6000;
      cycleTimer = setTimeout(() => {
        if (!isActive) return;
        runActions(config.cycle.steps[cycleIndex % config.cycle.steps.length]);
        cycleIndex++;
        cycleInterval = setInterval(() => {
          if (!isActive) return;
          runActions(config.cycle.steps[cycleIndex % config.cycle.steps.length]);
          cycleIndex++;
        }, period);
      }, 3000);
    } else {
      let explodeState = false;
      cycleTimer = setTimeout(() => {
        if (!isActive) return;
        if (window.__sceneDemo && typeof window.__sceneDemo.explode === 'function') {
          explodeState = true;
          try { window.__sceneDemo.explode(true); } catch (e) {}
          cycleInterval = setInterval(() => {
            if (!isActive) return;
            explodeState = !explodeState;
            try { window.__sceneDemo.explode(explodeState); } catch (e) {}
          }, 6000);
        }
      }, 3000);
    }
  }

  function stopDemo() {
    if (!isActive) return;
    isActive = false;
    debug.active = false;
    if (pausedAutoRotate) { pausedAutoRotate.autoRotate = true; pausedAutoRotate = null; }
    lastSweepStamp = 0;
    clearTimeout(startTimer);
    clearTimeout(cycleTimer);
    clearInterval(cycleInterval);
    startTimer = null;
    cycleTimer = null;
    cycleInterval = null;
    pivot = null;
    baseRadius = null;
    lastTickTime = null;
    if (config.stop) {
      runActions(config.stop);
    }
  }

  function startDemo() {
    if (isActive) return;
    clearTimeout(resumeTimer);
    resumeTimer = null;
    isActive = true;
    debug.active = true;
    pivot = null;
    baseRadius = null;
    zoomTime = 0;
    lastSweepStamp = 0;
    lastTickTime = null;

    if (config.start) {
      startTimer = setTimeout(() => {
        if (isActive) runActions(config.start);
      }, 1500);
    }

    startCycles();
  }

  function scheduleResume() {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      if (document.documentElement.classList.contains('pp-embed-hide')) {
        startDemo();
      }
    }, 20000);
  }

  const interactionEvents = ['pointerdown', 'wheel', 'touchstart', 'keydown'];
  function onUserInteraction(e) {
    if (!e.isTrusted) return;
    stopDemo();
    scheduleResume();
  }

  for (const evt of interactionEvents) {
    window.addEventListener(evt, onUserInteraction, { capture: true, passive: true });
  }

  window.addEventListener('pointermove', (e) => {
    if (e.isTrusted && e.buttons > 0 && !isActive) {
      scheduleResume();
    }
  }, { capture: true, passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.isTrusted && !isActive) {
      scheduleResume();
    }
  }, { capture: true, passive: true });

  if (typeof MutationObserver !== 'undefined' && document.documentElement) {
    const classObserver = new MutationObserver(() => {
      const isEmbedHide = document.documentElement.classList.contains('pp-embed-hide');
      // fullscreen keeps the demo running until the user interacts;
      // back in the tile, an idle (stopped) demo resumes shortly
      if (isEmbedHide && !isActive) {
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(startDemo, 3000);
      }
    });
    classObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  // Initial startup
  if (config.start) {
    startTimer = setTimeout(() => {
      if (isActive) runActions(config.start);
    }, 1500);
  }
  startCycles();
}
