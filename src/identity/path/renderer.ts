import * as THREE from 'three';
import gsap from 'gsap';
import type { PathRenderer, PathRendererOptions } from './types';

/*
 * O caminho 3D do estudante: cada aula das trilhas disponíveis é um nó num
 * tubo sinuoso. Trechos entre aulas concluídas acendem na cor da trilha,
 * com um pulso de luz correndo por eles; a aula atual pulsa; o resto espera,
 * pontilhado. Poeira estelar ao fundo e câmera que reage ao ponteiro.
 */

const TUBE_VERT = /* glsl */ `
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const TUBE_FRAG = /* glsl */ `
  uniform sampler2D uState;
  uniform float uCount;
  uniform float uTime;
  uniform float uReveal;
  uniform float uGlow;
  varying vec2 vUv;
  varying float vDepth;

  vec4 node(float i) { return texture2D(uState, vec2((i + 0.5) / uCount, 0.5)); }

  void main() {
    float x = vUv.x;
    if (x > uReveal) discard;
    float idx = x * (uCount - 1.0);
    vec4 a = node(floor(idx));
    vec4 b = node(min(floor(idx) + 1.0, uCount - 1.0));
    vec3 hue = mix(a.rgb, b.rgb, fract(idx));
    float lit = min(a.a, b.a);

    // pulso que percorre o trecho aceso
    float pulse = smoothstep(0.06, 0.0, abs(fract(x * 1.5 - uTime * 0.12) - 0.5) - 0.44);
    // pontilhado no trecho ainda não percorrido
    float dash = step(0.55, fract(x * uCount * 3.0));

    // batedor: uma luz fraca que percorre todo o caminho, mostrando o que vem pela frente
    float scout = smoothstep(0.035, 0.0, abs(x - fract(uTime * 0.045)));

    vec3 litColor = hue * (1.1 + pulse * 1.6);
    vec3 dimColor = mix(vec3(0.55, 0.55, 0.68), hue, 0.35) + hue * scout * 1.5;
    float alpha = mix(dash * 0.55 + scout * 0.9, 1.0, lit);
    vec3 color = mix(dimColor, litColor, lit);

    // a ponta do traço brilha enquanto ele se desenha
    float tip = smoothstep(0.03, 0.0, uReveal - x) * step(uReveal, 0.999);
    color += vec3(1.0) * tip;

    if (uGlow > 0.5) {
      alpha = lit * (0.18 + pulse * 0.25);
      color = hue;
    }
    float fog = smoothstep(70.0, 14.0, vDepth) * smoothstep(0.5, 3.0, vDepth);
    gl_FragColor = vec4(color, alpha * fog);
  }
`;

const NODE_VERT = /* glsl */ `
  attribute vec3 aColor;
  attribute float aStatus;
  attribute float aIndex;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uReveal;
  uniform float uCount;
  uniform float uHover;
  varying vec3 vColor;
  varying float vStatus;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float t = aIndex / max(uCount - 1.0, 1.0);
    float shown = smoothstep(t - 0.02, t + 0.01, uReveal);
    float size = aStatus > 1.5 ? 5.0 : (aStatus > 0.5 ? 2.2 : 1.3);
    if (abs(aIndex - uHover) < 0.5) size *= 1.8;
    gl_PointSize = min(size * 170.0 / -mv.z, 90.0) * uPixelRatio * shown;
    gl_Position = projectionMatrix * mv;
    vColor = aColor;
    vStatus = aStatus;
    vAlpha = shown * smoothstep(75.0, 16.0, -mv.z) * smoothstep(0.8, 3.5, -mv.z);
  }
`;

const NODE_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec3 vColor;
  varying float vStatus;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float core = smoothstep(0.16, 0.08, d);
    float halo = pow(smoothstep(0.5, 0.0, d), 2.2);
    vec3 col;
    float alpha;
    if (vStatus > 1.5) {
      // aula atual: núcleo branco, halo da trilha e uma onda que se expande
      float c2 = smoothstep(0.075, 0.035, d);
      float h2 = pow(smoothstep(0.5, 0.0, d), 3.0);
      float wave = fract(uTime * 0.5);
      float ring = smoothstep(0.02, 0.0, abs(d - wave * 0.48)) * (1.0 - wave);
      float ring2 = smoothstep(0.012, 0.0, abs(d - 0.11));
      col = mix(vColor, vec3(1.0), max(c2, ring2 * 0.6));
      alpha = c2 + h2 * 0.9 + ring * 0.8 + ring2 * 0.9;
    } else if (vStatus > 0.5) {
      float h2 = pow(smoothstep(0.5, 0.0, d), 1.6);
      col = mix(vColor, vec3(1.0), core * 0.7);
      alpha = core + h2 * 0.7;
    } else {
      float ring = smoothstep(0.04, 0.0, abs(d - 0.2));
      col = mix(vec3(0.6, 0.6, 0.72), vColor, 0.5);
      alpha = ring * 0.85 + halo * 0.12;
    }
    gl_FragColor = vec4(col, alpha * vAlpha);
  }
`;

const DUST_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vTwinkle;
  varying float vSeed;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = min((1.0 + aSeed * 2.2) * 30.0 / -mv.z, 5.0) * uPixelRatio;
    gl_Position = projectionMatrix * mv;
    vTwinkle = 0.45 + 0.55 * sin(uTime * (0.6 + aSeed * 1.8) + aSeed * 40.0);
    vSeed = aSeed;
  }
`;

const DUST_FRAG = /* glsl */ `
  varying float vTwinkle;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    vec3 uv = vec3(0.545, 0.424, 1.0);
    vec3 plasma = vec3(0.302, 0.882, 1.0);
    vec3 col = mix(uv, plasma, vSeed);
    gl_FragColor = vec4(col, smoothstep(0.5, 0.0, d) * vTwinkle * 0.55);
  }
`;

/** Um caminho que serpenteia para longe: cerca de 1,4 unidade entre aulas. */
function buildCurve(count: number): THREE.CatmullRomCurve3 {
  const n = Math.max(count, 8);
  const length = n * 1.4;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const u = (i / (n - 1)) * length;
    pts.push(new THREE.Vector3(u, Math.sin(u * 0.13) * 2.6 + Math.sin(u * 0.041) * 2.2, Math.cos(u * 0.083) * 5));
  }
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
}

export function createPathRenderer(opts: PathRendererOptions): PathRenderer {
  const { canvas, nodes, animate } = opts;
  const count = nodes.length;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  const world = new THREE.Group();
  scene.add(world);

  const curve = buildCurve(count);

  // Estado por nó numa textura 1×N: rgb = cor da trilha, a = aceso.
  const stateData = new Uint8Array(count * 4);
  const color = new THREE.Color();
  nodes.forEach((n, i) => {
    color.set(n.hue);
    stateData[i * 4] = Math.round(color.r * 255);
    stateData[i * 4 + 1] = Math.round(color.g * 255);
    stateData[i * 4 + 2] = Math.round(color.b * 255);
    stateData[i * 4 + 3] = n.status === 'done' ? 255 : 0;
  });
  const stateTex = new THREE.DataTexture(stateData, count, 1, THREE.RGBAFormat);
  stateTex.magFilter = THREE.NearestFilter;
  stateTex.minFilter = THREE.NearestFilter;
  stateTex.needsUpdate = true;

  const shared = {
    uState: { value: stateTex },
    uCount: { value: count },
    uTime: { value: 0 },
    uReveal: { value: animate ? 0 : 1 },
    uPixelRatio: { value: pixelRatio },
    uHover: { value: -1 },
  };

  const tubeMat = new THREE.ShaderMaterial({
    vertexShader: TUBE_VERT,
    fragmentShader: TUBE_FRAG,
    uniforms: { ...shared, uGlow: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const glowMat = tubeMat.clone();
  glowMat.uniforms = { ...shared, uGlow: { value: 1 } };

  const tubeGeo = new THREE.TubeGeometry(curve, Math.max(400, count * 12), 0.045, 8, false);
  const glowGeo = new THREE.TubeGeometry(curve, Math.max(400, count * 12), 0.3, 10, false);
  world.add(new THREE.Mesh(glowGeo, glowMat), new THREE.Mesh(tubeGeo, tubeMat));

  // Nós
  const nodePositions = new Float32Array(count * 3);
  const nodeColors = new Float32Array(count * 3);
  const nodeStatus = new Float32Array(count);
  const nodeIndex = new Float32Array(count);
  const nodeVecs: THREE.Vector3[] = [];
  nodes.forEach((n, i) => {
    const p = curve.getPointAt(count > 1 ? i / (count - 1) : 0.5);
    nodeVecs.push(p);
    nodePositions.set([p.x, p.y, p.z], i * 3);
    color.set(n.hue);
    nodeColors.set([color.r, color.g, color.b], i * 3);
    nodeStatus[i] = n.status === 'current' ? 2 : n.status === 'done' ? 1 : 0;
    nodeIndex[i] = i;
  });
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
  nodeGeo.setAttribute('aColor', new THREE.BufferAttribute(nodeColors, 3));
  nodeGeo.setAttribute('aStatus', new THREE.BufferAttribute(nodeStatus, 1));
  nodeGeo.setAttribute('aIndex', new THREE.BufferAttribute(nodeIndex, 1));
  const nodeMat = new THREE.ShaderMaterial({
    vertexShader: NODE_VERT,
    fragmentShader: NODE_FRAG,
    uniforms: shared,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  world.add(new THREE.Points(nodeGeo, nodeMat));

  // Poeira estelar
  const DUST = 1400;
  const dustPos = new Float32Array(DUST * 3);
  const dustSeed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    const p = curve.getPointAt(Math.random());
    const r = 4 + Math.random() * 18;
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    dustPos.set([p.x + r * Math.sin(b) * Math.cos(a), p.y + r * Math.cos(b) * 0.7, p.z + r * Math.sin(b) * Math.sin(a)], i * 3);
    dustSeed[i] = Math.random();
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dustSeed, 1));
  const dustMat = new THREE.ShaderMaterial({
    vertexShader: DUST_VERT,
    fragmentShader: DUST_FRAG,
    uniforms: shared,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  world.add(new THREE.Points(dustGeo, dustMat));

  // Câmera em viagem: fica atrás e acima da aula atual, olhando o caminho à frente.
  // O passado fica à esquerda (atrás do texto), o futuro se perde na distância.
  const currentIndex = Math.max(0, nodes.findIndex((n) => n.status === 'current'));
  const target = count > 1 ? currentIndex / (count - 1) : 0;
  const travel = { t: animate ? 0 : target };
  const up = new THREE.Vector3(0, 1, 0);
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const anchor = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  const look = new THREE.Vector3();
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let width = 1;
  let height = 1;
  let distance = 9;

  const placeCamera = (t: number, sway = 0, sway2 = 0) => {
    curve.getPointAt(t, anchor);
    curve.getTangentAt(t, tangent);
    side.crossVectors(tangent, up).normalize();
    camPos
      .copy(anchor)
      .addScaledVector(tangent, -distance * 0.75)
      .addScaledVector(side, distance * 0.65 + sway * 0.8)
      .addScaledVector(up, 2.4 + sway2 * 0.5 - pointer.y * 1.2)
      .addScaledVector(tangent, pointer.x * 1.5);
    look.copy(anchor).addScaledVector(tangent, distance * 0.55).addScaledVector(side, -1);
    camera.position.copy(camPos);
    camera.lookAt(look);
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    distance = camera.aspect < 1 ? 11 : 7;
    if (opts.offsetRight && camera.aspect > 1.6) camera.setViewOffset(width, height, -width * 0.24, -height * 0.04, width, height);
    else if (camera.aspect < 1.2) camera.setViewOffset(width, height, 0, height * 0.22, width, height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(() => {
    resize();
    if (!running) renderOnce();
  });
  ro.observe(canvas);

  // Placas: o nome de cada trilha flutua sobre a primeira aula dela.
  const labels: { el: HTMLElement; pos: THREE.Vector3; t: number }[] = [];
  if (opts.labelLayer) {
    nodes.forEach((n, i) => {
      if (i > 0 && nodes[i - 1].trackTitle === n.trackTitle) return;
      const el = document.createElement('div');
      el.className = 'dp-path-label';
      el.innerHTML = `<span style="background:${n.hue};box-shadow:0 0 10px ${n.hue}"></span>${n.trackTitle}`;
      opts.labelLayer!.appendChild(el);
      labels.push({ el, pos: nodeVecs[i].clone().add(new THREE.Vector3(0, 1.4, 0)), t: count > 1 ? i / (count - 1) : 0 });
    });
  }
  const view = new THREE.Vector3();
  const updateLabels = () => {
    for (const l of labels) {
      view.copy(l.pos).applyMatrix4(world.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
      const depth = -view.z;
      projected.copy(l.pos).applyMatrix4(world.matrixWorld).project(camera);
      const shown = shared.uReveal.value >= l.t ? 1 : 0;
      const fade = depth < 2 ? 0 : Math.min(1, (60 - depth) / 25) * Math.min(1, (depth - 2) / 3);
      const x = (projected.x * 0.5 + 0.5) * width;
      const y = (-projected.y * 0.5 + 0.5) * height;
      l.el.style.opacity = String(Math.max(0, fade) * shown);
      l.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%) scale(${Math.max(0.7, Math.min(1.1, 14 / depth)).toFixed(3)})`;
    }
  };

  // Interação: o nó mais próximo do ponteiro (em pixels) vira "hover".
  const projected = new THREE.Vector3();
  let hoverIndex = -1;
  const pick = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    let best = -1;
    let bestD = 22 * 22;
    for (let i = 0; i < count; i++) {
      projected.copy(nodeVecs[i]).applyMatrix4(world.matrixWorld).project(camera);
      const sx = (projected.x * 0.5 + 0.5) * width;
      const sy = (-projected.y * 0.5 + 0.5) * height;
      const d = (sx - mx) ** 2 + (sy - my) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return { best, rect };
  };
  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    if (e.pointerType !== 'mouse') return;
    const { best } = pick(e.clientX, e.clientY);
    if (best !== hoverIndex) {
      hoverIndex = best;
      shared.uHover.value = best;
      canvas.style.cursor = best >= 0 ? 'pointer' : '';
    }
    if (best >= 0) {
      projected.copy(nodeVecs[best]).applyMatrix4(world.matrixWorld).project(camera);
      opts.onHover({ node: nodes[best], x: (projected.x * 0.5 + 0.5) * width, y: (-projected.y * 0.5 + 0.5) * height });
    } else {
      opts.onHover(null);
    }
    if (!running) renderOnce();
  };
  const onLeave = () => {
    pointer.tx = 0;
    pointer.ty = 0;
    hoverIndex = -1;
    shared.uHover.value = -1;
    canvas.style.cursor = '';
    opts.onHover(null);
  };
  const onClick = (e: MouseEvent) => {
    const { best } = pick(e.clientX, e.clientY);
    if (best >= 0) opts.onSelect(nodes[best]);
  };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('click', onClick);

  const t0 = performance.now();
  let raf = 0;
  let running = false;
  let visible = true;

  const frame = () => {
    const t = (performance.now() - t0) / 1000;
    shared.uTime.value = t;
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    placeCamera(travel.t, Math.sin(t * 0.17), Math.cos(t * 0.13));
    renderer.render(scene, camera);
    updateLabels();
  };
  const renderOnce = () => {
    placeCamera(travel.t);
    renderer.render(scene, camera);
    updateLabels();
  };
  const loop = () => {
    frame();
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (running || !animate || !visible || document.hidden) return;
    running = true;
    loop();
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  });
  io.observe(canvas);
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  let revealTween: gsap.core.Timeline | null = null;
  if (animate) {
    // Abertura: o traço se desenha enquanto a câmera viaja do início até a aula atual.
    revealTween = gsap
      .timeline({ delay: 0.3 })
      .to(shared.uReveal, { value: 1, duration: 3.2, ease: 'power2.inOut' }, 0)
      .to(travel, { t: target, duration: 3.6, ease: 'power3.inOut' }, 0);
    start();
  } else {
    renderOnce();
  }

  return {
    dispose() {
      stop();
      revealTween?.kill();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('click', onClick);
      [tubeGeo, glowGeo, nodeGeo, dustGeo].forEach((g) => g.dispose());
      [tubeMat, glowMat, nodeMat, dustMat].forEach((m) => m.dispose());
      stateTex.dispose();
      labels.forEach((l) => l.el.remove());
      renderer.dispose();
    },
  };
}
