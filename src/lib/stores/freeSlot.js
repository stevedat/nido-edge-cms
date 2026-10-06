// @ts-check
import { writable } from 'svelte/store';

export const isFreeSlotModalOpen = writable(false);
export const freeSlotModalSource = writable('projects');

/**
 * Mở modal đăng ký suất miễn phí
 * @param {string} source
 */
export function openFreeSlotModal(source = 'projects') {
	freeSlotModalSource.set(source);
	isFreeSlotModalOpen.set(true);
}

/**
 * Đóng modal đăng ký
 */
export function closeFreeSlotModal() {
	isFreeSlotModalOpen.set(false);
}
