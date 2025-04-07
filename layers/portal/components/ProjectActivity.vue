<script setup lang="ts">
const props = defineProps<{
	updates: Array<{
		id: string;
		message: string;
		date_created: string;
		user_created?: string;
	}>;
}>();

const activities = computed(() => {
	if (!props.updates || props.updates.length === 0) return [];

	return props.updates.map((entry) => ({
		type: 'update',
		item: {
			id: entry.id,
			message: entry.message ?? '(No details)',
		},
		action: 'update',
		timestamp: entry.date_created,
	}));
});
</script>

<template>
	<div class="relative">
		<!-- Activity feed -->
		<div class="flow-root mt-6 space-y-4">
			<div v-if="activities.length">
				<TypographyTitle>Activity</TypographyTitle>
				<VDivider />

				<ul role="list" class="mt-4">
					<li v-for="(item, index) in activities" :key="index">
						<div class="relative pb-8">
							<span
								v-if="index !== activities.length - 1"
								class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-300 dark:bg-gray-700"
							/>
							<div class="relative flex space-x-3">
								<div>
									<span class="h-8 w-8 rounded-full flex items-center justify-center bg-gray-500">
										<Icon name="heroicons:document-text" class="w-5 h-5 text-white" />
									</span>
								</div>
								<div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
									<div>
										<div class="font-bold">Project update</div>
										<TypographyProse :content="item.item.message" size="sm" />
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

			<!-- ✨ Empty state fallback -->
			<div v-else class="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
				No updates yet — this space will come to life as progress happens 🚀
			</div>
		</div>
	</div>
</template>
