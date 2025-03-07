<script lang="ts">
	import chroma from 'chroma-js';
	import { Copy, Plus, RefreshCcw, Trash2 } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import github from 'svelte-highlight/styles/github-dark';
	import css from 'svelte-highlight/languages/css';
	import Highlight, { LineNumbers } from 'svelte-highlight';
	import { onMount } from 'svelte';
	import { Checkbox, Label, Card, Button, Toggle ,Tooltip} from 'flowbite-svelte';

	// Array of color set objects; each one has an id, variable name, and a base color.
	let colorSets = $state([{ id: 0, varName: 'primary', baseColor: '#3498db' }]);
	let colorSetCounter = 1; // Next id to use
	let scaleCorrectLightness = $state(false);
	let scaleGamma = $state(1.0);
	let scalePadding = $state([0.2, 0.2]);
	let previewDarkToggle = $state(false);
	let previewGaps = $state(false);

	let predefinedTWNames = $state({
		primary: true,
		secondary: false,
		tertiary: false,
		accent: false,
		neutral: false
	});

	$inspect({ predefinedTWNames });

	function reset() {
		// colorSets = [{ id: 0, varName: 'color-primary', baseColor: '#3498db' }];
		colorSets = [{ id: 0, varName: 'primary', baseColor: '#3498db' }];
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
			.colors(11); // Changed from 9 to 11 colors

		return {
			50: scale[0], // Added 50 shade
			100: scale[1],
			200: scale[2],
			300: scale[3],
			400: scale[4],
			500: scale[5],
			DEFAULT: baseColor,
			600: scale[6],
			700: scale[7],
			800: scale[8],
			900: scale[9],
			950: scale[10] // Added 950 shade
		};
	}

	// Generate the CSS variables output and create dummy boxes for preview.
	function generateAndDisplayShades() {
		let output = `@theme {\n`;
		let boxes = [];

		// Process each color set
		for (const cs of colorSets) {
			const varName = cs.varName.trim() || `color-${cs.id}`;
			const baseColor = cs.baseColor.trim() || '#3498db';
			const shades = generateShades(baseColor);

			// Add a comment line for the color set with extra spacing
			output += `\n  /* ${varName} */\n`;

			// For every shade add the CSS variable declaration and prepare a dummy box preview.
			for (const [shade, value] of Object.entries(shades)) {
				const finalShade = shade === 'DEFAULT' ? 'default' : shade;
				output += `  --color-${varName}-${finalShade}: ${value};\n`;
				boxes.push({
					varName,
					shade,
					cssColor: value
				});
			}
		}
		output += `\n}`;

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

	$effect(() => {
		// Process each predefined color name
		Object.entries(predefinedTWNames).forEach(([name, isChecked]) => {
			const varName = name;
			const existingIndex = colorSets.findIndex((cs) => cs.varName === varName);

			if (isChecked && existingIndex === -1) {
				// Add a new color set if checked and doesn't exist
				colorSets = [
					...colorSets,
					{ id: colorSetCounter, varName, baseColor: chroma.random().hex() }
				];
				colorSetCounter += 1;
			} else if (!isChecked && existingIndex !== -1) {
				// Remove color set if unchecked and exists
				colorSets = colorSets.filter((cs) => cs.varName !== varName);
			}
		});

		// Update the generated shades after modifying the color sets
		generateAndDisplayShades();
	});
</script>

<!-- Inject the dynamic CSS variables into the document head -->
<svelte:head>
	<title>Dynamic Shades Generator</title>
	<style id="dynamicCSS">
{cssOutput}
	</style>
	{@html github}
</svelte:head>

{#snippet tooltip(text: string)}
	<span class="tooltip-text">
		{text}
	</span>
{/snippet}

<main class="flex min-h-screen flex-col items-center gap-6 bg-white p-4 pb-36">
	<div class="container mx-auto flex max-w-[800px] flex-col gap-4">
		<div class="flex items-center justify-center text-center">
			<div>
				<h1 class="text-5xl">Dynamic Shades Generator</h1>
				<p class="text-lg font-medium">Generate CSS color variables for your design system</p>
			</div>
		</div>
		<Card size="none">
			<!-- <div class="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-8 shadow"> -->
			<div class="flex max-w-2xl flex-col gap-4">
				<p>
					The purpose of this tool is to generate CSS variables for different shades of a base
					color. You can add multiple color sets and generate the corresponding CSS variables, which
					will be displayed below along with a preview of the colors.
				</p>
				<p>
					The primary purpose of this tool is to assist in defining custom color palettes for
					<strong>Tailwind CSS v4</strong>. The generated CSS variables can be used within
					Tailwind’s
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
			<!-- </div> -->
		</Card>
		<Card size="none" class="flex flex-col gap-4">
			<!-- <div class=" flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-8 shadow"> -->
			<div class="flex flex-wrap items-center justify-between gap-4">
				<h2 class="">Color Variables</h2>
				<!-- <button
					class="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-4 py-2 font-medium transition hover:scale-105 hover:bg-gray-100 active:scale-95"
					onclick={() => {
						addColorSet();
						generateAndDisplayShades();
					}}
				>
					<Plus size={20} />
					Add Color</button
				> -->
				<Button
					size="sm"
					class="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 transition hover:scale-105 hover:bg-gray-100 active:scale-95"
					onclick={() => {
						addColorSet();
						generateAndDisplayShades();
					}}
				>
					<Plus size={20} />
					Add Color
				</Button>
			</div>
			<p>
				Define your own color variables and their base colors or choose from predefined common color
				palletes names.
			</p>
			<div class="flex flex-wrap gap-4">
				<Label class="flex gap-2">
					Primary
					<Checkbox value="primary" bind:checked={predefinedTWNames.primary} />
				</Label>
				<Label class="flex gap-2">
					Secondary
					<Checkbox value="secondary" bind:checked={predefinedTWNames.secondary} />
				</Label>
				<Label class="flex gap-2">
					Tertiary
					<Checkbox value="tertiary" bind:checked={predefinedTWNames.tertiary} />
				</Label>
				<Label class="flex gap-2">
					Accent
					<Checkbox value="accent" bind:checked={predefinedTWNames.accent} />
				</Label>
				<Label class="flex gap-2">
					Neutral
					<Checkbox value="neutral" bind:checked={predefinedTWNames.neutral} />
				</Label>
			</div>
			{#each colorSets as cs, index (cs.id)}
				<div class=" flex flex-wrap gap-4 rounded p-2 shadow" in:slide out:slide>
					<div class="flex flex-1 flex-col gap-4">
						<label for={'variableName-' + cs.id} class="font-medium text-nowrap"
							>CSS VAR #{index + 1}:</label
						>
						<input
							id={'variableName-' + cs.id}
							bind:value={cs.varName}
							class="w-full rounded border border-gray-200 p-2"
							type="text"
							placeholder="color-primary"
						/>
					</div>
					<div class="flex flex-col gap-4">
						<label for={'baseColor-' + cs.id} class="font-medium text-nowrap">Base Color</label>
						<div class="flex items-center gap-2">
							<input
								class="h-full min-w-[50px] rounded border border-gray-200 p-2"
								type="color"
								id={'baseColor-' + cs.id}
								bind:value={cs.baseColor}
							/>
							<input
								id={'baseColorText-' + cs.id}
								class="w-32 rounded border border-gray-200 p-2"
								type="text"
								bind:value={cs.baseColor}
								placeholder="#3498db"
							/>
							<button
								class="rounded px-4 py-2 font-bold text-white hover:bg-gray-200"
								onclick={() => {
									console.log('Remove color set:', cs.id);
									removeColorSet(cs.id);
									generateAndDisplayShades();
								}}
								hidden={colorSets.length < 2}
							>
								<Trash2 color="black" size={20} />
							</button>
						</div>
					</div>
				</div>
			{/each}
			<!-- </div> -->
		</Card>
		<!--  -->
		<Card size="none" class="flex flex-col gap-4 ">
			<!-- <div
				class="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-8 shadow"
				in:slide
				out:slide
			> -->
			<div>
				<h2>Preview Colors</h2>
				<p>Preview all generated color variations</p>
			</div>
			<div class="flex w-full flex-col gap-4 rounded-lg bg-white">
				<details open class="rounded-md border border-gray-200 px-4 py-2 font-medium">
					<summary class="py-4 font-medium">
						<span class="rounded bg-white px-2 py-1"> Settings </span>
					</summary>
					<div class="flex flex-col gap-4 rounded-lg bg-white p-4">
						<div class="flex flex-col gap-4">
							<div class="flex items-center gap-4">
								<label class="tooltip rounded font-medium text-black" for="colorMode">
									Color Mode:
									<!-- <span class="tooltip-text">
										With dropdown selected you can use arrow keys (up and down) to change mode
									</span> -->
									{@render tooltip(
										'With dropdown selected you can use arrow keys (up and down) to change mode'
									)}
								</label>
							</div>

							<select
								id="colorMode"
								bind:value={colorMode}
								class="rounded border border-gray-200 bg-white p-2 text-[clamp(0.8rem,2vw,1rem)]"
								onchange={generateAndDisplayShades}
							>
								{#each Object.entries(colorModeTooltip) as [mode, tooltip]}
									<option value={mode} class="text-[clamp(0.8rem,2vw,1rem)]">{tooltip}</option>
								{/each}
							</select>
						</div>
						<!-- Added slider for changing scaleGamma -->
						<div class="flex flex-col gap-4">
							<label for="scaleGamma" class="tooltip font-medium">
								Scale Gamma:{@render tooltip(
									'Gamma correction is a nonlinear operation used to encode and decode luminance or tristimulus values in video or still image systems.' +
										' It is used to adjust the brightness of an image, making it appear more natural to the human eye.' +
										' A gamma value of 1.0 means no correction, while values less than 1.0 darken the image and values greater than 1.0 brighten it.'
								)}
							</label>
							<div class="flex flex-wrap items-center gap-2 @md:flex-nowrap">
								<input
									type="number"
									min="0"
									max="2"
									step="0.1"
									bind:value={scaleGamma}
									onchange={generateAndDisplayShades}
									class="w-32 rounded border border-gray-300 bg-white px-2 text-center"
									placeholder="Enter Gamma Value"
								/>
								<input
									type="range"
									id="scaleGamma"
									min="0"
									max="2"
									step="0.1"
									bind:value={scaleGamma}
									onchange={generateAndDisplayShades}
									class="min-w-xs flex-1"
								/>
							</div>
						</div>
					</div>
				</details>
			</div>
			<div class="flex flex-col gap-4 w-fit">
				<!-- <label class="inline-flex cursor-pointer items-center">
					<input type="checkbox" value="" class="peer sr-only" bind:checked={previewDarkToggle} />
					<div
					class="peer relative h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-gray-800 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full"
					></div>
					<span class="ms-3 text-sm font-medium text-gray-900">Dark Background Preview</span>
					</label> -->
				<Toggle bind:checked={previewDarkToggle}>Dark Background Preview</Toggle>
				<Tooltip>
					This toggle allows you to preview the colors on a dark background. 
				</Tooltip>
				<!-- <label class="inline-flex cursor-pointer items-center">
					<input type="checkbox" value="" class="peer sr-only" bind:checked={previewGaps} />
					<div
						class="peer relative h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-gray-800 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full"
					></div>
					<span class="ms-3 text-sm font-medium text-gray-900">Remove Gaps</span>
				</label> -->
				<Toggle bind:checked={previewGaps}>Remove Gaps</Toggle>
				<Tooltip>
					This toggle allows you to remove the gaps between the color boxes in the preview.
				</Tooltip>
			</div>
			<div class={`grid gap-6 ${previewDarkToggle ? 'rounded-lg bg-gray-900 p-4 text-white' : ''}`}>
				{#each colorSets as cs}
					<div class="@container flex flex-col gap-1 space-y-2">
						<label class="font-medium" for={cs.varName}>--color-{cs.varName}</label>
						<!-- class={`grid grid-cols-11 ${!previewGaps ? 'gap-1' : ''} overflow-hidden rounded-lg`} -->
						<div
							class={[
								'grid grid-cols-6',
								'@md:grid-cols-12',
								`${!previewGaps ? 'gap-1' : ''}`,
								'overflow-hidden rounded-lg'
							]}
						>
							{#each dummyBoxes.filter((box) => box.varName === cs.varName) as box, index}
								<div
									class="flex min-h-10 items-center justify-center p-2 text-sm font-bold text-white"
									style="background: {box.cssColor};"
								>
									<span class="rotate-45 transition-all @md:rotate-0">
										{box.shade === 'DEFAULT' ? 'Base' : box.shade}
									</span>
									<!-- <span class="@md:hidden  rotate-90">
										{box.shade === 'DEFAULT' ? 'B' : String(box.shade).substring(0, 1)}
									</span> -->
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
			<!-- </div> -->
		</Card>
		<Card size="none" class="flex flex-col gap-4">
			<!-- <div class="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-8 shadow"> -->
			<div>
				<h2>Generated Code</h2>
				<p>CSS variables for your design system</p>
			</div>
			<div class="relative mt-4 w-full overflow-hidden rounded-xl">
				<!-- <code
					class="block w-full overflow-x-auto rounded bg-gray-800 p-4 whitespace-pre-wrap text-white"
				>
					{cssOutput}
				</code> -->

				<Highlight language={css} code={cssOutput} let:highlighted>
					<LineNumbers
						{highlighted}
						highlightedLines={[16]}
						--highlighted-background="rgba(150, 203, 254, 0.2)"
					/>
				</Highlight>

				<button
					class="absolute top-0 right-0 mt-4 mr-4 inline-flex items-baseline gap-1 rounded border border-gray-200 px-2 text-sm text-white transition hover:scale-105 hover:border-gray-500 hover:bg-gray-700 hover:shadow-[0px_0px_10px_rgba(255,255,255,1)] active:scale-95"
					onclick={copyToClipboard}
				>
					<Copy color="white" size={10} class="" />
					copy
				</button>
			</div>
			<!-- </div> -->
		</Card>
	</div>
</main>

<style>
	/* section {
		padding: 2rem;
	} */

	/* .code {
		font-size: 0.9rem;
		color: whitesmoke;

		background-color: var(--color-gray-800); 
		border-radius: 4px; 
		padding: 0.5rem; 
	} */
	.tooltip {
		position: relative;
		display: inline-block;
	}

	.tooltip-text {
		opacity: 0;
		visibility: hidden;
		width: 280px; /* Fixed width instead of 100% */
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
