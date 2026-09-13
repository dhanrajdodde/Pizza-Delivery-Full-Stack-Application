import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import { PizzaModel } from './PizzaModel';
import { FloatingIngredients } from './FloatingIngredients';

// Interactive mouse responsive rig
const InteractiveHeroScene = ({ mousePos }) => {
  const sceneGroupRef = useRef();

  useFrame((_, delta) => {
    if (!sceneGroupRef.current) return;
    // Slow cinematic rotation
    sceneGroupRef.current.rotation.y += delta * 0.25;

    // Subtle response to mouse movement
    const targetRotX = 0.55 + mousePos.y * 0.2;
    const targetRotZ = -mousePos.x * 0.2;
    sceneGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      sceneGroupRef.current.rotation.x,
      targetRotX,
      0.05
    );
    sceneGroupRef.current.rotation.z = THREE.MathUtils.lerp(
      sceneGroupRef.current.rotation.z,
      targetRotZ,
      0.05
    );
  });

  return (
    <group ref={sceneGroupRef} rotation={[0.55, 0, 0]}>
      {/* 3D Pizza Showcase Model */}
      <PizzaModel
        base="Classic"
        sauce="Classic Tomato"
        cheese="Mozzarella"
        vegetables={['Mushroom', 'Tomato', 'Capsicum', 'Olive', 'Spinach']}
        showPepperoni={true}
        showSteam={true}
        scale={1.15}
      />

      {/* Floating ingredients in space */}
      <FloatingIngredients />
    </group>
  );
};

// Fallback 2D visualizer if WebGL fails or is unsupported
const CanvasFallback = () => (
  <div className="w-full h-full flex flex-col items-center justify-center relative">
    <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-pizza-orange/30 p-4 relative animate-pulse-glow">
      <img
        src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"
        alt="Artisan Pizza"
        className="w-full h-full object-cover rounded-full shadow-2xl shadow-pizza-orange/30 animate-spin-slow"
      />
      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-charcoal-950 via-transparent to-transparent opacity-60" />
    </div>
    <span className="text-xs text-slate-400 mt-4 tracking-wider uppercase">
      Artisan 3D Showcase • PizzaVerse
    </span>
  </div>
);

export const HeroPizzaCanvas = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hasError, setHasError] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    setMousePos({ x, y });
  };

  if (hasError) {
    return <CanvasFallback />;
  }

  return (
    <div
      className="w-full h-[460px] lg:h-[580px] relative select-none cursor-grab active:cursor-grabbing"
      onMouseMove={handleMouseMove}
    >
      {/* Background glow radial */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-96 md:h-96 bg-pizza-orange/15 rounded-full blur-3xl pointer-events-none" />

      <Canvas
        camera={{ position: [0, 2.8, 4.5], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
        shadows
        onError={() => setHasError(true)}
      >
        <Suspense fallback={null}>
          {/* Studio Lights */}
          <ambientLight intensity={1.2} />
          <directionalLight
            position={[5, 8, 4]}
            intensity={2.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />
          <pointLight position={[-4, 3, -2]} intensity={1.5} color="#ffaa55" />
          <pointLight position={[3, 2, -3]} intensity={1.0} color="#ff4422" />

          <PresentationControls
            global={false}
            cursor={true}
            snap={true}
            speed={1.5}
            zoom={0.8}
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 6, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
          >
            <InteractiveHeroScene mousePos={mousePos} />
          </PresentationControls>

          {/* Contact Shadow for realism */}
          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.65}
            scale={8}
            blur={2.5}
            far={4}
            color="#000000"
          />
        </Suspense>
      </Canvas>

      {/* Subtle interaction tip */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-charcoal-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[11px] text-slate-400 pointer-events-none flex items-center gap-1.5 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-pizza-orange animate-ping" />
        Interactive 3D • Drag to rotate
      </div>
    </div>
  );
};
