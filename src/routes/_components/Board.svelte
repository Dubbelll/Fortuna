<script lang="ts">
	import type { Card } from '$lib/play'
	import PlayingCard from './PlayingCard.svelte'

	let { piles }: { piles: Card[][] } = $props()
	let columns = $derived(piles.map((pile) => [...pile].reverse()))
</script>

<div class="board">
	{#each columns as column}
		<div class="pile">
			{#each column as card, index (card.id)}
				<div class="card" style:margin-top={`${index * 24}px`}>
					<PlayingCard {card} />
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.board {
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
</style>
