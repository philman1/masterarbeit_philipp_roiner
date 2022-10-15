<script setup>
import { ref } from "vue";
import { fetchNfts, fetchMetadataFromIpfs } from "@/api";
import NftList from "./NftList.vue";

const nfts = ref([]);
const loading = ref(true);

fetchNfts()
	.then((fetchedNfts) => {
		// nfts.value = fetchedNfts;
		fetchMetadataFromIpfs(fetchedNfts).then((nftsWithMetadata) => {
			nfts.value = nftsWithMetadata;
		});
	})
	.finally(() => (loading.value = false));
</script>

<template>
	<nft-list :nfts="nfts" />
</template>
