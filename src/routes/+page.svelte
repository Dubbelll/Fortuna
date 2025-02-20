<script lang="ts">
	import { makeDiscard, makeGame, makePiles, type Card } from '$lib/play'
	import type { Move } from '$lib/solve'
	import Solver from '$lib/solve?worker'
	import { onMount } from 'svelte'
	import Board from './_components/Board.svelte'
	import Discard from './_components/Discard.svelte'

	let piles = $state(makePiles())
	let discard = $state(makeDiscard())
	let stash: Card | undefined = $state(undefined)
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
		const move = solution.shift()
		if (!move) return

		if (move.type === 'pile') {
			for (let i = 0; i < move.cards.length; i++) {
				const card = piles[move.from].shift()
				if (!card) return
				piles[move.to] = [card, ...piles[move.to]]
			}
		}
		if (move.type === 'stash') {
			const card = piles[move.from].shift()
			if (!card) return
			stash = card
		}
		if (move.type === 'unstash') {
			if (!stash) return
			piles[move.to] = [stash, ...piles[move.to]]
			stash = undefined
		}
		if (move.type === 'discardPile') {
			const card = piles[move.from].shift()
			if (!card) return
			discard[move.to] = card
		}
		if (move.type === 'discardStash') {
			if (!stash) return
			discard[move.to] = stash
			stash = undefined
		}
	}
</script>

<div class="container">
	<div class="controls">
		<button onclick={start} disabled={solving}>SOLVE</button>
		<button onclick={reset} disabled={solving}>RESET</button>
		<button onclick={next} disabled={solution.length === 0}>NEXT</button>
	</div>
	<Discard {discard} {stash} />
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
