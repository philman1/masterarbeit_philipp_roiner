<script setup>
import { defineProps } from "vue";

defineProps({
	clickHandler: Function,
	label: String,
	appearance: {
		type: String,
		default: "primary",
	},
});
</script>

<template>
	<button
		class="flex border border-solid py-2 px-6 mb-2 focus:outline-none rounded"
		:class="{
			'text-white bg-sol-purple hover:bg-sol-purple-soft':
				appearance === 'primary',
			'text-sol-purple bg-white border-sol-purple hover:bg-sol-purple-soft hover:text-white':
				appearance === 'secondary',
		}"
		@click="clickHandler"
	>
		{{ label }}
	</button>
</template>
