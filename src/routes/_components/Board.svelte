<script lang="ts">
	import type { TransitionConfig } from 'svelte/transition'
	import Card from './Card.svelte'

	let {
		piles,
		mode,
		startMove,
		move,
		animateIn,
	}: {
		piles: number[][]
		mode: string
		startMove: (card: number | undefined) => void
		move: (column: number) => void
		animateIn: (node: HTMLElement) => TransitionConfig
	} = $props()
	let reversedPiles = $derived(piles.map((pile) => [...pile].reverse()))

	function allowMove(event: DragEvent) {
		event.preventDefault()
	}
</script>

<div class="board">
	{#each reversedPiles as pile, pileIndex}
		<div
			id={`pile${pileIndex}`}
			class="pile"
			role="none"
			ondragover={allowMove}
			ondrop={() => move(pileIndex)}
		>
			<Card />
			{#each pile as card, cardIndex (card)}
				<Card {card} {startMove} {animateIn} movable={true} offset={cardIndex * 25} />
			{/each}
		</div>
	{/each}
	{#if mode === 'unsolvable'}
		<div class="unsolvable">
			<p>UNSOLVABLE</p>
		</div>
	{/if}
</div>

<style>
	.board {
		position: relative;
		display: grid;
		justify-content: start;
		grid-template-columns: repeat(11, 1fr);
		column-gap: 8px;
		overflow: auto;
	}

	.pile {
		display: grid;
	}

	.unsolvable {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			to bottom right,
			transparent calc(50% - 1px),
			red 0,
			red calc(50% + 1px),
			transparent 0
		);
		border: 2px solid red;

		& > p {
			padding: 0 8px;
			background-color: white;
			border: 2px solid red;
		}
	}
</style>
