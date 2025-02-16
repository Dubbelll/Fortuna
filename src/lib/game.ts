export interface Game {
	// top card first
	piles: Pile[]
	// tarotLow, tarotHigh, red, green, blue, yellow
	discard: Discard
	solution: Step[]
	remaining: number
	penalty: 0
}

type Pile = number[]

type Discard = [number, number, number, number, number, number]

export interface Step {
	type: 'move' | 'discard'
	card: number
	from: number
	to: number
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
function solve(root: Game) {
	let tree: Game[] = [root]
	let best: Game | undefined = undefined

	while (tree.length > 0) {
		const branch = tree.pop()
		if (!branch) continue

		if (branch.remaining === 0) {
			self.postMessage({ code: 'done', payload: branch })
			console.log('bingo', branch)
			break
		}
		if (!best || branch.remaining < best.remaining) {
			best = branch
			console.log(best)
		}

		self.postMessage({ code: 'update', payload: best.remaining })
		const branches = makeBranches(branch)
		for (let index = branches.length - 1; index >= 0; index--) {
			tree.push(branches[index])
		}
	}

	self.postMessage({ code: 'deadend', payload: best })
	console.log('deadend', best)
}

function perform(step: Step, branch: Game) {
	if (step.type === 'move') {
		branch.piles[step.from].shift()
		branch.piles[step.to] = [step.card, ...branch.piles[step.to]]
	}
	if (step.type === 'discard') {
		branch.piles[step.from].shift()
		branch.discard[step.to] = step.card
		branch.remaining--
	}
	branch.solution.push(step)
	branch.penalty += step.penalty
}

// constructing

function makeBranches(branch: Game): Game[] {
	let branches: Game[] = []
	if (branches.length === 0) branches = makeDiscardBranches(branch)

	return branches.sort((a, b) => a.penalty - b.penalty || a.remaining - b.remaining)
}

function makeDiscardBranches(root: Game): Game[] {
	let branches: Game[] = []
	for (let from = 0; from < root.piles.length; from++) {
		const pile = root.piles[from]
		for (let depth = 0; depth < pile.length; depth++) {
			const card = pile[depth]
			const to = root.discard.findIndex((discard) => Math.abs(discard - card) === 1)
			if (to === -1) continue

			const branch = makeBranch(root)
			const blockers = root.piles[from].slice(0, depth)
			for (const blocker of blockers) {
				const step = makeStep(blocker, from, branch)
				if (step) perform(step, branch)
			}
			if (branch.solution.length - root.solution.length !== blockers.length) continue
			if (card > 200 && !isOverflowOpen(branch)) continue

			perform(
				{
					type: 'discard',
					card,
					from,
					to,
					penalty: 0,
				},
				branch,
			)
			branches.push(branch)
		}
	}

	return branches
}

function makeEmptyPilesBranches(root: Game): Game[] {
	let branches: Game[] = []

	return branches
}

function makeStep(card1: number, column1: number, game: Game): Step | undefined {
	let steps: Step[] = []

	for (let column2 = 0; column2 < game.piles.length; column2++) {
		if (column2 === column1) continue
		if (column2 === game.piles.length - 1) {
			if (game.piles[game.piles.length - 1].length !== 0) continue
			if (!isOverflowSafe(card1, game)) continue
		}

		const card2 = game.piles[column2][0]
		// overflow
		if (card2 === undefined && column2 === game.piles.length - 1)
			steps.push({ type: 'move', card: card1, from: column1, to: column2, penalty: 100 })
		// empty pile
		if (card2 === undefined && column2 !== game.piles.length - 1)
			steps.push({ type: 'move', card: card1, from: column1, to: column2, penalty: 10 })
		// stack up
		if (Math.abs(card1 - card2) === 1 && card1 > card2)
			steps.push({ type: 'move', card: card1, from: column1, to: column2, penalty: 2 })
		// stack down
		if (Math.abs(card1 - card2) === 1 && card1 < card2)
			steps.push({ type: 'move', card: card1, from: column1, to: column2, penalty: 1 })
		// discard
		const column3 = game.discard.findIndex((card3) => Math.abs(card1 - card3) === 1)
		if (column3 !== -1)
			steps.push({ type: 'discard', card: card1, from: column1, to: column3, penalty: 0 })
	}

	return steps.sort((a, b) => a.penalty - b.penalty)[0]
}

function makeBranch(branch: Game): Game {
	return {
		piles: branch.piles.map((pile) => [...pile]),
		discard: [...branch.discard],
		solution: [...branch.solution],
		remaining: branch.remaining,
		penalty: 0,
	}
}

function makeGame(piles: Pile[]): Game {
	return {
		piles,
		discard: [99, 122, 201, 301, 401, 501],
		solution: [],
		remaining: 70,
		penalty: 0,
	}
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
		case 'b':
			return 300
		case 'g':
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

function isOverflowOpen(game: Game): boolean {
	return game.piles[game.piles.length - 1].length === 0
}

function isOverflowSafe(card: number, game: Game): boolean {
	for (let column = 0; column < game.piles.length; column++) {
		const pile = game.piles[column]
		if (column === game.piles.length - 1) continue
		if (pile.length === 0) return true
		if (Math.abs(card - pile[0]) === 1) return true
	}

	return false
}
