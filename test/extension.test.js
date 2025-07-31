const assert = require('assert');
const { createUseStatementFoldingRanges, isUseStatement } = require('../extension');

function createMockDocument(lines, languageId = 'php') {
	return {
		languageId,
		lineCount: lines.length,
		lineAt: (index) => ({
			text: lines[index] || ''
		})
	};
}

suite('Extension Test Suite', () => {
	suite('isUseStatement', () => {
		test('should detect valid use statements', () => {
			assert.strictEqual(isUseStatement('use App\\Models\\User;'), true);
			assert.strictEqual(isUseStatement('  use App\\Models\\User;  '), true);
			assert.strictEqual(isUseStatement('use App\\Models\\User as UserModel;'), true);
		});

		test('should reject invalid use statements', () => {
			assert.strictEqual(isUseStatement('// use App\\Models\\User;'), false);
			assert.strictEqual(isUseStatement('function use() {}'), false);
			assert.strictEqual(isUseStatement('$use = "test";'), false);
		});
	});

	suite('createUseStatementFoldingRanges', () => {
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
			assert.strictEqual(ranges.length, 1);
			assert.strictEqual(ranges[0].start, 1);
			assert.strictEqual(ranges[0].end, 3);
		});

		test('should not create folding range for single use statement', () => {
			const document = createMockDocument([
				'<?php',
				'use App\\Models\\User;',
				'',
				'class MyClass {}'
			]);

			const ranges = createUseStatementFoldingRanges(document);
			assert.strictEqual(ranges.length, 0);
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
			assert.strictEqual(ranges.length, 1);
			assert.strictEqual(ranges[0].start, 1);
			assert.strictEqual(ranges[0].end, 4);
		});

		test('should handle multiple separate groups', () => {
			const document = createMockDocument([
				'<?php',
				'use App\\Models\\User;',
				'use App\\Models\\Post;',
				'',
				'class MyClass {',
				'    public function test() {',
				'        use App\\Services\\Helper;',
				'        use App\\Services\\Logger;',
				'    }',
				'}'
			]);

			const ranges = createUseStatementFoldingRanges(document);
			assert.strictEqual(ranges.length, 2);
			assert.strictEqual(ranges[0].start, 1);
			assert.strictEqual(ranges[0].end, 2);
			assert.strictEqual(ranges[1].start, 6);
			assert.strictEqual(ranges[1].end, 7);
		});

		test('should handle multi-line comments', () => {
			const document = createMockDocument([
				'<?php',
				'use App\\Models\\User;',
				'/*',
				'use App\\Models\\Comment;',
				'*/',
				'use App\\Models\\Post;',
				'',
				'class MyClass {}'
			]);

			const ranges = createUseStatementFoldingRanges(document);
			assert.strictEqual(ranges.length, 1);
			assert.strictEqual(ranges[0].start, 1);
			assert.strictEqual(ranges[0].end, 5);
		});

		test('should handle empty lines between use statements', () => {
			const document = createMockDocument([
				'<?php',
				'use App\\Models\\User;',
				'',
				'use App\\Models\\Post;',
				'use App\\Models\\Comment;',
				'',
				'class MyClass {}'
			]);

			const ranges = createUseStatementFoldingRanges(document);
			assert.strictEqual(ranges.length, 1);
			assert.strictEqual(ranges[0].start, 1);
			assert.strictEqual(ranges[0].end, 4);
		});

		test('should handle use statements at end of file', () => {
			const document = createMockDocument([
				'<?php',
				'use App\\Models\\User;',
				'use App\\Models\\Post;'
			]);

			const ranges = createUseStatementFoldingRanges(document);
			assert.strictEqual(ranges.length, 1);
			assert.strictEqual(ranges[0].start, 1);
			assert.strictEqual(ranges[0].end, 2);
		});
	});
});
