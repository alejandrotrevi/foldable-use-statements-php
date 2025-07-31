const vscode = require('vscode');

function isUseStatement(text) {
	return /^\s*use\s+[A-Za-z_\\][A-Za-z0-9_\\]*(\s+as\s+[A-Za-z_][A-Za-z0-9_]*)?\s*;/.test(text);
}

function isComment(text, inMultiLineComment) {
	return inMultiLineComment || text.startsWith('//') || text.startsWith('#');
}

function createUseStatementFoldingRanges(document) {
	const ranges = [];
	let groupStart = null;
	let lastUseLine = null;
	let inMultiLineComment = false;

	for (let i = 0; i < document.lineCount; i++) {
		const trimmedText = document.lineAt(i).text.trim();
		
		if (!trimmedText) continue;

		if (trimmedText.includes('/*')) inMultiLineComment = true;
		if (trimmedText.includes('*/')) {
			inMultiLineComment = false;
			continue;
		}

		if (isUseStatement(trimmedText)) {
			if (groupStart === null) groupStart = i;
			lastUseLine = i;
		} else if (!isComment(trimmedText, inMultiLineComment) && groupStart !== null) {
			if (lastUseLine > groupStart) {
				ranges.push(new vscode.FoldingRange(groupStart, lastUseLine, vscode.FoldingRangeKind.Imports));
			}
			groupStart = null;
			lastUseLine = null;
		}
	}

	if (groupStart !== null && lastUseLine > groupStart) {
		ranges.push(new vscode.FoldingRange(groupStart, lastUseLine, vscode.FoldingRangeKind.Imports));
	}

	return ranges;
}

function activate(context) {
	const foldingRangeProvider = {
		provideFoldingRanges: (document) => {
			if (document.languageId !== 'php') return [];
			
			return createUseStatementFoldingRanges(document);
		}
	};

	const disposable = vscode.languages.registerFoldingRangeProvider('php', foldingRangeProvider);
	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate, createUseStatementFoldingRanges, isUseStatement };
