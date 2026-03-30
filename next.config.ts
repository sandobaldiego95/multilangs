import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Forma oficial de excluir paquetes del bundle del servidor (Next.js 14/15)
  serverExternalPackages: ["kokoro-js"],

  
    // @ts-ignore - Esta propiedad es necesaria para el despliegue en Vercel
    // pero no está en la definición de tipos actual.
    outputFileTracingExcludes: {
      "*": [
        "./node_modules/kokoro-js/**",
        "./node_modules/onnxruntime-web/**",
        "./node_modules/@huggingface/**",
      ],
    },
  

  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    if (isServer) {
      if (Array.isArray(config.externals)) {
        config.externals.push("kokoro-js");
      } else {
        config.externals = {
          ...(config.externals as Record<string, any>),
          "kokoro-js": "commonjs kokoro-js",
        };
      }
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },
};

export default nextConfig;