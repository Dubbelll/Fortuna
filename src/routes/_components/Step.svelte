<script lang="ts">
	import { type Step, type SuitRank } from '$lib/play'

	let { step }: { step: Step } = $props()
</script>

{@render target(step.from, 'from')}
<div class="arrow">&#x2192;</div>
{@render target(step.to, 'to')}

{#snippet target(target: 'stash' | 'empty' | SuitRank[], type: string)}
	{#if target === 'stash'}
		<div
			class={{
				spot: true,
				[type]: true,
			}}
		>
			STASH
		</div>
	{:else if target === 'empty'}
		<div
			class={{
				spot: true,
				[type]: true,
			}}
		>
			EMPTY
		</div>
	{:else}
		<div
			class={{
				card: true,
				[type]: true,
				tarot: target[0].suit === 100,
				red: target[0].suit === 200,
				green: target[0].suit === 300,
				blue: target[0].suit === 400,
				yellow: target[0].suit === 500,
			}}
		>
			{#each target as card, index (card.rank)}
				{#if index > 0}
					<span class="separator">,</span>
				{/if}
				<span class="rank">
					{card.rank}
				</span>
			{/each}
		</div>
	{/if}
{/snippet}

<style>
	.spot {
		padding: 0 8px;
		background-color: white;
		border: 2px solid lightgrey;
	}

	.card {
		padding: 0 8px;
		white-space: nowrap;
		background-color: white;
		user-select: none;

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

	.from {
		justify-self: end;
	}

	.to {
		justify-self: start;
	}

	.arrow {
		font-weight: bold;
	}
</style>
