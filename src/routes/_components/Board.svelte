<script lang="ts">
	import type { TransitionConfig } from 'svelte/transition'
	import Card from './Card.svelte'

	let {
		piles,
		mode,
		animateIn,
	}: {
		piles: number[][]
		mode: string
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
