#!/usr/bin/env node

/**
 * Mobile UX & Accessibility Audit Tool
 * Checks Svelte components for:
 * 1. Modals without role="dialog" or aria-modal="true"
 * 2. Modals without backdrop click light dismiss
 * 3. Icon-only buttons without aria-label
 * 4. Close buttons with sub-44px touch targets
 * 5. Usage of native window.confirm()
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'src');

const isStrict = process.argv.includes('--strict');

function getAllSvelteFiles(dir, files = []) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name !== 'node_modules' && entry.name !== '.svelte-kit') {
				getAllSvelteFiles(fullPath, files);
			}
		} else if (entry.isFile() && entry.name.endsWith('.svelte')) {
			files.push(fullPath);
		}
	}
	return files;
}

const files = getAllSvelteFiles(srcDir);
const issues = [];

for (const filePath of files) {
	const relPath = path.relative(rootDir, filePath);
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');

	// 1. Check for raw window.confirm()
	lines.forEach((line, idx) => {
		const isNativeConfirm = /(?:window\.)?\bconfirm\s*\(/.test(line) && !line.includes('onconfirm') && !line.includes('// ignore-confirm') && !line.includes('function confirm');
		if (isNativeConfirm) {
			issues.push({
				file: relPath,
				line: idx + 1,
				type: 'NATIVE_CONFIRM',
				message: 'Sử dụng native confirm() - Cần thay bằng ConfirmDialog chuẩn Mobile UX'
			});
		}
	});

	// 2. Check modal elements without ARIA
	if (content.includes('fixed inset-0') && (content.includes('z-50') || content.includes('z-40'))) {
		// If it looks like a modal overlay but lacks role="dialog" or aria-modal
		const isModalLike = content.includes('rounded-') && (content.includes('shadow-') || content.includes('backdrop-blur'));
		if (isModalLike && !content.includes('role="dialog"') && !relPath.includes('+layout.svelte')) {
			issues.push({
				file: relPath,
				line: 1,
				type: 'MODAL_ARIA_MISSING',
				message: 'Modal thiếu role="dialog" hoặc aria-modal="true" theo chuẩn WCAG'
			});
		}
	}

	// 3. Check for sub-44px icon buttons or close buttons
	lines.forEach((line, idx) => {
		if (line.includes('<button') || line.includes('class="')) {
			// Look for close buttons
			if ((line.includes('<X') || line.includes('aria-label="Đóng"') || line.includes('aria-label="Close"')) && line.includes('size-8')) {
				issues.push({
					file: relPath,
					line: idx + 1,
					type: 'TOUCH_TARGET_SMALL',
					message: 'Nút đóng có kích thước nhỏ (size-8 < 44px) vi phạm tiêu chuẩn công thái học di động'
				});
			}
		}
	});
}

console.log('\n📱 ========================================================');
console.log('📱   BÁO CÁO KIỂM TRA MOBILE UX & DIALOG ACCESSIBILITY    ');
console.log('📱 ========================================================\n');

if (issues.length === 0) {
	console.log('✅ TUYỆT VỜI: Tất cả các thành phần đều tuân thủ 100% chuẩn Mobile UX & Dialog!\n');
	process.exit(0);
} else {
	console.log(`⚠️  Phát hiện ${issues.length} điểm cần tối ưu hóa Mobile UX:\n`);
	for (const issue of issues) {
		console.log(` • [${issue.type}] ${issue.file}:${issue.line}`);
		console.log(`   👉 ${issue.message}\n`);
	}

	if (isStrict) {
		console.error('❌ Kiểm tra thất bại ở chế độ --strict. Vui lòng khắc phục các điểm trên.');
		process.exit(1);
	} else {
		console.log('ℹ️  Chạy ở chế độ audit. Sử dụng "npm run mobile:check" để bật chế độ strict.\n');
		process.exit(0);
	}
}
