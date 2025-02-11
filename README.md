# Tailwind CSS v4 Color Generator

A tool for generating color palettes compatible with Tailwind CSS v4's new CSS variable-based theming system.

## Features

- Generate complete color shade palettes from a base color
- Create multiple color sets simultaneously
- Live preview of generated colors
- Copy-to-clipboard functionality for easy integration
- Uses CSS variables format compatible with Tailwind CSS v4
- Color generation using OKLCH color space for better perceptual uniformity

## Installation

```bash
# Clone the repository
git clone https://github.com/Maxiviper117/generate-colors-tailwindv4.git

# Navigate to project directory
cd generate-colors-tailwindv4

# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

1. Open the application in your browser
2. Add one or more color sets using the "Add Another Color" button
3. For each color set:
   - Enter a variable name (e.g., "bg-primary")
   - Select a base color using the color picker
4. Click "Generate CSS Vars" to create the color palette
5. Use the "Copy Output" button to copy the generated CSS variables
6. Paste the variables into your Tailwind CSS v4 configuration

## Integration with Tailwind CSS v4

The generated CSS variables can be used within Tailwind's `@theme` directive:

```css
@theme {
	--bg-primary-100: #c5e0f6;
	--bg-primary-200: #afd4f2;
	--bg-primary-300: #99c8ee;
	--bg-primary-400: #83bce9;
	--bg-primary-500: #6bb0e5;
	--bg-primary-600: #52a4e0;
	--bg-primary-700: #3498db;
	--bg-primary-800: #006dad;
	--bg-primary-900: #004481;
	--bg-primary-default: #3498db;
}
```

## License

MIT
