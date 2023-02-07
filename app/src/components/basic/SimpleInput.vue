<script setup>
import { defineProps, ref, computed } from "vue";

const props = defineProps({
	type: String,
	modelValue: [String, Number],
	id: String,
	label: String,
	placeholder: String,
	min: [String, Number],
	max: [String, Number],
	step: Number,
	w: {
		type: String,
		default: "full",
	},
});

const value = ref(props.modelValue);
const width = computed(() => `w-${props.w}`);
</script>

<template>
	<div :class="width" class="mb-3 mr-3">
		<label
			v-if="label"
			class="block text-sm font-medium text-gray-600 mb-2"
			:for="id"
		>
			{{ label }}
		</label>
		<input
			:id="id"
			ref="input"
			class="appearance-none border rounded py-2 px-3 text-gray-700 focus:border focus:border-gray-500 focus-visible:outline-none focus:shadow-outline"
			:class="width"
			:placeholder="placeholder"
			:type="type"
			v-model="value"
			:min="min"
			:max="max"
			:step="step"
			@input="$emit('update:modelValue', $event.target.value)"
		/>
	</div>
</template>
