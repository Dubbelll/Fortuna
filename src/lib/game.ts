type Pile = number[]
type Discard = [number, number, number, number, number, number]
type Move = [number, number]
//type Step = [number, number]
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

// export interface Game {
// 	// sum of top cards
// 	id: number
// 	// top card first
// 	piles: Pile[]
// 	// tarotLow, tarotHigh, yellow, red, green, blue
// 	discard: Discard
// 	branches: Game[] | undefined
// 	solution: Step[]
// 	// previous ids
// 	history: number[]
// 	score: number
// 	previousScores: number[]
// }
export interface Game {
	// top card first
	piles: Pile[]
	// tarotLow, tarotHigh, yellow, red, green, blue
	discard: Discard
	solution: Step[]
}

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
		console.log('BINGO', game)
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

// function stack(game: Game) {
// 	let moves = 0
// 	for (let column1 = 0; column1 < game.piles.length; column1++) {
// 		const card1 = game.piles[column1][0]
// 		if (card1 === undefined) continue

// 		for (let column2 = 0; column2 < game.piles.length; column2++) {
// 			const card2 = game.piles[column2][0]
// 			if (card2 === undefined || Math.abs(card1 - card2) !== 1) continue

// 			if (card1 < card2) {
// 				move(card1, column1, column2, game)
// 				game.solution.push([column1, column2])
// 			}
// 			if (card1 > card2) {
// 				move(card2, column2, column1, game)
// 				game.solution.push([column2, column1])
// 			}
// 			settle(game)
// 			moves += 1
// 		}
// 	}
// 	if (moves !== 0) stack(game)
// }

// function settle(game: Game) {
// 	let discards = 0
// 	for (let from = 0; from < game.piles.length; from++) {
// 		const card1 = game.piles[from][0]

// 		// can't move from board if there is overflow
// 		if (from !== game.piles.length - 1 && game.piles[game.piles.length - 1].length !== 0)
// 			continue

// 		for (let to = 0; to < game.discard.length; to++) {
// 			const card2 = game.discard[to]
// 			if (Math.abs(card1 - card2) !== 1) continue

// 			discard(card1, from, to, game)
// 			discards += 1
// 		}
// 	}
// 	if (discards !== 0) settle(game)
// 	else {
// 		game.history.push(game.id)
// 		game.previousScores.push(game.score)
// 		game.id = makeId(game.piles)
// 		game.score = makeScore(game)
// 	}
// }

function move(card: number, from: number, to: number, game: Game) {
	game.piles[from].shift()
	game.piles[to] = [card, ...game.piles[to]]
}

function discard(card: number, from: number, to: number, game: Game) {
	game.piles[from].shift()
	game.discard[to] = card
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

// filtering & sorting

// function filterBranches(branch: Game): boolean {
// 	return !branch.history.includes(branch.id)
// }

// function sortBranches(a: Game, b: Game): number {
// 	return b.score - a.score
// }

// function isDeadEnd(game: Game): boolean {
// 	if (game.previousScores.length < 10) return false

// 	return game.previousScores.slice(-10).reduce((sum, score) => sum + score, 0) === game.score
// }

// function preferOpenOverflow(a: Game, b: Game): number {
// 	return a.piles[a.piles.length - 1].length - b.piles[b.piles.length - 1].length
// }

// function preferProgress(a: Game, b: Game): number {
// 	const scoreA = makeScore(a.discard)
// 	const scoreB = makeScore(b.discard)

// 	return scoreB - scoreA
// }

// function preferOneAway(a: Game, b: Game): number {
// 	const oneAwaysA = countOneAways(a)
// 	const oneAwaysB = countOneAways(b)

// 	return oneAwaysB - oneAwaysA
// }

// function preferStackedCards(a: Game, b: Game): number {
// 	const stackedCardsA = countStackedCards(a.piles)
// 	const stackedCardsB = countStackedCards(b.piles)

// 	return stackedCardsB - stackedCardsA
// }

// function preferEmptyPiles(a: Game, b: Game): number {
// 	const emptyPilesA = countEmptyPiles(a.piles)
// 	const emptyPilesB = countEmptyPiles(b.piles)

// 	return emptyPilesB - emptyPilesA
// }

function countOneAways(game: Game): number {
	const emptyPiles = countEmptyPiles(game.piles)
	if (emptyPiles === 0 && game.piles[game.piles.length - 1].length > 0) return 0

	let oneAways = 0
	for (const pile of game.piles) {
		if (pile.length < 2) continue

		const card1 = pile[1]
		for (const card2 of game.discard) {
			if (Math.abs(card1 - card2) !== 1) continue

			oneAways += 1
		}
	}

	return oneAways
}

function countStackedCards(piles: Pile[]): number {
	let stackedCards = 0
	let previousCard = 0
	for (const pile of piles) {
		for (const card of pile) {
			if (Math.abs(card - previousCard) === 1) stackedCards += 1

			previousCard = card
		}
	}

	return stackedCards
}

function countStacks(piles: Pile[]): number {
	/*
	piles: [[102,103,...],[306,...],[101,...],[104,...]]
	stacks: [[101,102,103,104]]

	piles: [[104,101,...],[306,...],[102,...],[103,...]]
	stacks: if empty/overflow [[101,102,103,104]] else [[103,104], [102,101]]
	*/

	let possibilities: Record<number, { card: number; column: number; depth: number }[]> = {}
	for (const pile1 of piles) {
		if (pile1.length < 1) continue
		const card1 = pile1[0]
		for (let column = 0; column < piles.length; column++) {
			const pile2 = piles[column]
			for (let depth = 0; depth < pile2.length; depth++) {
				const card2 = pile2[depth]
				if (Math.abs(card1 - card2) !== 1) continue
				if (!possibilities[card1]) possibilities[card1] = []

				possibilities[card1].push({ card: card2, column, depth })
			}
		}
	}
	console.log(possibilities)

	return 0
}

function countEmptyPiles(piles: Pile[]): number {
	return piles.reduce((sum, pile) => (pile.length === 0 ? sum + 1 : sum), 0)
}

// constructing

// function makeGame(piles: Pile[]): Game {
// 	return {
// 		id: makeId(piles),
// 		piles,
// 		discard: [99, 122, 201, 301, 401, 501],
// 		branches: undefined,
// 		solution: [],
// 		history: [],
// 		score: 0,
// 		previousScores: [],
// 	}
// }
function makeGame(piles: Pile[]): Game {
	return {
		piles,
		discard: [99, 122, 201, 301, 401, 501],
		solution: [],
	}
}

function makeId(piles: Pile[]): number {
	return piles.reduce((sum, pile) => sum + (pile[0] ?? 0), 0)
}

function makeScore(game: Game): number {
	const discard = game.discard.reduce((sum, card) => sum + card, 0)
	const openOverflow = game.piles[game.piles.length - 1].length === 0 ? 1 : 0
	const emptyPiles = countEmptyPiles(game.piles)
	const stackedCards = countStackedCards(game.piles)
	const oneAways = countOneAways(game)

	return discard + openOverflow + emptyPiles + stackedCards + oneAways
}

// function makeBranches(game: Game): Game[] {
// 	stack(game)
// 	const moves = makeLegalMoves(game.piles)
// 	const branches = moves.map((move) => makeBranch(move, game))
// 	for (const branch of branches) {
// 		settle(branch)
// 	}

// 	const sorted = branches.filter(filterBranches).toSorted(sortBranches)
// 	return sorted.slice(0, 2)
// }
function makeBranches(game: Game): Game[] {
	const options = makeBestMoves(game)
	return options.map((steps) => makeBranch(steps, game))
}

// function makeBranch(move: Move, game: Game): Game {
// 	const solution: Step[] = [
// 		...game.solution,
// 		[game.piles[move[0]][0] ?? move[0], game.piles[move[1]][0] ?? move[1]],
// 	]
// 	const piles = game.piles.map((pile, index) => {
// 		if (index === move[0]) return pile.slice(1)
// 		if (index === move[1]) return [game.piles[move[0]][0], ...pile]

// 		return [...pile]
// 	})
// 	const discard: Discard = [...game.discard]
// 	const history = [...game.history]
// 	const previousScores = [...game.history]

// 	return {
// 		id: game.id,
// 		piles,
// 		discard,
// 		branches: undefined,
// 		solution,
// 		history,
// 		score: 0,
// 		previousScores,
// 	}
// }
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

function makeLegalMoves(piles: Pile[]): Move[] {
	const moves: Move[] = []

	for (let column1 = 0; column1 < piles.length; column1++) {
		const card1 = piles[column1][0]
		if (card1 === undefined) continue

		for (let column2 = 0; column2 < piles.length; column2++) {
			const card2 = piles[column2][0]
			if (card1 === card2) continue
			if (Math.abs(card1 - card2) !== 1 && card2 !== undefined) continue
			if (column2 === piles.length - 1 && card2 !== undefined) continue

			moves.push([column1, column2])
		}
	}

	return moves
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
