<script setup>
import { ref } from "vue";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { fetchNfts, availabilityFilter } from "@/api";
import NftList from "../NftList.vue";

const data = ref([]);
// const loading = ref(true);

const filters = [availabilityFilter(bs58.encode(Uint8Array.from([1])))];

fetchNfts(filters).then((data) => {
	if (!data.value) return;
	console.log(data);
	data.value = data;
});
</script>

<template>
	<nft-list v-if="data.length > 0" :data="data" />
</template>
