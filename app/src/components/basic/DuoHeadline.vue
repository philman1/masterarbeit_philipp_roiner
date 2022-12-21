<script setup>
import { defineProps } from "vue";

defineProps({
	importance: String,
	headline: String,
	subHeadline: String,
});
</script>

<template>
	<div class="px-4 py-5 sm:px-6">
		<component
			:is="'h' + importance"
			class="font-bold text-black-700"
			:class="{
				'text-6xl': importance == 1,
				'text-5xl': importance == 2,
				'text-4xl': importance == 3,
				'text-3xl': importance == 4,
				'text-2xl': importance == 5,
				'text-xl': importance == 6,
			}"
			>{{ headline }}</component
		>
		<p class="mt-1 max-w-2xl text-m text-gray-500">{{ subHeadline }}</p>
	</div>
</template>
