import { OrbitControls } from '@react-three/drei';
import Lights from './Lights.jsx';
import Grass from './Grass.jsx';
import Tree from './Tree.jsx';

export default function Experience() {
  return (
    <>
      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2} maxZoom={0.1} />

      <Lights />
      <group position={[0, -2, 0]}>
        <Tree />
        <Grass />
      </group>
    </>
  );
}
