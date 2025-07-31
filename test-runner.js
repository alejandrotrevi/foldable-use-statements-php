const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
	if (id === 'vscode') {
		return {
			FoldingRange: class FoldingRange {
				constructor(start, end) {
					this.start = start;
					this.end = end;
				}
			},
			languages: {
				registerFoldingRangeProvider: () => ({})
			}
		};
	}
	return originalRequire.apply(this, arguments);
};

const { isUseStatement, createUseStatementFoldingRanges } = require('./extension');

function createMockDocument(lines, languageId = 'php') {
	return {
		languageId,
		lineCount: lines.length,
		lineAt: (index) => ({
			text: lines[index] || ''
		})
	};
}

function runTests() {
	let passed = 0;
	let failed = 0;

	function test(name, fn) {
		try {
			fn();
			console.log(`✓ ${name}`);
			passed++;
		} catch (error) {
			console.log(`✗ ${name}: ${error.message}`);
			failed++;
		}
	}

	function assert(condition, message) {
		if (!condition) {
			throw new Error(message || 'Assertion failed');
		}
	}

	console.log('Running tests...\n');

	test('should detect valid use statements', () => {
		assert(isUseStatement('use App\\Models\\User;'), 'Should detect basic use statement');
		assert(isUseStatement('  use App\\Models\\User;  '), 'Should detect use statement with whitespace');
		assert(isUseStatement('use App\\Models\\User as UserModel;'), 'Should detect use statement with alias');
	});

	test('should reject invalid use statements', () => {
		assert(!isUseStatement('// use App\\Models\\User;'), 'Should reject commented use statement');
		assert(!isUseStatement('function use() {}'), 'Should reject function named use');
		assert(!isUseStatement('$use = "test";'), 'Should reject variable named use');
	});

	test('should create folding range for multiple consecutive use statements', () => {
		const document = createMockDocument([
			'<?php',
			'use App\\Models\\User;',
			'use App\\Models\\Post;',
			'use App\\Models\\Comment;',
			'',
			'class MyClass {}'
		]);

		const ranges = createUseStatementFoldingRanges(document);
		assert(ranges.length === 1, `Expected 1 range, got ${ranges.length}`);
		assert(ranges[0].start === 1, `Expected start 1, got ${ranges[0].start}`);
		assert(ranges[0].end === 3, `Expected end 3, got ${ranges[0].end}`);
	});

	test('should not create folding range for single use statement', () => {
		const document = createMockDocument([
			'<?php',
			'use App\\Models\\User;',
			'',
			'class MyClass {}'
		]);

		const ranges = createUseStatementFoldingRanges(document);
		assert(ranges.length === 0, `Expected 0 ranges, got ${ranges.length}`);
	});

	test('should handle comments between use statements', () => {
		const document = createMockDocument([
			'<?php',
			'use App\\Models\\User;',
			'use App\\Models\\Post;',
			'// use App\\Models\\Comment;',
			'use App\\Models\\Tag;',
			'',
			'class MyClass {}'
		]);

		const ranges = createUseStatementFoldingRanges(document);
		assert(ranges.length === 1, `Expected 1 range, got ${ranges.length}`);
		assert(ranges[0].start === 1, `Expected start 1, got ${ranges[0].start}`);
		assert(ranges[0].end === 4, `Expected end 4, got ${ranges[0].end}`);
	});

	test('should handle use statements at end of file', () => {
		const document = createMockDocument([
			'<?php',
			'use App\\Models\\User;',
			'use App\\Models\\Post;'
		]);

		const ranges = createUseStatementFoldingRanges(document);
		assert(ranges.length === 1, `Expected 1 range, got ${ranges.length}`);
		assert(ranges[0].start === 1, `Expected start 1, got ${ranges[0].start}`);
		assert(ranges[0].end === 2, `Expected end 2, got ${ranges[0].end}`);
	});

	console.log(`\nResults: ${passed} passed, ${failed} failed`);
	process.exit(failed > 0 ? 1 : 0);
}

runTests();