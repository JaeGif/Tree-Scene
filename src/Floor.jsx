import React from 'react';
import * as THREE from 'three';

function Floor() {
  return (
    <>
      <mesh receiveShadow position-y={-0.1} rotation-x={Math.PI / 2}>
        <circleGeometry args={[75]} />
        <meshPhongMaterial
          side={2}
          color={'blue'}
          combine={THREE.MixOperation}
        />
      </mesh>
    </>
  );
}

export default Floor;
