import type { Game } from './solve'

export class PriorityQueue {
	heap: Game[]

	constructor(start: Game) {
		this.heap = [start]
	}

	get size() {
		return this.heap.length
	}

	push(node: Game) {
		this.heap.push(node)
		let index = this.heap.length - 1

		// bubble up
		while (index > 0) {
			let parentIndex = Math.floor((index - 1) / 2)
			let parent = this.heap[parentIndex]
			if (parent.penalty <= node.penalty) break

			this.heap[parentIndex] = node
			this.heap[index] = parent
			index = parentIndex
		}
	}

	pop(): Game | undefined {
		const root = this.heap[0]
		const leaf = this.heap.pop()
		if (!leaf || this.heap.length === 0) return root

		// sink down
		this.heap[0] = leaf
		let index = 0
		while (true) {
			const leftChildIndex = 2 * index + 1
			const rightChildIndex = 2 * index + 2
			const leftChild = this.heap[leftChildIndex]
			const rightChild = this.heap[rightChildIndex]
			let swap: number | undefined = undefined

			if (leftChild && leftChild.penalty < leaf.penalty) swap = leftChildIndex
			if (
				rightChild &&
				rightChild.penalty < (swap === undefined ? leaf.penalty : leftChild.penalty)
			)
				swap = rightChildIndex

			if (swap === undefined) break

			this.heap[index] = this.heap[swap]
			this.heap[swap] = leaf
			index = swap
		}

		return root
	}
}
