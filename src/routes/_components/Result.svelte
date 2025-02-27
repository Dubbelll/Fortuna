<script lang="ts">
	import type { Mode } from '$lib/play'
	import type { Move } from '$lib/solve'

	let {
		mode,
		solution,
		startAutoplay,
	}: {
		mode: Mode
		solution: Move[]
		startAutoplay: () => void
	} = $props()
	let dialog: HTMLDialogElement

	export function open() {
		dialog.show()
	}

	function close() {
		dialog.close()
	}

	function autoplay() {
		close()
		startAutoplay()
	}

	function show() {
		console.log(solution)
	}
</script>

<dialog bind:this={dialog}>
	<div class="mode">{mode}</div>
	<div class="menu">
		{#if mode === 'solved'}
			<button onclick={autoplay}>AUTOPLAY</button>
			<button onclick={show}>SHOW</button>
		{/if}
		<button onclick={close}>CLOSE</button>
	</div>
</dialog>

<style>
	dialog[open] {
		display: grid;
		grid-auto-columns: min-content;
		grid-auto-rows: min-content;
		gap: 8px;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		padding: 8px;
		background-color: rgba(0, 0, 0, 0.64);
		border: 0;
	}

	.mode {
		padding: 0 8px;
		background-color: white;
		text-transform: uppercase;
	}

	button {
		padding: 0 8px;
		border: 2px solid black;
		background-color: white;
	}
</style>
