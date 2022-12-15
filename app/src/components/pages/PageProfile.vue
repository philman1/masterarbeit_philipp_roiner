<script setup>
import { ref, onMounted } from "vue";
import { useWorkspace } from "@/composables";
import { fetchNfts, imageAuthorFilter } from "@/api";
import DuoHeadline from "../basic/DuoHeadline.vue";
import NftList from "../NftList.vue";

const nftData = ref([]);
const { wallet } = useWorkspace();
const filters = [imageAuthorFilter(wallet.value.publicKey.toBase58())];

onMounted(() => {
	fetchNfts(filters).then((data) => {
		if (!nftData.value) return;
		console.log(data);
		nftData.value = data;
	});
});
</script>

<template>
	<duo-headline
		importance="1"
		headline="Images"
		sub-headline="of which you are the author."
	></duo-headline>
	<nft-list v-if="nftData.length > 0" :nftData="nftData" />
</template>
