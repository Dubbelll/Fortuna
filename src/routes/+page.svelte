<script lang="ts">
	import example from '$lib/example.txt?raw'
	import type { Step } from '$lib/game'
	import Game from '$lib/game?worker'
	import { onMount } from 'svelte'

	let input = $state(example)
	let remaining = $state(0)
	let lowestRemaining = $state(70)
	let solution = $state('')

	let game: Worker
	onMount(() => {
		game = new Game()
		game.onmessage = (event: MessageEvent<{ code: string; payload: any }>) => {
			if (event.data.code === 'update') {
				remaining = event.data.payload.reduce(
					(sum: number, pile: number[]) => sum + pile.length,
					0,
				)
				lowestRemaining = Math.min(lowestRemaining, remaining)
				// iteration = event.data.payload.map(
				// 	(step: [number, number]) => `${step[0]}->${step[1]}`,
				// )
			}
			if (event.data.code === 'done') {
				remaining = 0
				lowestRemaining = 0
				solution = event.data.payload.solution
					.map(
						(step: Step) =>
							`${step.from}->${step.to}${step.type === 'discard' ? '(auto)\n' : '\n'}`,
					)
					.join('')
			}
		}
	})

	function start() {
		game.postMessage({ code: 'start', payload: input })
	}
</script>

<p contenteditable bind:textContent={input}></p>
<button onclick={start}>START</button>
<p>{remaining}</p>
<p>{lowestRemaining}</p>
<p>{solution}</p>

<style>
	p {
		white-space: pre;
	}
</style>
