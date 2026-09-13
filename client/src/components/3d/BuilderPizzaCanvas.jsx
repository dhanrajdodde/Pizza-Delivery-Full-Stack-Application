import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { PizzaModel } from './PizzaModel';
import { RotateCw, Eye, Sparkles } from 'lucide-react';

const RotatingBuilderPizza = ({ base, sauce, cheese, vegetables, autoRotate }) => {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={meshRef}>
      <PizzaModel
        base={base}
        sauce={sauce}
        cheese={cheese}
        vegetables={vegetables}
        showPepperoni={false}
        showSteam={true}
        scale={1.25}
      />
    </group>
  );
};

export const BuilderPizzaCanvas = ({
  base = 'Classic',
  sauce = 'Classic Tomato',
  cheese = 'Mozzarella',
  vegetables = [],
}) => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraView, setCameraView] = useState('angle'); // 'angle', 'top', 'side'
  const controlsRef = useRef();

  const setView = (type) => {
    setCameraView(type);
    if (!controlsRef.current) return;

    if (type === 'top') {
      controlsRef.current.object.position.set(0, 4.5, 0.01);
    } else if (type === 'side') {
      controlsRef.current.object.position.set(0, 0.8, 3.8);
    } else {
      controlsRef.current.object.position.set(0, 2.8, 3.6);
    }
    controlsRef.current.update();
  };

  return (
    <div className="w-full h-[400px] md:h-[480px] lg:h-[540px] relative rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/60 via-charcoal-950/80 to-charcoal-950 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pizza-orange/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all backdrop-blur-md border ${
            autoRotate
              ? 'bg-pizza-orange/20 border-pizza-orange/50 text-pizza-orange shadow-glow-orange'
              : 'bg-charcoal-800/80 border-white/10 text-slate-300 hover:bg-charcoal-700'
          }`}
          title="Toggle Auto-Rotation"
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          {autoRotate ? 'Rotating' : 'Paused'}
        </button>

        <div className="flex bg-charcoal-800/80 backdrop-blur-md rounded-lg p-0.5 border border-white/10 text-xs">
          <button
            onClick={() => setView('angle')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              cameraView === 'angle' ? 'bg-pizza-orange text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D
          </button>
          <button
            onClick={() => setView('top')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              cameraView === 'top' ? 'bg-pizza-orange text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Top
          </button>
          <button
            onClick={() => setView('side')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              cameraView === 'side' ? 'bg-pizza-orange text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Side
          </button>
        </div>
      </div>

      {/* Live 3D Spec Badges */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[11px] bg-charcoal-900/90 border border-white/10 text-slate-300 backdrop-blur-md">
            🍞 {base}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] bg-charcoal-900/90 border border-white/10 text-slate-300 backdrop-blur-md">
            🍅 {sauce}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] bg-charcoal-900/90 border border-white/10 text-slate-300 backdrop-blur-md">
            🧀 {cheese}
          </span>
          {vegetables.length > 0 && (
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-pizza-orange/20 border border-pizza-orange/40 text-pizza-orange backdrop-blur-md font-medium">
              🥗 {vegetables.length} Toppings
            </span>
          )}
        </div>

        <span className="text-[11px] text-slate-400 bg-charcoal-900/80 px-2 py-0.5 rounded backdrop-blur-sm">
          Drag to inspect 360°
        </span>
      </div>

      <Canvas
        camera={{ position: [0, 2.8, 3.6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.2} />
          <directionalLight
            position={[5, 8, 4]}
            intensity={2.0}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-3, 2, -2]} intensity={1.2} color="#ffbe76" />
          <pointLight position={[3, 1, 2]} intensity={0.8} color="#ff7979" />

          <RotatingBuilderPizza
            base={base}
            sauce={sauce}
            cheese={cheese}
            vegetables={vegetables}
            autoRotate={autoRotate}
          />

          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minDistance={2.4}
            maxDistance={5.5}
            maxPolarAngle={Math.PI / 2.05} // prevent going below floor
            minPolarAngle={0.1}
          />

          <ContactShadows
            position={[0, -0.65, 0]}
            opacity={0.6}
            scale={6}
            blur={2.0}
            far={3}
            color="#000000"
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
