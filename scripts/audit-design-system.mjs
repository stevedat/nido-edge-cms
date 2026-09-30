import fs from 'node:fs/promises';
import path from 'node:path';

const SRC_DIR = path.resolve(process.cwd(), 'src');
const shouldFix = process.argv.includes('--fix');

/**
 * Scan all .svelte files recursively in directory
 */
async function getSvelteFiles(dir) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await getSvelteFiles(fullPath)));
		} else if (entry.isFile() && entry.name.endsWith('.svelte')) {
			files.push(fullPath);
		}
	}
	return files;
}

/**
 * Audit and optionally fix a single .svelte file
 */
async function auditFile(filePath) {
	let content = await fs.readFile(filePath, 'utf-8');
	const relativePath = path.relative(process.cwd(), filePath);
	const violations = [];
	let modified = false;

	// 1. Detect imported Lucide icons
	const lucideImportMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-svelte['"]/);
	const lucideIcons = new Set();
	if (lucideImportMatch) {
		lucideImportMatch[1]
			.split(',')
			.map(s => s.trim().split(/\s+as\s+/)[0].trim())
			.filter(s => s && /^[A-Z]/.test(s))
			.forEach(icon => lucideIcons.add(icon));
	}

	const lines = content.split('\n');
	const newLines = [];

	for (let index = 0; index < lines.length; index++) {
		let line = lines[index];
		const lineNum = index + 1;
		const trimmed = line.trim();

		// Skip comments
		if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('<!--')) {
			newLines.push(line);
			continue;
		}

		// Check for hardcoded colors (solid)
		const hardcodedColorPatterns = [
			{ regex: /\bbg-white(?![/\w-])/, desc: 'Hardcoded solid "bg-white" (dùng "bg-surface" hoặc "bg-main-bg")' },
			{ regex: /\bbg-black(?![/\w-])/, desc: 'Hardcoded solid "bg-black" (dùng "bg-main-bg" hoặc "bg-surface")' },
			{ regex: /\bbg-slate-(?:50|100|200|300|800|900)\b/, desc: 'Hardcoded "bg-slate-*" (dùng semantic token "bg-main-bg" / "bg-soft-bg" / "bg-surface")' },
			{ regex: /\bbg-gray-(?:50|100|200|300|800|900)\b/, desc: 'Hardcoded "bg-gray-*" (dùng semantic token "bg-main-bg" / "bg-soft-bg" / "bg-surface")' },
			{ regex: /\btext-slate-(?:400|500|600|700|800|900)\b/, desc: 'Hardcoded "text-slate-*" (dùng "text-text-main" / "text-text-body" / "text-text-muted")' },
			{ regex: /\btext-gray-(?:400|500|600|700|800|900)\b/, desc: 'Hardcoded "text-gray-*" (dùng "text-text-main" / "text-text-body" / "text-text-muted")' },
			{ regex: /\bborder-slate-(?:100|200|300|700|800)\b/, desc: 'Hardcoded "border-slate-*" (dùng "border-border-subtle" / "border-border-strong")' },
			{ regex: /\bborder-gray-(?:100|200|300|700|800)\b/, desc: 'Hardcoded "border-gray-*" (dùng "border-border-subtle" / "border-border-strong")' }
		];

		// Exclude layout swatch preview in settings where explicit palette colors are previewed
		const isSettingsPaletteSwatch = relativePath.includes('settings/+page.svelte') && (trimmed.includes('style="background-color:') || trimmed.includes('title="Nền'));

		if (!isSettingsPaletteSwatch) {
			for (const { regex, desc } of hardcodedColorPatterns) {
				if (regex.test(trimmed)) {
					violations.push({
						type: 'COLOR_HARDCODED',
						line: lineNum,
						desc,
						snippet: trimmed
					});
				}
			}
		}

		// Check for Lucide icons without strokeWidth
		if (lucideIcons.size > 0) {
			for (const icon of lucideIcons) {
				const tagRegex = new RegExp(`<${icon}\\b([^>]*)\\/?>`, 'g');
				let match;
				while ((match = tagRegex.exec(line)) !== null) {
					const attrs = match[1];
					if (!attrs.includes('strokeWidth') && !attrs.includes('stroke-width')) {
						violations.push({
							type: 'ICON_STROKE_WIDTH',
							line: lineNum,
							desc: `Icon <${icon} /> thiếu 'strokeWidth={1.75}' (hoặc {2.25} cho Check)`,
							snippet: trimmed
						});

						if (shouldFix) {
							const defaultStroke = icon === 'Check' ? 'strokeWidth={2.25}' : 'strokeWidth={1.75}';
							// Insert strokeWidth right after <IconName
							const replacement = `<${icon} ${defaultStroke}${attrs}>`;
							// Only replace if matched self-closing or open tag
							if (match[0].endsWith('/>')) {
								line = line.replace(match[0], `<${icon} ${defaultStroke}${attrs}/>`);
							} else {
								line = line.replace(match[0], `<${icon} ${defaultStroke}${attrs}>`);
							}
							modified = true;
						}
					}
				}
			}
		}

		newLines.push(line);
	}

	if (shouldFix && modified) {
		await fs.writeFile(filePath, newLines.join('\n'), 'utf-8');
	}

	return {
		file: relativePath,
		violations
	};
}

async function main() {
	console.log(`🔍 [Design System Audit] Bắt đầu quét kiểm tra quy chuẩn thiết kế${shouldFix ? ' (Chế độ tự động sửa --fix)' : ''}...`);
	const files = await getSvelteFiles(SRC_DIR);
	console.log(`📁 Quét ${files.length} tệp .svelte trong src/\n`);

	const results = [];
	let totalViolations = 0;

	for (const file of files) {
		const res = await auditFile(file);
		if (res.violations.length > 0) {
			results.push(res);
			totalViolations += res.violations.length;
		}
	}

	console.log('======================================================');
	console.log(`📊 KẾT QUẢ QUÉT KIỂM TRA QUY CHUẨN THIẾT KẾ`);
	console.log('======================================================');

	if (totalViolations === 0) {
		console.log('🎉 XUẤT SẮC! Không phát hiện vi phạm nào. 100% tuân thủ quy chuẩn Apple Minimalist & Semantic Tokens.\n');
		process.exit(0);
	}

	console.log(`⚠️ Phát hiện tổng cộng: ${totalViolations} vi phạm tại ${results.length} tệp:\n`);

	for (const r of results) {
		console.log(`📄 ${r.file} (${r.violations.length} lỗi):`);
		for (const v of r.violations) {
			console.log(`   [Dòng ${v.line}] [${v.type}] ${v.desc}`);
			console.log(`      > ${v.snippet.substring(0, 95)}...`);
		}
		console.log('');
	}

	console.log('======================================================');
	if (shouldFix) {
		console.log(' Đã tự động bổ sung strokeWidth={1.75} cho các icon.');
		console.log('Hãy chạy lại `node scripts/audit-design-system.mjs` để kiểm tra các lỗi màu sắc cần xử lý thủ công.');
	} else {
		console.log('Chạy `node scripts/audit-design-system.mjs --fix` để tự động sửa strokeWidth cho toàn bộ icon.');
	}
	console.log('======================================================\n');
}

main().catch(err => {
	console.error('Lỗi khi chạy audit:', err);
	process.exit(1);
});
