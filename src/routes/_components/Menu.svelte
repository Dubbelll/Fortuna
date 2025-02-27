<script lang="ts">
	import type { Mode } from '$lib/play'

	let {
		mode,
		solve,
		shuffle,
		make,
	}: {
		mode: Mode
		solve: () => void
		shuffle: () => void
		make: () => void
	} = $props()
</script>

<div class="menu">
	<button onclick={solve} disabled={mode !== 'idle' && mode !== 'making'}>SOLVE</button>
	<button
		onclick={shuffle}
		disabled={mode !== 'idle' && mode !== 'unsolvable' && mode !== 'making'}
	>
		SHUFFLE
	</button>
	<button onclick={make} disabled={mode !== 'idle' && mode !== 'making'}>MAKE</button>
	{#if mode === 'solved'}
		<button onclick={solve}>SHOW</button>
		<button onclick={shuffle}>PLAY</button>
	{/if}
</div>

<style>
	.menu {
		display: grid;
		justify-content: end;
		gap: 8px;
	}

	button {
		padding: 0 8px;
		border: 2px solid black;
		background-color: white;
	}
</style>
