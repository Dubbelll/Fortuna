<script lang="ts">
	import { makeDiscard, makePiles, makeSortedDeck, type Mode } from '$lib/play'
	import type { Move, SolvedMessage, SolveMessage, UnsolvableMessage } from '$lib/solve'
	import Solver from '$lib/solve?worker'
	import { onMount } from 'svelte'
	import type { TransitionConfig } from 'svelte/transition'
	import Board from './_components/Board.svelte'
	import Deck from './_components/Deck.svelte'
	import Discard from './_components/Discard.svelte'

	let mode: Mode = $state('idle')
	let piles = $state(makePiles())
	let discard = $state(makeDiscard())
	let stash: number[] = $state([])
	let solution: Move[] = $state([])
	let deck = $state(makeSortedDeck())
	let movingDiscardCard: number | undefined = $state(undefined)
	let movingBoardCard: number | undefined = $state(undefined)
	let movingDeckCard: number | undefined = $state(undefined)

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

	function shuffle() {
		mode = 'idle'
		discard = makeDiscard()
		piles = makePiles()
		solution = []
		animateInById = {}
	}

	function make() {
		mode = 'making'
		discard = makeDiscard()
		deck = makeSortedDeck()
		piles = [[], [], [], [], [], [], [], [], [], [], []]
		solution = []
		animateInById = {}
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

	function startDiscardMove(card: number | undefined) {
		movingDiscardCard = card
	}

	function startBoardMove(card: number | undefined) {
		movingBoardCard = card
	}

	function startDeckMove(card: number | undefined) {
		movingDeckCard = card
	}

	function moveToBoard(column: number) {
		if (movingDiscardCard) {
			discard = discard.map((suit) => suit.filter((card) => card !== movingDiscardCard))
			stash = stash.filter((card) => card !== movingDiscardCard)
			piles[column] = [movingDiscardCard].concat(piles[column])
			movingDiscardCard = undefined
		}
		if (movingBoardCard) {
			piles = piles.map((pile) => pile.filter((card) => card !== movingBoardCard))
			piles[column] = [movingBoardCard].concat(piles[column])
			movingBoardCard = undefined
		}
		if (movingDeckCard) {
			deck = deck.filter((card) => card !== movingDeckCard)
			piles[column] = [movingDeckCard].concat(piles[column])
			movingDeckCard = undefined
		}
	}

	function moveToDiscard(suit: number) {
		if (movingBoardCard) {
			piles = piles.map((pile) => pile.filter((card) => card !== movingBoardCard))
			if (suit === -1) stash.push(movingBoardCard)
			else discard[suit].push(movingBoardCard)
			movingBoardCard = undefined
		}
		if (movingDeckCard) {
			deck = deck.filter((card) => card !== movingDeckCard)
			if (suit === -1) stash.push(movingDeckCard)
			else discard[suit].push(movingDeckCard)
			movingDeckCard = undefined
		}
	}

	function moveToDeck() {
		if (movingDiscardCard) {
			discard = discard.map((suit) => suit.filter((card) => card !== movingDiscardCard))
			stash = stash.filter((card) => card !== movingDiscardCard)
			deck.push(movingDiscardCard)
			movingDiscardCard = undefined
		}
		if (movingBoardCard) {
			piles = piles.map((pile) => pile.filter((card) => card !== movingBoardCard))
			deck.push(movingBoardCard)
			movingBoardCard = undefined
		}
	}
</script>

<div class="container">
	<div class="game">
		<Discard
			{discard}
			{stash}
			{mode}
			{solve}
			{shuffle}
			{make}
			{animateIn}
			startMove={startDiscardMove}
			move={moveToDiscard}
		/>
		{#if mode === 'making'}
			<Deck {deck} startMove={startDeckMove} move={moveToDeck} />
		{/if}
		<Board {piles} {mode} {animateIn} startMove={startBoardMove} move={moveToBoard} />
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

	.game {
		display: grid;
		gap: 8px;
		max-height: calc(100dvh - 16px);
		overflow-x: auto;
	}
</style>
