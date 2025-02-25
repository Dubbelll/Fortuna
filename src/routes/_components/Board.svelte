<script lang="ts">
	import type { TransitionConfig } from 'svelte/transition'
	import Card from './Card.svelte'

	let {
		piles,
		animateIn,
	}: {
		piles: number[][]
		animateIn: (node: HTMLElement) => TransitionConfig
	} = $props()
	let reversedPiles = $derived(piles.map((pile) => [...pile].reverse()))
</script>

<div class="board">
	{#each reversedPiles as pile, pileIndex}
		<div id={`pile${pileIndex}`} class="pile">
			<div class="card">
				<Card card={undefined} {animateIn} />
			</div>
			{#each pile as card, cardIndex (card)}
				<div class="card" style:margin-top={`${cardIndex * 25}px`}>
					<Card {card} {animateIn} />
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.board {
		display: grid;
		grid-template-columns: repeat(11, 1fr);
		column-gap: 8px;
	}

	.pile {
		display: grid;
	}

	.card {
		grid-column: 1;
		grid-row: 1;
	}
</style>
