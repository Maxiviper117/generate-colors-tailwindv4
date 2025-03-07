import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

// export default defineConfig({
// 	plugins: [sveltekit(), tailwindcss()]
// });

// "dependencies": {
// 		"@types/chroma-js": "^3.1.1",
// 		"chroma-js": "^3.1.2",
// 		"lucide-svelte": "^0.475.0"
// 	}

export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	console.log({ command, mode });

	const isProduction = mode === 'production';
	return {
		plugins: [sveltekit(), tailwindcss()],
		optimizeDeps: {
			force: isProduction,
			include: [
				'chroma-js',
				'lucide-svelte',
			]
		}
	};
});
