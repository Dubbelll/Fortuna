<script lang="ts">
	import type { TransitionConfig } from 'svelte/transition'
	import Card from './Card.svelte'

	let {
		discard,
		stash,
		animateIn,
	}: {
		discard: number[][]
		stash: number[]
		animateIn: (node: HTMLElement) => TransitionConfig
	} = $props()
</script>

<div class="discard">
	{@render discardPile(0, 1)}
	{@render discardPile(1, 2)}
	<div id="stash" class="pile" style:grid-column="5">
		{#each stash as card (card)}
			<Card {card} {animateIn} />
		{:else}
			<Card card={undefined} {animateIn} />
		{/each}
	</div>
	{@render discardPile(2, 8)}
	{@render discardPile(3, 9)}
	{@render discardPile(4, 10)}
	{@render discardPile(5, 11)}
</div>

{#snippet discardPile(discardIndex: number, gridColumn: number)}
	<div id={`discard${discardIndex}`} class="pile" style:grid-column={gridColumn}>
		{#each discard[discardIndex] as card (card)}
			<div class="card">
				<Card {card} {animateIn} />
			</div>
		{:else}
			<div class="card">
				<Card card={undefined} {animateIn} />
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
		position: relative;
	}

	.card {
		&:nth-child(n + 2) {
			position: absolute;
			top: 0;
			width: 100%;
			z-index: 0;
		}
	}
</style>
