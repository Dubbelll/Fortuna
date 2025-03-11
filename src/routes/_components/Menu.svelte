<script lang="ts">
	import Mode, { type Mode as ModeType } from './Mode.svelte'

	let {
		popovers,
		solve,
		shuffle,
		manual,
		autoplay,
	}: {
		popovers: { steps: string }
		solve: () => void
		shuffle: () => void
		manual: () => void
		autoplay: () => void
	} = $props()
	let mode: ModeType = $state('auto')

	function selectMode(selected: ModeType) {
		if (mode === selected) return

		mode = selected
		if (selected === 'auto') shuffle()
		if (selected === 'manual') manual()
	}
</script>

<div class="menu">
	<Mode {mode} select={selectMode} />
	{#if mode === 'auto'}
		<button onclick={autoplay}>PLAY</button>
		<button popovertarget={popovers.steps}>STEPS</button>
		<button onclick={shuffle}>SHUFFLE</button>
	{/if}
	{#if mode === 'manual'}
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
