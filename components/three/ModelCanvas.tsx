"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Rig, { type ModelState } from "./Rig";

export default function ModelCanvas({
  stateRef,
  active,
}: {
  stateRef: React.RefObject<ModelState>;
  active: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 5], fov: 35 }}
      frameloop={active ? "always" : "never"}
      style={{ background: "transparent" }}
      onCreated={({ gl }) => {
        // Without filmic tone mapping, several simultaneous lights (ambient
        // + key + three point lights) sum past 1.0 and just clip to flat
        // white instead of rolling off — exactly what washed out the
        // artwork before this was set.
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
      }}
    >
      <Rig state={stateRef} />
    </Canvas>
  );
}
