<script setup>
import { defineProps } from "vue";

defineProps({
	cid: { type: String, required: true },
});
</script>

<template>
	<a :href="`https://ipfs.io/ipfs/${cid}`" target="_blank">
		{{ cid.substring(0, 4) }}..{{ cid.substring(cid.length - 4) }}
	</a>
</template>
