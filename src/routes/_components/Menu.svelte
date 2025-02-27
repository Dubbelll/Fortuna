<script lang="ts">
	import type { Mode } from '$lib/play'

	let {
		mode,
		solve,
		shuffle,
		enter,
		cancel,
		show,
		autoplay,
	}: {
		mode: Mode
		solve: () => void
		shuffle: () => void
		enter: () => void
		cancel: () => void
		show: () => void
		autoplay: () => void
	} = $props()
</script>

<div class="menu">
	<button class="idle" onclick={solve} disabled={mode !== 'idle' && mode !== 'entering'}>
		SOLVE
	</button>
	<button
		class="idle"
		onclick={shuffle}
		disabled={mode !== 'idle' && mode !== 'unsolvable' && mode !== 'entering'}
	>
		SHUFFLE
	</button>
	<button class="idle" onclick={enter} disabled={mode !== 'idle' && mode !== 'entering'}>
		ENTER
	</button>
	{#if mode === 'solved' || mode === 'solving' || mode === 'autoplaying'}
		<button
			class="busy"
			style:grid-row="1"
			onclick={cancel}
			disabled={mode !== 'solving' && mode !== 'autoplaying'}
		>
			CANCEL
		</button>
		<button class="busy" style:grid-row="2" onclick={show} disabled={mode !== 'solved'}>
			SHOW
		</button>
		<button class="busy" style:grid-row="3" onclick={autoplay} disabled={mode !== 'solved'}>
			PLAY
		</button>
	{/if}
</div>

<style>
	.menu {
		display: grid;
		justify-content: end;
		gap: 8px;
	}

	.idle {
		grid-column: 1;
	}

	.busy {
		grid-column: 2;
	}

	button {
		padding: 0 8px;
		border: 2px solid black;
		background-color: white;
	}
</style>
