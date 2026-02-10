import { OrbitControls} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'

const App = () => {

  return (

    <Canvas >
      <OrbitControls autoRotate />
      <ambientLight/>
      <Scene/>
    </Canvas>
  )
}

export default App