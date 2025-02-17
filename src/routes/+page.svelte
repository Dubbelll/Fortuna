<script lang="ts">
	import { makeDiscard, makeGame, makePiles } from '$lib/play'
	import type { Step } from '$lib/solve'
	import Solver from '$lib/solve?worker'
	import { onMount } from 'svelte'
	import Board from './_components/Board.svelte'
	import Discard from './_components/Discard.svelte'

	let discard = $state(makeDiscard())
	let piles = $state(makePiles())
	let solution: Step[] = $state([])
	let iteration = $state(0)
	let result = $state('')

	let solver: Worker
	onMount(() => {
		solver = new Solver()
		solver.onmessage = (event: MessageEvent<{ code: string; payload: any }>) => {
			if (event.data.code === 'update') {
				iteration += 1
			}
			if (event.data.code === 'done') {
				result = 'done'
				solution = event.data.payload.solution
			}
			if (event.data.code === 'fail') {
				result = 'fail'
			}
		}
	})

	function reset() {
		discard = makeDiscard()
		piles = makePiles()
		solution = []
		iteration = 0
		result = ''
	}

	function start() {
		const game = makeGame($state.snapshot(piles))
		solver.postMessage({ code: 'start', payload: game })
	}

	function next() {
		const step = solution.shift()
		if (!step) return

		const card = piles[step.from].shift()
		if (!card) return
		if (step.type === 'move') {
			piles[step.to] = [card, ...piles[step.to]]
		}
		if (step.type === 'discard') {
			discard[step.to] = card
		}
	}
</script>

<Discard {discard} />
<Board {piles} />
<button onclick={reset}>RESET</button>
<button onclick={start}>START</button>
<p>{iteration}</p>
<p>{result}</p>
{#if solution.length > 0}
	<button onclick={next}>NEXT</button>
{/if}

<style>
	p {
		white-space: pre;
	}
</style>
