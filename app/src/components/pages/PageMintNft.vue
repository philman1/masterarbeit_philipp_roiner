<script setup>
import { saveToIpfs, mintNft } from "@/api";
import { computed, ref } from "vue";
import DuoHeadline from "../basic/DuoHeadline.vue";
import SimpleButton from "../basic/SimpleButton.vue";
import SimpleInput from "../basic/SimpleInput.vue";

const defaultInput = {
	name: "",
	symbol: "",
	description: "",
	available: false,
	allowedLicenseTypes: 3,
	oneTimePrice: 1,
};

const name = ref(defaultInput.name);
const symbol = ref(defaultInput.symbol);
const description = ref(defaultInput.description);
const available = ref(defaultInput.available);
const allowedLicenseTypes = ref(defaultInput.allowedLicenseTypes);
const oneTimePrice = ref(defaultInput.oneTimePrice);

const nameInput = ref(null);
const symbolInput = ref(null);
const descriptionInput = ref(null);
const availableInput = ref(null);
const allowedLicenseTypesInput = ref(null);
const oneTimePriceInput = ref(null);
const imageInput = ref(null);

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
	const ipfs = await saveToIpfs(image.value);
	const { cidsEncrypted, cidsThumbnails } = ipfs.data;

	await mintNft(
		{
			name: name.value,
			symbol: symbol.value,
			description: description.value,
			image: `http://127.0.0.1:8080/ipfs/${cidsThumbnails[0]}`,
			fullResImg: cidsEncrypted[0],
		},
		{
			available: available.value,
			allowedLicenseTypes: allowedLicenseTypes.value,
			oneTimePrice: oneTimePrice.value,
		}
	);

	clearInputs();
};

const clearInputs = () => {
	nameInput.value.$refs.input.value = name.value = defaultInput.name;
	nameInput.value.$refs.input.dispatchEvent(new Event("input"));
	symbolInput.value.$refs.input.value = symbol.value = defaultInput.symbol;
	symbolInput.value.$refs.input.dispatchEvent(new Event("input"));
	descriptionInput.value.$refs.input.value = description.value =
		defaultInput.description;
	descriptionInput.value.$refs.input.dispatchEvent(new Event("input"));
	availableInput.value = available.value = defaultInput.available;

	if (allowedLicenseTypesInput.value) {
		allowedLicenseTypesInput.value.$refs.input.value =
			allowedLicenseTypes.value = defaultInput.allowedLicenseTypes;
		allowedLicenseTypesInput.value.$refs.input.dispatchEvent(
			new Event("input")
		);
		if (oneTimePriceInput.value) {
			oneTimePriceInput.value.$refs.input.value = oneTimePrice.value =
				defaultInput.oneTimePrice;
			oneTimePriceInput.value.$refs.input.dispatchEvent(
				new Event("input")
			);
		}
	}

	imageInput.value.$refs.input.value = image.value = bgImage.value = null;
	imageInput.value.$refs.input.dispatchEvent(new Event("input"));
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
									placeholder="Name"
									v-model="name"
									label="Name"
									:class="{ 'border-red-500': !validName }"
									ref="nameInput"
								/>
								<p
									v-if="!validName"
									class="text-red-500 text-xs italic"
								>
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
									ref="symbolInput"
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
								ref="descriptionInput"
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
									v-model="available"
									ref="availableInput"
								/>
							</div>
							<div v-if="available" class="mx-4">
								<simple-input
									id="allowedLicenseTypes"
									type="number"
									:min="0"
									:max="3"
									:step="1"
									v-model="allowedLicenseTypes"
									label="License type"
									ref="allowedLicenseTypesInput"
								/>
							</div>

							<div
								v-if="available && allowedLicenseTypes == 2"
								class="ml-2"
							>
								<simple-input
									id="oneTimePrice"
									type="text"
									v-model="oneTimePrice"
									label="Price (SOL)"
									w="24"
									ref="oneTimePriceInput"
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
								ref="imageInput"
							/>
						</div>
						<div class="w-full flex justify-center">
							<simple-button
								:click-handler="mint"
								label="Upload"
							/>
						</div>
					</form>
				</div>
				<div
					class="absolute w-full h-full -z-10 opacity-25 bg-cover"
					:style="
						bgImage ? { backgroundImage: `url(${bgImage})` } : ''
					"
				></div>
			</div>
		</div>
	</div>
</template>
