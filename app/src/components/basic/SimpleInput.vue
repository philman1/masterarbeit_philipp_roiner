<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
	modelValue: Number,
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
	<input
		class="appearance-none border rounded w-24 py-2 px-3 text-gray-700 mb-3 focus:border focus:border-gray-500 focus-visible:outline-none focus:shadow-outline"
		type="number"
		:value="value"
		@input="emit('update:modelValue', $event.target.value)"
	/>
</template>
