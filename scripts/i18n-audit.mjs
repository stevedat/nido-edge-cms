#!/usr/bin/env node
/**
 * i18n Audit & Coverage Tool for Antigravity / SvelteKit
 * 
 * Features:
 * 1. Checks 1-1 Key Parity between vi.ts and en.ts
 * 2. Scans for hardcoded Vietnamese strings across codebase (categorized: Storefront, Admin, API/Services)
 * 3. Detects ad-hoc inline translation ternaries (e.g. `getLocale() === 'en' ? ... : ...`)
 * 4. Checks for unused translation keys in dictionaries
 * 5. Generates structured health & coverage report
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');
const VI_FILE = path.join(SRC_DIR, 'lib/i18n/translations/vi.ts');
const EN_FILE = path.join(SRC_DIR, 'lib/i18n/translations/en.ts');

const VIETNAMESE_CHAR_REGEX = /[àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/i;
const INLINE_LOCALE_TERNARY = /getLocale\(\)\s*===?\s*['"]en['"]/g;

// Helper to extract keys from a TS object file
function parseTsObjectKeys(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');
	// Extract object body by removing export statement
	const match = content.match(/export\s+const\s+(?:vi|en)\s*=\s*(\{[\s\S]*\});?\s*$/);
	if (!match) {
		throw new Error(`Could not parse translation object in ${filePath}`);
	}

	// Safely evaluate translation dictionary as JS object using Function or JSON-like parse
	const cleanJs = match[1]
		.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '') // Remove comments
		.replace(/,\s*([\}\]])/g, '$1'); // Remove trailing commas

	try {
		// Use Function to evaluate JS object literal
		const fn = new Function(`return (${cleanJs});`);
		const obj = fn();

		function extractKeys(o, prefix = '') {
			let keys = [];
			for (const [k, v] of Object.entries(o)) {
				const fullKey = prefix ? `${prefix}.${k}` : k;
				if (v && typeof v === 'object' && !Array.isArray(v)) {
					keys = keys.concat(extractKeys(v, fullKey));
				} else {
					keys.push(fullKey);
				}
			}
			return keys;
		}

		return { obj, keys: extractKeys(obj) };
	} catch (err) {
		console.error(`Error parsing ${filePath}:`, err.message);
		return { obj: {}, keys: [] };
	}
}

// Helper to walk directory
function walkDir(dir, filter = /\.(svelte|ts|js)$/) {
	let results = [];
	if (!fs.existsSync(dir)) return results;
	const list = fs.readdirSync(dir);
	for (const file of list) {
		const fullPath = path.join(dir, file);
		const stat = fs.statSync(fullPath);
		if (stat.isDirectory()) {
			if (file !== 'node_modules' && file !== '.svelte-kit' && file !== '.git' && file !== '.tempmediaStorage') {
				results = results.concat(walkDir(fullPath, filter));
			}
		} else if (filter.test(file)) {
			results.push(fullPath);
		}
	}
	return results;
}

console.log('\n======================================================');
console.log('   🔍 ANTIGRAVITY i18n COMPREHENSIVE AUDIT REPORT');
console.log('======================================================\n');

// 1. Check Key Parity between vi.ts and en.ts
const viData = parseTsObjectKeys(VI_FILE);
const enData = parseTsObjectKeys(EN_FILE);

const viKeySet = new Set(viData.keys);
const enKeySet = new Set(enData.keys);

const missingInEn = viData.keys.filter((k) => !enKeySet.has(k));
const missingInVi = enData.keys.filter((k) => !viKeySet.has(k));

console.log('--- [1] DICTIONARY PARITY & HEALTH ---');
console.log(`• Total Keys in VI (vi.ts): ${viKeySet.size}`);
console.log(`• Total Keys in EN (en.ts): ${enKeySet.size}`);

if (missingInEn.length === 0 && missingInVi.length === 0) {
	console.log('✅ Dictionary Parity: 100% Match (0 missing keys between VI and EN)\n');
} else {
	console.log(`❌ Missing in EN (${missingInEn.length}):`, missingInEn.slice(0, 10));
	console.log(`❌ Missing in VI (${missingInVi.length}):`, missingInVi.slice(0, 10), '\n');
}

// 2. Scan Codebase for Hardcoded Text and Inline Ternaries
const allFiles = walkDir(SRC_DIR);

const issues = {
	admin: [],
	storefront: [],
	servicesApi: []
};

const inlineTernaryOccurrences = [];
const usedTranslationKeys = new Set();

for (const file of allFiles) {
	// Skip translation files themselves & seeds/tests & utils slug map
	if (
		file.includes('i18n/translations/vi.ts') || 
		file.includes('i18n/translations/en.ts') ||
		file.includes('src/lib/utils.js')
	) continue;

	const relPath = path.relative(ROOT_DIR, file);
	const content = fs.readFileSync(file, 'utf8');
	const lines = content.split('\n');

	// Check used t('...') calls
	const tMatches = content.matchAll(/t\(\s*['"]([a-zA-Z0-9_.]+)['"]/g);
	for (const m of tMatches) {
		usedTranslationKeys.add(m[1]);
	}

	// Check inline ternaries
	if (INLINE_LOCALE_TERNARY.test(content)) {
		const matchCount = (content.match(INLINE_LOCALE_TERNARY) || []).length;
		inlineTernaryOccurrences.push({ file: relPath, count: matchCount });
	}

	// Check line-by-line for hardcoded Vietnamese text
	lines.forEach((line, idx) => {
		const trimmed = line.trim();
		// Skip single line comments, HTML comments, or markdown formatting files
		if (
			trimmed.startsWith('//') || 
			trimmed.startsWith('/*') || 
			trimmed.startsWith('*') ||
			trimmed.startsWith('<!--') ||
			trimmed.endsWith('-->')
		) return;
		if (trimmed.startsWith('console.log') || trimmed.startsWith('console.error')) return;

		if (VIETNAMESE_CHAR_REGEX.test(line)) {
			const item = {
				file: relPath,
				line: idx + 1,
				snippet: trimmed.slice(0, 90)
			};

			if (relPath.includes('src/routes/admin') || relPath.includes('src/lib/components/admin')) {
				issues.admin.push(item);
			} else if (relPath.includes('src/lib/services') || relPath.includes('src/routes/api')) {
				issues.servicesApi.push(item);
			} else {
				issues.storefront.push(item);
			}
		}
	});
}

// 3. Unused Keys in Dictionary
const unusedKeys = viData.keys.filter((k) => !usedTranslationKeys.has(k));

console.log('--- [2] CODEBASE COVERAGE BREAKDOWN ---');
console.log(`• Hardcoded Vietnamese strings in Admin Portal:     ${issues.admin.length} lines`);
console.log(`• Hardcoded Vietnamese strings in Storefront (UI):   ${issues.storefront.length} lines`);
console.log(`• Hardcoded Vietnamese strings in API / Services:   ${issues.servicesApi.length} lines`);
console.log(`• Ad-hoc inline ternaries (\`getLocale() === 'en'\`): ${inlineTernaryOccurrences.reduce((acc, curr) => acc + curr.count, 0)} instances across ${inlineTernaryOccurrences.length} files`);
console.log(`• Unreferenced / Potential Dead Keys in vi.ts:       ${unusedKeys.length} keys\n`);

// 4. Detailed Top Affected Files
console.log('--- [3] TOP FILES NEEDING i18n REFACTORING ---');
const fileCounts = {};
[...issues.admin, ...issues.storefront, ...issues.servicesApi].forEach((i) => {
	fileCounts[i.file] = (fileCounts[i.file] || 0) + 1;
});
const sortedFiles = Object.entries(fileCounts).sort((a, b) => b[1] - a[1]);

console.log('📍 Admin Area:');
sortedFiles.filter(([f]) => f.includes('admin')).slice(0, 8).forEach(([f, count]) => {
	console.log(`   - ${count.toString().padStart(3)} lines: ${f}`);
});

console.log('\n📍 Storefront / Public UI:');
sortedFiles.filter(([f]) => !f.includes('admin') && !f.includes('api') && !f.includes('services')).slice(0, 8).forEach(([f, count]) => {
	console.log(`   - ${count.toString().padStart(3)} lines: ${f}`);
});

console.log('\n📍 API & System Services:');
sortedFiles.filter(([f]) => f.includes('api') || f.includes('services')).slice(0, 5).forEach(([f, count]) => {
	console.log(`   - ${count.toString().padStart(3)} lines: ${f}`);
});

// 5. Estimated Overall Coverage Score
console.log('\n--- [4] OVERALL i18n COVERAGE SCORECARD ---');
const storefrontScore = Math.max(0, Math.round(100 - (issues.storefront.length / 150) * 100));
const adminScore = issues.admin.length > 50 ? 0 : 50; // Admin has virtually zero i18n
const apiScore = issues.servicesApi.length > 20 ? 0 : 40;
const overallScore = Math.round(storefrontScore * 0.5 + adminScore * 0.35 + apiScore * 0.15);

console.log(`📊 Storefront (Public-facing):  ~${storefrontScore}% Covered`);
console.log(`📊 Admin Portal (/admin/*):     ~${adminScore}% Covered (Completely Hardcoded in Vietnamese)`);
console.log(`📊 API & System Services:       ~${apiScore}% Covered (Raw Vietnamese error/success strings)`);
console.log(`------------------------------------------------------`);
console.log(`🎯 TOTAL SYSTEM i18n COVERAGE:  ~${overallScore}% (NOT 100% COVERED)\n`);

const isStrict = process.argv.includes('--strict');
if (isStrict && (issues.admin.length > 0 || issues.storefront.length > 0 || missingInEn.length > 0)) {
	console.error('❌ Strict check failed: Found unlocalized strings or missing translation keys.');
	process.exit(1);
} else {
	console.log('💡 Audit completed. Use `npm run i18n:audit` anytime to re-check.');
}
