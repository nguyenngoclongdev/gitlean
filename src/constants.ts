'use strict';
import { commands, TextDocument, TextEditor, window } from 'vscode';
import { ViewShowBranchComparison } from './config';
import { SearchPattern } from './git/git';

export const quickPickTitleMaxChars = 80;

export enum BuiltInCommands {
	CloseActiveEditor = 'workbench.action.closeActiveEditor',
	CloseAllEditors = 'workbench.action.closeAllEditors',
	CursorMove = 'cursorMove',
	Diff = 'vscode.diff',
	EditorScroll = 'editorScroll',
	ExecuteDocumentSymbolProvider = 'vscode.executeDocumentSymbolProvider',
	ExecuteCodeLensProvider = 'vscode.executeCodeLensProvider',
	FocusFilesExplorer = 'workbench.files.action.focusFilesExplorer',
	InstallExtension = 'workbench.extensions.installExtension',
	Open = 'vscode.open',
	OpenFolder = 'vscode.openFolder',
	OpenInTerminal = 'openInTerminal',
	OpenWith = 'vscode.openWith',
	NextEditor = 'workbench.action.nextEditor',
	PreviewHtml = 'vscode.previewHtml',
	RevealLine = 'revealLine',
	SetContext = 'setContext',
	ShowExplorerActivity = 'workbench.view.explorer',
	ShowReferences = 'editor.action.showReferences',
}

export enum BuiltInGitCommands {
	Publish = 'git.publish',
	Pull = 'git.pull',
	PullRebase = 'git.pullRebase',
	Push = 'git.push',
	PushForce = 'git.pushForce',
	UndoCommit = 'git.undoCommit',
}

export enum BuiltInGitConfiguration {
	AutoRepositoryDetection = 'git.autoRepositoryDetection',
	FetchOnPull = 'git.fetchOnPull',
	UseForcePushWithLease = 'git.useForcePushWithLease',
}

export enum ContextKeys {
	ActionPrefix = 'gitlean:action:',
	ActiveFileStatus = 'gitlean:activeFileStatus',
	AnnotationStatus = 'gitlean:annotationStatus',
	DisabledToggleCodeLens = 'gitlean:disabledToggleCodeLens',
	Disabled = 'gitlean:disabled',
	Enabled = 'gitlean:enabled',
	HasConnectedRemotes = 'gitlean:hasConnectedRemotes',
	HasRemotes = 'gitlean:hasRemotes',
	HasRichRemotes = 'gitlean:hasRichRemotes',
	Key = 'gitlean:key',
	Readonly = 'gitlean:readonly',
	ViewsCanCompare = 'gitlean:views:canCompare',
	ViewsCanCompareFile = 'gitlean:views:canCompare:file',
	ViewsCommitsMyCommitsOnly = 'gitlean:views:commits:myCommitsOnly',
	ViewsFileHistoryCanPin = 'gitlean:views:fileHistory:canPin',
	ViewsFileHistoryCursorFollowing = 'gitlean:views:fileHistory:cursorFollowing',
	ViewsFileHistoryEditorFollowing = 'gitlean:views:fileHistory:editorFollowing',
	ViewsLineHistoryEditorFollowing = 'gitlean:views:lineHistory:editorFollowing',
	ViewsRepositoriesAutoRefresh = 'gitlean:views:repositories:autoRefresh',
	ViewsSearchAndCompareKeepResults = 'gitlean:views:searchAndCompare:keepResults',
	ViewsWelcomeVisible = 'gitlean:views:welcome:visible',
	Vsls = 'gitlean:vsls',
}

export function setContext(key: ContextKeys | string, value: any) {
	return commands.executeCommand(BuiltInCommands.SetContext, key, value);
}

export enum Colors {
	GutterBackgroundColor = 'gitlean.gutterBackgroundColor',
	GutterForegroundColor = 'gitlean.gutterForegroundColor',
	GutterUncommittedForegroundColor = 'gitlean.gutterUncommittedForegroundColor',
	TrailingLineBackgroundColor = 'gitlean.trailingLineBackgroundColor',
	TrailingLineForegroundColor = 'gitlean.trailingLineForegroundColor',
	LineHighlightBackgroundColor = 'gitlean.lineHighlightBackgroundColor',
	LineHighlightOverviewRulerColor = 'gitlean.lineHighlightOverviewRulerColor',
	ClosedPullRequestIconColor = 'gitlean.closedPullRequestIconColor',
	OpenPullRequestIconColor = 'gitlean.openPullRequestIconColor',
	MergedPullRequestIconColor = 'gitlean.mergedPullRequestIconColor',
	UnpushlishedChangesIconColor = 'gitlean.unpushlishedChangesIconColor',
	UnpublishedCommitIconColor = 'gitlean.unpublishedCommitIconColor',
	UnpulledChangesIconColor = 'gitlean.unpulledChangesIconColor',
}

export enum DocumentSchemes {
	DebugConsole = 'debug',
	File = 'file',
	Git = 'git',
	GitLean = 'gitlean',
	Output = 'output',
	PRs = 'pr',
	Vsls = 'vsls',
}

export function getEditorIfActive(document: TextDocument): TextEditor | undefined {
	const editor = window.activeTextEditor;
	return editor != null && editor.document === document ? editor : undefined;
}

export function isActiveDocument(document: TextDocument): boolean {
	const editor = window.activeTextEditor;
	return editor != null && editor.document === document;
}

export function isTextEditor(editor: TextEditor): boolean {
	const scheme = editor.document.uri.scheme;
	return scheme !== DocumentSchemes.Output && scheme !== DocumentSchemes.DebugConsole;
}

export function hasVisibleTextEditor(): boolean {
	if (window.visibleTextEditors.length === 0) return false;

	return window.visibleTextEditors.some(e => isTextEditor(e));
}

export const enum GlyphChars {
	AngleBracketLeftHeavy = '\u2770',
	AngleBracketRightHeavy = '\u2771',
	ArrowBack = '\u21a9',
	ArrowDown = '\u2193',
	ArrowDownUp = '\u21F5',
	ArrowDropRight = '\u2937',
	ArrowHeadRight = '\u27A4',
	ArrowLeft = '\u2190',
	ArrowLeftDouble = '\u21d0',
	ArrowLeftRight = '\u2194',
	ArrowLeftRightDouble = '\u21d4',
	ArrowLeftRightDoubleStrike = '\u21ce',
	ArrowLeftRightLong = '\u27f7',
	ArrowRight = '\u2192',
	ArrowRightDouble = '\u21d2',
	ArrowRightHollow = '\u21e8',
	ArrowUp = '\u2191',
	ArrowUpDown = '\u21C5',
	ArrowUpRight = '\u2197',
	ArrowsHalfLeftRight = '\u21cb',
	ArrowsHalfRightLeft = '\u21cc',
	ArrowsLeftRight = '\u21c6',
	ArrowsRightLeft = '\u21c4',
	Asterisk = '\u2217',
	Check = '✔',
	Dash = '\u2014',
	Dot = '\u2022',
	Ellipsis = '\u2026',
	EnDash = '\u2013',
	Envelope = '\u2709',
	EqualsTriple = '\u2261',
	Flag = '\u2691',
	FlagHollow = '\u2690',
	MiddleEllipsis = '\u22EF',
	MuchLessThan = '\u226A',
	MuchGreaterThan = '\u226B',
	Pencil = '\u270E',
	Space = '\u00a0',
	SpaceThin = '\u2009',
	SpaceThinnest = '\u200A',
	SquareWithBottomShadow = '\u274F',
	SquareWithTopShadow = '\u2750',
	Warning = '\u26a0',
	ZeroWidthSpace = '\u200b',
}

export enum SyncedState {
	Version = 'gitlean:synced:version',
	WelcomeViewVisible = 'gitlean:views:welcome:visible',

	Deprecated_DisallowConnectionPrefix = 'gitlean:disallow:connection:',
}

export enum GlobalState {
	Avatars = 'gitlean:avatars',
	PendingWelcomeOnFocus = 'gitlean:pendingWelcomeOnFocus',
	PendingWhatsNewOnFocus = 'gitlean:pendingWhatsNewOnFocus',
	Version = 'gitlean:version',

	Deprecated_Version = 'gitlensVersion',
}

export const ImageMimetypes: Record<string, string> = {
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.jpe': 'image/jpeg',
	'.webp': 'image/webp',
	'.tif': 'image/tiff',
	'.tiff': 'image/tiff',
	'.bmp': 'image/bmp',
};

export interface BranchComparison {
	ref: string;
	notation: '..' | '...' | undefined;
	type: Exclude<ViewShowBranchComparison, false> | undefined;
}

export interface BranchComparisons {
	[id: string]: string | BranchComparison;
}

export interface NamedRef {
	label?: string;
	ref: string;
}

export interface PinnedComparison {
	type: 'comparison';
	timestamp: number;
	path: string;
	ref1: NamedRef;
	ref2: NamedRef;
	notation?: '..' | '...';
}

export interface PinnedSearch {
	type: 'search';
	timestamp: number;
	path: string;
	labels: {
		label: string;
		queryLabel:
			| string
			| {
					label: string;
					resultsType?: { singular: string; plural: string };
			  };
	};
	search: SearchPattern;
}

export type PinnedItem = PinnedComparison | PinnedSearch;

export interface PinnedItems {
	[id: string]: PinnedItem;
}

export interface Starred {
	[id: string]: boolean;
}

export interface Usage {
	[id: string]: number;
}

export enum WorkspaceState {
	BranchComparisons = 'gitlean:branch:comparisons',
	ConnectedPrefix = 'gitlean:connected:',
	DefaultRemote = 'gitlean:remote:default',
	GitCommandPaletteUsage = 'gitlean:gitComandPalette:usage',
	StarredBranches = 'gitlean:starred:branches',
	StarredRepositories = 'gitlean:starred:repositories',
	ViewsRepositoriesAutoRefresh = 'gitlean:views:repositories:autoRefresh',
	ViewsSearchAndCompareKeepResults = 'gitlean:views:searchAndCompare:keepResults',
	ViewsSearchAndComparePinnedItems = 'gitlean:views:searchAndCompare:pinned',

	Deprecated_DisallowConnectionPrefix = 'gitlean:disallow:connection:',
	Deprecated_PinnedComparisons = 'gitlean:pinned:comparisons',
}
