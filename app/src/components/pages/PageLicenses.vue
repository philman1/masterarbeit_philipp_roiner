<script setup>
import { ref, onMounted } from "vue";
import { fetchLicenses, licenseOwnerFilter } from "@/api";
import { useWorkspace } from "@/composables";
import HashLink from "../HashLink.vue";

const licenses = ref([]);

onMounted(async () => {
	const { wallet } = useWorkspace();
	licenses.value = await fetchLicenses([
		licenseOwnerFilter(wallet.value.publicKey.toBase58()),
	]);

	console.log(licenses.value);
});
</script>

<template>
	<div v-if="licenses.length > 0">
		<div class="px-4 py-5 sm:px-6">
			<h3 class="text-lg font-medium leading-6 text-gray-900">
				Licenses
			</h3>
			<p class="mt-1 max-w-2xl text-sm text-gray-500">that you own.</p>
		</div>

		<div class="overflow-hidden rounded relative m-5">
			<table class="w-full text-sm text-left text-gray-500">
				<thead class="text-xs text-gray-900 uppercase bg-gray-100">
					<tr>
						<th scope="col" class="py-3 px-6">Licensed NFT</th>
						<th scope="col" class="py-3 px-6">License Type</th>
						<th scope="col" class="py-3 px-6">Created at</th>
						<th scope="col" class="py-3 px-6">
							License information
						</th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="{ account } of licenses"
						:key="account.licensedImage.toBase58()"
						class="bg-white border-b"
					>
						<th
							scope="row"
							class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap"
						>
							<hash-link
								:hash="account.licensedImage.toBase58()"
							/>
						</th>
						<td class="py-4 px-6">{{ account.licenseType }}</td>
						<td class="py-4 px-6">
							{{
								new Date(
									Number(account.timestamp) * 1000
								).toLocaleDateString("de-DE")
							}}
						</td>
						<td class="py-4 px-6">
							{{ account.licenseInformation }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
