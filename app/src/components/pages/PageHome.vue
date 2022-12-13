<script setup>
import { ref } from "vue";
import { fetchNfts } from "@/api";
// import store from "@/store";
import NftList from "../NftList.vue";

const nfts = ref([]);
// const loading = ref(true);

fetchNfts().then((fetchedNfts) => {
	if (!nfts.value) return;
	console.log(fetchedNfts);
	nfts.value = fetchedNfts;
});
</script>

<template>
	<nft-list v-if="nfts.length > 0" :nfts="nfts" />
</template>
