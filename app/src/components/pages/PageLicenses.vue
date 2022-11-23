<script setup>
import { ref, onMounted } from "vue";
import {
	fetchLicenses,
	licenseOwnerFilter,
	downloadDecryptedImage,
} from "@/api";
import { useWorkspace } from "@/composables";
import ActionTable from "../ActionTable.vue";

const licenses = ref([]);
const actions = ref([]);

onMounted(async () => {
	const { wallet } = useWorkspace();
	licenses.value = await fetchLicenses([
		licenseOwnerFilter(wallet.value.publicKey.toBase58()),
	]);

	actions.value = [
		{ fn: downloadLicense, label: "Download license" },
		{ fn: downloadImage, label: "Download image" },
	];
});

const downloadLicense = () => {};

const downloadImage = async (license) => {
	await downloadDecryptedImage(license.licensedImage.toBase58());
};
</script>

<template>
	<div v-if="licenses.length > 0">
		<div class="px-4 py-5 sm:px-6">
			<h3 class="text-lg font-medium leading-6 text-gray-900">Licenses</h3>
			<p class="mt-1 max-w-2xl text-sm text-gray-500">that you own.</p>
		</div>

		<action-table
			:cols="[
				{ attr: 'publicKey', heading: 'License' },
				{ attr: 'licenseTypeAsText', heading: 'License type' },
				{ attr: 'owner', heading: 'Owner' },
				{ attr: 'licensedImage', heading: 'Licensed image' },
				{ attr: 'createdAt', heading: 'Created at' },
				{ attr: 'createdAgo', heading: 'Created ago' },
				{ attr: 'licenseInformation', heading: 'Conditions' },
				{ attr: null, heading: '' },
			]"
			:data="licenses"
			:actions="actions"
		/>
	</div>
</template>
