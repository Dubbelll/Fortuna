<script lang="ts">
	import Card from './Card.svelte'

	let {
		deck,
		startMove,
		move,
	}: {
		deck: number[]
		startMove: (card: number | undefined) => void
		move: () => void
	} = $props()
	let sortedDeck = $derived(deck.toSorted())

	function allowMove(event: DragEvent) {
		event.preventDefault()
	}
</script>

<div class="deck" role="none" ondragover={allowMove} ondrop={move}>
	{#each sortedDeck as card (card)}
		<Card {card} {startMove} movable={true} />
	{/each}
</div>

<style>
	.deck {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 44px;
		overflow-x: auto;
	}
</style>
