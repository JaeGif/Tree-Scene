import './style.css';
import ReactDOM from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience.jsx';
import { Sky } from '@react-three/drei';
const root = ReactDOM.createRoot(document.querySelector('#root'));

root.render(
  <Canvas
    color='black'
    shadows
    camera={{
      fov: 45,
      near: 0.001,
      far: 500,
      position: [0, 15, 60],
    }}
  >
    <Sky
      sunPosition={[0, 5, 0]}
      distance={450000}
      turbidity={0.1}
      rayleigh={0.2}
      mieCoefficient={0.5}
      mieDirectionalG={0.99}
      azimuth={170}
    />
    <Experience />
  </Canvas>
);
