<script setup lang="ts">
import type { OsTask } from '~/types';
import { readItems } from '@directus/sdk';
import ProjectMilestoneStepper from '~/components/ProjectMilestoneStepper.vue';

const { user } = useDirectusAuth();
const { path } = useRoute();

const milestoneSteps = ['Discovery', 'Design', 'Development', 'Testing', 'Launch'];

function getMilestoneIndex(step: string) {
	return milestoneSteps.indexOf(step);
}

// 🎯 1. Dynamic greeting
function useGreetings() {
	const messages = [
		'Remember, <em>every challenge</em> is easier together.',
		"Your vision is our mission. Together, we'll create <em>something outstanding</em>.",
		"The best projects are <em>fueled by partnership</em>. Here's to another successful day working together!",
		'Every detail, every idea, every feedback. <em>It all matters</em>. Thank you for entrusting us with your vision.',
		"Project management isn't just about the destination, it's about <em>enjoying and learning from the journey</em>. We're thrilled to be on this adventure with you.",
		'With every challenge, we <em>grow stronger</em>. Thanks for pushing us to be our best!',
		"From concept to completion, your aspirations are in <em>dedicated hands</em>. Let's keep moving forward, together.",
		"Like a symphony, <em>every note counts</em>. We're harmonizing perfectly with your vision, creating a masterpiece in progress.",
		"As we tackle today's tasks, know that our <em>commitment</em> to your success is unwavering.",
		'Every step with you is a step towards <em>brilliance</em>. Thanks for making this journey shine brighter.',
	];

	function getTodaysMessage() {
		const now = new Date();
		const start = new Date(now.getFullYear(), 0, 0);
		const difference = now.getTime() - start.getTime();
		const oneDay = 1000 * 60 * 60 * 24;
		const dayOfYear = Math.floor(difference / oneDay);
		const messageIndex = dayOfYear % messages.length;
		return messages[messageIndex];
	}

	return { getTodaysMessage };
}

const { getTodaysMessage } = useGreetings();

// 🎯 2. Project data
const { data: projects } = await useAsyncData(
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

// 🎯 3. Task formatting for stepper
type TaskStatus = 'pending' | 'active' | 'in_progress' | 'in_review' | 'completed';

const taskStatuses = {
	pending: { label: 'Pending', icon: 'i-heroicons-clock-20-solid', color: 'gray' },
	active: { label: 'Active', icon: 'i-heroicons-play-20-solid', color: 'blue' },
	in_progress: { label: 'In Progress', icon: 'i-heroicons-wrench-screwdriver-20-solid', color: 'amber' },
	in_review: { label: 'In Review', icon: 'i-heroicons-exclamation-circle-20-solid', color: 'orange' },
	completed: { label: 'Completed', icon: 'i-heroicons-check-20-solid', color: 'green' },
};

const columns = [
	{ key: 'name', label: 'Name' },
	{ key: 'milestones', label: 'Status' },
	{ key: 'due_date', label: 'Target Date' },
	{ key: 'actions' },
];

const projectsShown = computed(() => {
	if (!projects.value) return [];

	return projects.value.map((project) => {
		const tasks = project.tasks as OsTask[];

		return {
			id: project.id,
			name: project.name,
			due_date: project.due_date,
			current_milestone: project.current_milestone,
			tasks: tasks.map((task) => ({
				isComplete: task.status === 'completed',
				isCurrent: ['active', 'in_progress', 'in_review'].includes(task.status),
				icon: 'i-heroicons-calendar',
				name: task.name,
				status: taskStatuses[task.status as TaskStatus]?.label ?? 'Pending',
			})),
		};
	});
});
</script>

<template>
	<PageContainer>
		<img class="w-48 ml-auto mr-0" src="~/assets/illustrations/tokyo-luminous-table-lamp-on-boxes.svg" />
		<TypographyTitle class="normal-case">{{ greetUser() }} {{ user?.first_name ?? 'friend' }},</TypographyTitle>
		<TypographyHeadline :content="getTodaysMessage()" size="xl" />

		<VDivider class="my-8" />

		<UCard class="mt-6">
			<template #header>
				<div class="flex items-center justify-between">
					<TypographyTitle>Your Projects</TypographyTitle>
				</div>
			</template>

			<UTable :columns="columns" :rows="projectsShown" column-attribute="label">
				<template #empty-state>
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<UIcon name="i-heroicons-folder-open" class="w-12 h-12 text-gray-400 mb-2" />
						<TypographyTitle size="lg" class="mb-1">No Projects Yet</TypographyTitle>
						<VText text-color="light">Your project updates will appear here once they are available.</VText>
					</div>
				</template>

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
	</PageContainer>
</template>
