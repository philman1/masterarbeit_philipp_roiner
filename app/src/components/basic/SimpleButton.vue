<script setup>
import { defineProps } from "vue";

defineProps({
	clickHandler: Function,
	label: String,
});
</script>

<template>
	<button
		class="flex text-white bg-sol-purple hover:bg-sol-purple-soft border-0 py-2 px-6 mb-2 focus:outline-none hover:bg-red-600 rounded"
		@click="clickHandler"
	>
		{{ label }}
	</button>
</template>
