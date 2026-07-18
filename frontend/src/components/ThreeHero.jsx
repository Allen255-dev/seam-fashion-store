import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeHero({ className = "" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Scene
    const scene = new THREE.Scene();
    const width = el.clientWidth;
    const height = el.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // ─── Floating fabric ribbons ─────────────────────────────────────────────
    const ribbons = [];
    const ribbonCount = 4;

    const palette = [
      new THREE.Color(0x0a0a0a),   // near-black
      new THREE.Color(0x1a1a1a),   // dark charcoal
      new THREE.Color(0x2d2d2d),   // charcoal
      new THREE.Color(0x8b7355),   // warm tan/camel
    ];

    for (let r = 0; r < ribbonCount; r++) {
      const segW = 32;
      const segH = 2;
      const geo = new THREE.PlaneGeometry(3 + r * 0.8, 0.08 + r * 0.04, segW, segH);

      const mat = new THREE.MeshStandardMaterial({
        color: palette[r % palette.length],
        side: THREE.DoubleSide,
        roughness: 0.85,
        metalness: 0.05,
        transparent: true,
        opacity: 0.82 - r * 0.06,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 1.5,
        (r - ribbonCount / 2) * 0.9 + (Math.random() - 0.5) * 0.4,
        -r * 0.3
      );
      mesh.rotation.z = (Math.random() - 0.5) * 0.15;
      scene.add(mesh);

      // Store original vertex positions for wave animation
      const posArr = geo.attributes.position.array.slice();
      ribbons.push({ mesh, geo, posArr, phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.3 });
    }

    // ─── Particle dust field ─────────────────────────────────────────────────
    const particleCount = 260;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      sizes[i] = Math.random() * 3 + 1;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const particleMat = new THREE.PointsMaterial({
      color: 0xc4b49a,
      size: 0.025,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ─── Lighting ─────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xfff5e0, 1.8);
    key.position.set(3, 5, 3);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xd0c8ff, 0.5);
    fill.position.set(-4, -2, 2);
    scene.add(fill);

    // ─── Mouse interaction ───────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    function onMouseMove(e) {
      const rect = el.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
    window.addEventListener("mousemove", onMouseMove);

    // ─── Resize ──────────────────────────────────────────────────────────────
    function onResize() {
      const w = el.clientWidth;
      const h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    // ─── Animation loop ──────────────────────────────────────────────────────
    let frameId;
    let t = 0;

    function animate() {
      frameId = requestAnimationFrame(animate);
      t += 0.012;

      // Animate ribbon wave vertices
      ribbons.forEach(({ geo, posArr, phase, speed, mesh }) => {
        const pos = geo.attributes.position;
        const count = pos.count;
        for (let i = 0; i < count; i++) {
          const ox = posArr[i * 3];
          const oy = posArr[i * 3 + 1];
          // Ripple wave along X axis, modulated by Y
          const wave = Math.sin(ox * 2.5 + t * speed + phase) * 0.04
            + Math.sin(ox * 5 + t * speed * 1.4 + phase * 0.7) * 0.015;
          pos.setZ(i, oy * 0.02 + wave);
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();

        // Subtle drift
        mesh.position.x += Math.sin(t * 0.18 + phase) * 0.0003;
        mesh.position.y += Math.cos(t * 0.14 + phase) * 0.0002;
      });

      // Camera parallax with mouse
      camera.position.x += (mouse.x * 0.3 - camera.position.x) * 0.04;
      camera.position.y += (mouse.y * 0.2 - camera.position.y) * 0.04;

      // Rotate particles slowly
      particles.rotation.y = t * 0.02;
      particles.rotation.x = t * 0.008;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      ribbons.forEach(({ geo, mesh }) => {
        geo.dispose();
        mesh.material.dispose();
      });
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} style={{ width: "100%", height: "100%" }} />;
}
