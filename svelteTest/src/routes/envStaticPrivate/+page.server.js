import { redirect, fail } from '@sveltejs/kit';
// import { PASSPHRASE } from '$env/static/private';
import { env } from '$env/dynamic/private';

export function load({ cookies }) {
	if (cookies.get('allowed')) {
		redirect(307, '/envStaticPrivate/welcome');
	}
}

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();

		// if (data.get('passphrase') === PASSPHRASE) {
		if (data.get('passphrase') === env.PASSPHRASE) {
			cookies.set('allowed', 'true', {
				path: '/'
			});

			redirect(303, '/envStaticPrivate/welcome');
		}

		return fail(403, {
			incorrect: true
		});
	}
};
