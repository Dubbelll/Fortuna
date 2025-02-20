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
	<div id="discard0" class="pile" style:grid-column="1">
		{#each discard[0] as card (card)}
			<div class="card">
				<Card {card} {animateIn} />
			</div>
		{/each}
	</div>
	<div id="discard1" class="pile" style:grid-column="2">
		{#each discard[1] as card (card)}
			<div class="card">
				<Card {card} {animateIn} />
			</div>
		{/each}
	</div>
	<div id="stash" class="pile" style:grid-column="5">
		{#each stash as card (card)}
			<Card {card} {animateIn} />
		{/each}
	</div>
	<div id="discard2" class="pile" style:grid-column="8">
		{#each discard[2] as card (card)}
			<div class="card">
				<Card {card} {animateIn} />
			</div>
		{/each}
	</div>
	<div id="discard3" class="pile" style:grid-column="9">
		{#each discard[3] as card (card)}
			<div class="card">
				<Card {card} {animateIn} />
			</div>
		{/each}
	</div>
	<div id="discard4" class="pile" style:grid-column="10">
		{#each discard[4] as card (card)}
			<div class="card">
				<Card {card} {animateIn} />
			</div>
		{/each}
	</div>
	<div id="discard5" class="pile" style:grid-column="11">
		{#each discard[5] as card (card)}
			<div class="card">
				<Card {card} {animateIn} />
			</div>
		{/each}
	</div>
</div>

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
		}
	}
</style>
