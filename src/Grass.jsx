import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import grassVertexShader from './shaders/grass/vertex.glsl';
import grassFragmentShader from './shaders/grass/fragment.glsl';
import { useFrame } from '@react-three/fiber';

function Grass() {
  const grassRef = useRef(null);

  useFrame((state, delta) => {
    grassRef.current.material.uniforms.uTime.value += delta;
  });

  // Parameters
  const PLANE_SIZE = 100;
  const BLADE_COUNT = 400000;
  const BLADE_WIDTH = 0.1;
  const BLADE_HEIGHT = 1;
  const BLADE_HEIGHT_VARIATION = 1.5;

  // Grass Texture
  const grassTexture = new THREE.TextureLoader().load('grass.jpg');
  const cloudTexture = new THREE.TextureLoader().load('cloud.jpg');
  cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;

  // Grass Shader
  const grassUniforms = {
    textures: { value: [grassTexture, cloudTexture] },
    uTime: { value: 0 },
  };

  const grassMaterial = new THREE.ShaderMaterial({
    uniforms: grassUniforms,
    vertexShader: grassVertexShader,
    fragmentShader: grassFragmentShader,
    vertexColors: true,
    side: THREE.DoubleSide,
  });

  function convertRange(val, oldMin, oldMax, newMin, newMax) {
    return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
  }

  function generateField() {
    const positions = [];
    const uvs = [];
    const indices = [];
    const colors = [];

    for (let i = 0; i < BLADE_COUNT; i++) {
      const VERTEX_COUNT = 5;
      const surfaceMin = (PLANE_SIZE / 2) * -1;
      const surfaceMax = PLANE_SIZE / 2;
      const radius = PLANE_SIZE / 2;

      const r = radius * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);

      const pos = new THREE.Vector3(x, 0, y);

      const uv = [
        convertRange(pos.x, surfaceMin, surfaceMax, 0, 1),
        convertRange(pos.z, surfaceMin, surfaceMax, 0, 1),
      ];

      const blade = generateBlade(pos, i * VERTEX_COUNT, uv);
      blade.verts.forEach((vert) => {
        positions.push(...vert.pos);
        uvs.push(...vert.uv);
        colors.push(...vert.color);
      });
      blade.indices.forEach((indice) => indices.push(indice));
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(positions), 3)
    );
    geom.setAttribute(
      'uv',
      new THREE.BufferAttribute(new Float32Array(uvs), 2)
    );
    geom.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(colors), 3)
    );
    geom.setIndex(indices);
    geom.computeVertexNormals();

    return geom;
  }

  function generateBlade(center, vArrOffset, uv) {
    const MID_WIDTH = BLADE_WIDTH * 0.5;
    const TIP_OFFSET = 0.1;
    const height = BLADE_HEIGHT + Math.random() * BLADE_HEIGHT_VARIATION;

    const yaw = Math.random() * Math.PI * 2;
    const yawUnitVec = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
    const tipBend = Math.random() * Math.PI * 2;
    const tipBendUnitVec = new THREE.Vector3(
      Math.sin(tipBend),
      0,
      -Math.cos(tipBend)
    );

    // Find the Bottom Left, Bottom Right, Top Left, Top right, Top Center vertex positions
    const bl = new THREE.Vector3().addVectors(
      center,
      new THREE.Vector3().copy(yawUnitVec).multiplyScalar((BLADE_WIDTH / 2) * 1)
    );
    const br = new THREE.Vector3().addVectors(
      center,
      new THREE.Vector3()
        .copy(yawUnitVec)
        .multiplyScalar((BLADE_WIDTH / 2) * -1)
    );
    const tl = new THREE.Vector3().addVectors(
      center,
      new THREE.Vector3().copy(yawUnitVec).multiplyScalar((MID_WIDTH / 2) * 1)
    );
    const tr = new THREE.Vector3().addVectors(
      center,
      new THREE.Vector3().copy(yawUnitVec).multiplyScalar((MID_WIDTH / 2) * -1)
    );
    const tc = new THREE.Vector3().addVectors(
      center,
      new THREE.Vector3().copy(tipBendUnitVec).multiplyScalar(TIP_OFFSET)
    );

    tl.y += height / 2;
    tr.y += height / 2;
    tc.y += height;

    // Vertex Colors
    const black = [0, 0, 0];
    const gray = [0.5, 0.5, 0.5];
    const white = [1.0, 1.0, 1.0];

    const verts = [
      { pos: bl.toArray(), uv: uv, color: black },
      { pos: br.toArray(), uv: uv, color: black },
      { pos: tr.toArray(), uv: uv, color: gray },
      { pos: tl.toArray(), uv: uv, color: gray },
      { pos: tc.toArray(), uv: uv, color: white },
    ];

    const indices = [
      vArrOffset,
      vArrOffset + 1,
      vArrOffset + 2,
      vArrOffset + 2,
      vArrOffset + 4,
      vArrOffset + 3,
      vArrOffset + 3,
      vArrOffset,
      vArrOffset + 2,
    ];

    return { verts, indices };
  }

  const geometry = generateField();

  return (
    <>
      <mesh position-y={-0.3} rotation-x={[Math.PI / 2]}>
        <circleGeometry args={[49]} />
        <meshBasicMaterial color={'#90EE90'} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={grassRef} material={grassMaterial} geometry={geometry} />
    </>
  );
}

export default Grass;
