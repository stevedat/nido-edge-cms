import { writable } from 'svelte/store';

export interface ToastMessage {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<ToastMessage[]>([]);

	function add(message: string, type: ToastMessage['type'] = 'info', duration = 4000) {
		const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
		const newToast: ToastMessage = { id, type, message, duration };

		update((toasts) => [...toasts, newToast]);

		if (duration > 0) {
			setTimeout(() => {
				remove(id);
			}, duration);
		}

		return id;
	}

	function remove(id: string) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		add,
		remove,
		success: (msg: string, duration?: number) => add(msg, 'success', duration),
		error: (msg: string, duration?: number) => add(msg, 'error', duration),
		info: (msg: string, duration?: number) => add(msg, 'info', duration),
		warning: (msg: string, duration?: number) => add(msg, 'warning', duration),
		clear: () => update(() => [])
	};
}

export const toast = createToastStore();
