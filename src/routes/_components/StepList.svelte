<script lang="ts">
	import { makeSteps } from '$lib/play'
	import type { Move } from '$lib/solve'
	import Step from './Step.svelte'

	let {
		id,
		solution,
	}: {
		id: string
		solution: Move[]
	} = $props()
	let steps = $derived(makeSteps(solution))
</script>

<div {id} class="container" popover="auto">
	<button popovertarget={id} popovertargetaction="hide">CLOSE</button>
	<div class="steps">
		{#each steps as step}
			<Step {step} />
		{/each}
	</div>
</div>

<style>
	.container {
		grid-template-rows: min-content 1fr;
		top: 16px;
		left: 16px;
		max-height: calc(100% - 32px);
		border-radius: 8px;
		background-color: var(--black);

		&:popover-open {
			display: grid;
		}
	}

	button {
		margin: 8px;
		padding: 0 8px;
		border: none;
		border-radius: 4px;
		background-color: var(--white);
	}

	.steps {
		display: grid;
		grid-template-columns: max-content min-content max-content;
		gap: 8px;
		overflow-y: auto;
		padding: 0 8px 8px 8px;
	}
</style>
