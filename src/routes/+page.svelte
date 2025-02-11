<script lang="ts">
	import chroma from 'chroma-js';
	import { Copy } from 'lucide-svelte';

	// Array of color set objects; each one has an id, variable name, and a base color.
	let colorSets = $state([{ id: 0, varName: 'color-primary', baseColor: '#3498db' }]);
	let colorSetCounter = 1; // Next id to use
	let scaleCorrectLightness = $state(false);
	let scaleGamma = $state(1.0);
	let scalePadding = $state([0.2, 0.2]);

	function reset() {
		// colorSets = [{ id: 0, varName: 'color-primary', baseColor: '#3498db' }];
		colorSetCounter = 1;
		scaleCorrectLightness = false;
		scaleGamma = 1.0;
		scalePadding = [0.2, 0.2];

		generateAndDisplayShades(); // Call to update shades after reset
	}

	const colorModeTooltip = {
		hcl: 'HCL (Hue, Chroma, Lightness)',
		hsi: 'HSI (Hue, Saturation, Intensity)',
		hsl: 'HSL (Hue, Saturation, Lightness)',
		hsv: 'HSV (Hue, Saturation, Value)',
		lab: 'Lab (Lightness, a, b)',
		lch: 'LCH (Lightness, Chroma, Hue)',
		lrgb: 'Linear RGB',
		oklab: 'OkLab (Perceptual lightness, a, b)',
		oklch: 'OkLCH (Perceptual lightness, Chroma, Hue)',
		rgb: 'RGB'
	};

	let colorMode = $state<
		'hcl' | 'hsi' | 'hsl' | 'hsv' | 'lab' | 'lch' | 'lrgb' | 'oklab' | 'oklch' | 'rgb'
	>('oklab');
	// Holds the generated CSS output string.
	let cssOutput = $state('');

	type Box = {
		varName: string;
		shade: string;
		cssColor: string;
	};

	// Array to hold dummy box objects to display generated colors.
	let dummyBoxes = $state<Box[]>([]);

	$effect(() => {
		dummyBoxes;
		const t = $state.snapshot(dummyBoxes);
		console.log({ dummyBoxes: t }); // corrected typo from 'dummyBoex' to 'dummyBoxes'
	});

	// Add a new color set
	function addColorSet() {
		colorSets = [
			...colorSets,
			{ id: colorSetCounter, varName: `color-${colorSetCounter}`, baseColor: '#abcdef' }
		];
		colorSetCounter += 1;
	}

	// Remove a color set by id
	function removeColorSet(id: number) {
		colorSets = colorSets.filter((cs) => cs.id !== id);
	}

	// Generate an object containing shades for a given base color
	function generateShades(baseColor: string) {
		const scale = chroma
			.scale(['white', baseColor, 'black'])
			.correctLightness(scaleCorrectLightness)
			.gamma(scaleGamma)
			.domain([0, 0.65, 1])
			.padding(scalePadding)
			.mode(colorMode)
			.colors(9);

		return {
			DEFAULT: baseColor,
			100: scale[0],
			200: scale[1],
			300: scale[2],
			400: scale[3],
			500: scale[4],
			600: scale[5],
			700: scale[6],
			800: scale[7],
			900: scale[8]
		};
	}

	// Generate the CSS variables output and create dummy boxes for preview.
	function generateAndDisplayShades() {
		let output = `:root {\n`;
		let boxes = [];

		// Process each color set
		for (const cs of colorSets) {
			const varName = cs.varName.trim() || `color-${cs.id}`;
			const baseColor = cs.baseColor.trim() || '#3498db';
			const shades = generateShades(baseColor);

			// For every shade add the CSS variable declaration and prepare a dummy box preview.
			for (const [shade, value] of Object.entries(shades)) {
				const finalShade = shade === 'DEFAULT' ? 'default' : shade;
				output += `  --${varName}-${finalShade}: ${value};\n`;
				boxes.push({
					varName,
					shade,
					// Changed: use the generated color directly.
					cssColor: value
				});
			}
		}
		output += `}`;

		cssOutput = output;
		dummyBoxes = boxes;
	}

	// Copy the generated CSS output to the clipboard.
	function copyToClipboard() {
		navigator.clipboard
			.writeText(cssOutput)
			.then(() => {
				alert('CSS variables copied to clipboard!');
			})
			.catch((err) => {
				console.error('Failed to copy: ', err);
			});
	}

	$effect(() => {
		generateAndDisplayShades();
	});
</script>

<!-- Inject the dynamic CSS variables into the document head -->
<svelte:head>
	<title>Dynamic Shades Generator</title>
	<style id="dynamicCSS">
{cssOutput}
	</style>
</svelte:head>

<main class="flex min-h-screen flex-col items-center gap-6 bg-gray-50 p-4 pb-36">
	<div class="flex max-w-2xl flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
		<h2 class="text-2xl font-bold">Dynamic Shades to CSS Variables</h2>
		<div class="flex max-w-2xl flex-col gap-4">
			<p>
				The purpose of this tool is to generate CSS variables for different shades of a base color.
				You can add multiple color sets and generate the corresponding CSS variables, which will be
				displayed below along with a preview of the colors.
			</p>
			<p>
				The primary purpose of this tool is to assist in defining custom color palettes for
				<strong>Tailwind CSS v4</strong>. The generated CSS variables can be used within Tailwind’s
				<code>{'@theme { ... }'}</code> directive, allowing you to
				<strong>modify the default color palette</strong> or
				<strong>introduce new colors</strong> that integrate seamlessly with Tailwind utility classes.
			</p>
			<p>
				By using these theme variables, you can ensure consistency across your design while
				leveraging Tailwind’s utility-based approach for styling.
			</p>
			<!-- Added link to docs on the subject -->
			<p>
				For more details, see docs on the subject <a
					class="font-bold text-blue-500"
					href="https://tailwindcss.com/docs/theme">https://tailwindcss.com/docs/theme</a
				>.
			</p>
		</div>
	</div>
	<!-- Change color modes -->
	<div
		class="fixed right-0 bottom-5 z-10 mt-4 mr-4 flex w-full max-w-2xl items-center gap-4 rounded-lg bg-white p-4 shadow-md"
	>
		<label class="tooltip rounded bg-black px-2 py-2 font-medium text-white" for="colorMode"
			>Color Mode:

			<span class="tooltip-text">
				With dropdown selected you can use arrow keys (up and down) to change mode
			</span>
		</label>
		<select
			id="colorMode"
			bind:value={colorMode}
			class="rounded border border-gray-300 p-2"
			onchange={generateAndDisplayShades}
		>
			{#each Object.entries(colorModeTooltip) as [mode, tooltip]}
				<option value={mode}>{tooltip}</option>
			{/each}
		</select>
	</div>

	<div class="flex w-full max-w-2xl justify-center gap-4 rounded-lg bg-white p-4 shadow-md">
		<button
			class="rounded bg-blue-500 px-4 py-2 font-bold text-white transition hover:scale-105 hover:bg-blue-700 active:scale-95"
			onclick={() => {
				addColorSet();
				generateAndDisplayShades();
			}}>Add Another Color</button
		>
		<button
			class="rounded bg-blue-500 px-4 py-2 font-bold text-white transition hover:scale-105 hover:bg-blue-700 active:scale-95"
			onclick={generateAndDisplayShades}>Generate CSS Vars</button
		>
		<!-- <button
			class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
			onclick={copyToClipboard}>Copy Output</button
		> -->
	</div>

	<!-- Loop through the color sets -->
	<div class="flex max-w-2xl flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
		<p class="w-full">
			Change the name of the css variables and the base color to generate different shades. The
			preview will update automatically. Example: color-primary will output:
		</p>
		<code class="code"> --color-primary-100, --color-primary-200... etc. </code>
		{#each colorSets as cs, index (cs.id)}
			<div class="flex flex-wrap items-center justify-start gap-2" id={'colorSet-' + cs.id}>
				<label class="font-medium" for={'varName-' + cs.id}>
					CSS VAR #{index + 1}:
				</label>
				<input
					type="text"
					id={'varName-' + cs.id}
					bind:value={cs.varName}
					placeholder="bg-primary"
					class="w-32 rounded border border-gray-300 p-2"
				/>

				<label class="font-medium" for={'colorInput-' + cs.id}>Base Color:</label>
				<input
					type="color"
					id={'colorInput-' + cs.id}
					bind:value={cs.baseColor}
					placeholder="#3498db"
					class="min-h-10 rounded border border-gray-300 p-2"
					onchange={() => generateAndDisplayShades()}
				/>

				<button
					class="tooltip rounded bg-red-500 px-3 py-1 font-bold text-white hover:bg-red-700"
					onclick={() => {
						removeColorSet(cs.id);
						generateAndDisplayShades();
					}}
					hidden={index === 0}
				>
					Remove
					<span class="tooltip-text"> Remove this color set </span>
				</button>
			</div>
		{/each}
	</div>

	<!-- Display the generated CSS variables -->
	<div class="flex w-full max-w-2xl flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
		<h2 class="text-2xl font-bold">Generated CSS Variables</h2>
		<div class="relative mt-4 w-4/5 max-w-2xl">
			<code
				class="block w-full overflow-x-auto rounded bg-gray-800 p-4 whitespace-pre-wrap text-white"
			>
				{cssOutput}
			</code>
			<button
				class="absolute top-0 right-0 mt-4 mr-4 inline-flex items-baseline gap-1 rounded border border-gray-300 px-2 text-sm text-white transition hover:scale-105 hover:border-gray-500 hover:bg-gray-700 hover:shadow-[0px_0px_10px_rgba(255,255,255,1)] active:scale-95"
				onclick={copyToClipboard}
			>
				<Copy color="white" size={10} class="" />
				copy
			</button>
		</div>
	</div>

	<div class="flex flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
		<div class="flex w-full flex-col justify-between items-center gap-4">
			<h2 class="text-4xl font-bold">Preview Colors</h2>
			<button onclick={reset} class="rounded bg-red-500 px-4 py-2 font-bold text-white transition hover:bg-red-700 active:scale-95">Reset</button>
		</div>
		<div class="flex min-w-48 flex-col justify-center gap-4">
			<div class="flex flex-col">
				<p class="tooltip relative flex items-center gap-2">
					<span class="font-medium"
						>Left Padding:<span class="w-[50px] px-4">{scalePadding[0]}</span></span
					>
					<span class="tooltip-text absolute">Adjust left padding</span>
				</p>
				<input type="range" min="0" max="1" step="0.01" bind:value={scalePadding[0]} />
				<p class="tooltip relative flex items-center gap-2">
					<span class="font-medium"
						>Right Padding:<span class="w-[50px] px-4">{scalePadding[1]}</span></span
					>
					<span class="tooltip-text absolute">Adjust right padding</span>
				</p>
				<input type="range" min="0" max="1" step="0.01" bind:value={scalePadding[1]} />
			</div>
			<p class="flex items-center gap-2">
				<span class="font-medium">Correct Lightness</span>
				<input
					bind:checked={scaleCorrectLightness}
					type="checkbox"
					class="h-4 w-4 rounded border-gray-300 text-blue-600"
				/>
			</p>
			<p class="tooltip relative flex items-center gap-2">
				<span class="font-medium">Gamma Shift:</span>
				<span>{scaleGamma}</span>
				<span class="tooltip-text"
					>Gamma-correction can be used to "shift" a scale's center more the the beginning {'(gamma < 1)'}
					or end {'(gamma > 1)'}, typically used to "even" the lightness gradient. Default is 1.</span
				>
			</p>
			<input
				type="range"
				min="0"
				max="2"
				step="0.01"
				bind:value={scaleGamma}
				disabled={scaleCorrectLightness}
			/>
		</div>

		<!-- Dummy boxes to preview the generated colors -->
		<div id="dummyShades" class="flex w-full flex-col gap-4">
			{#each colorSets as cs}
				<div class="rounded-2xl bg-black p-4">
					<h3 class="mb-2 font-bold text-white">{cs.varName}</h3>
					<div class="flex flex-wrap">
						{#each dummyBoxes.filter((box) => box.varName === cs.varName) as box}
							<div
								class="flex h-24 w-24 items-center justify-center p-2 text-sm font-bold text-white"
								style="background: {box.cssColor};"
							>
								{box.varName}-{box.shade}
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</main>

<style>
	.code {
		font-size: 0.9rem;
		color: whitesmoke;

		background-color: var(--color-gray-800); /* Added background color for better contrast */
		border-radius: 4px; /* Added border radius for aesthetics */
		padding: 0.5rem; /* Added padding for spacing */
	}
	.tooltip {
		position: relative;
		display: inline-block;
	}

	.tooltip-text {
		opacity: 0;
		visibility: hidden;
		width: 100%; /* Changed from 100 to 100% for proper width definition */
		max-width: 500px; /* Set the maximum width */
		background-color: rgba(0, 0, 0, 1);
		color: #fff;
		text-align: center;
		border-radius: 4px;
		padding: 0.4rem 0.6rem;
		font-size: 0.75rem;
		position: absolute;
		z-index: 10;
		bottom: 120%; /* Position above the button */
		left: 50%;
		transform: translateX(-50%);
		transition: opacity 0.2s ease-in-out;
		white-space: normal; /* Allow text wrapping */
	}
	.tooltip:hover .tooltip-text {
		opacity: 1;
		visibility: visible;
	}
</style>
