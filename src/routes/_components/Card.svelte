<script lang="ts">
	import { makeFace } from '$lib/play'
	import type { TransitionConfig } from 'svelte/transition'

	let {
		card = undefined,
		movable = false,
		startMove,
		animateIn,
	}: {
		card?: number
		movable?: boolean
		startMove?: (card: number | undefined) => void
		animateIn?: (node: HTMLElement) => TransitionConfig
	} = $props()
	let face = $derived(makeFace(card))

	function maybeAnimateIn(node: HTMLElement): TransitionConfig {
		if (animateIn) return animateIn(node)
		else return {}
	}
</script>

<div
	id={card ? `card${card}` : ''}
	class={{
		card: true,
		empty: !card,
		tarot: card && card >= 99 && card < 200,
		red: card && card >= 200 && card < 300,
		green: card && card >= 300 && card < 400,
		blue: card && card >= 400 && card < 500,
		yellow: card && card >= 500 && card < 600,
	}}
	role="none"
	draggable={movable}
	ondragstart={startMove ? () => startMove(card) : undefined}
	in:maybeAnimateIn
>
	{#if card}
		<div class="face">{face}</div>
	{/if}
</div>

<style>
	.card {
		width: 100%;
		min-width: 44px;
		aspect-ratio: 2.5 / 3.5;
		background-color: white;
		user-select: none;

		&.empty {
			border: 2px solid lightgrey;
		}

		&.tarot {
			border: 2px solid black;

			& > .face {
				color: black;
			}
		}

		&.red {
			border: 2px solid red;

			& > .face {
				color: red;
			}
		}

		&.green {
			border: 2px solid green;

			& > .face {
				color: green;
			}
		}

		&.blue {
			border: 2px solid blue;

			& > .face {
				color: blue;
			}
		}

		&.yellow {
			border: 2px solid yellow;

			& > .face {
				color: yellow;
			}
		}
	}

	.face {
		padding-left: 4px;
	}
</style>
