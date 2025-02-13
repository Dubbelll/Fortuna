export interface Game {
	// top card first
	piles: Pile[]
	// tarotLow, tarotHigh, yellow, red, green, blue
	discard: Discard
	solution: Step[]
}

type Pile = number[]

type Discard = [number, number, number, number, number, number]

export interface Step {
	type: 'board' | 'discard'
	card: number
	from: number
	to: number
	penalty: number
}

interface Spot {
	type: 'board' | 'discard'
	column: number
	penalty: number
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
		const game = parse(event.data.payload)
		solve(game)
	}
}

// playing
let solution: Game | undefined = undefined
function solve(game: Game) {
	solution = undefined
	followBranch(game)
}

function followBranch(game: Game) {
	if (solution) return
	if (game.piles.every((pile) => pile.length === 0)) {
		solution = game
		self.postMessage({ code: 'done', payload: game })
		return
	}

	self.postMessage({ code: 'update', payload: game.piles })
	const branches = makeBranches(game)
	for (const branch of branches) {
		followBranch(branch)
	}

	return
}

function perform(step: Step, game: Game) {
	if (step.type === 'board') {
		game.piles[step.from].shift()
		game.piles[step.to] = [step.card, ...game.piles[step.to]]
	}
	if (step.type === 'discard') {
		game.piles[step.from].shift()
		game.discard[step.to] = step.card
	}
}

// constructing

function makeGame(piles: Pile[]): Game {
	return {
		piles,
		discard: [99, 122, 201, 301, 401, 501],
		solution: [],
	}
}

function makeBranches(game: Game): Game[] {
	const options = makeBestMoves(game)
	return options.map((steps) => makeBranch(steps, game))
}

function makeBranch(steps: Step[], game: Game): Game {
	const branch: Game = {
		piles: game.piles.map((pile) => [...pile]),
		discard: [...game.discard],
		solution: [...game.solution, ...steps],
	}
	for (const step of steps) {
		perform(step, branch)
	}

	return branch
}

function makeBestMoves(game: Game): Step[][] {
	let options: {
		steps: Step[]
		penalty: number
	}[] = []
	for (let from = 0; from < game.piles.length; from++) {
		const pile = game.piles[from]
		for (let depth = 0; depth < pile.length; depth++) {
			const card = pile[depth]
			const to = game.discard.findIndex((discard) => Math.abs(discard - card) === 1)
			if (to === -1) continue

			const steps: Step[] = []
			const blockers = game.piles[from].slice(0, depth)
			for (const blocker of blockers) {
				const spot = makeBestSpot(blocker, from, steps, game)
				if (spot)
					steps.push({
						type: spot.type,
						card: blocker,
						from: from,
						to: spot.column,
						penalty: spot.penalty,
					})
			}
			if (steps.length !== blockers.length) continue

			steps.push({
				type: 'discard',
				card,
				from,
				to,
				penalty: -1,
			})
			options.push({
				steps,
				penalty: steps.reduce((sum, step) => sum + step.penalty, 0),
			})
		}
	}

	return options.toSorted((a, b) => a.penalty - b.penalty).map((option) => option.steps)
}

function makeBestSpot(card1: number, column1: number, steps: Step[], game: Game): Spot | undefined {
	let spots: Spot[] = []

	for (let column2 = 0; column2 < game.piles.length; column2++) {
		if (column2 === column1) continue
		const card2 =
			steps.find((step) => step.type === 'board' && step.to === column2)?.card ||
			game.piles[column2][0]

		// overflow
		if (card2 === undefined && column2 === game.piles.length - 1)
			spots.push({ type: 'board', column: column2, penalty: 3 })
		// empty pile
		if (card2 === undefined && column2 !== game.piles.length - 1)
			spots.push({ type: 'board', column: column2, penalty: 2 })
		// stack up
		if (Math.abs(card1 - card2) === 1 && card1 > card2)
			spots.push({ type: 'board', column: column2, penalty: 1 })
		// stack down
		if (Math.abs(card1 - card2) === 1 && card1 < card2)
			spots.push({ type: 'board', column: column2, penalty: 0 })
		// discard
		const column3 = game.discard.findIndex((card3) => Math.abs(card1 - card3) === 1)
		if (column3 !== -1) spots.push({ type: 'discard', column: column3, penalty: -1 })
	}

	return spots.toSorted((a, b) => a.penalty - b.penalty)[0]
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
		case 'y':
			return 200
		case 'r':
			return 300
		case 'b':
			return 400
		case 'g':
			return 500
		default:
			return 0
	}
}

function parseRank(rank: string): number {
	return parseInt(rank)
}
