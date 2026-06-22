import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 150;
const MAX_DISTANCE = 3.5;

const ParticleConstellation: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const { mouse, viewport } = useThree();

  // Initialize particle positions and velocities
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return [pos, vel];
  }, []);

  const linePositions = useMemo(() => new Float32Array(PARTICLE_COUNT * PARTICLE_COUNT * 3), []);
  const lineColors = useMemo(() => new Float32Array(PARTICLE_COUNT * PARTICLE_COUNT * 3), []);

  const pointGeoRef = useRef<THREE.BufferGeometry>(null);
  const lineGeoRef = useRef<THREE.BufferGeometry>(null);

  useFrame(() => {
    if (!pointsRef.current || !linesRef.current || !pointGeoRef.current || !lineGeoRef.current) return;

    // Mouse parallax effect
    const targetX = (mouse.x * viewport.width) / 10;
    const targetY = (mouse.y * viewport.height) / 10;
    
    // Animate positions
    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Apply velocity
      positions[i * 3] += velocities[i * 3];
      positions[i * 3 + 1] += velocities[i * 3 + 1];
      positions[i * 3 + 2] += velocities[i * 3 + 2];

      // Bounce off walls
      if (Math.abs(positions[i * 3]) > 15) velocities[i * 3] *= -1;
      if (Math.abs(positions[i * 3 + 1]) > 15) velocities[i * 3 + 1] *= -1;
      if (Math.abs(positions[i * 3 + 2]) > 15) velocities[i * 3 + 2] *= -1;

      // Calculate connections
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < MAX_DISTANCE) {
          const alpha = 1.0 - dist / MAX_DISTANCE;

          linePositions[vertexpos++] = positions[i * 3];
          linePositions[vertexpos++] = positions[i * 3 + 1];
          linePositions[vertexpos++] = positions[i * 3 + 2];

          linePositions[vertexpos++] = positions[j * 3];
          linePositions[vertexpos++] = positions[j * 3 + 1];
          linePositions[vertexpos++] = positions[j * 3 + 2];

          // Indigo glow colors
          const r = 0.38 + 0.1 * alpha; // ~99 for indigo
          const g = 0.40 + 0.1 * alpha; // ~102
          const b = 0.94;               // ~241

          lineColors[colorpos++] = r;
          lineColors[colorpos++] = g;
          lineColors[colorpos++] = b;

          lineColors[colorpos++] = r;
          lineColors[colorpos++] = g;
          lineColors[colorpos++] = b;

          numConnected++;
        }
      }
    }

    pointGeoRef.current.attributes.position.needsUpdate = true;
    
    lineGeoRef.current.setDrawRange(0, numConnected * 2);
    lineGeoRef.current.attributes.position.needsUpdate = true;
    lineGeoRef.current.attributes.color.needsUpdate = true;

    // Rotate whole constellation slightly based on mouse
    pointsRef.current.rotation.x += (targetY * 0.05 - pointsRef.current.rotation.x) * 0.02;
    pointsRef.current.rotation.y += (targetX * 0.05 - pointsRef.current.rotation.y) * 0.02;
    linesRef.current.rotation.x = pointsRef.current.rotation.x;
    linesRef.current.rotation.y = pointsRef.current.rotation.y;
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry ref={pointGeoRef}>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#818cf8"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry ref={lineGeoRef}>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT * PARTICLE_COUNT * 2}
            array={linePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={PARTICLE_COUNT * PARTICLE_COUNT * 2}
            array={lineColors}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
};

export default ParticleConstellation;
