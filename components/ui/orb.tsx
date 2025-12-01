"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { createNoise3D } from "simplex-noise"

export interface OrbProps {
  colors?: [string, string]
  colorsRef?: React.MutableRefObject<[string, string]>
  resizeDebounce?: number
  seed?: number
  agentState?: "thinking" | "listening" | "talking" | null
  volumeMode?: "auto" | "manual"
  manualInput?: number
  manualOutput?: number
  inputVolumeRef?: React.MutableRefObject<number>
  outputVolumeRef?: React.MutableRefObject<number>
  getInputVolume?: () => number
  getOutputVolume?: () => number
  className?: string
}

// Fix import for Next.js environment
let noise3D: any = null
if (typeof createNoise3D === 'function') {
  try {
    noise3D = createNoise3D()
  } catch (e) {
    console.warn('Failed to create noise3D', e)
  }
}

function OrbGeometry({
  colors = ["#CADCFC", "#A0B9D1"],
  colorsRef,
  seed = Math.random() * 1000,
  agentState,
  manualInput,
  manualOutput,
  inputVolumeRef,
  outputVolumeRef,
  getInputVolume,
  getOutputVolume,
}: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const [targetUniforms] = useState({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(colors[0]) },
    uColor2: { value: new THREE.Color(colors[1]) },
    uNoiseScale: { value: 1.0 },
    uDeformation: { value: 0.0 },
  })

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms = targetUniforms
    }
  }, [targetUniforms])

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return

    const time = state.clock.getElapsedTime()
    materialRef.current.uniforms.uTime.value = time + seed

    // Handle colors
    const currentColors = colorsRef?.current || colors
    const color1 = new THREE.Color(currentColors[0])
    const color2 = new THREE.Color(currentColors[1])
    
    materialRef.current.uniforms.uColor1.value.lerp(color1, 0.05)
    materialRef.current.uniforms.uColor2.value.lerp(color2, 0.05)

    // Handle state & volume
    let noiseScale = 1.0
    let deformation = 0.0
    let speed = 0.5

    // Get volume levels
    let inputVol = 0
    let outputVol = 0

    if (manualInput !== undefined) inputVol = manualInput
    else if (inputVolumeRef) inputVol = inputVolumeRef.current
    else if (getInputVolume) inputVol = getInputVolume()

    if (manualOutput !== undefined) outputVol = manualOutput
    else if (outputVolumeRef) outputVol = outputVolumeRef.current
    else if (getOutputVolume) outputVol = getOutputVolume()

    // State logic
    if (agentState === "thinking") {
      noiseScale = 2.0
      deformation = 0.2
      speed = 2.0
    } else if (agentState === "listening") {
      noiseScale = 1.0 + inputVol * 2
      deformation = 0.1 + inputVol * 0.3
      speed = 1.0 + inputVol * 2
    } else if (agentState === "talking") {
      noiseScale = 1.0 + outputVol * 3
      deformation = 0.1 + outputVol * 0.5
      speed = 1.0 + outputVol * 2
    }

    materialRef.current.uniforms.uNoiseScale.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uNoiseScale.value,
      noiseScale,
      0.1
    )
    
    materialRef.current.uniforms.uDeformation.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uDeformation.value,
      deformation,
      0.1
    )

    // Simple rotation
    meshRef.current.rotation.y += speed * 0.01
    meshRef.current.rotation.z += speed * 0.005
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={`
          uniform float uTime;
          uniform float uNoiseScale;
          uniform float uDeformation;
          varying vec2 vUv;
          varying float vDisplacement;
          varying vec3 vNormal;

          // Simplex 3D Noise 
          // by Ian McEwan, Ashima Arts
          vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
          vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

          float snoise(vec3 v){ 
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

            // First corner
            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 = v - i + dot(i, C.xxx) ;

            // Other corners
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );

            //  x0 = x0 - 0.0 + 0.0 * C 
            vec3 x1 = x0 - i1 + 1.0 * C.xxx;
            vec3 x2 = x0 - i2 + 2.0 * C.xxx;
            vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

            // Permutations
            i = mod(i, 289.0 ); 
            vec4 p = permute( permute( permute( 
                      i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

            // Gradients
            float n_ = 1.0/7.0; // N=7
            vec3  ns = n_ * D.wyz - D.xzx;

            vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);

            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );

            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));

            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);

            //Normalise gradients
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;

            // Mix final noise value
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                          dot(p2,x2), dot(p3,x3) ) );
          }

          void main() {
            vUv = uv;
            vNormal = normal;
            
            // Correctly use the simplex noise function
            float noise = snoise(vec3(normal * uNoiseScale + uTime * 0.5));
            
            vDisplacement = noise;
            
            vec3 newPosition = position + normal * (noise * uDeformation);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          varying vec2 vUv;
          varying float vDisplacement;
          varying vec3 vNormal;

          void main() {
            float mixStrength = (vDisplacement + 1.0) * 0.5;
            vec3 color = mix(uColor1, uColor2, mixStrength);
            
            // Add simple rim lighting
            vec3 viewDir = normalize(cameraPosition - vNormal); // Approximation
            float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
            rim = pow(rim, 2.0);
            
            color += vec3(0.2) * rim;
            
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  )
}

export function Orb({ className, ...props }: OrbProps) {
  return (
    <div className={`relative w-full h-full min-h-[200px] ${className}`}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbGeometry {...props} />
      </Canvas>
    </div>
  )
}
