<script lang="ts">
	import type { TransitionConfig } from 'svelte/transition'
	import Card from './Card.svelte'

	let {
		discard,
		stash,
		animateIn,
	}: {
		discard: (number | undefined)[]
		stash: number | undefined
		animateIn: (node: HTMLElement) => TransitionConfig
	} = $props()
</script>

<div class="discard">
	<div id="discard0" class="card" style:grid-column="1">
		<Card card={discard[0]} {animateIn} />
	</div>
	<div id="discard1" class="card" style:grid-column="2">
		<Card card={discard[1]} {animateIn} />
	</div>
	<div id="stash" class="card" style:grid-column="5">
		<Card card={stash} {animateIn} />
	</div>
	<div id="discard2" class="card" style:grid-column="8">
		<Card card={discard[2]} {animateIn} />
	</div>
	<div id="discard3" class="card" style:grid-column="9">
		<Card card={discard[3]} {animateIn} />
	</div>
	<div id="discard4" class="card" style:grid-column="10">
		<Card card={discard[4]} {animateIn} />
	</div>
	<div id="discard5" class="card" style:grid-column="11">
		<Card card={discard[5]} {animateIn} />
	</div>
</div>

<style>
	.discard {
		display: grid;
		grid-template-columns: repeat(11, 1fr);
		gap: 8px;
	}
</style>
