<script lang="ts">
	let { text }: { text: string } = $props()
</script>

<p class="placeholder">
	{text}
</p>

<style>
	.placeholder {
		grid-column: 1;
		grid-row: 1;
		display: grid;
		align-items: end;
		width: 64px;
		aspect-ratio: 1 / 1.64;
		padding-top: 4px;
		background-color: white;
		color: lightgrey;
		border: 2px solid lightgrey;
		user-select: none;
		writing-mode: vertical-lr;
	}
</style>
