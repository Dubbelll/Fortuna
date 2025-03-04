<script lang="ts">
	import { makeRank } from '$lib/play'
	import type { TransitionConfig } from 'svelte/transition'

	let {
		card = undefined,
		movable = false,
		offset = undefined,
		stack = true,
		startMove,
		animateIn,
	}: {
		card?: number
		movable?: boolean
		offset?: number
		stack?: boolean
		startMove?: (card: number | undefined) => void
		animateIn?: (node: HTMLElement) => TransitionConfig
	} = $props()
	let rank = $derived(makeRank(card))

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
	style:margin-top={offset ? `${offset}px` : undefined}
	style:grid-column={stack ? 1 : undefined}
	style:grid-row={stack ? 1 : undefined}
	role="none"
	draggable={movable}
	ondragstart={startMove ? () => startMove(card) : undefined}
	in:maybeAnimateIn
>
	{#if card}
		<div class="rank">{rank}</div>
	{/if}
</div>

<style>
	.card {
		width: 64px;
		aspect-ratio: 1 / 1.64;
		background-color: white;
		user-select: none;

		&.empty {
			border: 2px solid lightgrey;
		}

		&.tarot {
			border: 2px solid black;
		}

		&.red {
			border: 2px solid red;
		}

		&.green {
			border: 2px solid green;
		}

		&.blue {
			border: 2px solid blue;
		}

		&.yellow {
			border: 2px solid yellow;
		}
	}

	.rank {
		padding-left: 4px;
	}
</style>
