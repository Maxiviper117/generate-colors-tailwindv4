<script lang="ts">
	import chroma from 'chroma-js';

	// Array of color set objects; each one has an id, variable name, and a base color.
	let colorSets = $state([{ id: 0, varName: 'primary-color', baseColor: '#3498db' }]);
	let colorSetCounter = 1; // Next id to use

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
			.domain([0, 0.65, 1])
			.padding([0.2, 0.2])
			.mode('oklch')
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
</script>

<!-- Inject the dynamic CSS variables into the document head -->
<svelte:head>
	<title>Dynamic Shades Generator</title>
	<style id="dynamicCSS">
{cssOutput}
	</style>
</svelte:head>

<main class="flex min-h-screen flex-col items-center bg-gray-50 p-4">
	<h2 class="mb-4 text-2xl font-bold">Dynamic Shades to CSS Variables</h2>
	<div class="mb-4 flex justify-center space-x-4">
		<button class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700" onclick={addColorSet}
			>Add Another Color</button
		>
		<button
			class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
			onclick={generateAndDisplayShades}>Generate CSS Vars</button
		>
		<button
			class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
			onclick={copyToClipboard}>Copy Output</button
		>
	</div>

	<!-- Loop through the color sets -->
	<div class="mb-4 flex w-full flex-col items-center gap-4">
		{#each colorSets as cs (cs.id)}
			<div class="flex flex-wrap items-center gap-2" id={'colorSet-' + cs.id}>
				<label class="font-medium" for={'varName-' + cs.id}>Variable Name:</label>
				<input
					type="text"
					id={'varName-' + cs.id}
					bind:value={cs.varName}
					placeholder="primary-color"
					class="w-32 rounded border border-gray-300 p-2"
				/>

				<label class="font-medium" for={'colorInput-' + cs.id}>Base Color:</label>
				<input
					type="color"
					id={'colorInput-' + cs.id}
					bind:value={cs.baseColor}
					placeholder="#3498db"
					class="min-h-10 rounded border border-gray-300 p-2"
				/>

				<button
					class="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-700"
					onclick={() => removeColorSet(cs.id)}
				>
					Remove
				</button>
			</div>
		{/each}
	</div>

	<!-- Display the generated CSS variables -->
	<code
		id="output"
		class="mt-4 block w-4/5 max-w-lg overflow-x-auto rounded bg-gray-800 p-4 whitespace-pre-wrap text-white"
		>{cssOutput}</code
	>

	<!-- Dummy boxes to preview the generated colors -->
	<div
		id="dummyShades"
		class="mt-4 grid w-full grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-4 rounded-2xl bg-black p-4"
	>
		{#each dummyBoxes as box}
			<div
				class="flex h-24 w-24 items-center justify-center text-sm text-white shadow p-2 font-bold"
				style="background: {box.cssColor};"
			>
				{box.varName}-{box.shade}
			</div>
		{/each}
	</div>
</main>
