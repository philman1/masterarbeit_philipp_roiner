<script setup>
import { ref, toRefs } from "vue";
import { fetchImageFromIpfs } from "@/api";

const props = defineProps({
	nft: Object,
	imgOnly: Boolean,
});

const { nft } = toRefs(props);
const img = ref("");

fetchImageFromIpfs(nft.value).then((image) => (img.value = image));
</script>

<template>
	<router-link
		:to="{
			name: 'NftDetail',
			params: { mint: nft.mint.address.toBase58() },
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
</template>
