import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
// shaders
import leavesVertexShader from './shaders/leaves/vertex.glsl';
import leavesFragmentShader from './shaders/leaves/fragment.glsl';
import particleShader from './shaders/leaves/particle.glsl';
// THREE

import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

function Tree() {
  // gl is instance of renderer
  const { nodes, materials } = useGLTF('/tree.glb');
  const leafTexture = useTexture('/leaf.png');
  const { gl } = useThree();

  const baseGeometry = {};
  baseGeometry.instance = nodes.leaves002.geometry;
  baseGeometry.count = baseGeometry.instance.attributes.position.count;

  // GP-GPU
  const gpgpu = {};
  gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count));
  gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, gl);

  // Base Particles
  const baseParticlesTexture = gpgpu.computation.createTexture();

  for (let i = 0; i < baseGeometry.count; i++) {
    const i3 = i * 3;
    const i4 = i * 4;
    baseParticlesTexture.image.data[i4 + 0] =
      baseGeometry.instance.attributes.position.array[i3 + 0];
    baseParticlesTexture.image.data[i4 + 1] =
      baseGeometry.instance.attributes.position.array[i3 + 1];
    baseParticlesTexture.image.data[i4 + 2] =
      baseGeometry.instance.attributes.position.array[i3 + 2];
    baseParticlesTexture.image.data[i4 + 3] = Math.random();
  }

  // particles vars
  gpgpu.particlesVariable = gpgpu.computation.addVariable(
    'uParticles',
    particleShader,
    baseParticlesTexture
  );

  gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [
    gpgpu.particlesVariable,
  ]);
  // uniforms
  gpgpu.particlesVariable.material.uniforms.uTime = new THREE.Uniform(0);
  gpgpu.particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(16);
  gpgpu.particlesVariable.material.uniforms.uBase = new THREE.Uniform(
    baseParticlesTexture
  );
  gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [
    gpgpu.particlesVariable,
  ]);
  // uniforms
  gpgpu.particlesVariable.material.uniforms.uTime = new THREE.Uniform(0);
  gpgpu.particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(16);
  gpgpu.particlesVariable.material.uniforms.uBase = new THREE.Uniform(
    baseParticlesTexture
  );
  gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence =
    new THREE.Uniform(0.6);
  gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength =
    new THREE.Uniform(4.5);
  gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency =
    new THREE.Uniform(0.1);

  gpgpu.computation.init();
  gpgpu.debug = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3),
    new THREE.MeshBasicMaterial({
      map: gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable)
        .texture,
    })
  );
  gpgpu.debug.position.x = 3;
  gpgpu.debug.visible = false;

  const particles = {};

  // geometry
  const particlesUvArray = new Float32Array(baseGeometry.count * 2);
  const sizesArray = new Float32Array(baseGeometry.count);
  const colorsArray = new Float32Array(baseGeometry.count * 3);

  for (let y = 0; y < gpgpu.size; y++) {
    for (let x = 0; x < gpgpu.size; x++) {
      const i = y * gpgpu.size + x;

      const i2 = i * 2;

      // normalize the uv
      const uvX = (x + 0.5) / gpgpu.size; // sample from the center of each pixel
      const uvY = (y + 0.5) / gpgpu.size;

      particlesUvArray[i2 + 0] = uvX;
      particlesUvArray[i2 + 1] = uvY;

      sizesArray[i] = Math.random() * 15; // for randomized size
    }

    for (let i = 0; i < baseGeometry.count; i++) {
      const i3 = i * 3;
      // set colors
      const color1 = { r: 240 / 255, g: 185 / 255, b: 39 / 255 };
      const color2 = { r: 75 / 255, g: 106 / 255, b: 20 / 255 };
      const color3 = { r: 183 / 255, g: 186 / 255, b: 29 / 255 };

      const randomInt = Math.floor(Math.random() * 10);
      if (randomInt < 3) {
        colorsArray[i3 + 0] = color1.r;
        colorsArray[i3 + 1] = color1.g;
        colorsArray[i3 + 2] = color1.b;
      } else if (randomInt < 9) {
        colorsArray[i3 + 0] = color2.r;
        colorsArray[i3 + 1] = color2.g;
        colorsArray[i3 + 2] = color2.b;
      } else {
        colorsArray[i3 + 0] = color3.r;
        colorsArray[i3 + 1] = color3.g;
        colorsArray[i3 + 2] = color3.b;
      }
    }
  }

  particles.geometry = new THREE.BufferGeometry();
  particles.geometry.setDrawRange(0, baseGeometry.count);
  particles.geometry.setAttribute(
    'aParticlesUv',
    new THREE.BufferAttribute(particlesUvArray, 2)
  );
  particles.geometry.setAttribute(
    'aColor',
    new THREE.BufferAttribute(colorsArray, 3)
  );
  particles.geometry.setAttribute(
    'aSize',
    new THREE.BufferAttribute(sizesArray, 1)
  );

  // Material
  particles.material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexShader: leavesVertexShader,
    fragmentShader: leavesFragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(0.07),
      uTexture: new THREE.Uniform(leafTexture),
      uResolution: new THREE.Uniform(
        new THREE.Vector2(
          window.innerWidth * Math.min(window.devicePixelRatio, 2),
          window.innerHeight * Math.min(window.devicePixelRatio, 2)
        )
      ),
      uParticlesTexture: new THREE.Uniform(baseParticlesTexture),
    },
  });

  useFrame((state, delta) => {
    if (!gpgpu.computation) return;
    if (!particles.material) return;
    gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = delta;
    gpgpu.particlesVariable.material.uniforms.uTime.value =
      state.clock.elapsedTime;

    // gpgpu update
    gpgpu.computation.compute();
    // update uniform after compute
    particles.material.uniforms.uParticlesTexture.value =
      gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture;
  });

  return (
    <group scale={6} position={[14.5, 0.2, -2]} dispose={null}>
      <mesh
        name='tree'
        geometry={nodes.tree.geometry}
        material={materials['tree wood']}
        position={[-0.064, 1, 0.012]}
      />
      <points
        name='leaves002'
        geometry={particles.geometry}
        material={particles.material}
        position={[-3.083, 2.036, -0.083]}
        rotation={[0.661, 1.017, 0]}
        scale={0.353}
      />
    </group>
  );
}

export default Tree;

useGLTF.preload('/tree.glb');
