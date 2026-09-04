"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import PosterModel from "./PosterModel";

export interface ModelState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  sweep: number; // -1..1, drives the rim light sweep
  rimIntensity: number;
}

export default function Rig({ state }: { state: React.RefObject<ModelState> }) {
  const groupRef = useRef<THREE.Group>(null);
  const rimRef = useRef<THREE.PointLight>(null);

  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const isTouch = useRef(false);

  useEffect(() => {
    isTouch.current = window.matchMedia("(hover: none)").matches;
    if (isTouch.current) return;

    const onMove = (e: MouseEvent) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onLeave = () => {
      mouseTarget.current.x = 0;
      mouseTarget.current.y = 0;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useFrame(() => {
    const s = state.current;
    if (!s) return;

    // Heavy, physical lag — not a toy that snaps to the cursor.
    mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.045;
    mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.045;

    if (groupRef.current) {
      groupRef.current.position.copy(s.position);
      groupRef.current.scale.setScalar(s.scale);
      // Mouse parallax stays within ~2-5 degrees total — a heavy, physical
      // object responding to the cursor, not spinning to track it.
      groupRef.current.rotation.set(
        s.rotation.x - mouseCurrent.current.y * 0.05,
        s.rotation.y + mouseCurrent.current.x * 0.07,
        s.rotation.z
      );
    }

    if (rimRef.current) {
      rimRef.current.position.x = s.sweep * 4;
      rimRef.current.intensity = s.rimIntensity;
    }
  });

  return (
    <>
      {/* Soft neutral fill so the artwork is legible even at its dimmest. */}
      <ambientLight intensity={0.38} color="#6a6480" />
      {/* Key light: the main, readable exposure on the face. */}
      <directionalLight position={[2, 2.5, 5]} intensity={0.95} color="#f2ecff" />
      {/* Rim light: pink, sweeps with scroll, never fully off. */}
      <pointLight ref={rimRef} position={[-3, 0.5, -1]} intensity={0.8} color="#ff3d81" distance={13} decay={2} />
      {/* Violet fill from the opposite side. */}
      <pointLight position={[3, -1, 1.5]} intensity={0.85} color="#9b4dff" distance={11} decay={2} />
      {/* Warm orange edge accent. */}
      <pointLight position={[-1, 1.8, 2.5]} intensity={0.5} color="#ff7a30" distance={9} decay={2} />
      <PosterModel groupRef={groupRef} />
    </>
  );
}
