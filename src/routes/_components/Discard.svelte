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
	{@render pile('discard0', discard[0], 1)}
	{@render pile('discard1', discard[1], 2)}
	{@render pile('stash', stash, 5)}
	{@render pile('discard2', discard[2], 8)}
	{@render pile('discard3', discard[3], 9)}
	{@render pile('discard4', discard[4], 10)}
	{@render pile('discard5', discard[5], 11)}
</div>

{#snippet pile(id: string, pile: number[], column: number)}
	<div {id} class="pile" style:grid-column={column}>
		<div class="card">
			<Card card={undefined} {animateIn} />
		</div>
		{#each pile as card (card)}
			<div class="card">
				<Card {card} {animateIn} />
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
</style>
