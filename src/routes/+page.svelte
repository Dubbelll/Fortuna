<script lang="ts">
	import { makeDiscard, makePiles, solvableDiscard, solvablePiles } from '$lib/play'
	import type { Move, SolvedMessage, SolveMessage, UnsolvableMessage } from '$lib/solve'
	import Solver from '$lib/solve?worker'
	import { onMount } from 'svelte'
	import type { TransitionConfig } from 'svelte/transition'
	import Board from './_components/Board.svelte'
	import Discard from './_components/Discard.svelte'

	let mode: 'idle' | 'solving' | 'playing' | 'paused' | 'unsolvable' = $state('idle')
	let piles = $state(solvablePiles)
	let discard = $state(solvableDiscard)
	let stash: number[] = $state([])
	let solution: Move[] = $state([])

	let solver: Worker
	let animateInById: Record<string, DOMRect | undefined> = {}

	onMount(() => {
		solver = new Solver()
		solver.onmessage = (event: MessageEvent<SolvedMessage | UnsolvableMessage>) => {
			if (event.data.key === 'solved') {
				solution = event.data.payload
				play()
			}
			if (event.data.key === 'unsolvable') {
				mode = 'unsolvable'
				solution = []
			}
		}
	})

	function shuffle() {
		mode = 'idle'
		discard = makeDiscard()
		piles = makePiles()
		solution = []
		animateInById = {}
	}

	function solve() {
		mode = 'solving'
		const message: SolveMessage = {
			key: 'solve',
			payload: {
				piles: $state.snapshot(piles),
				discard: $state.snapshot(discard),
				stash: $state.snapshot(stash),
			},
		}
		solver.postMessage(message)
	}

	function play() {
		mode = 'playing'
		let interval = setInterval(() => {
			if (solution.length > 0) next()
			else {
				clearInterval(interval)
				mode = 'idle'
			}
		}, 320)
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
		<button onclick={solve} disabled={mode !== 'idle'}>SOLVE</button>
		<button onclick={shuffle} disabled={mode !== 'idle' && mode !== 'unsolvable'}>
			SHUFFLE
		</button>
	</div>
	<div class="game">
		<Discard {discard} {stash} {animateIn} />
		<Board {piles} {animateIn} />
		{#if mode === 'unsolvable'}
			<div class="unsolvable">
				<p>UNSOLVABLE</p>
			</div>
		{/if}
	</div>
</div>

<svelte:head>
	<title>Fortuna</title>
</svelte:head>

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

	.game {
		position: relative;
		display: grid;
		gap: 8px;
	}

	.unsolvable {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			to bottom right,
			transparent calc(50% - 1px),
			red 0,
			red calc(50% + 1px),
			transparent 0
		);
		border: 2px solid red;

		& > p {
			padding: 0 8px;
			background-color: white;
			border: 2px solid red;
		}
	}
</style>
