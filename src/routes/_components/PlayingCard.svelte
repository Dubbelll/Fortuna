<script lang="ts">
	import type { Card } from '$lib/play'

	let { card }: { card: Card } = $props()
</script>

<div
	class="card"
	class:tarot={card.id >= 100 && card.id < 200}
	class:red={card.id >= 200 && card.id < 300}
	class:green={card.id >= 300 && card.id < 400}
	class:blue={card.id >= 400 && card.id < 500}
	class:yellow={card.id >= 500 && card.id < 600}
>
	<span class="face">{card.face}</span>
</div>

<style>
	.card {
		width: 100%;
		aspect-ratio: 2.5 / 3.5;
		background-color: white;
		user-select: none;
		cursor: move;

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

	.face {
		background-color: white;
	}
</style>
