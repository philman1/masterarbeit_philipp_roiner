<script setup>
import { toRefs } from "vue";
import NftCard from "./NftCard.vue";

const props = defineProps({
	nfts: Array,
	loading: Boolean,
});

const { nfts, loading } = toRefs(props);
</script>

<template>
	<div v-if="loading" class="p-8 text-gray-500 text-center">Loading...</div>
	<div v-else class="flex flex-wrap justify-center items-center">
		<nft-card
			v-for="nft of nfts"
			:nft="nft"
			:key="nft.mint.address.toBase58()"
		/>
	</div>
</template>
