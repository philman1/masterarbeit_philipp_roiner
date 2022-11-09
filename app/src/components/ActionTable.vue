<script setup>
import { defineProps } from "vue";
import { PublicKey } from "@metaplex-foundation/js";
import { CID } from "@/models";
import HashLink from "./HashLink.vue";
import IpfsLink from "./IpfsLink.vue";

defineProps({
	headings: Array,
	data: Array,
	actions: Array,
});
</script>

<template>
	<div class="overflow-hidden rounded relative m-5">
		<table class="w-full text-sm text-left text-gray-500">
			<thead class="text-xs text-gray-900 uppercase bg-gray-100">
				<tr>
					<th
						v-for="heading in headings"
						:key="heading"
						scope="col"
						class="py-3 px-6"
					>
						{{ heading }}
					</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="(entry, i) in data"
					:key="i"
					class="bg-white border-b"
				>
					<td
						v-for="(value, key) in entry"
						:key="key + i"
						class="py-4 px-6"
					>
						<hash-link
							v-if="value instanceof PublicKey"
							:hash="entry[key + 'B58']"
						/>
						<ipfs-link
							v-else-if="value instanceof CID"
							:cid="entry[key + 'CID']"
						/>
						<span v-else>{{ value }}</span>
					</td>
					<td class="py-4 px-6">
						<button
							v-for="(action, t) in actions"
							:key="t"
							class="flex ml-auto text-white bg-blue-500 border-0 py-2 px-6 mb-2 focus:outline-none hover:bg-red-600 rounded"
							@click="action.fn"
						>
							{{ action.label }}
						</button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
