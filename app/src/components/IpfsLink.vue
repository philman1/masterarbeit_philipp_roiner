<script setup>
import { defineProps } from "vue";

const props = defineProps({
	cid: { type: String, required: true },
});
</script>

<template>
	<a :href="`https://ipfs.io/ipfs/${props.cid}`" target="_blank">
		{{ props.cid.substring(0, 4) }}..{{
			props.cid.substring(props.cid.length - 4)
		}}
	</a>
</template>
