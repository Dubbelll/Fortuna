<script lang="ts">
	export type Mode = 'auto' | 'manual'

	let { mode, select }: { mode: Mode; select: (mode: Mode) => void } = $props()
</script>

<div class="mode">
	<button class={{ left: true, selected: mode === 'auto' }} onclick={() => select('auto')}>
		AUTO
	</button>
	<button class={{ right: true, selected: mode === 'manual' }} onclick={() => select('manual')}>
		MANUAL
	</button>
</div>

<style>
	.mode {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	button {
		padding: 0 8px;
		border: none;
		font-size: 12px;

		&.selected {
			background-color: var(--brown);
			color: var(--white);
		}

		&.left {
			border-radius: 4px 0 0 4px;
		}

		&.right {
			border-radius: 0 4px 4px 0;
		}
	}
</style>
