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
		popovers: { steps: string; stats: string }
		solve: () => void
		shuffle: () => void
		manual: () => void
		autoplay: () => void
	} = $props()
	let enabled: EnabledControls = $derived(makeEnabled(mode))

	function makeEnabled(mode: Mode): EnabledControls {
		return {
			solve: mode === 'idle',
			shuffle: true,
			manual: mode === 'idle',
			showSteps: mode === 'solved',
			showStats: mode === 'solved',
			autoplay: mode === 'solved',
		}
	}
</script>

<div class="menu">
	<button onclick={solve} disabled={!enabled.solve}>SOLVE</button>
	<button popovertarget={popovers.steps} disabled={!enabled.showSteps}>STEPS</button>
	<button onclick={shuffle} disabled={!enabled.shuffle}>SHUFFLE</button>
	<button popovertarget={popovers.stats} disabled={!enabled.showSteps}>STATS</button>
	<button onclick={manual} disabled={!enabled.manual}>MANUAL</button>
	<button onclick={autoplay} disabled={!enabled.autoplay}>AUTO</button>
</div>

<style>
	.menu {
		display: grid;
		grid-template-columns: min-content min-content;
		gap: 8px;
	}

	button {
		padding: 0 8px;
		border: none;
		border-radius: 4px;
		background-color: var(--white);
	}
</style>
