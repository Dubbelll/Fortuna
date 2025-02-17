<script lang="ts">
	import type { Card } from '$lib/play'
	import PlayingCard from './PlayingCard.svelte'

	let { discard }: { discard: Card[] } = $props()
</script>

<div class="discard">
	{#each discard as card (card.id)}
		<div class="card">
			<PlayingCard {card} />
		</div>
	{/each}
</div>

<style>
	.discard {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 8px;
	}
</style>
