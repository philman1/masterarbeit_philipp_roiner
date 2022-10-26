<script setup>
import { saveToIpfs, mintNft } from "@/api";
import { computed, ref } from "vue";

const name = ref("");
const symbol = ref("");
const description = ref("");
const image = ref(null);
const validName = computed(() => name.value && name.value.length > 0);

const handleFiles = async (event) => {
	event.stopPropagation();
	event.preventDefault();
	image.value = event.target.files;
};

const mint = async () => {
	console.log("mint", validName.value, image.value);
	if (!validName.value || !image.value) return;
	const cids = await saveToIpfs(image.value);

	await mintNft({
		name: name.value,
		symbol: symbol.value,
		description: description.value,
		image: `https://ipfs.io/ipfs/${cids[0]}`,
	});
};
</script>

<template>
	<h1 class="block text-gray-700 text-xl font-bold mb-2 m-4">Mint NFT</h1>
	<div class="w-full max-w-xs">
		<form class="px-8 pt-6 pb-8 mb-4">
			<div class="mb-4">
				<label
					class="block text-gray-700 text-sm font-bold mb-2"
					for="name"
				>
					Name
				</label>
				<input
					class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
					:class="{ 'border-red-500': !validName }"
					id="name"
					type="text"
					placeholder="Name"
					v-model="name"
				/>
				<p v-if="!validName" class="text-red-500 text-xs italic">
					Please choose a name.
				</p>
			</div>
			<div class="mb-6">
				<label
					class="block text-gray-700 text-sm font-bold mb-2"
					for="symbol"
				>
					Symbol
				</label>
				<input
					class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
					id="symbol"
					type="text"
					placeholder="Symbol"
					v-model="symbol"
				/>
			</div>
			<div class="mb-6">
				<label
					class="block text-gray-700 text-sm font-bold mb-2"
					for="description"
				>
					Description
				</label>
				<input
					class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
					id="desciption"
					type="text"
					placeholder="Description"
					v-model="description"
				/>
			</div>
			<div class="mb-6">
				<label
					class="block text-gray-700 text-sm font-bold mb-2"
					for="images"
				>
					Images
				</label>
				<input
					class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
					type="file"
					id="images"
					@change="handleFiles"
					multiple
				/>
			</div>
			<div class="flex items-center justify-between">
				<button
					class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
					type="button"
					v-on:click="mint"
				>
					Mint
				</button>
			</div>
		</form>
	</div>
</template>
