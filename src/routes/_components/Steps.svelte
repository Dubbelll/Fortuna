<script lang="ts">
	import type { Move } from '$lib/solve'

	let {
		id,
		solution,
	}: {
		id: string
		solution: Move[]
	} = $props()
</script>

<div {id} class="container" popover="auto">
	<button popovertarget={id} popovertargetaction="hide">CLOSE</button>
	<div class="steps">
		{#each solution as step}
			<p>{step.from}&rarr;{step.to}</p>
		{/each}
	</div>
</div>

<style>
	.container {
		position: relative;
		grid-auto-columns: min-content;
		grid-auto-rows: min-content;
		gap: 8px;
		top: 8px;
		left: 8px;
		max-height: calc(100% - 16px);
		padding: 8px;
		border: 0;

		&:popover-open {
			display: grid;
		}
	}

	button {
		position: sticky;
		top: 0;
		padding: 0 8px;
		border: 2px solid black;
		background-color: white;
	}
</style>
