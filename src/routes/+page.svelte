<script lang="ts">
	import { makeDiscard, makeGame, makePiles } from '$lib/play'
	import type { Move } from '$lib/solve'
	import Solver from '$lib/solve?worker'
	import { onMount } from 'svelte'
	import Board from './_components/Board.svelte'
	import Discard from './_components/Discard.svelte'

	let discard = $state(makeDiscard())
	let piles = $state(makePiles())
	let solution: Move[] = $state([])
	let solving = $state(false)

	let solver: Worker
	onMount(() => {
		solver = new Solver()
		solver.onmessage = (event: MessageEvent<{ code: string; payload: any }>) => {
			if (event.data.code === 'done') {
				solving = false
				solution = event.data.payload
			}
			if (event.data.code === 'fail') {
				solving = false
				solution = []
			}
		}
	})

	function reset() {
		discard = makeDiscard()
		piles = makePiles()
		solution = []
		solving = false
	}

	function start() {
		solving = true
		const game = makeGame($state.snapshot(piles))
		solver.postMessage({ code: 'start', payload: game })
	}

	function next() {
		// const move = solution.shift()
		// if (!move) return
		// const card = piles[move.from].shift()
		// if (!card) return
		// if (move.type === 'move') {
		// 	piles[move.to] = [card, ...piles[move.to]]
		// }
		// if (move.type === 'discard') {
		// 	discard[move.to] = card
		// }
	}
</script>

<div class="container">
	<div class="controls">
		<button onclick={start} disabled={solving}>SOLVE</button>
		<button onclick={reset} disabled={solving}>RESET</button>
		<button onclick={next} disabled={solution.length === 0}>NEXT</button>
	</div>
	<Discard {discard} />
	<Board {piles} />
</div>

<style>
	.container {
		display: grid;
		gap: 8px;
		padding: 8px;
	}
	.controls {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: min-content;
		gap: 8px;
	}

	button {
		padding: 0 8px;
		border: 2px solid black;
		background-color: white;
	}
</style>
