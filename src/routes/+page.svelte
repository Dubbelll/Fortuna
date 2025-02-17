<script lang="ts">
	import example from '$lib/example.txt?raw'
	import type { Step } from '$lib/game'
	import Game from '$lib/game?worker'
	import { makePiles } from '$lib/play'
	import { onMount } from 'svelte'
	import Board from './_components/Board.svelte'

	let piles = $state(makePiles())
	let input = $state(example)
	let iteration = $state(0)
	let remaining = $state(70)
	let lowestRemaining = $state(70)
	let solution = $state('')

	let game: Worker
	onMount(() => {
		game = new Game()
		game.onmessage = (event: MessageEvent<{ code: string; payload: any }>) => {
			if (event.data.code === 'update') {
				iteration += 1
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

<Board {piles} />
<p contenteditable bind:textContent={input}></p>
<button onclick={start}>START</button>
<p>{iteration}</p>
<p>{solution}</p>

<style>
	p {
		white-space: pre;
	}
</style>
