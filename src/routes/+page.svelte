<script lang="ts">
	import { makeDiscard, makePiles, solvableDiscard, solvableGame, solvablePiles } from '$lib/play'
	import type { Move } from '$lib/solve'
	import Solver from '$lib/solve?worker'
	import { onMount } from 'svelte'
	import type { TransitionConfig } from 'svelte/transition'
	import Board from './_components/Board.svelte'
	import Discard from './_components/Discard.svelte'

	let piles = $state(solvablePiles)
	let discard = $state(solvableDiscard)
	let stash: number[] = $state([])
	let solution: Move[] = $state([])
	let solving = $state(false)

	let solver: Worker
	let animateInById: Record<string, DOMRect | undefined> = {}

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
		//const game = makeGame($state.snapshot(piles))
		solver.postMessage({ code: 'start', payload: solvableGame })
	}

	function next() {
		const move = solution.shift()
		if (!move) return

		queueAnimations(move)
		if (move.type === 'pile') {
			for (let i = 0; i < move.cards.length; i++) {
				const card = piles[move.from].shift()
				if (!card) return
				piles[move.to] = [card, ...piles[move.to]]
			}
		}
		if (move.type === 'stash') {
			stash.push(piles[move.from].shift()!)
		}
		if (move.type === 'unstash') {
			piles[move.to] = [stash.pop()!, ...piles[move.to]]
		}
		if (move.type === 'discardPile') {
			discard[move.to].push(piles[move.from].shift()!)
		}
		if (move.type === 'discardStash') {
			discard[move.to].push(stash.pop()!)
		}
	}

	function queueAnimations(move: Move) {
		if (move.type === 'pile') {
			for (let i = 0; i < move.cards.length; i++) {
				const id = `card${move.cards[i]}`
				animateInById[id] = document.getElementById(id)?.getBoundingClientRect()
			}
		} else {
			let id = ''
			if (move.type === 'stash') {
				id = `card${piles[move.from][0]}`
			}
			if (move.type === 'unstash') {
				id = `card${stash}`
			}
			if (move.type === 'discardPile') {
				id = `card${piles[move.from][0]}`
			}
			if (move.type === 'discardStash') {
				id = `card${stash}`
			}

			animateInById[id] = document.getElementById(id)?.getBoundingClientRect()
		}
	}

	function animateIn(node: HTMLElement): TransitionConfig {
		const offset = animateInById[node.id]
		if (!offset) return {}
		const bounds = node.getBoundingClientRect()

		// start from offset (where card came from) and then back to bounds (where card is now)
		const x = offset.x - bounds.x
		const y = offset.y - bounds.y
		return {
			delay: 0,
			duration: 320,
			css: (t: number, u: number) => `transform: translate(${x * u}px,${y * u}px)`,
		}
	}
</script>

<div class="container">
	<div class="controls">
		<button onclick={start} disabled={solving}>SOLVE</button>
		<button onclick={reset} disabled={solving}>RESET</button>
		<button onclick={next} disabled={solution.length === 0}>NEXT</button>
	</div>
	<Discard {discard} {stash} {animateIn} />
	<Board {piles} {animateIn} />
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
