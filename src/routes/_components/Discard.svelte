<script lang="ts">
	import type { Mode } from '$lib/play'
	import type { TransitionConfig } from 'svelte/transition'
	import Card from './Card.svelte'

	let {
		discard,
		stash,
		mode,
		solve,
		shuffle,
		make,
		startMove,
		move,
		animateIn,
	}: {
		discard: number[][]
		stash: number[]
		mode: Mode
		solve: () => void
		shuffle: () => void
		make: () => void
		startMove: (card: number | undefined) => void
		move: (suit: number) => void
		animateIn: (node: HTMLElement) => TransitionConfig
	} = $props()

	function allowMove(event: DragEvent) {
		event.preventDefault()
	}
</script>

<div class="discard">
	{@render pile('discard0', discard[0], 0, 1)}
	{@render pile('discard1', discard[1], 1, 2)}
	<div class="controls">
		<button onclick={solve} disabled={mode !== 'idle' && mode !== 'making'}>SOLVE</button>
		<button
			onclick={shuffle}
			disabled={mode !== 'idle' && mode !== 'unsolvable' && mode !== 'making'}
		>
			SHUFFLE
		</button>
		<button onclick={make} disabled={mode !== 'idle' && mode !== 'making'}>MAKE</button>
	</div>
	{@render pile('stash', stash, -1, 7)}
	{@render pile('discard2', discard[2], 2, 8)}
	{@render pile('discard3', discard[3], 3, 9)}
	{@render pile('discard4', discard[4], 4, 10)}
	{@render pile('discard5', discard[5], 5, 11)}
</div>

{#snippet pile(id: string, pile: number[], suit: number, column: number)}
	<div
		{id}
		class="pile"
		style:grid-column={column}
		role="none"
		ondragover={allowMove}
		ondrop={() => move(suit)}
	>
		<div class="card">
			<Card />
		</div>
		{#each pile as card (card)}
			<div class="card">
				<Card {card} {startMove} {animateIn} movable={true} />
			</div>
		{/each}
	</div>
{/snippet}

<style>
	.discard {
		display: grid;
		grid-template-columns: repeat(11, 1fr);
		gap: 8px;
	}

	.pile {
		display: grid;
	}

	.card {
		grid-column: 1;
		grid-row: 1;
	}

	.controls {
		grid-column: 3/7;
		display: grid;
		justify-content: center;
		align-content: center;
		gap: 8px;
	}

	button {
		padding: 0 8px;
		border: 2px solid black;
		background-color: white;
	}
</style>
