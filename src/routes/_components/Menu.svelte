<script lang="ts">
	import type { Mode } from '$lib/play'

	type EnabledControls = Record<
		'solve' | 'shuffle' | 'manual' | 'showSteps' | 'showStats' | 'autoplay',
		boolean
	>

	let {
		mode,
		popovers,
		solve,
		shuffle,
		manual,
		autoplay,
	}: {
		mode: Mode
		popovers: { steps: string }
		solve: () => void
		shuffle: () => void
		manual: () => void
		autoplay: () => void
	} = $props()
</script>

<div class="menu">
	<button onclick={autoplay}>AUTO</button>
	<button popovertarget={popovers.steps}>STEPS</button>
	<button onclick={shuffle}>SHUFFLE</button>
</div>

<style>
	.menu {
		display: grid;
		grid-template-columns: min-content;
		gap: 8px;
	}

	button {
		padding: 0 8px;
		border: none;
		border-radius: 4px;
		background-color: var(--white);
	}
</style>
