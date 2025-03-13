<script lang="ts">
	import { makeSteps } from '$lib/play'
	import { STEP_LIST_ID } from '$lib/popover'
	import type { Move } from '$lib/solve'
	import Step from './Step.svelte'

	let { solution }: { solution: Move[] } = $props()
	let steps = $derived(makeSteps(solution))
</script>

<div id={STEP_LIST_ID} class="stepList" popover="auto">
	<button class="close" popovertarget={STEP_LIST_ID} popovertargetaction="hide">&#x2A09;</button>
	<div class="steps">
		{#each steps as step}
			<Step {step} />
		{/each}
	</div>
</div>

<style>
	.stepList {
		position: fixed;
		inset: unset;
		top: 0;
		right: 0;
		grid-template-rows: min-content 1fr;
		gap: 16px;
		max-height: 100%;
		overflow-y: auto;
		border: none;
		background-color: var(--black);

		&:popover-open {
			display: grid;
		}
	}

	.steps {
		display: grid;
		grid-template-columns: max-content min-content max-content;
		gap: 8px;
		padding: 16px;
	}

	.close {
		position: sticky;
		top: 16px;
		right: 16px;
		justify-self: end;
		width: 24px;
		height: 24px;
		border: none;
		border-radius: 4px;
		background-color: var(--white);
		box-shadow: 0 0 16px var(--black);
	}
</style>
