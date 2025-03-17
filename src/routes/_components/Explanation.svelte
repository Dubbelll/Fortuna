<div class="explanation">
	<section>
		<h1>WHAT</h1>
		<p>
			A solver for the solitaire variant <a
				href="https://www.zachtronics.com/solitaire-collection"
			>
				Fortune's Foundation
			</a>
			made by
			<a href="https://www.zachtronics.com">Zachtronics</a>
		</p>
	</section>
	<section>
		<h1>WHY</h1>
		<p>Because it's an awesome hard game and I wanted to see if I could do it</p>
	</section>
	<section>
		<h1>HOW</h1>
		<p>
			By using the <a href="https://en.wikipedia.org/wiki/A*_search_algorithm">
				A* search algorithm
			</a>
			with a combination of the remaining cards, amount of empty columns and whether the stash
			is blocked as a heuristic. Every legal move generates a new board that is uniquely identified
			by the combination of the discard piles and the top cards. Those keys are checked to prevent
			infinite loops of moves. A
			<a href="https://en.wikipedia.org/wiki/Binary_heap">binary heap</a>
			is used to make a priority queue for fast access to the most promising node during every
			iteration.
		</p>
	</section>
	<section>
		<h1>RULES</h1>
		<div class="rules">
			<p>✦</p>
			<p>Move one card at a time</p>
			<p>✦</p>
			<p>Cards of the same suit can stack if they are 1 rank apart</p>
			<p>✦</p>
			<p>Cards can be discarded if they are 1 rank apart of the matching discard pile</p>
			<p>✦</p>
			<p>Cards are discarded as soon as they can be</p>
			<p>✦</p>
			<p>The tarot suit has two discards: one going up, one going down</p>
			<p>✦</p>
			<p>The standard suits only have one discard: going up</p>
			<p>✦</p>
			<p>The stash blocks discards, but only to the standard suits</p>
		</div>
	</section>
</div>

<style>
	.explanation {
		display: grid;
		gap: 16px;
		padding: 16px;
		border-radius: 8px;
		background-color: var(--white);
	}

	a {
		padding: 0 4px;
		border-radius: 4px;
		background-color: var(--brown);
		color: var(--white);
		text-decoration: none;
		white-space: nowrap;
	}

	.rules {
		display: grid;
		grid-template-columns: min-content auto;
		column-gap: 8px;
	}
</style>
