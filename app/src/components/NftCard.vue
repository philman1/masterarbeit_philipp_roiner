<script setup>
import { ref, onMounted } from "vue";
import { fetchMetadataFromIpfs, fetchImageFromIpfs } from "@/api";
import { useMetaplex } from "@/composables";
import store from "@/store";
import Spinner from "./Spinner.vue";

const props = defineProps({
	metadata: Object,
	imgOnly: Boolean,
});

const nft = ref(props.metadata);
const img = ref("");

const randomHeight = () => {
	const heights = [16, 18, 20, 24];
	return `height: ${heights[Math.floor(Math.random() * heights.length)]}rem;`;
};

onMounted(async () => {
	const { metaplex } = useMetaplex();
	const n = await metaplex.nfts().load({ metadata: nft.value });
	// console.log(n);

	const nftsWithMetadata = await fetchMetadataFromIpfs(n);
	// console.log(nftsWithMetadata);
	nft.value = nftsWithMetadata;
	// console.log(nft.value);
	store.commit("add", { nft: nftsWithMetadata });
	// loading.value = false;

	await fetchImageFromIpfs(nftsWithMetadata).then(
		(image) => (img.value = image)
	);
});
</script>

<template>
	<router-link
		v-if="img.length"
		:to="{
			name: 'NftDetail',
			params: { mint: nft.address.toBase58() },
		}"
		class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6 max-w-sm rounded overflow-hidden shadow-lg"
	>
		<img class="w-full" :src="img" alt="" />
		<div v-if="!imgOnly" class="px-6 py-4">
			<div class="font-bold text-xl mb-2">
				{{ nft.json.name }}
			</div>
			<p class="text-gray-700 text-base">
				{{ nft.json.description }}
			</p>
		</div>
		<!-- <div class="px-6 pt-4 pb-2">
			<span
				class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
				>#photography</span
			>
		</div> -->
	</router-link>
	<router-link
		v-else-if="!img.length && nft.address.toBase58().length && nft.json"
		:to="{
			name: 'NftDetail',
			params: { mint: nft.address.toBase58() },
		}"
		class="w-full rounded overflow-hidden shadow-lg flex justify-center items-center"
		:style="randomHeight()"
	>
		<spinner />
	</router-link>
	<div
		v-else
		class="w-full rounded overflow-hidden shadow-lg flex justify-center items-center"
		:style="randomHeight()"
	>
		<spinner />
	</div>
</template>
