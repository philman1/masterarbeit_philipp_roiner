<script setup>
import { ref } from "vue";
import { fetchNfts, fetchMetadataFromIpfs } from "@/api";
import store from "@/store";
import NftList from "../NftList.vue";

const nfts = ref([]);
const loading = ref(true);

fetchNfts().then((fetchedNfts) => {
	if (!nfts.value) return;
	fetchMetadataFromIpfs(fetchedNfts)
		.then((nftsWithMetadata) => {
			nfts.value = nftsWithMetadata;
			console.log(nftsWithMetadata[0]);
		})
		.then(() => {
			store.commit("set", { nfts: nfts.value });
			loading.value = false;
		});
});
</script>

<template>
	<nft-list v-if="nfts.length > 0" :nfts="nfts" />
</template>
