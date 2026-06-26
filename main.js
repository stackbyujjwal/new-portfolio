/**
 * CREATIVE.DEV — Main JavaScript Architecture
 * Merges WebGL Background Shaders, Three.js 3D Physics Engine, Custom Cursor Follower, and Scroll Telemetry.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCursorFollower();
  initBackgroundShader();
  initThreeJSEngine();
  initScrollReveal();
  initNumberCounters();
  initSkillRings();
});

/* ==========================================================================
   1. Custom Cursor Follower
   ========================================================================== */
function initCursorFollower() {
  const cursor = document.getElementById('cursor-follower');
  if (!cursor || window.innerWidth <= 768) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function renderCursor() {
    // Smooth Lerp tracking
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.top = `${cursorY}px`;
    cursor.style.left = `${cursorX}px`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover magnetic interaction on interactive elements
  const interactiveSelector = '.interactive-glass, a, button, input, textarea, .glass-card';
  document.querySelectorAll(interactiveSelector).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
}

/* ==========================================================================
   2. WebGL Background Shader Atmosphere (Ported from Stitch System)
   ========================================================================== */
function initBackgroundShader() {
  const canvas = document.getElementById('shader-canvas');
  if (!canvas) return;

  function syncSize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }
  window.addEventListener('resize', syncSize);
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const vs = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fs = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    varying vec2 v_texCoord;

    void main() {
      vec2 uv = v_texCoord;
      vec2 p = (uv - 0.5) * 2.0;
      p.x *= u_resolution.x / u_resolution.y;
      
      float d = length(p);
      
      // Moving grid lines
      float grid = abs(sin(uv.x * 24.0 + u_time * 0.4)) * abs(sin(uv.y * 24.0 + u_time * 0.4));
      grid = pow(grid, 0.08);
      
      // Soft cosmic gradient waves
      float wave = sin(uv.x * 4.0 + u_time * 0.8) * cos(uv.y * 3.0 - u_time * 0.6);
      wave += 0.5 * sin(uv.x * 8.0 - u_time * 1.0) * cos(uv.y * 6.0 + u_time * 0.9);
      
      // Deep space palette
      vec3 color1 = vec3(0.02, 0.02, 0.04); // Void Black
      vec3 color2 = vec3(0.0, 0.5, 0.7);    // Electric Blue
      vec3 color3 = vec3(0.45, 0.05, 0.65); // Deep Royal Purple
      
      vec3 finalColor = mix(color1, color2, wave * 0.5 + 0.5);
      finalColor = mix(finalColor, color3, d * 0.45);
      
      // Add grid glow
      finalColor += color2 * (1.0 - smoothstep(0.0, 0.03, grid)) * 0.12;
      
      // Fade vignette at edges
      finalColor *= 1.0 - smoothstep(0.5, 1.4, d);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  function createShader(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    return s;
  }

  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl.VERTEX_SHADER, vs));
  gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const pos = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uRes = gl.getUniformLocation(program, 'u_resolution');

  function render(time) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, time * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

/* ==========================================================================
   3. Three.js 3D Creative Engine Background (Hero Icosahedron)
   ========================================================================== */
function initThreeJSEngine() {
  const container = document.getElementById('threejs-container');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || 500;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  // Inner Glowing Core
  const coreGeo = new THREE.IcosahedronGeometry(2.2, 0);
  const coreMat = new THREE.MeshPhongMaterial({
    color: 0x00d2ff,
    wireframe: true,
    emissive: 0x00d2ff,
    emissiveIntensity: 0.6
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Outer Ethereal Shell
  const outerGeo = new THREE.IcosahedronGeometry(3.8, 1);
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0x9d50bb,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });
  const outer = new THREE.Mesh(outerGeo, outerMat);
  group.add(outer);

  // Floating Cyan Particles
  const particlesCount = 800;
  const positions = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 18;
  }
  const particlesGeo = new THREE.BufferGeometry();
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particlesMat = new THREE.PointsMaterial({ color: 0x00f5d4, size: 0.06 });
  const particles = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particles);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0x00d2ff, 2.5);
  pointLight.position.set(6, 6, 6);
  scene.add(pointLight);

  camera.position.z = 10;

  // Parallax mouse interaction
  let mouseTargetX = 0;
  let mouseTargetY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseTargetX = (e.clientX / window.innerWidth - 0.5) * 0.5;
    mouseTargetY = (e.clientY / window.innerHeight - 0.5) * 0.5;
  });

  function animate() {
    requestAnimationFrame(animate);
    
    // Auto rotation
    group.rotation.x += 0.004 + mouseTargetY * 0.05;
    group.rotation.y += 0.007 + mouseTargetX * 0.05;
    particles.rotation.y -= 0.0015;

    // Harmonic Pulse
    const pulse = Math.sin(Date.now() * 0.002) * 0.08 + 1;
    group.scale.set(pulse, pulse, pulse);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    if (!container) return;
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || 500;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

/* ==========================================================================
   4. Scroll Reveal Telemetry
   ========================================================================== */
function initScrollReveal() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

/* ==========================================================================
   5. Animated Number Counters
   ========================================================================== */
function initNumberCounters() {
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateValue(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.count-up').forEach(el => counterObserver.observe(el));
}

function animateValue(el) {
  const target = parseInt(el.getAttribute('data-target'), 10) || 0;
  const duration = 2000;
  const start = 0;
  const startTime = performance.now();

  function updateValue(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // EaseOutExpo curve
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const currentNum = Math.floor(easeProgress * target);
    
    el.textContent = currentNum + (target > 10 ? '+' : '');

    if (progress < 1) {
      requestAnimationFrame(updateValue);
    } else {
      el.textContent = target + '+';
    }
  }
  requestAnimationFrame(updateValue);
}

/* ==========================================================================
   6. Circular Skill Progress Rings
   ========================================================================== */
function initSkillRings() {
  const ringObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const ring = entry.target.querySelector('.ring-progress');
        const percent = parseInt(entry.target.getAttribute('data-percent'), 10) || 80;
        const circumference = 282.7; // 2 * PI * 45
        const offset = circumference - (percent / 100) * circumference;
        
        if (ring) {
          ring.style.strokeDashoffset = offset;
        }
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.ring-container').forEach(el => ringObserver.observe(el));
}

/* ==========================================================================
   7. Contact Form Simulation Protocol
   ========================================================================== */
window.handleFormSubmit = function(e) {
  e.preventDefault();
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  if (!statusEl || !submitBtn) return;

  // Simulate transmission
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = `Transmitting Telemetry... <span class="material-symbols-outlined animate-spin">sync</span>`;
  submitBtn.disabled = true;

  setTimeout(() => {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    form.reset();
    
    statusEl.textContent = "MISSION PARAMETERS RECEIVED. STANDBY FOR QUANTUM ENCRYPTED COMM TRANSMISSION.";
    statusEl.className = "success";
  }, 1500);
};
