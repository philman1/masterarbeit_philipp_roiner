<script setup>
import { defineProps } from "vue";

const props = defineProps({
	cid: { type: String, required: true },
});
console.log(props);
</script>

<template>
	<a :href="`https://ipfs.io/ipfs/${cid}`" target="_blank">
		{{ cid.substring(0, 4) }}..{{ cid.substring(props.cid.length - 4) }}
	</a>
</template>
