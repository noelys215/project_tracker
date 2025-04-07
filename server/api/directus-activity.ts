// server/api/directus-activity.ts
import { defineEventHandler, getQuery } from 'h3';
import { $fetch } from 'ofetch';

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const token = config.directusServerToken;
	const url = config.public.directusUrl;

	const query = getQuery(event);

	console.log('Using server token:', token);

	try {
		const activity = await $fetch(`${url}/activity`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			query,
		});

		return activity;
	} catch (err) {
		console.error('🛑 Error fetching activity from Directus:', err);
		throw createError({ statusCode: 500, message: 'Failed to fetch Directus activity' });
	}
});
