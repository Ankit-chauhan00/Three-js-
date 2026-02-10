import React from 'react'
import { useTexture } from '@react-three/drei'


const Scene = () => {
  const texture =  useTexture("/texture/desert.jpg")
  return (
    <mesh>
        <torusGeometry />
        <meshStandardMaterial map={texture} />
      
    </mesh>
  )
}

export default Scene