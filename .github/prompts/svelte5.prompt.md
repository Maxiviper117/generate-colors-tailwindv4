
# Svelte 5 Runes and Snippets Breakdown

This VS Code Copilot prompt file summarizes all the new Svelte 5 runes and snippets—explaining their purpose, usage, and how they differ from Svelte 4. Use this file as a quick reference to integrate Svelte 5’s new features into your development workflow.

---

## Overview

Svelte 5 introduces **runes** for explicit reactivity and **snippets** to replace Svelte 4’s slot mechanism. These enhancements clarify intent, improve flexibility, and align reactivity with a “signals” style model.

---

## Runes

### `$state` – Reactive State Variable

**Purpose:**  
Explicitly declare a reactive state variable.

**Svelte 4:**  
```svelte
<script>
  let count = 0; // Implicitly reactive in Svelte 4
</script>
```

**Svelte 5 Example:**
```svelte
<script>
  let count = $state(0); // Explicit reactivity with $state
</script>

<button onclick={() => count++}>
  Count: {count}
</button>
```

**Explanation:**  
Using `$state` makes reactivity explicit and allows state to be used outside top-level declarations.

---

### `$derived` – Derived/Computed State

**Purpose:**  
Compute a reactive value based on other state variables.

**Svelte 4:**  
```svelte
<script>
  let count = 0;
  $: double = count * 2; // Implicit reactive computation
</script>
```

**Svelte 5 Example:**
```svelte
<script>
  let count = $state(0);
  let double = $derived(count * 2);
</script>

<p>{count} doubled is {double}</p>
```

**Explanation:**  
`$derived` clearly indicates that the value is computed from dependencies, separating it from side-effects.

---

### `$effect` – Reactive Side-Effect

**Purpose:**  
Run side-effects reactively when dependencies change.

**Svelte 4:**  
```svelte
<script>
  let count = 0;
  $: {
    console.log(`Count is ${count}`);
  }
</script>
```

**Svelte 5 Example:**
```svelte
<script>
  let count = $state(0);
  $effect(() => {
    console.log(`Count changed to ${count}`);
  });
</script>
```

**Explanation:**  
`$effect` isolates side-effects to run only when their dependencies update.

---

### `$props` – Component Props Destructuring

**Purpose:**  
Destructure component props using standard JavaScript syntax.

**Svelte 4:**  
```svelte
<script>
  export let title = 'Untitled';
</script>
```

**Svelte 5 Example:**
```svelte
<script>
  let { title = 'Untitled', ...restProps } = $props();
</script>

<h1>{title}</h1>
```

**Explanation:**  
`$props` provides a clear, reactive way to handle props—including rest props—using JS destructuring.

---

### `$bindable` – Two-Way Bindable Props

**Purpose:**  
Explicitly enable two-way binding for specific props.

**Svelte 4:**  
All exported props could be bound by default.

**Svelte 5 Example:**
```svelte
<script>
  let { value = $bindable(), ...props } = $props();
</script>

<input bind:value={value} {...props} />
```

**Explanation:**  
`$bindable` makes two-way data flow opt-in, reducing unintended mutations.

---

### `$inspect` – Debugging Reactive Values

**Purpose:**  
Inspect and trace reactive computations without interrupting execution.

**Svelte 5 Example:**
```svelte
<script>
  let count = $state(0);
  let doubled = $derived($inspect(count * 2));
  $effect(() => {
    $inspect.trace(() => {
      console.log('Effect: count is', count);
    })();
  });
</script>
```

**Explanation:**  
`$inspect` and its tracing functions help debug reactive updates without pausing your code.

---

### `$host` – Component Host Element Access

**Purpose:**  
Access the component’s host DOM element, useful for custom elements and event dispatching.

**Svelte 4:**  
Used `createEventDispatcher()` for custom events.

**Svelte 5 Example:**
```svelte
<script>
  import { onMount } from 'svelte';
  let { onClose = null } = $props();

  function close() {
    onClose?.();
    $host().dispatchEvent(new CustomEvent('close'));
  }

  onMount(() => {
    $host().focus();
  });
</script>

<div tabindex="-1">
  <button on:click={close}>Close</button>
</div>
```

**Explanation:**  
`$host` provides direct access to the component’s DOM element for imperative actions and custom event dispatching.

---

## Snippets

Snippets in Svelte 5 replace the slot mechanism, allowing you to define reusable chunks of markup that can accept parameters and be passed between components.

### Basic Snippet Usage

**Svelte 5 Example:**
```svelte
{#snippet greetingSnippet()}
  <p>Hello, World!</p>
{/snippet}

{@render greetingSnippet()}
```

**Explanation:**  
Defines a static snippet and renders it. This is analogous to a default slot in Svelte 4.

---

### Snippets with Parameters

**Svelte 5 Example:**
```svelte
<script>
  let items = [
    { id: 1, name: 'Apple', price: 0.5 },
    { id: 2, name: 'Banana', price: 0.25 },
    { id: 3, name: 'Orange', price: 0.75 }
  ];
</script>

<ul>
  {#each items as item}
    {@render listItem(item)}
  {/each}
</ul>

{#snippet listItem(item)}
  <li>
    <span>{item.name}:</span>
    <span>${item.price.toFixed(2)}</span>
  </li>
{/snippet}
```

**Explanation:**  
Snippets can accept parameters to render dynamic content in loops, replacing Svelte 4’s slot with `let:` syntax.

---

### Passing Snippets to Child Components

**Parent Component:**
```svelte
<script>
  import Child from './Child.svelte';
  let items = [ /* your items array */ ];
</script>

<Child {items}>
  {#snippet row(item)}
    <li>{item.name}: ${item.price.toFixed(2)}</li>
  {/snippet}
</Child>
```

**Child Component:**
```svelte
<script>
  let { items, row } = $props();
</script>

<ul>
  {#each items as item}
    {@render row(item)}
  {/each}
</ul>
```

**Explanation:**  
Passing snippets as props streamlines component customization compared to named slots.

---

### Handling Fallbacks

**Svelte 5 Example:**
```svelte
<script>
  let { row = null, items } = $props();
  {#snippet defaultRow(item)}
    <li>{item.name} (default): ${item.price}</li>
  {/snippet}
</script>

<ul>
  {#each items as item}
    {@render (row ? row(item) : defaultRow(item))}
  {/each}
</ul>
```

**Explanation:**  
Provides default rendering when a parent does not supply a snippet.

---

## Conclusion

Svelte 5’s runes (`$state`, `$derived`, `$effect`, `$props`, `$bindable`, `$inspect`, `$host`) offer explicit, flexible control over reactivity and component interfaces, while snippets replace slots to create more maintainable and reusable templates. Use this prompt file as a guide to transition from Svelte 4’s implicit patterns to Svelte 5’s explicit and powerful features.
