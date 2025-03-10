<script lang="ts">
	import type { TransitionConfig } from 'svelte/transition'
	import Card from './Card.svelte'
	import Placeholder from './Placeholder.svelte'

	let {
		piles,
		startMove,
		move,
		animateIn,
	}: {
		piles: number[][]
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
			<Placeholder text="EMPTY" />
			{#each pile as card, cardIndex (card)}
				<Card {card} {startMove} {animateIn} movable={true} offset={cardIndex * 28} />
			{/each}
		</div>
	{/each}
</div>

<style>
	.board {
		position: relative;
		display: grid;
		grid-template-columns: repeat(11, 1fr);
		column-gap: 8px;
		overflow: auto;
	}

	.pile {
		display: grid;
	}
</style>
