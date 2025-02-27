<script lang="ts">
	import type { TransitionConfig } from 'svelte/transition'
	import Card from './Card.svelte'

	let {
		discard,
		stash,
		startMove,
		move,
		animateIn,
	}: {
		discard: number[][]
		stash: number[]
		startMove: (card: number | undefined) => void
		move: (suit: number) => void
		animateIn: (node: HTMLElement) => TransitionConfig
	} = $props()

	function allowMove(event: DragEvent) {
		event.preventDefault()
	}
</script>

<div class="discard">
	{@render pile('discard0', discard[0], 0)}
	{@render pile('discard1', discard[1], 1)}
	{@render pile('stash', stash, -1)}
	{@render pile('discard2', discard[2], 2)}
	{@render pile('discard3', discard[3], 3)}
	{@render pile('discard4', discard[4], 4)}
	{@render pile('discard5', discard[5], 5)}
</div>

{#snippet pile(id: string, pile: number[], suit: number)}
	<div {id} class="pile" role="none" ondragover={allowMove} ondrop={() => move(suit)}>
		<Card />
		{#each pile as card (card)}
			<Card {card} {startMove} {animateIn} movable={true} />
		{/each}
	</div>
{/snippet}

<style>
	.discard {
		display: grid;
		grid-auto-flow: column;
		gap: 8px;
		overflow-x: auto;
	}

	.pile {
		display: grid;
	}
</style>
