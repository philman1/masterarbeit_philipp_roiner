<script setup>
import { saveToIpfs } from "@/api";
import { computed, ref } from "vue";
import DuoHeadline from "../basic/DuoHeadline.vue";
import SimpleButton from "../basic/SimpleButton.vue";

const name = ref("");
const symbol = ref("");
const description = ref("");
const image = ref(null);
const bgImage = ref(null);
const validName = computed(() => name.value && name.value.length > 0);

const handleFiles = async (event) => {
	event.stopPropagation();
	event.preventDefault();
	image.value = event.target.files;
	bgImage.value = URL.createObjectURL(event.target.files[0]);
};

const mint = async () => {
	if (!validName.value || !image.value) return;
	const { cidsEncrypted, cidsThumbnails } = await saveToIpfs(image.value);
	console.log(cidsEncrypted, cidsThumbnails);
	// await mintNft({
	// 	name: name.value,
	// 	symbol: symbol.value,
	// 	description: description.value,
	// 	image: `https://ipfs.io/ipfs/${cidsThumbnails[0]}`,
	// 	fullResImg: cidsEncrypted[0],
	// });
};
</script>

<template>
	<duo-headline importance="1" headline="Upload image"></duo-headline>
	<div class="w-full h-[70vh] flex justify-center items-center">
		<div
			class="relative w-fit h-fit rounded overflow-hidden shadow-lg flex justify-center items-center"
		>
			<div class="w-full max-w-xs">
				<form class="px-8 pt-6 pb-2 mb-4">
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
					<div class="w-full flex justify-center">
						<simple-button :click-handler="mint" label="Upload" />
					</div>
				</form>
			</div>
			<div
				class="absolute w-full h-full -z-10 opacity-25 bg-cover"
				:style="bgImage ? { backgroundImage: `url(${bgImage})` } : ''"
			></div>
		</div>
	</div>
</template>
