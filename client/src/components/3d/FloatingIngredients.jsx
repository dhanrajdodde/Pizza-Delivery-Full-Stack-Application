import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const FloatingIngredients = () => {
  const groupRef = useRef();

  // Gentle orbit and floating bobbing
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.15;

    // Children subtle independent bobbing
    groupRef.current.children.forEach((child, idx) => {
      child.position.y += Math.sin(t * 1.5 + idx) * 0.003;
      child.rotation.x += 0.005;
      child.rotation.z += 0.008;
    });
  });

  return (
    <group ref={groupRef}>
      {/* 1. Floating Cherry Tomato */}
      <group position={[2.8, 0.6, 0.8]}>
        <mesh castShadow>
          <sphereGeometry args={[0.28, 20, 20]} />
          <meshStandardMaterial color="#dc2626" roughness={0.25} metalness={0.1} />
        </mesh>
        {/* Little stem */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 6]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>
      </group>

      {/* 2. Floating Artisan Cheese Cube */}
      <mesh castShadow position={[-2.7, 0.8, 1.2]} rotation={[0.4, 0.6, 0.2]}>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
        <meshStandardMaterial color="#fef08a" roughness={0.6} />
      </mesh>

      {/* 3. Floating Button Mushroom */}
      <group position={[-2.4, -0.4, -1.8]} rotation={[0.3, 0.8, -0.4]}>
        <mesh castShadow position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.3, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#c2b2a3" roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.14, 8]} />
          <meshStandardMaterial color="#f5f0eb" roughness={0.9} />
        </mesh>
      </group>

      {/* 4. Floating Black Olive Ring */}
      <mesh castShadow position={[2.4, -0.5, -1.4]} rotation={[1.1, 0.4, 0.9]}>
        <torusGeometry args={[0.22, 0.08, 10, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* 5. Floating Red Chili / Pepper */}
      <mesh castShadow position={[1.8, 1.2, -1.6]} rotation={[0.6, 1.2, 0.4]}>
        <coneGeometry args={[0.12, 0.5, 12]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* 6. Floating Fresh Basil Leaf */}
      <mesh castShadow position={[-1.6, 1.4, 1.8]} rotation={[0.7, 0.2, 0.5]}>
        <sphereGeometry args={[0.3, 12, 8]} scale={[1, 0.1, 1.6]} />
        <meshStandardMaterial color="#15803d" roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
