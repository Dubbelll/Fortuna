import type { Game } from './solve'

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
		if (target === -1) continue
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

export function makeFace(card: number | undefined): string {
	if (!card) return ''

	if (card >= 99 && card < 200) return 'T' + (card - 100)
	if (card >= 200 && card < 300) return 'R' + (card - 200)
	if (card >= 300 && card < 400) return 'G' + (card - 300)
	if (card >= 400 && card < 500) return 'B' + (card - 400)
	if (card >= 500 && card < 600) return 'Y' + (card - 500)

	return ''
}

const deck = [
	100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118,
	119, 120, 121, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 302, 303, 304, 305,
	306, 307, 308, 309, 310, 311, 312, 313, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412,
	413, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513,
]

export const solvablePiles = [
	[114, 406, 306, 410, 107, 210, 413],
	[212, 100, 208, 408, 505, 411, 502],
	[302, 209, 205, 121, 110, 206, 303],
	[115, 113, 307, 308, 118, 117, 305],
	[106, 207, 409, 503, 304, 311, 108],
	[],
	[510, 412, 211, 402, 504, 202, 103],
	[102, 509, 111, 116, 112, 512, 109],
	[105, 119, 506, 404, 405, 513, 403],
	[204, 310, 309, 312, 213, 104, 507],
	[101, 511, 203, 508, 313, 407, 120],
]
export const solvableDiscard = [[], [], [201], [301], [401], [501]]
export const solvableGame: Game = {
	key: '114212302115106X51010210520410199122201301401501X',
	piles: [
		[114, 406, 306, 410, 107, 210, 413],
		[212, 100, 208, 408, 505, 411, 502],
		[302, 209, 205, 121, 110, 206, 303],
		[115, 113, 307, 308, 118, 117, 305],
		[106, 207, 409, 503, 304, 311, 108],
		[],
		[510, 412, 211, 402, 504, 202, 103],
		[102, 509, 111, 116, 112, 512, 109],
		[105, 119, 506, 404, 405, 513, 403],
		[204, 310, 309, 312, 213, 104, 507],
		[101, 511, 203, 508, 313, 407, 120],
	],
	discard: [99, 122, 201, 301, 401, 501],
	stash: [],
	remaining: 70,
	iteration: 0,
	solution: [],
}
