<script setup lang="ts">
import ProjectMilestoneStepper from '~/components/ProjectMilestoneStepper.vue';
import type { OsTask } from '~/types';

const { path } = useRoute();

const milestoneSteps = ['Discovery', 'Design', 'Development', 'Testing', 'Launch'];

// function getMilestoneIndex(step: string) {
// 	return milestoneSteps.indexOf(step);
// }

const { data: projects, error } = await useAsyncData(
	path,
	() => {
		return useDirectus(
			readItems('os_projects', {
				fields: [
					'id',
					'name',
					'due_date',
					'current_milestone',
					{
						tasks: ['id', 'name', 'status', 'due_date'],
					},
				],
				deep: {
					// @ts-ignore
					tasks: {
						_sort: ['due_date'],
						_filter: {
							type: {
								_eq: 'milestone',
							},
						},
					},
				},
			}),
		);
	},
	{},
);

if (error) {
	// console.log(error);
}

type TaskStatus = 'pending' | 'active' | 'in_progress' | 'in_review' | 'completed';

const taskStatuses = {
	pending: {
		label: 'Pending',
		icon: 'i-heroicons-clock-20-solid',
		color: 'gray',
	},
	active: {
		label: 'Active',
		icon: 'i-heroicons-play-20-solid',
		color: 'blue',
	},
	in_progress: {
		label: 'In Progress',
		icon: 'i-heroicons-wrench-screwdriver-20-solid',
		color: 'amber',
	},
	in_review: {
		label: 'In Review',
		icon: 'i-heroicons-exclamation-circle-20-solid',
		color: 'orange',
	},
	completed: {
		label: 'Completed',
		icon: 'i-heroicons-check-20-solid',
		color: 'green',
	},
};

const columns = [
	{
		key: 'name',
		label: 'Name',
	},
	{
		key: 'milestones',
		label: 'Status',
	},
	{
		key: 'due_date',
		label: 'Target Date',
	},
	{
		key: 'actions',
	},
];

const projectsShown = computed(() => {
	if (!projects.value) {
		return [];
	}

	return projects.value?.map((project) => {
		const tasks = project.tasks as OsTask[];

		return {
			id: project.id,
			name: project.name,
			due_date: project.due_date,
			current_milestone: project.current_milestone,
			tasks: tasks.map((task) => {
				return {
					isComplete: task.status === 'completed',
					isCurrent: task.status === 'active' || task.status === 'in_progress' || task.status === 'in_review',
					icon: 'i-heroicons-calendar',
					name: task.name,
					status: taskStatuses[(task.status as TaskStatus) ?? 'pending'].label,
				};
			}),
		};
	});
});
</script>
<template>
	<div>
		<PortalPageHeader
			title="Projects"
			:breadcrumbs="[
				{
					title: 'Portal',
					href: '/portal',
				},
				{
					title: 'Projects',
				},
			]"
		>
			<template #actions></template>
		</PortalPageHeader>
		<UCard class="mt-6">
			<!-- Filters -->
			<template #header>
				<div class="flex items-center justify-between">
					<!-- <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search..." /> -->
					<!-- <USelectMenu v-model="selectedStatus" :options="todoStatus" multiple placeholder="Status" class="w-40" /> -->
				</div>
			</template>
			<!-- Table -->
			<UTable :columns="columns" :rows="projectsShown" column-attribute="label">
				<template #name-data="{ row }">
					<UButton variant="link" :to="`/portal/projects/${row.id}`" size="xl" :padded="false">
						{{ row.name }}
					</UButton>
				</template>
				<template #due_date-data="{ row }">
					<VText size="xs">{{ getFriendlyDate(row.due_date) }}</VText>
					<VText size="xs" text-color="light">{{ getRelativeTime(row.due_date) }}</VText>
				</template>

				<template #milestones-data="{ row }">
					<ProjectMilestoneStepper :steps="milestoneSteps" :current-step="row.current_milestone" size="sm" />
				</template>

				<template #actions-data="{ row }">
					<UButton
						:to="`/portal/projects/${row.id}`"
						color="primary"
						variant="outline"
						icon="i-heroicons-arrow-right"
					/>
				</template>
			</UTable>
		</UCard>
	</div>
</template>
