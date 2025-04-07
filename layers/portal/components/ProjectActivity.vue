<script setup lang="ts">
const props = defineProps({
	item: {
		type: String,
		default: null,
	},
	collection: {
		type: String,
		default: '',
	},
});

console.log('Fetching activity for', props.collection, props.item);

const { data: activity, error } = await useFetch('/api/directus-activity', {
	query: {
		sort: '-timestamp',
		filter: {
			item: { _eq: props.item },
			collection: { _eq: props.collection },
		},
		fields: ['action', 'collection', 'item', 'comment', 'timestamp', 'user', 'revisions'],
	},
});

// Add this log
watchEffect(() => {
	console.log('Activity response:', activity.value);
	if (error.value) {
		console.error('Activity fetch error:', error.value);
	}
});

type GroupedActivity = {
	date: string;

	activity: typeof activities.value;
};

const activities = computed(() => {
	if (!activity.value) return [];

	return activity.value.map((entry) => {
		const isMilestoneUpdate =
			entry.collection === 'os_tasks' && entry.action === 'update' && entry.revisions?.some((r) => r.delta?.status);

		const isMilestoneCreated = entry.collection === 'os_tasks' && entry.action === 'create';

		const isProjectUpdate = entry.collection === 'os_project_updates';

		if (isMilestoneUpdate || isMilestoneCreated) {
			return {
				type: 'milestone',

				item: {
					id: entry.item,

					name: entry.comment || 'Unnamed Milestone',
				},

				action: isMilestoneCreated ? 'started' : 'completed',

				timestamp: entry.timestamp,
			};
		} else if (isProjectUpdate) {
			return {
				type: 'update',

				item: {
					id: entry.item,

					message: entry.comment,
				},

				action: 'update',

				timestamp: entry.timestamp,
			};
		}

		// fallback

		return {
			type: 'update',

			item: {
				id: entry.item,

				message: entry.comment ?? '(No details)',
			},

			action: 'update',

			timestamp: entry.timestamp,
		};
	});
});
</script>

<template>
	<div class="relative">
		<!-- Activity feed-->

		<div class="flow-root mt-6 space-y-4">
			<div v-for="(date, dateIdx) in groupedActivity" :key="`date-${dateIdx}`">
				<TypographyTitle>{{ date.date }}</TypographyTitle>

				<VDivider />

				<ul role="list" class="mt-4">
					<li v-for="(item, itemIdx) in date.activity" :key="itemIdx">
						<div class="relative pb-8">
							<span
								v-if="itemIdx !== date.activity.length - 1"
								class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-300 dark:bg-gray-700"
								aria-hidden="true"
							/>

							<div class="relative flex space-x-3">
								<div>
									<span :class="['h-8 w-8 rounded-full flex items-center justify-center bg-gray-500 ']">
										<Icon
											:name="
												item.type === 'milestone'
													? 'heroicons:flag'
													: item.type === 'update'
														? 'heroicons:document-text'
														: 'heroicons:document'
											"
											class="w-5 h-5 text-white"
											aria-hidden="true"
										/>
									</span>
								</div>

								<div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
									<div>
										<!-- Activity Detail -->

										<template v-if="item.type === 'update'">
											<div class="font-bold">User posted a project update</div>

											<TypographyProse v-if="item.item && item.item.message" :content="item.item.message" size="sm" />
										</template>

										<template v-else-if="item.type === 'milestone'">
											Milestone - {{ item.item.name }} - {{ item.action }}
										</template>
									</div>

									<div class="text-sm text-right text-gray-500 whitespace-nowrap">
										{{ getRelativeTime(item.timestamp) }}
									</div>
								</div>
							</div>
						</div>
					</li>
				</ul>
			</div>
		</div>

		<!-- <UTextarea v-model="newActivity" placeholder="Add a new activity" /> -->
	</div>
</template>
