<script setup>
import { defineProps } from "vue";

const props = defineProps({
	hash: { type: String, required: true },
	hashType: { type: String, required: false, default: "account" },
	cluster: { type: String, required: false, default: "devnet" },
});
</script>

<template>
	<a
		:href="`https://solscan.io/${props.hashType}/${props.hash}?cluster=${props.cluster}`"
		target="_blank"
	>
		{{ props.hash.substring(0, 4) }}..{{
			props.hash.substring(props.hash.length - 4)
		}}
	</a>
</template>
