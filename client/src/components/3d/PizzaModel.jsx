import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural Toppings & Geometry Configs
export const BASE_STYLES = {
  'Classic': { color: '#d4883b', thickness: 0.16, rimRadius: 0.18, roughness: 0.7 },
  'Classic Hand Tossed': { color: '#d4883b', thickness: 0.16, rimRadius: 0.18, roughness: 0.7 },
  'Thin Crust': { color: '#c47934', thickness: 0.08, rimRadius: 0.12, roughness: 0.6 },
  'Cheese Burst': { color: '#f59e0b', thickness: 0.22, rimRadius: 0.24, roughness: 0.5 },
  'Whole Wheat': { color: '#8c5626', thickness: 0.17, rimRadius: 0.18, roughness: 0.9 },
  'Italian Herb': { color: '#8f9460', thickness: 0.16, rimRadius: 0.19, roughness: 0.8 },
};

export const SAUCE_COLORS = {
  'Classic Tomato': '#d92525',
  'Spicy Arrabbiata': '#a80d19',
  'Smoky BBQ': '#4a190b',
  'Garlic Cream': '#f5f0e6',
  'Artisan Pesto': '#2d6a4f',
};

export const CHEESE_COLORS = {
  'Fior di Latte Mozzarella': '#fffce8',
  'Mozzarella': '#fffce8',
  'Sharp Cheddar': '#f59e0b',
  'Cheddar': '#f59e0b',
  'Parmigiano Reggiano': '#fef08a',
  'Parmesan': '#fef08a',
  'Four Cheese Volcano': '#fed7aa',
  'Four Cheese': '#fed7aa',
};

// Procedural topping distribution points (seed-based deterministic coordinates)
const generateToppingPositions = (count, minRadius = 0.4, maxRadius = 1.6) => {
  const positions = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.35;
    const r = minRadius + (Math.sin(i * 1.7) * 0.5 + 0.5) * (maxRadius - minRadius);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const rotY = Math.sin(i * 3) * Math.PI;
    positions.push({ x, z, rotY, scale: 0.85 + (i % 4) * 0.08 });
  }
  return positions;
};

// Steam Particle Cloud
const SteamParticles = () => {
  const particlesRef = useRef();
  const particleCount = 20;

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const ph = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2.0;
      pos[i * 3 + 1] = 0.2 + Math.random() * 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, []);

  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    const arr = particlesRef.current.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3 + 1] += delta * 0.4;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 2 + phases[i]) * 0.005;
      if (arr[i * 3 + 1] > 2.0) {
        arr[i * 3 + 1] = 0.2;
        arr[i * 3] = (Math.random() - 0.5) * 1.8;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#ffffff"
        transparent
        opacity={0.25}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const PizzaModel = ({
  base = 'Classic',
  sauce = 'Classic Tomato',
  cheese = 'Mozzarella',
  vegetables = [],
  showPepperoni = false,
  showSteam = true,
  scale = 1,
}) => {
  const groupRef = useRef();

  // Selected base attributes
  const baseConfig = BASE_STYLES[base] || BASE_STYLES['Classic'];
  const sauceColor = SAUCE_COLORS[sauce] || SAUCE_COLORS['Classic Tomato'];
  const cheeseColor = CHEESE_COLORS[cheese] || CHEESE_COLORS['Mozzarella'];

  // Cache topping positions
  const pepperoniPositions = useMemo(() => generateToppingPositions(8, 0.4, 1.4), []);
  const mushroomPositions = useMemo(() => generateToppingPositions(7, 0.5, 1.5), []);
  const onionPositions = useMemo(() => generateToppingPositions(9, 0.4, 1.5), []);
  const tomatoPositions = useMemo(() => generateToppingPositions(6, 0.6, 1.4), []);
  const capsicumPositions = useMemo(() => generateToppingPositions(8, 0.5, 1.5), []);
  const jalapeñoPositions = useMemo(() => generateToppingPositions(7, 0.4, 1.4), []);
  const olivePositions = useMemo(() => generateToppingPositions(10, 0.5, 1.55), []);
  const cornPositions = useMemo(() => generateToppingPositions(12, 0.3, 1.5), []);
  const spinachPositions = useMemo(() => generateToppingPositions(6, 0.4, 1.3), []);
  const basilPositions = useMemo(() => generateToppingPositions(5, 0.3, 1.2), []);

  const hasVeg = (name) => {
    return vegetables.some((v) => v.toLowerCase().includes(name.toLowerCase()));
  };

  return (
    <group ref={groupRef} scale={scale}>
      {/* 1. PIZZA CRUST & DOUGH */}
      <mesh receiveShadow castShadow position={[0, -baseConfig.thickness / 2, 0]}>
        <cylinderGeometry args={[2.0, 1.95, baseConfig.thickness, 48]} />
        <meshStandardMaterial
          color={baseConfig.color}
          roughness={baseConfig.roughness}
          metalness={0.05}
        />
      </mesh>

      {/* Outer Crust Rim (Puffy border) */}
      <mesh receiveShadow castShadow position={[0, baseConfig.rimRadius * 0.4, 0]}>
        <torusGeometry args={[1.9, baseConfig.rimRadius, 20, 48]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial
          color={baseConfig.color}
          roughness={baseConfig.roughness + 0.1}
          metalness={0.05}
        />
      </mesh>

      {/* 2. SAUCE LAYER */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[1.82, 1.82, 0.02, 40]} />
        <meshStandardMaterial
          color={sauceColor}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* 3. CHEESE LAYER */}
      <mesh receiveShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.03, 40]} />
        <meshStandardMaterial
          color={cheeseColor}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Cheese blister details (golden toasted spots) */}
      {[0.5, 1.1, -0.7, -1.2, 0.2].map((x, idx) => (
        <mesh key={`blister-${idx}`} position={[x, 0.06, Math.sin(idx * 2) * 0.8]}>
          <cylinderGeometry args={[0.15 + (idx % 2) * 0.08, 0.15 + (idx % 2) * 0.08, 0.005, 12]} />
          <meshStandardMaterial color="#d97706" roughness={0.9} opacity={0.6} transparent />
        </mesh>
      ))}

      {/* 4. PEPPERONI TOPPINGS */}
      {showPepperoni &&
        pepperoniPositions.map((pos, i) => (
          <group key={`pep-${i}`} position={[pos.x, 0.07, pos.z]} rotation={[0, pos.rotY, 0]} scale={pos.scale}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.26, 0.26, 0.025, 24]} />
              <meshStandardMaterial color="#991b1b" roughness={0.5} metalness={0.1} />
            </mesh>
            {/* Dark crisp edge */}
            <mesh position={[0, 0.015, 0]}>
              <torusGeometry args={[0.25, 0.02, 8, 20]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color="#581c1c" roughness={0.8} />
            </mesh>
          </group>
        ))}

      {/* 5. MUSHROOMS */}
      {hasVeg('Mushroom') &&
        mushroomPositions.map((pos, i) => (
          <group key={`mush-${i}`} position={[pos.x, 0.07, pos.z]} rotation={[0, pos.rotY, 0.1]} scale={pos.scale * 0.9}>
            {/* Cap */}
            <mesh castShadow position={[0, 0.04, 0]}>
              <sphereGeometry args={[0.16, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#b5a494" roughness={0.8} />
            </mesh>
            {/* Stem */}
            <mesh castShadow position={[0, 0.01, 0]}>
              <cylinderGeometry args={[0.04, 0.05, 0.06, 8]} />
              <meshStandardMaterial color="#ece5dc" roughness={0.9} />
            </mesh>
          </group>
        ))}

      {/* 6. RED ONIONS */}
      {hasVeg('Onion') &&
        onionPositions.map((pos, i) => (
          <mesh
            key={`onion-${i}`}
            position={[pos.x, 0.075, pos.z]}
            rotation={[Math.PI / 2, 0, pos.rotY]}
            scale={pos.scale * 0.8}
            castShadow
          >
            <torusGeometry args={[0.18, 0.03, 8, 16, Math.PI * 0.8]} />
            <meshStandardMaterial color="#86198f" roughness={0.4} />
          </mesh>
        ))}

      {/* 7. SLICED TOMATOES */}
      {hasVeg('Tomato') &&
        tomatoPositions.map((pos, i) => (
          <mesh
            key={`tom-${i}`}
            position={[pos.x, 0.07, pos.z]}
            rotation={[0, pos.rotY, 0]}
            scale={pos.scale}
            castShadow
          >
            <cylinderGeometry args={[0.22, 0.22, 0.02, 16]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.1} />
          </mesh>
        ))}

      {/* 8. CAPSICUM / BELL PEPPER */}
      {(hasVeg('Capsicum') || hasVeg('Bell Pepper')) &&
        capsicumPositions.map((pos, i) => {
          const color = hasVeg('Bell Pepper') && i % 2 === 0 ? '#ea580c' : '#22c55e';
          return (
            <mesh
              key={`cap-${i}`}
              position={[pos.x, 0.08, pos.z]}
              rotation={[Math.PI / 2, 0, pos.rotY]}
              scale={pos.scale * 0.85}
              castShadow
            >
              <torusGeometry args={[0.19, 0.035, 8, 14, Math.PI * 0.6]} />
              <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
            </mesh>
          );
        })}

      {/* 9. JALAPEÑOS */}
      {hasVeg('Jalapeño') &&
        jalapeñoPositions.map((pos, i) => (
          <mesh
            key={`jal-${i}`}
            position={[pos.x, 0.075, pos.z]}
            rotation={[Math.PI / 2, 0, pos.rotY]}
            scale={pos.scale * 0.75}
            castShadow
          >
            <torusGeometry args={[0.13, 0.03, 8, 16]} />
            <meshStandardMaterial color="#15803d" roughness={0.35} />
          </mesh>
        ))}

      {/* 10. BLACK OLIVES */}
      {hasVeg('Olive') &&
        olivePositions.map((pos, i) => (
          <mesh
            key={`olv-${i}`}
            position={[pos.x, 0.075, pos.z]}
            rotation={[Math.PI / 2, 0, pos.rotY]}
            scale={pos.scale * 0.65}
            castShadow
          >
            <torusGeometry args={[0.12, 0.04, 8, 16]} />
            <meshStandardMaterial color="#1e1b18" roughness={0.4} metalness={0.2} />
          </mesh>
        ))}

      {/* 11. GOLDEN SWEET CORN */}
      {hasVeg('Corn') &&
        cornPositions.map((pos, i) => (
          <group key={`corn-${i}`} position={[pos.x, 0.065, pos.z]} scale={pos.scale * 0.65}>
            <mesh position={[0, 0, 0]} castShadow>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#eab308" roughness={0.3} />
            </mesh>
            <mesh position={[0.05, 0, 0.02]} castShadow>
              <sphereGeometry args={[0.038, 8, 8]} />
              <meshStandardMaterial color="#facc15" roughness={0.3} />
            </mesh>
          </group>
        ))}

      {/* 12. BABY SPINACH / BASIL */}
      {hasVeg('Spinach') &&
        spinachPositions.map((pos, i) => (
          <mesh
            key={`spin-${i}`}
            position={[pos.x, 0.08, pos.z]}
            rotation={[-Math.PI / 2 + 0.1, 0, pos.rotY]}
            scale={[pos.scale * 0.25, pos.scale * 0.14, 0.01]}
            castShadow
          >
            <circleGeometry args={[1, 16]} />
            <meshStandardMaterial color="#166534" roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
        ))}

      {/* Subtle rising steam */}
      {showSteam && <SteamParticles />}
    </group>
  );
};
