<script lang="ts">
	import { UNSOLVABLE_ID } from '$lib/popover'

	let element: HTMLDivElement

	export function show() {
		element.showPopover()
	}
</script>

<div id={UNSOLVABLE_ID} class="unsolvable" popover="auto" bind:this={element}>
	<p class="message">UNSOLVABLE</p>
	<button popovertarget={UNSOLVABLE_ID} popovertargetaction="hide">CLOSE</button>
</div>

<style>
	.unsolvable {
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		top: 32px;
		left: 32px;
		padding: 8px;
		border: none;
		border-radius: 4px;
		background-color: var(--red);
		box-shadow: 0 4px 8px var(--black);

		&:popover-open {
			display: flex;
		}
	}

	.message {
		margin-left: 8px;
	}

	button {
		padding: 0 8px;
		border: none;
		border-radius: 4px;
		background-color: var(--white);
	}
</style>
