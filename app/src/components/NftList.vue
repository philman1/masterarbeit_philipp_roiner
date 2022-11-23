<script setup>
import { toRefs } from "vue";
import NftCard from "./NftCard.vue";

const props = defineProps({
	nfts: Array,
	loading: Boolean,
});

const { nfts, loading } = toRefs(props);
// const firstPart = ref([]);
// const secondPart = ref([]);
// const thirdPart = ref([]);

const getDataForCol = (numCols, col) => {
	const tmp = [...nfts.value];
	const index = Math.ceil(tmp.length / numCols);
	let d;
	for (let i = 1; i <= numCols; i++) {
		d = tmp.splice(-index);
		if (i == col) return d;
	}
	return null;
};

console.log(getDataForCol(3, 1));
</script>

<template>
	<div v-if="loading" class="p-8 text-gray-500 text-center">Loading...</div>
	<div v-else class="image-gallery m-4">
		<div v-for="col in 3" :key="col" class="column">
			<div
				v-for="nft of getDataForCol(3, col)"
				:key="nft.mint.address.toBase58()"
				class="image-item"
			>
				<!-- <div class="w-full p-1 md:p-2"> -->
				<nft-card :nft="nft" :imgOnly="true" />
				<!-- </div> -->
				<!-- </div> -->
			</div>
		</div>
	</div>
	<!-- <div v-else class="flex flex-wrap justify-center items-center">
		
	</div> -->
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
