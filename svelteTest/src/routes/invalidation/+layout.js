// export async function load({ fetch }) {
// 	const response = await fetch('/invalidation/api/now');
// 	const now = await response.json();
// 	return {
// 		now
// 	};
// }

// export async function load({ depends }) {
//  depends('data:now');
// 	return {
//     now: Date.now()
// 	};
// }

export async function load() {
	return {
    now: Date.now()
	};
}
