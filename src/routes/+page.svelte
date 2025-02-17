<script lang="ts">
	import { makeDiscard, makeGame, makePiles } from '$lib/play'
	import type { Step } from '$lib/solve'
	import Solver from '$lib/solve?worker'
	import { onMount } from 'svelte'
	import Board from './_components/Board.svelte'
	import Discard from './_components/Discard.svelte'

	let discard = $state(makeDiscard())
	let piles = $state(makePiles())
	let solution: Step[] = $state([])
	let solving = $state(false)

	let solver: Worker
	onMount(() => {
		solver = new Solver()
		solver.onmessage = (event: MessageEvent<{ code: string; payload: any }>) => {
			if (event.data.code === 'done') {
				solving = false
				solution = event.data.payload.solution
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
		const step = solution.shift()
		if (!step) return

		const card = piles[step.from].shift()
		if (!card) return
		if (step.type === 'move') {
			piles[step.to] = [card, ...piles[step.to]]
		}
		if (step.type === 'discard') {
			discard[step.to] = card
		}
	}
</script>

<div class="container">
	<div class="controls">
		<button onclick={reset} disabled={solving}>RESET</button>
		<button onclick={start} disabled={solving}>SOLVE</button>
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
		gap: 8px;
	}

	button {
		border: 2px solid black;
		background-color: white;
	}
</style>
