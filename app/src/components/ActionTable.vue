<script setup>
import { defineProps, computed } from "vue";
import { PublicKey } from "@metaplex-foundation/js";
import { CID } from "@/models";
import HashLink from "./basic/HashLink.vue";
import IpfsLink from "./basic/IpfsLink.vue";
import SimpleButton from "./basic/SimpleButton.vue";

const props = defineProps({
	cols: Array,
	data: Array,
	actions: Array,
});

const colsNotNull = computed(() =>
	props.cols.filter((col) => col.attr !== null)
);
</script>

<template>
	<div class="overflow-hidden rounded relative m-5">
		<table class="w-full text-sm text-left text-gray-500">
			<thead class="text-xs text-gray-900 uppercase bg-gray-100">
				<tr>
					<th
						v-for="(col, i) in cols"
						:key="i"
						scope="col"
						class="py-3 px-6"
					>
						{{ col.heading }}
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
						v-for="col in colsNotNull"
						:key="col.heading + i"
						class="py-4 px-6"
					>
						<hash-link
							v-if="entry[col.attr] instanceof PublicKey"
							:hash="entry[col.attr + 'B58']"
						/>
						<ipfs-link
							v-else-if="entry[col.attr] instanceof CID"
							:cid="entry[col.attr + 'CID']"
						/>
						<span v-else>{{ entry[col.attr] }}</span>
					</td>
					<td v-if="actions" class="py-4 px-6">
						<div class="ml-auto w-fit">
							<simple-button
								v-for="(action, t) in actions"
								:key="t"
								:click-handler="() => action.fn(entry)"
								:label="action.label"
							/>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
