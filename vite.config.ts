import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib';

  return {
    plugins: [
      react(),
      isLib && dts({
        include: ['src'],
        exclude: ['src/demo/**/*'],
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@graphs': resolve(__dirname, './src/graphs'),
        '@widgets': resolve(__dirname, './src/widgets'),
        '@api': resolve(__dirname, './src/api'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@utils': resolve(__dirname, './src/utils'),
        '@types': resolve(__dirname, './src/types'),
      },
    },
    build: isLib ? {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'AdaptUI',
        formats: ['es'],
        fileName: 'index',
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
    } : undefined,
  };
});
