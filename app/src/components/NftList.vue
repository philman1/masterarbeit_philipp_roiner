<script setup>
import { ref, toRefs, onBeforeMount } from "vue";
import NftCard from "./NftCard.vue";

const props = defineProps({
	nftData: Object,
	loading: Boolean,
});

const { nftData, loading } = toRefs(props);
console.log(nftData);
const colsWithData = ref([]);
const totalCols = 3;

onBeforeMount(() => {
	colsWithData.value = getDataForCols();
});

const getDataForCols = (
	tmp = [...nftData.value],
	result = [],
	remainingCols = totalCols
) => {
	if (tmp.length <= 0) return result;
	const index = Math.ceil(tmp.length / remainingCols);
	result.push(tmp.splice(-index));
	return getDataForCols(tmp, result, --remainingCols);
};
</script>

<template>
	<div v-if="loading" class="p-8 text-gray-500 text-center">Loading...</div>
	<div v-else class="image-gallery m-4">
		<div v-for="col in totalCols" :key="col" class="column">
			<div
				v-for="{ imageAccount, nftMetadata } of colsWithData[--col]"
				:key="nftMetadata.address.toBase58()"
				class="image-item"
			>
				<nft-card :nftData="{ imageAccount, nftMetadata }" :imgOnly="true" />
			</div>
		</div>
	</div>
</template>

<style>
.image-gallery {
	/* Mobile first */
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.image-gallery .column {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	width: 33%;
}

.image-item img {
	width: 100%;
	border-radius: 5px;
	height: 100%;
	object-fit: cover;
}

@media only screen and (min-width: 768px) {
	.image-gallery {
		flex-direction: row;
	}
}
</style>
