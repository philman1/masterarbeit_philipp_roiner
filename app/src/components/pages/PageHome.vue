<script setup>
import { ref, onMounted } from "vue";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { fetchNfts, availabilityFilter } from "@/api";
import NftList from "../NftList.vue";

const nftData = ref([]);
// const loading = ref(true);

const filters = [availabilityFilter(bs58.encode(Uint8Array.from([1])))];

onMounted(() => {
	fetchNfts(filters).then((data) => {
		if (!data) return;
		nftData.value = data;
	});
});
</script>

<template>
	<nft-list v-if="nftData.length > 0" :nftData="nftData" />
</template>
