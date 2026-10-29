/* Arene 3D leggere e decorative. Le regole restano gestite dai minigiochi. */
(function () {
  const mount = (arena, tipo) => {
    if (!window.THREE || !arena) return null;
    const THREE = window.THREE;
    const canvas = document.createElement("canvas");
    canvas.className = "arena3d-canvas";
    canvas.setAttribute("aria-hidden", "true");
    arena.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 3.6, 9);
    camera.lookAt(0, 0, 0);
    const root = new THREE.Group();
    scene.add(root);
    const clock = new THREE.Clock();
    const objects = [];
    const keyMeshes = new Map();
    let alive = true;
    let pulse = 0;

    const mat = (color, emissive = color, intensity = 0.22) => new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: intensity, metalness: 0.35, roughness: 0.38 });
    const addBox = (x, y, z, w, h, d, material, key) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      root.add(mesh);
      objects.push({ mesh, baseY: y, phase: Math.random() * 6 });
      if (key) keyMeshes.set(key.toLowerCase(), mesh);
      return mesh;
    };

    if (tipo === "tastiera") {
      const keys = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
      keys.forEach((row, r) => [...row].forEach((key, i) => {
        const x = (i - (row.length - 1) / 2) * 0.78 + (r === 1 ? 0.18 : r === 2 ? 0.48 : 0);
        const keyMat = mat(0x17253b, 0x00d9ff, 0.18);
        addBox(x, 0, 0.2 - r * 0.72, 0.65, 0.24, 0.58, keyMat, key);
      }));
      addBox(0.25, 0, -2.42, 4.4, 0.24, 0.58, mat(0x17253b, 0xb026ff, 0.2), " ");
      camera.position.set(0, 4.5, 8.7); camera.lookAt(0, 0, -0.7);
    } else if (tipo === "semaforo") {
      addBox(0, 0.25, 0, 1.15, 3.7, 0.7, mat(0x182238, 0x00f0ff, 0.25));
      [0xff334f, 0xffbb33, 0x24f18a].forEach((color, i) => {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 12), mat(color, color, 0.6));
        sphere.position.set(0, 1.35 - i * 1.05, 0.42); root.add(sphere); objects.push({mesh:sphere, baseY:sphere.position.y, phase:i});
      });
      camera.position.set(0, 1.4, 8); camera.lookAt(0, 0, 0);
    } else {
      for (let i = 0; i < 4; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4 - i * 0.28, 0.055, 8, 48), mat(i === 0 ? 0xffd84d : 0x43d9ff, i === 0 ? 0xffa500 : 0x0088ff, 0.4));
        ring.position.set(0, 0.2, -i * 0.08);
        root.add(ring); objects.push({mesh:ring, baseY:ring.position.y, phase:i * 0.8});
      }
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), mat(0xff4466, 0xff0055, 0.7));
      center.position.set(0, 0.2, 0.12); root.add(center); objects.push({mesh:center, baseY:center.position.y, phase:2});
      camera.position.set(0, 1.1, 8); camera.lookAt(0, 0, 0);
    }

    const resize = () => {
      if (!alive) return;
      const w = Math.max(1, arena.clientWidth), h = Math.max(1, arena.clientHeight);
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(arena); resize();
    const loop = () => {
      if (!alive) return;
      const t = clock.getElapsedTime();
      objects.forEach(({mesh, baseY, phase}) => {
        mesh.position.y = baseY + Math.sin(t * 1.5 + phase) * (tipo === "tastiera" ? 0.035 : 0.08);
        if (tipo !== "tastiera") mesh.rotation.z = Math.sin(t * 0.55 + phase) * 0.035;
      });
      root.rotation.y = Math.sin(t * 0.35) * (tipo === "tastiera" ? 0.035 : 0.08);
      if (pulse > 0) { root.scale.setScalar(1 + pulse * 0.025); pulse *= 0.88; if (pulse < 0.01) pulse = 0; }
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    };
    loop();

    return {
      press(key) {
        const mesh = keyMeshes.get(String(key).toLowerCase());
        if (mesh) { mesh.position.y = -0.13; mesh.material.emissiveIntensity = 1.1; setTimeout(() => { if (alive) { mesh.position.y = 0; mesh.material.emissiveIntensity = 0.18; } }, 120); }
        pulse = 1;
      },
      hit() { pulse = 1; },
      dispose() { alive = false; observer.disconnect(); renderer.dispose(); root.clear(); canvas.remove(); }
    };
  };
  window.Arena3D = { mount };
})();
