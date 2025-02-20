export interface Game {
	// discard + top cards + stash
	key: string
	// top card first
	piles: Pile[]
	// tarotLow, tarotHigh, red, green, blue, yellow
	discard: Discard
	// card on top of discard
	stash: number[]
	// part of heuristic (h) in A*
	remaining: number
	// cost (g) in A*
	iteration: number
	// previous game
	solution: Move[]
	// move that made this game
	by: string
}

type Pile = number[]

type Discard = [number, number, number, number, number, number]

export interface Move {
	type: 'pile' | 'stash' | 'unstash'
	cards: number[]
	from: number
	to: number
}

const deck = [
	100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118,
	119, 120, 121, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 302, 303, 304, 305,
	306, 307, 308, 309, 310, 311, 312, 313, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412,
	413, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513,
]

// worker
self.onmessage = (event: MessageEvent<{ code: string; payload: any }>) => {
	if (event.data.code === 'start') {
		const solution = astar(event.data.payload)
		if (solution) self.postMessage({ code: 'done', payload: solution })
		else self.postMessage({ code: 'fail', payload: undefined })
	}
}

// playing
function astar(start: Game): Move[] | undefined {
	// game can have possible discards at the start
	discard(start)

	let open: Game[] = [start]
	let closed: Game[] = []

	while (open.length > 0) {
		// cheapest open node according to A* cheapness (f = g + h)
		let cheapest = 0
		for (let i = 0; i < open.length; i++) {
			const a = open[i]
			const b = open[cheapest]
			if (isBetter(a, b)) cheapest = i
		}
		const node = open[cheapest]

		if (node.remaining === 0) {
			return node.solution
		}

		open = open.slice(0, cheapest).concat(open.slice(cheapest + 1))
		closed.push(node)
		const neighbors = makeNextGames(node)
		for (const neighbor of neighbors) {
			// bad node skip to next
			if (closed.find((node) => node.key === neighbor.key)) continue

			// good new node so consider it an option
			if (!open.find((node) => node.key === neighbor.key)) open.push(neighbor)
		}
	}

	return undefined
}

function isBetter(a: Game, b: Game): boolean {
	return (
		a.remaining < b.remaining ||
		a.stash.length < b.stash.length ||
		a.piles.reduce((empty, pile) => (pile.length === 0 ? empty + 1 : empty), 0) >
			b.piles.reduce((empty, pile) => (pile.length === 0 ? empty + 1 : empty), 0)
	)
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
				game.discard[suit] = stash
				game.stash.shift()
				game.remaining--
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
				game.discard[suit] = card
				game.piles[column].shift()
				game.remaining--
				discarded = true
			}
		}
	}

	game.key = makeKey(game)
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
		remaining: game.remaining,
		iteration: game.iteration + 1,
		solution: game.solution.concat(move),
		by: moveToString(move, game),
	}
	play(move, next)
	discard(next)

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
			// unless the bottom card (will become top) can be discarded
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
			})
		}
	}

	return moves
}

export function makeKey(game: Game): string {
	let key = ''
	for (const pile of game.piles) {
		key += pile[0] || 'X'
	}
	for (const discard of game.discard) {
		key += discard
	}
	return key + (game.stash[0] || 'X')
}

function makeGame(piles: Pile[]): Game {
	const game: Game = {
		key: '',
		piles,
		discard: [99, 122, 201, 301, 401, 501],
		stash: [],
		remaining: 70,
		iteration: 0,
		solution: [],
		by: '',
	}
	game.key = makeKey(game)
	return game
}

// parsing
export function parse(input: string): Game {
	const piles = input.split('\n').map((column) => {
		if (column === 'x') return []

		return column.split(' ').map((element) => {
			const suit = parseSuit(element.substring(0, 1))
			const rank = parseRank(element.substring(1))

			return suit + rank
		})
	})
	const cards = piles.reduce((cards, pile) => cards.concat(pile), [])
	const isValid = cards.length === deck.length && deck.every((card) => cards.includes(card))
	if (!isValid) throw 'invalid input'

	return makeGame(piles)
}

function parseSuit(suit: string): number {
	switch (suit) {
		case 't':
			return 100
		case 'r':
			return 200
		case 'g':
			return 300
		case 'b':
			return 400
		case 'y':
			return 500
		default:
			return 0
	}
}

function parseRank(rank: string): number {
	return parseInt(rank)
}

// convenience
function moveToString(move: Move, game: Game): string {
	if (move.type === 'stash') return `${move.cards[0]}->STASH`
	if (move.type === 'unstash') return `STASH${move.cards[0]}->${game.piles[move.to][0] || 'X'}`
	if (move.type === 'pile') return `${move.cards}->${game.piles[move.to][0] || 'X'}`
	return 'UNKNOWN'
}
