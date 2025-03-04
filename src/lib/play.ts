import type { Move } from './solve'

export type Mode = 'idle' | 'solving' | 'solved' | 'autoplaying' | 'unsolvable' | 'manual'

export interface Step {
	from: 'stash' | SuitRank[]
	to: 'stash' | 'empty' | SuitRank[]
}

export interface SuitRank {
	suit: number
	rank: string
}

export function makePiles(): number[][] {
	const deck = makeShuffledDeck()
	const piles: number[][] = [[], [], [], [], [], [], [], [], [], []]
	for (let column = 0; column < 10; column++) {
		for (let depth = 0; depth < 7; depth++) {
			piles[column][depth] = deck[column * 7 + depth]
		}
	}

	// ensure no cards can be immediately discarded
	// this way the board always has 70 cards like the real game
	const discardable = [100, 121, 202, 302, 402, 502]
	for (let column = 0; column < piles.length; column++) {
		const pile = piles[column]
		if (!discardable.includes(pile[0])) continue

		const target = pile.findIndex((card) => !discardable.includes(card))
		if (target === -1) {
			continue
		}
		;[pile[0], pile[target]] = [pile[target], pile[0]]
	}

	return [...piles.slice(0, 5), [], ...piles.slice(5)]
}

function makeShuffledDeck(): number[] {
	let shuffled = [...deck]
	for (let i = shuffled.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
	}

	return shuffled
}

export function makeDiscard(): number[][] {
	return [[], [], [201], [301], [401], [501]]
}

function makeSuit(card: number): number {
	if (card < 200) return 100
	if (card < 300) return 200
	if (card < 400) return 300
	if (card < 500) return 400
	if (card < 600) return 500

	return 0
}

export function makeRank(card: number | undefined): string {
	if (!card) return ''
	if (card < 200) return (card - 100).toString()
	if (card < 300) return makeDeckRank(card - 200)
	if (card < 400) return makeDeckRank(card - 300)
	if (card < 500) return makeDeckRank(card - 400)
	if (card < 600) return makeDeckRank(card - 500)

	return 'ERR'
}

function makeDeckRank(rank: number): string {
	if (rank < 11) return rank.toString()
	if (rank === 11) return 'J'
	if (rank === 12) return 'Q'
	if (rank === 13) return 'K'

	return 'ERR'
}

export function makeSortedDeck(): number[] {
	return deck.toSorted()
}

export function makeSteps(moves: Move[]): Step[] {
	const steps: Step[] = []
	for (const move of moves) {
		if (move.type === 'stash')
			steps.push({
				from: [makeSuitRank(move.cards[0])],
				to: 'stash',
			})
		if (move.type === 'unstash')
			steps.push({
				from: 'stash',
				to: move.target === undefined ? 'empty' : [makeSuitRank(move.target)],
			})
		if (move.type === 'pile')
			steps.push({
				from: move.cards.map((card) => makeSuitRank(card)),
				to: move.target === undefined ? 'empty' : [makeSuitRank(move.target)],
			})
	}

	return steps
}

function makeSuitRank(card: number): SuitRank {
	return { suit: makeSuit(card), rank: makeRank(card) }
}

const deck = [
	100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118,
	119, 120, 121, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 302, 303, 304, 305,
	306, 307, 308, 309, 310, 311, 312, 313, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412,
	413, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513,
]
