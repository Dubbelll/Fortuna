<script lang="ts">
	import type { Mode } from '$lib/play'

	type EnabledControls = Record<
		'solve' | 'shuffle' | 'manual' | 'cancel' | 'show' | 'autoplay',
		boolean
	>

	let {
		mode,
		solve,
		shuffle,
		manual,
		cancel,
		show,
		autoplay,
	}: {
		mode: Mode
		solve: () => void
		shuffle: () => void
		manual: () => void
		cancel: () => void
		show: () => void
		autoplay: () => void
	} = $props()
	let enabled: EnabledControls = $derived(makeEnabled(mode))

	function makeEnabled(mode: Mode): EnabledControls {
		return {
			solve: mode === 'idle',
			shuffle:
				mode === 'idle' || mode === 'solved' || mode === 'unsolvable' || mode === 'manual',
			manual: mode === 'idle',
			cancel: mode === 'solving' || mode === 'autoplaying',
			show: mode === 'solved',
			autoplay: mode === 'solved',
		}
	}
</script>

<div class="menu">
	<button onclick={solve} disabled={!enabled.solve}>SOLVE</button>
	<button onclick={cancel} disabled={!enabled.cancel}>CANCEL</button>
	<button onclick={shuffle} disabled={!enabled.shuffle}>SHUFFLE</button>
	<button onclick={show} disabled={!enabled.show}>SHOW</button>
	<button onclick={manual} disabled={!enabled.manual}>MANUAL</button>
	<button onclick={autoplay} disabled={!enabled.autoplay}>PLAY</button>
</div>

<style>
	.menu {
		display: grid;
		grid-template-columns: min-content min-content;
		gap: 8px;
	}

	button {
		padding: 0 8px;
		border: 2px solid black;
		background-color: white;
	}
</style>
