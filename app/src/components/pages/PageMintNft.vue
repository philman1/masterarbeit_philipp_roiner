<script setup>
import { saveToIpfs, mintNft } from "@/api";
import { computed, ref } from "vue";
import DuoHeadline from "../basic/DuoHeadline.vue";
import SimpleButton from "../basic/SimpleButton.vue";
import SimpleInput from "../basic/SimpleInput.vue";

const name = ref("");
const symbol = ref("");
const description = ref("");
const available = ref(false);
const allowedLicenseTypes = ref(3);
const oneTimePrice = ref(1);
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
	const res = await saveToIpfs(image.value);
	const { cidsEncrypted, cidsThumbnails } = res.data;
	console.log(cidsEncrypted, cidsThumbnails);
	await mintNft(
		{
			name: name.value,
			symbol: symbol.value,
			description: description.value,
			image: `https://ipfs.io/ipfs/${cidsThumbnails[0]}`,
			fullResImg: cidsEncrypted[0],
		},
		{
			available: available.value,
			allowedLicenseTypes: allowedLicenseTypes.value,
			oneTimePrice: oneTimePrice.value,
		}
	);
};
</script>

<template>
	<div>
		<duo-headline importance="1" headline="Upload image"></duo-headline>
		<div class="w-full h-[70vh] flex justify-center items-center">
			<div
				class="relative w-fit h-fit rounded overflow-hidden shadow-lg flex justify-center items-center"
			>
				<div class="w-full max-w-s">
					<form class="px-8 pt-6 pb-2 mb-4">
						<div class="mb-4 flex justify-between">
							<div class="mr-2">
								<simple-input
									id="name"
									type="text"
									placeholder="Name uri"
									v-model="name"
									label="Name"
									:class="{ 'border-red-500': !validName }"
								/>
								<p v-if="!validName" class="text-red-500 text-xs italic">
									Please choose a name.
								</p>
							</div>
							<div class="ml-2">
								<simple-input
									id="symbol"
									type="text"
									placeholder="Symbol"
									v-model="symbol"
									label="Symbol"
								/>
							</div>
						</div>
						<div class="mb-4">
							<simple-input
								id="desciption"
								type="text"
								placeholder="Description"
								v-model="description"
								label="Description"
							/>
						</div>
						<div class="mb-4 flex">
							<div class="mr-2">
								<label
									class="block text-sm font-medium text-gray-600 mb-2"
									for="description"
								>
									Should it be licensable?
								</label>
								<input
									class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
									id="available"
									type="checkbox"
									placeholder="Description"
									v-model="available"
								/>
							</div>
							<div v-if="available" class="mx-4">
								<simple-input
									id="allowedLicenseTypes"
									type="number"
									:min="0"
									:max="3"
									:step="1"
									placeholder="Description"
									v-model="allowedLicenseTypes"
									label="License type"
								/>
							</div>

							<div v-if="available && allowedLicenseTypes === 2" class="ml-2">
								<simple-input
									id="oneTimePrice"
									type="text"
									placeholder="Description"
									v-model="oneTimePrice"
									label="Price (SOL)"
									w="24"
								/>
							</div>
						</div>
						<div class="mb-6">
							<simple-input
								type="file"
								id="images"
								@change="handleFiles"
								multiple
								label="Images"
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
	</div>
</template>
