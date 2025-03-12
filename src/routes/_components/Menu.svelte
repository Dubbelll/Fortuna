<script lang="ts">
	import { STEP_LIST_ID } from '$lib/popover'
	import type { Move } from '$lib/solve'
	import Mode, { type Mode as ModeType } from './Mode.svelte'

	let {
		mode,
		solution,
		selectMode,
		solve,
		shuffle,
		manual,
		autoplay,
	}: {
		mode: ModeType
		solution: Move[]
		selectMode: (mode: ModeType) => void
		solve: () => void
		shuffle: () => void
		manual: () => void
		autoplay: () => void
	} = $props()
</script>

<div class="menu">
	<Mode {mode} {selectMode} />
	{#if mode === 'auto'}
		<button onclick={autoplay}>PLAY</button>
		<button popovertarget={STEP_LIST_ID}>STEPS</button>
		<button onclick={shuffle}>SHUFFLE</button>
	{/if}
	{#if mode === 'manual'}
		{#if solution.length > 0}
			<button onclick={autoplay}>PLAY</button>
			<button popovertarget={STEP_LIST_ID}>STEPS</button>
		{/if}
		<button onclick={solve}>SOLVE</button>
	{/if}
</div>

<style>
	.menu {
		display: grid;
		grid-template-columns: max-content;
		grid-auto-rows: min-content;
		gap: 8px;
	}

	button {
		padding: 0 8px;
		border: none;
		border-radius: 4px;
		background-color: var(--white);
	}
</style>
