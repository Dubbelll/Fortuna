import { makeDiscard, makePiles } from './play'
import { PriorityQueue } from './queue'

export interface Game {
	// sorted values of discard + top cards
	key: string
	// top card first
	piles: number[][]
	// tarotLow, tarotHigh, red, green, blue, yellow
	discard: number[]
	// card on top of discard
	stash: number[]
	// remaining - (empty * 0.1) + (stash * 0.1)
	penalty: number
	// first move last
	solution: Move[]
}

export interface Move {
	type: 'pile' | 'stash' | 'unstash' | 'destash' | 'discard'
	cards: number[]
	from: number
	to: number
	target: number | undefined
}

export interface GenerateMessage {
	key: 'generate'
	payload: undefined
}

export interface GeneratedMessage {
	key: 'generated'
	payload: { piles: number[][]; solution: Move[] }
}

export interface SolveMessage {
	key: 'solve'
	payload: { piles: number[][]; discard: number[][]; stash: number[] }
}

export interface SolvedMessage {
	key: 'solved'
	payload: Move[]
}

export interface UnsolvableMessage {
	key: 'unsolvable'
	payload: undefined
}

// 0 remaining - (11 empty * 0.1) + (empty stash * 0.1)
const SOLVED_PENALTY = -1.1

// worker
self.onmessage = (event: MessageEvent<GenerateMessage | SolveMessage>) => {
	if (event.data.key === 'generate') {
		const payload = generate()
		const message: GeneratedMessage = { key: 'generated', payload }
		self.postMessage(message)
	}

	if (event.data.key === 'solve') {
		const game = makeGame(event.data.payload)
		const solution = solve(game)

		if (solution) {
			const message: SolvedMessage = { key: 'solved', payload: solution }
			self.postMessage(message)
		} else {
			const message: UnsolvableMessage = { key: 'unsolvable', payload: undefined }
			self.postMessage(message)
		}
	}
}

// playing
function generate(): {
	piles: number[][]
	solution: Move[]
} {
	const discard = makeDiscard()
	const stash: number[] = []
	let piles: number[][] = []
	let solution: Move[] | undefined = undefined
	while (solution === undefined) {
		piles = makePiles()
		solution = solve(makeGame({ piles, discard, stash }))
	}

	return { piles, solution }
}

function solve(start: Game): Move[] | undefined {
	const queue: PriorityQueue = new PriorityQueue(start)
	const openKeys: Record<string, boolean> = { [start.key]: true }
	const closedKeys: Record<string, boolean> = {}

	while (queue.size > 0) {
		const node = queue.pop()!
		if (node.penalty === SOLVED_PENALTY) return node.solution

		openKeys[node.key] = false
		closedKeys[node.key] = true
		const neighbors = makeNextGames(node)
		for (const neighbor of neighbors) {
			// bad node skip to next
			if (closedKeys[neighbor.key]) continue

			// good new node so consider it an option
			if (!openKeys[neighbor.key]) {
				queue.push(neighbor)
				openKeys[neighbor.key] = true
			}
		}
	}

	return undefined
}

function play(move: Move, game: Game) {
	if (move.type === 'stash') {
		game.piles[move.from].shift()
		game.stash.push(move.cards[0])
	}
	if (move.type === 'unstash') {
		game.stash.shift()
		game.piles[move.to] = [move.cards[0], ...game.piles[move.to]]
	}
	if (move.type === 'pile') {
		for (const card of move.cards) {
			game.piles[move.from].shift()
			game.piles[move.to] = [card, ...game.piles[move.to]]
		}
	}
}

function discard(game: Game) {
	let discarded = true
	while (discarded) {
		discarded = false

		const stash = game.stash[0]
		if (stash < 200) {
			const suit = game.discard.findIndex((discard) => Math.abs(discard - stash) === 1)
			if (suit !== -1) {
				game.solution.push({
					type: 'destash',
					cards: [stash],
					from: 0,
					to: suit,
					target: game.discard[suit],
				})
				game.discard[suit] = stash
				game.stash.shift()
				discarded = true
			}
		}

		for (let column = 0; column < game.piles.length; column++) {
			if (game.piles[column].length === 0) continue

			const card = game.piles[column][0]
			const suit = game.discard.findIndex(
				(discard) =>
					Math.abs(discard - card) === 1 && (card < 200 || game.stash.length === 0),
			)
			if (suit !== -1) {
				game.solution.push({
					type: 'discard',
					cards: [card],
					from: column,
					to: suit,
					target: game.discard[suit],
				})
				game.discard[suit] = card
				game.piles[column].shift()
				discarded = true
			}
		}
	}
}

function update(game: Game) {
	game.key = makeKey(game.piles, game.discard)
	game.penalty = makePenalty(game.piles, game.stash)
}

// constructing
function makeNextGames(game: Game): Game[] {
	const moves = makePossibleMoves(game)

	return moves.map((move) => makeNextGame(move, game))
}

function makeNextGame(move: Move, game: Game): Game {
	const next: Game = {
		key: game.key,
		piles: game.piles.map((pile) => [...pile]),
		discard: [...game.discard],
		stash: [...game.stash],
		penalty: game.penalty,
		solution: game.solution.concat(move),
	}
	play(move, next)
	discard(next)
	update(next)

	return next
}

function makePossibleMoves(game: Game): Move[] {
	const moves: Move[] = []
	const firstEmptyColumn = game.piles.findIndex((pile) => pile.length === 0)

	// stash -> firstEmpty
	if (firstEmptyColumn > -1 && game.stash.length > 0)
		moves.push({
			type: 'unstash',
			cards: game.stash,
			from: 0,
			to: firstEmptyColumn,
			target: undefined,
		})

	for (let from = 0; from < game.piles.length; from++) {
		if (game.piles[from].length === 0) continue

		// stack1 -> firstEmpty
		if (firstEmptyColumn > -1) {
			const cards: number[] = []
			for (const card of game.piles[from]) {
				if (cards.length === 0) cards.push(card)
				else if (Math.abs(cards[cards.length - 1] - card) === 1) cards.push(card)
				else break
			}
			// prevent moves that just move stacks between piles
			// unless the last card (will become first) can be discarded
			if (
				game.piles[from].length - cards.length !== 0 ||
				game.discard.findIndex(
					(discard) => Math.abs(discard - cards[cards.length - 1]) === 1,
				) !== -1
			)
				moves.push({
					type: 'pile',
					cards,
					from,
					to: firstEmptyColumn,
					target: undefined,
				})
		}

		const card1 = game.piles[from][0]
		// card1 -> stash
		if (firstEmptyColumn === -1 && game.piles[from].length > 0 && game.stash.length === 0)
			moves.push({
				type: 'stash',
				cards: [card1],
				from,
				to: 0,
				target: undefined,
			})

		for (let to = 0; to < game.piles.length; to++) {
			if (to === from || game.piles[to].length === 0) continue

			const card2 = game.piles[to][0]
			if (Math.abs(card1 - card2) !== 1) continue
			if (game.piles[from].length === 1 && game.piles[to].length === 1) continue

			// stack1 -> card2
			const stack1: number[] = []
			for (const card of game.piles[from]) {
				if (stack1.length === 0) stack1.push(card)
				else if (Math.abs(stack1[stack1.length - 1] - card) === 1) stack1.push(card)
				else break
			}
			moves.push({
				type: 'pile',
				cards: stack1,
				from,
				to,
				target: card2,
			})
		}
	}

	return moves
}

function makeKey(piles: number[][], discard: number[]): string {
	const key: number[] = [...discard]
	for (const pile of piles) {
		if (pile.length !== 0) key.push(pile[0])
	}

	return key.sort((a, b) => a - b).join('')
}

function makePenalty(piles: number[][], stash: number[]): number {
	let remaining = 0
	let emptyPiles = 0
	for (let column = 0; column < piles.length; column++) {
		if (piles[column].length === 0) emptyPiles++
		for (let depth = 0; depth < piles[column].length; depth++) {
			remaining++
		}
	}

	return remaining - emptyPiles * 0.1 + stash.length * 0.1
}

function makeGame(payload: { piles: number[][]; discard: number[][]; stash: number[] }): Game {
	const tarotDiscardDefaults = [99, 122]
	const discard = payload.discard.map(
		(suit, i) => suit[suit.length - 1] || tarotDiscardDefaults[i],
	)
	const game: Game = {
		key: makeKey(payload.piles, discard),
		piles: payload.piles,
		discard: discard,
		stash: payload.stash,
		penalty: makePenalty(payload.piles, payload.stash),
		solution: [],
	}

	return game
}
