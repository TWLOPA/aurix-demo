"use client"

import { useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

export type AgentState = null | "thinking" | "listening" | "talking"

type OrbProps = {
  colors?: [string, string]
  agentState?: AgentState
  className?: string
}

export function Orb({
  colors = ["#000000", "#000000"], // Default to black for light mode
  agentState = null,
  className,
}: OrbProps) {
  return (
    <div className={className ?? "relative h-full w-full"}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{
          alpha: true,
          antialias: true,
        }}
      >
        <GeomorphScene colors={colors} agentState={agentState} />
      </Canvas>
    </div>
  )
}

function GeomorphScene({
  colors,
  agentState,
}: {
  colors: [string, string]
  agentState: AgentState
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)
  
  // Create geometry and cache original positions
  const { geometry, originalPositions } = useMemo(() => {
    // Reduced detail to 4 to prevent WebGL Context Lost (Crash)
    const geo = new THREE.IcosahedronGeometry(1, 4)
    const pos = geo.attributes.position.array.slice()
    return { geometry: geo, originalPositions: pos }
  }, [])

  // Particle system
  const { particleGeometry, particleVelocities, particleOriginalDistances } = useMemo(() => {
    const count = 150 // Reduced particle count for performance
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const velocities = []
    const distances = []

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 1.8 + Math.random() * 1.5

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      distances.push(radius)
      velocities.push({
        theta: (Math.random() - 0.5) * 0.004,
        phi: (Math.random() - 0.5) * 0.004,
        radialSpeed: (Math.random() - 0.5) * 0.002
      })
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return { 
      particleGeometry: geo, 
      particleVelocities: velocities, 
      particleOriginalDistances: distances 
    }
  }, [])

  // Animation helpers
  const organicPulse = (time: number) => {
    // Modify pulse based on agent state
    let speed = 1.0
    if (agentState === 'listening') speed = 1.5
    if (agentState === 'thinking') speed = 2.5
    if (agentState === 'talking') speed = 3.0

    const breathCycle = 12 / speed
    const breathPhase = (time % breathCycle) / breathCycle
    const breath = (Math.sin(breathPhase * Math.PI * 2 - Math.PI / 2) + 1) * 0.5
    
    return {
      intensity: breath,
      phase: breathPhase
    }
  }

  const flowNoise = (x: number, y: number, z: number, time: number) => {
    const n1 = Math.sin(x * 1.2 + time * 0.15) * Math.cos(y * 1.1 + time * 0.12)
    const n2 = Math.sin(y * 1.3 + time * 0.13) * Math.cos(z * 1.0 + time * 0.11)
    const n3 = Math.sin(z * 1.1 + time * 0.14) * Math.cos(x * 1.2 + time * 0.1)
    return (n1 + n2 + n3) / 3
  }

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    const pulse = organicPulse(time)

    // Animate Mesh
    if (meshRef.current) {
      const positions = geometry.attributes.position.array as Float32Array
      const vertexCount = positions.length / 3

      // Morph intensity based on state
      let morphScale = 1.0
      if (agentState === 'thinking') morphScale = 1.5
      if (agentState === 'talking') morphScale = 2.0

      for (let i = 0; i < vertexCount; i++) {
        const i3 = i * 3
        const ox = originalPositions[i3]
        const oy = originalPositions[i3 + 1]
        const oz = originalPositions[i3 + 2]

        const len = Math.sqrt(ox * ox + oy * oy + oz * oz)
        const nx = ox / len
        const ny = oy / len
        const nz = oz / len

        const flow1 = flowNoise(nx, ny, nz, time) * 0.4 * morphScale
        const flow2 = flowNoise(nx * 2, ny * 2, nz * 2, time * 0.8) * 0.2 * morphScale

        const stretchX = Math.sin(time * 0.1) * 0.15
        const stretchY = Math.cos(time * 0.12) * 0.12
        const stretchZ = Math.sin(time * 0.08 + 1) * 0.1

        const stretch = 1 + nx * stretchX + ny * stretchY + nz * stretchZ
        const breathe = 1 + pulse.intensity * 0.1

        const totalDeform = (1 + flow1 + flow2) * stretch * breathe

        positions[i3] = ox * totalDeform
        positions[i3 + 1] = oy * totalDeform
        positions[i3 + 2] = oz * totalDeform
      }

      geometry.attributes.position.needsUpdate = true
      
      // Rotation speed based on state
      let rotSpeed = 1.0
      if (agentState === 'thinking') rotSpeed = 3.0
      
      meshRef.current.rotation.x += 0.001 * rotSpeed
      meshRef.current.rotation.y += 0.0015 * rotSpeed
    }

    // Animate Particles
    if (particlesRef.current) {
      const pPositions = particleGeometry.attributes.position.array as Float32Array
      const particleCount = particleVelocities.length
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        let x = pPositions[i3]
        let y = pPositions[i3 + 1]
        let z = pPositions[i3 + 2]

        let radius = Math.sqrt(x * x + y * y + z * z)
        let theta = Math.atan2(y, x)
        let phi = Math.acos(z / radius)

        // State-based agitation
        let agitation = 1.0
        if (agentState === 'talking') agitation = 3.0

        theta += particleVelocities[i].theta * 0.3 * agitation
        phi += particleVelocities[i].phi * 0.1 * agitation

        const targetRadius = particleOriginalDistances[i] + pulse.intensity * 0.08
        radius += (targetRadius - radius) * 0.01

        phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi))

        pPositions[i3] = radius * Math.sin(phi) * Math.cos(theta)
        pPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        pPositions[i3 + 2] = radius * Math.cos(phi)
      }
      
      particleGeometry.attributes.position.needsUpdate = true
    }
  })

  const primaryColor = colors[0] || "#000000"

  return (
    <>
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial 
          color={primaryColor}
          wireframe={true}
          transparent={true}
          opacity={0.15} // Low opacity for subtle "skin" look
        />
      </mesh>
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial 
          color={primaryColor}
          size={0.015} // Smaller, finer particles
          sizeAttenuation={true}
          transparent={true}
          opacity={0.4}
        />
      </points>
    </>
  )
}
