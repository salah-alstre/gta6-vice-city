"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MODEL_URL } from "@/lib/modelConstants";

export interface PosterModelHandle {
  group: THREE.Group | null;
}

/**
 * The provided GLB is a thin "key art plaque" (~2 x 0.1 x 2 units): two
 * near-coincident meshes (Object_4, Object_7) sharing the official cover-art
 * texture on their outward faces, plus a third, untextured mesh (Object_5)
 * that appears to be a backing/frame shell spanning the full thickness.
 * Object_5's top face sits at the same depth as the textured decal and,
 * even with a depth bias, ends up winning the draw and hiding the artwork
 * entirely — and since it isn't needed for a clean "floating art card"
 * presentation, it's simplest and most reliable to just not render it.
 *
 * The materials also came in as KHR_materials_unlit (MeshBasicMaterial),
 * which ignores scene lights entirely — swapped for MeshStandardMaterial
 * instances that keep the same base color map but actually respond to the
 * rim/key lighting.
 */
export default function PosterModel({
  groupRef,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
}) {
  const { scene } = useGLTF(MODEL_URL);

  const prepared = useMemo(() => {
    const clone = scene.clone(true);

    // The GLB's own accessor bounds are already symmetric to within ~0.006
    // units of the origin, so no re-centering is needed.
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Normalize to a consistent ~2 unit width regardless of source scale.
    const targetSize = 2;
    const scale = targetSize / Math.max(size.x, size.z);

    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const oldMat = child.material as THREE.MeshBasicMaterial;
      const map = oldMat?.map ?? null;

      if (!map) {
        // The untextured backing/frame shell — see file comment.
        child.visible = false;
        return;
      }

      map.colorSpace = THREE.SRGBColorSpace;
      child.material = new THREE.MeshStandardMaterial({
        map,
        // Low metalness + moderate roughness reads as a printed/lacquered
        // art panel under key+rim lighting; high metalness with no env map
        // just goes dark since there's nothing physical to reflect.
        roughness: 0.45,
        metalness: 0.08,
        envMapIntensity: 0.6,
        side: THREE.DoubleSide,
      });
      child.castShadow = false;
      child.receiveShadow = false;
    });

    const wrapper = new THREE.Group();
    wrapper.add(clone);
    wrapper.scale.setScalar(scale);

    // The plaque's flat face is the local X-Z plane (its thin axis is local
    // Y — confirmed from the GLB's bounding box: ~2 x 0.1 x 2). Lying
    // untouched, its face normal points straight up, so a camera on the Z
    // axis sees it almost edge-on ("lying flat on a table"). Rotating +90°
    // around X brings the *textured* face's normal around to point at the
    // camera — verified directly by rendering each candidate mesh in
    // isolation; -90° instead faces the camera away from every textured
    // surface. This is the true "face-on" baseline; the scroll choreography
    // then only ever adds small naturalistic offsets on top of it.
    wrapper.rotation.x = Math.PI / 2;

    return wrapper;
  }, [scene]);

  const idleT = useRef(0);
  const isTouchRef = useRef(false);
  useEffect(() => {
    isTouchRef.current = window.matchMedia("(hover: none)").matches;
  }, []);

  useFrame((_, delta) => {
    if (!isTouchRef.current) return;
    // Mobile fallback: a slow, subtle automatic breathing rotation.
    idleT.current += delta;
    if (groupRef.current) {
      groupRef.current.rotation.y += Math.sin(idleT.current * 0.35) * 0.0006;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={prepared} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
