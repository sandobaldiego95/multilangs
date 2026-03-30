import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // Excluye kokoro-js del bundle del servidor completamente.
  serverExternalPackages: ["kokoro-js"],

  experimental: {
    // outputFileTracingExcludes evita que los archivos ONNX/WASM se suban a Vercel
    outputFileTracingExcludes: {
      "*": [
        "./node_modules/kokoro-js/**",
        "./node_modules/onnxruntime-web/**",
        "./node_modules/@huggingface/**",
      ],
    },
  },

  webpack: (config, { isServer }) => {
    // WASM support para el browser
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // En el servidor, marcar kokoro-js como externo
    if (isServer) {
      if (Array.isArray(config.externals)) {
        config.externals.push("kokoro-js");
      } else {
        config.externals = {
          ...config.externals,
          "kokoro-js": "commonjs kokoro-js",
        };
      }
    }

    // Polyfills necesarios para evitar errores de módulos de Node en el cliente
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },
};

export default nextConfig;