<script lang="ts">
	import type { Card } from '$lib/play'
	import PlayingCard from './PlayingCard.svelte'

	let { discard, stash }: { discard: Card[]; stash: Card | undefined } = $props()
</script>

<div class="discard">
	<div class="card" style:grid-column="1">
		<PlayingCard card={discard[0]} />
	</div>
	<div class="card" style:grid-column="2">
		<PlayingCard card={discard[1]} />
	</div>
	{#if stash}
		<div class="card" style:grid-column="5">
			<PlayingCard card={stash} />
		</div>
	{/if}
	<div class="card" style:grid-column="8">
		<PlayingCard card={discard[2]} />
	</div>
	<div class="card" style:grid-column="9">
		<PlayingCard card={discard[3]} />
	</div>
	<div class="card" style:grid-column="10">
		<PlayingCard card={discard[4]} />
	</div>
	<div class="card" style:grid-column="11">
		<PlayingCard card={discard[5]} />
	</div>
</div>

<style>
	.discard {
		display: grid;
		grid-template-columns: repeat(11, 1fr);
		gap: 8px;
	}
</style>
