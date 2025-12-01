/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable minification to debug the "reading 'S'" error
  // This often happens when a library uses class names or internal props that get mangled
  swcMinify: false,
  
  // Ensure we transpile the 3D libraries
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei']
};

export default nextConfig;
