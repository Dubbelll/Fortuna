<script lang="ts">
	import { makeDiscard, makeSortedDeck, type Mode } from '$lib/play'
	import type {
		GeneratedMessage,
		GenerateMessage,
		Move,
		SolvedMessage,
		SolveMessage,
		UnsolvableMessage,
	} from '$lib/solve'
	import Solver from '$lib/solve?worker'
	import { onMount } from 'svelte'
	import type { TransitionConfig } from 'svelte/transition'
	import Board from './_components/Board.svelte'
	import Deck from './_components/Deck.svelte'
	import Discard from './_components/Discard.svelte'
	import Explanation from './_components/Explanation.svelte'
	import Menu from './_components/Menu.svelte'
	import StepList from './_components/StepList.svelte'

	let mode: Mode = $state('idle')
	let piles: number[][] = $state([[], [], [], [], [], [], [], [], [], [], []])
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
		solver.onmessage = (
			event: MessageEvent<GeneratedMessage | SolvedMessage | UnsolvableMessage>,
		) => {
			if (event.data.key === 'generated') {
				mode = 'solved'
				piles = event.data.payload.piles
				solution = event.data.payload.solution
			}
			if (event.data.key === 'solved') {
				mode = 'solved'
				solution = event.data.payload
			}
			if (event.data.key === 'unsolvable') {
				mode = 'unsolvable'
				solution = []
			}
		}

		const message: GenerateMessage = { key: 'generate', payload: undefined }
		solver.postMessage(message)
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
		stash = []
		piles = [[], [], [], [], [], [], [], [], [], [], []]
		animateInById = {}

		const message: GenerateMessage = { key: 'generate', payload: undefined }
		solver.postMessage(message)
	}

	function manual() {
		mode = 'manual'
		discard = makeDiscard()
		deck = makeSortedDeck()
		piles = [[], [], [], [], [], [], [], [], [], [], []]
		solution = []
		animateInById = {}
	}

	function autoplay() {
		mode = 'autoplaying'
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
		if (move.type === 'destash') {
			discard[move.to].push(stash.pop()!)
		}
		if (move.type === 'discard') {
			discard[move.to].push(piles[move.from].shift()!)
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
			if (move.type === 'destash') {
				id = `card${stash}`
			}
			if (move.type === 'discard') {
				id = `card${piles[move.from][0]}`
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

<div class="page">
	<div class="content">
		<div class="game">
			<div class="discard">
				<Menu {mode} {solve} {shuffle} {manual} {autoplay} popovers={{ steps: 'steps' }} />
				<Discard
					{discard}
					{stash}
					{animateIn}
					startMove={startDiscardMove}
					move={moveToDiscard}
				/>
			</div>
			{#if mode === 'manual'}
				<Deck {deck} startMove={startDeckMove} move={moveToDeck} />
			{/if}
			<Board {piles} {animateIn} startMove={startBoardMove} move={moveToBoard} />
			<StepList {solution} id="steps" />
		</div>
		<Explanation />
	</div>
</div>

<svelte:head>
	<title>Fortuna</title>
</svelte:head>

<style>
	.page {
		display: flex;
		justify-content: center;
		background-color: var(--brown);
	}

	.content {
		display: grid;
		grid-auto-columns: min-content;
		gap: 16px;
		padding: 16px;
	}

	.game {
		position: relative;
		display: grid;
		justify-content: start;
		gap: 8px;
		width: min(calc(100dvw - 32px), 816px);
		max-height: calc(100dvh - 32px);
		padding: 16px;
		border-radius: 8px;
		background-color: var(--black);
	}

	.discard {
		display: grid;
		grid-template-columns: min-content auto;
		justify-content: space-between;
		gap: 8px;
	}
</style>
