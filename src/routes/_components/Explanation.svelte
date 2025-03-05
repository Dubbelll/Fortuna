<h1>WHAT</h1>
<p>
	A solver for the solitaire variant <a href="https://www.zachtronics.com/solitaire-collection">
		Fortune's Foundation
	</a>
	made by
	<a href="https://www.zachtronics.com">Zachtronics</a>
</p>
<h1>WHY</h1>
<p>Because it's an awesome hard game and I wanted to see if I could do it</p>
<h1>HOW</h1>
<p>
	By using the <a href="https://en.wikipedia.org/wiki/A*_search_algorithm">A* search algorithm</a>
	with a combination of the remaining cards, amount of empty columns and whether the stash is blocked
	as a heuristic. Every legal move generates a new board that is uniquely identified by the combination
	of the discard piles and the top cards. Those keys are checked to prevent infinite loops of moves.
	A
	<a href="https://en.wikipedia.org/wiki/Binary_heap">binary heap</a>
	is used to make a priority queue for fast access to the most promising node during every iteration.
</p>
<h1>INSTRUCTIONS</h1>
<div class="instructions">
	<p class="action">SOLVE</p>
	<p>Tries to solve the current game</p>
	<p class="action">SHUFFLE</p>
	<p>Generates a completely random game that may or may not be solveable</p>
	<p class="action">MANUAL</p>
	<p>Manually input a game using the deck, perhaps one from the real game</p>
	<p class="action">STEPS</p>
	<p>Shows the steps needed to solve the game after a solution is found</p>
	<p class="action">STATS</p>
	<p>Shows some statistics about the solution of this game</p>
	<p class="action">AUTO</p>
	<p>Plays an animation of the moves that solve this game</p>
</div>
<h1>RULES</h1>
<ul>
	<li>Move one card at a time</li>
	<li>Cards of the same suit can stack if they are 1 rank apart</li>
	<li>Cards can be discarded if they are 1 rank apart of the matching discard pile</li>
	<li>Cards are discarded automatically if they can be</li>
	<li>The tarot suit has two dicards: one going up, one going down</li>
	<li>The standard suits only have one discard: going up</li>
	<li>The stash blocks discards, but only to the standard suits</li>
</ul>

<style>
	.instructions {
		display: grid;
		grid-template-columns: min-content auto;
		column-gap: 8px;
	}

	.action {
		justify-self: end;
	}
</style>
