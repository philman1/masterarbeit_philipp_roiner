<script setup>
import { defineProps } from "vue";

const props = defineProps({
	hash: { type: String, required: true },
	hashType: { type: String, required: false, default: "account" },
	cluster: { type: String, required: false, default: "devnet" },
});
console.log(props.hash.substring(0, 4));
console.log(props.hash.substring(props.hash.length - 4));
</script>

<template>
	<a
		:href="`https://solscan.io/${hashType}/${hash}?cluster=${cluster}`"
		target="_blank"
	>
		{{ hash.substring(0, 4) }}..{{ hash.substring(hash.length - 4) }}
	</a>
</template>
