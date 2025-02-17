import type { Game } from './solve'

export interface Card {
	id: number
	face: string
}

type Column = Card[]

export function makeGame(columns: Column[]): Game {
	return {
		piles: columns.map((column) => column.map((card) => card.id)),
		discard: [99, 122, 201, 301, 401, 501],
		solution: [],
		remaining: 70,
		penalty: 0,
	}
}

export function makeDiscard(): Card[] {
	return [
		{ id: 99, face: 'T99' },
		{ id: 122, face: 'T122' },
		{ id: 201, face: 'R1' },
		{ id: 301, face: 'G1' },
		{ id: 401, face: 'B1' },
		{ id: 501, face: 'Y1' },
	]
}

export function makePiles(): Column[] {
	let deck = makeShuffledDeck()
	let piles: Card[][] = [[], [], [], [], [], [], [], [], [], []]
	for (let column = 0; column < 10; column++) {
		for (let depth = 0; depth < 7; depth++) {
			piles[column][depth] = deck[column * 7 + depth]
		}
	}
	return [...piles.slice(0, 5), [], ...piles.slice(5), []]
}

function makeShuffledDeck(): Card[] {
	let shuffled = [...deck]
	for (let i = shuffled.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
	}
	return shuffled
}

const deck: Card[] = [
	{ id: 100, face: 'T0' },
	{ id: 101, face: 'T1' },
	{ id: 102, face: 'T2' },
	{ id: 103, face: 'T3' },
	{ id: 104, face: 'T4' },
	{ id: 105, face: 'T5' },
	{ id: 106, face: 'T6' },
	{ id: 107, face: 'T7' },
	{ id: 108, face: 'T8' },
	{ id: 109, face: 'T9' },
	{ id: 110, face: 'T10' },
	{ id: 111, face: 'T11' },
	{ id: 112, face: 'T12' },
	{ id: 113, face: 'T13' },
	{ id: 114, face: 'T14' },
	{ id: 115, face: 'T15' },
	{ id: 116, face: 'T16' },
	{ id: 117, face: 'T17' },
	{ id: 118, face: 'T18' },
	{ id: 119, face: 'T19' },
	{ id: 120, face: 'T20' },
	{ id: 121, face: 'T21' },
	{ id: 202, face: 'R2' },
	{ id: 203, face: 'R3' },
	{ id: 204, face: 'R4' },
	{ id: 205, face: 'R5' },
	{ id: 206, face: 'R6' },
	{ id: 207, face: 'R7' },
	{ id: 208, face: 'R8' },
	{ id: 209, face: 'R9' },
	{ id: 210, face: 'R10' },
	{ id: 211, face: 'R11' },
	{ id: 212, face: 'R12' },
	{ id: 213, face: 'R13' },
	{ id: 302, face: 'G2' },
	{ id: 303, face: 'G3' },
	{ id: 304, face: 'G4' },
	{ id: 305, face: 'G5' },
	{ id: 306, face: 'G6' },
	{ id: 307, face: 'G7' },
	{ id: 308, face: 'G8' },
	{ id: 309, face: 'G9' },
	{ id: 310, face: 'G10' },
	{ id: 311, face: 'G11' },
	{ id: 312, face: 'G12' },
	{ id: 313, face: 'G13' },
	{ id: 402, face: 'B2' },
	{ id: 403, face: 'B3' },
	{ id: 404, face: 'B4' },
	{ id: 405, face: 'B5' },
	{ id: 406, face: 'B6' },
	{ id: 407, face: 'B7' },
	{ id: 408, face: 'B8' },
	{ id: 409, face: 'B9' },
	{ id: 410, face: 'B10' },
	{ id: 411, face: 'B11' },
	{ id: 412, face: 'B12' },
	{ id: 413, face: 'B13' },
	{ id: 502, face: 'Y2' },
	{ id: 503, face: 'Y3' },
	{ id: 504, face: 'Y4' },
	{ id: 505, face: 'Y5' },
	{ id: 506, face: 'Y6' },
	{ id: 507, face: 'Y7' },
	{ id: 508, face: 'Y8' },
	{ id: 509, face: 'Y9' },
	{ id: 510, face: 'Y10' },
	{ id: 511, face: 'Y11' },
	{ id: 512, face: 'Y12' },
	{ id: 513, face: 'Y13' },
]
