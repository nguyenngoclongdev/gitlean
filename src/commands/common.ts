'use strict';
import * as paths from 'path';
import {
	commands,
	Disposable,
	ExtensionContext,
	GitTimelineItem,
	SourceControlResourceGroup,
	SourceControlResourceState,
	TextDocumentShowOptions,
	TextEditor,
	TextEditorEdit,
	TimelineItem,
	Uri,
	ViewColumn,
	window,
	workspace,
} from 'vscode';
import type { Action, ActionContext } from '../api/gitlean';
import { BuiltInCommands, DocumentSchemes, ImageMimetypes } from '../constants';
import { Container } from '../container';
import { GitBranch, GitCommit, GitContributor, GitFile, GitReference, GitRemote, GitTag, Repository } from '../git/git';
import { GitUri } from '../git/gitUri';
import { Logger } from '../logger';
import { CommandQuickPickItem, RepositoryPicker } from '../quickpicks';
import { ViewNode, ViewRefNode } from '../views/nodes';

export enum Commands {
	ActionPrefix = 'gitlean.action.',
	AddAuthors = 'gitlean.addAuthors',
	BrowseRepoAtRevision = 'gitlean.browseRepoAtRevision',
	BrowseRepoAtRevisionInNewWindow = 'gitlean.browseRepoAtRevisionInNewWindow',
	BrowseRepoBeforeRevision = 'gitlean.browseRepoBeforeRevision',
	BrowseRepoBeforeRevisionInNewWindow = 'gitlean.browseRepoBeforeRevisionInNewWindow',
	ClearFileAnnotations = 'gitlean.clearFileAnnotations',
	CloseUnchangedFiles = 'gitlean.closeUnchangedFiles',
	CloseWelcomeView = 'gitlean.closeWelcomeView',
	CompareWith = 'gitlean.compareWith',
	CompareHeadWith = 'gitlean.compareHeadWith',
	CompareWorkingWith = 'gitlean.compareWorkingWith',
	ComputingFileAnnotations = 'gitlean.computingFileAnnotations',
	ConnectRemoteProvider = 'gitlean.connectRemoteProvider',
	CopyCurrentBranch = 'gitlean.copyCurrentBranch',
	CopyMessageToClipboard = 'gitlean.copyMessageToClipboard',
	CopyRemoteBranchesUrl = 'gitlean.copyRemoteBranchesUrl',
	CopyRemoteBranchUrl = 'gitlean.copyRemoteBranchUrl',
	CopyRemoteCommitUrl = 'gitlean.copyRemoteCommitUrl',
	CopyRemoteComparisonUrl = 'gitlean.copyRemoteComparisonUrl',
	CopyRemoteFileUrl = 'gitlean.copyRemoteFileUrlToClipboard',
	CopyRemoteFileUrlWithoutRange = 'gitlean.copyRemoteFileUrlWithoutRange',
	CopyRemoteFileUrlFrom = 'gitlean.copyRemoteFileUrlFrom',
	CopyRemotePullRequestUrl = 'gitlean.copyRemotePullRequestUrl',
	CopyRemoteRepositoryUrl = 'gitlean.copyRemoteRepositoryUrl',
	CopyShaToClipboard = 'gitlean.copyShaToClipboard',
	CreatePullRequestOnRemote = 'gitlean.createPullRequestOnRemote',
	DiffDirectory = 'gitlean.diffDirectory',
	DiffDirectoryWithHead = 'gitlean.diffDirectoryWithHead',
	DiffWith = 'gitlean.diffWith',
	DiffWithNext = 'gitlean.diffWithNext',
	DiffWithNextInDiffLeft = 'gitlean.diffWithNextInDiffLeft',
	DiffWithNextInDiffRight = 'gitlean.diffWithNextInDiffRight',
	DiffWithPrevious = 'gitlean.diffWithPrevious',
	DiffWithPreviousInDiffLeft = 'gitlean.diffWithPreviousInDiffLeft',
	DiffWithPreviousInDiffRight = 'gitlean.diffWithPreviousInDiffRight',
	DiffLineWithPrevious = 'gitlean.diffLineWithPrevious',
	DiffWithRevision = 'gitlean.diffWithRevision',
	DiffWithRevisionFrom = 'gitlean.diffWithRevisionFrom',
	DiffWithWorking = 'gitlean.diffWithWorking',
	DiffWithWorkingInDiffLeft = 'gitlean.diffWithWorkingInDiffLeft',
	DiffWithWorkingInDiffRight = 'gitlean.diffWithWorkingInDiffRight',
	DiffLineWithWorking = 'gitlean.diffLineWithWorking',
	DisconnectRemoteProvider = 'gitlean.disconnectRemoteProvider',
	DisableDebugLogging = 'gitlean.disableDebugLogging',
	EnableDebugLogging = 'gitlean.enableDebugLogging',
	DisableRebaseEditor = 'gitlean.disableRebaseEditor',
	EnableRebaseEditor = 'gitlean.enableRebaseEditor',
	ExternalDiff = 'gitlean.externalDiff',
	ExternalDiffAll = 'gitlean.externalDiffAll',
	FetchRepositories = 'gitlean.fetchRepositories',
	InviteToLiveShare = 'gitlean.inviteToLiveShare',
	OpenBlamePriorToChange = 'gitlean.openBlamePriorToChange',
	OpenBranchesOnRemote = 'gitlean.openBranchesOnRemote',
	OpenBranchOnRemote = 'gitlean.openBranchOnRemote',
	OpenChangedFiles = 'gitlean.openChangedFiles',
	OpenCommitOnRemote = 'gitlean.openCommitOnRemote',
	OpenComparisonOnRemote = 'gitlean.openComparisonOnRemote',
	OpenFileHistory = 'gitlean.openFileHistory',
	OpenFileFromRemote = 'gitlean.openFileFromRemote',
	OpenFileOnRemote = 'gitlean.openFileOnRemote',
	OpenFileOnRemoteFrom = 'gitlean.openFileOnRemoteFrom',
	OpenFileAtRevision = 'gitlean.openFileRevision',
	OpenFileAtRevisionFrom = 'gitlean.openFileRevisionFrom',
	OpenFolderHistory = 'gitlean.openFolderHistory',
	OpenOnRemote = 'gitlean.openOnRemote',
	OpenPullRequestOnRemote = 'gitlean.openPullRequestOnRemote',
	OpenAssociatedPullRequestOnRemote = 'gitlean.openAssociatedPullRequestOnRemote',
	OpenRepoOnRemote = 'gitlean.openRepoOnRemote',
	OpenRevisionFile = 'gitlean.openRevisionFile',
	OpenRevisionFileInDiffLeft = 'gitlean.openRevisionFileInDiffLeft',
	OpenRevisionFileInDiffRight = 'gitlean.openRevisionFileInDiffRight',
	OpenWorkingFile = 'gitlean.openWorkingFile',
	OpenWorkingFileInDiffLeft = 'gitlean.openWorkingFileInDiffLeft',
	OpenWorkingFileInDiffRight = 'gitlean.openWorkingFileInDiffRight',
	PullRepositories = 'gitlean.pullRepositories',
	PushRepositories = 'gitlean.pushRepositories',
	GitCommands = 'gitlean.gitCommands',
	GitCommandsBranch = 'gitlean.gitCommands.branch',
	GitCommandsCherryPick = 'gitlean.gitCommands.cherryPick',
	GitCommandsMerge = 'gitlean.gitCommands.merge',
	GitCommandsRebase = 'gitlean.gitCommands.rebase',
	GitCommandsReset = 'gitlean.gitCommands.reset',
	GitCommandsRevert = 'gitlean.gitCommands.revert',
	GitCommandsSwitch = 'gitlean.gitCommands.switch',
	GitCommandsTag = 'gitlean.gitCommands.tag',
	QuickOpenFileHistory = 'gitlean.quickOpenFileHistory',
	RefreshHover = 'gitlean.refreshHover',
	ResetAvatarCache = 'gitlean.resetAvatarCache',
	ResetSuppressedWarnings = 'gitlean.resetSuppressedWarnings',
	RevealCommitInView = 'gitlean.revealCommitInView',
	SearchCommits = 'gitlean.showCommitSearch',
	SearchCommitsInView = 'gitlean.views.searchAndCompare.searchCommits',
	SetViewsLayout = 'gitlean.setViewsLayout',
	ShowBranchesView = 'gitlean.showBranchesView',
	ShowCommitInView = 'gitlean.showCommitInView',
	ShowCommitsInView = 'gitlean.showCommitsInView',
	ShowCommitsView = 'gitlean.showCommitsView',
	ShowContributorsView = 'gitlean.showContributorsView',
	ShowFileHistoryView = 'gitlean.showFileHistoryView',
	ShowLastQuickPick = 'gitlean.showLastQuickPick',
	ShowLineHistoryView = 'gitlean.showLineHistoryView',
	ShowQuickBranchHistory = 'gitlean.showQuickBranchHistory',
	ShowQuickCommit = 'gitlean.showQuickCommitDetails',
	ShowQuickCommitFile = 'gitlean.showQuickCommitFileDetails',
	ShowQuickCurrentBranchHistory = 'gitlean.showQuickRepoHistory',
	ShowQuickFileHistory = 'gitlean.showQuickFileHistory',
	ShowQuickRepoStatus = 'gitlean.showQuickRepoStatus',
	ShowQuickCommitRevision = 'gitlean.showQuickRevisionDetails',
	ShowQuickCommitRevisionInDiffLeft = 'gitlean.showQuickRevisionDetailsInDiffLeft',
	ShowQuickCommitRevisionInDiffRight = 'gitlean.showQuickRevisionDetailsInDiffRight',
	ShowQuickStashList = 'gitlean.showQuickStashList',
	ShowRemotesView = 'gitlean.showRemotesView',
	ShowRepositoriesView = 'gitlean.showRepositoriesView',
	ShowSearchAndCompareView = 'gitlean.showSearchAndCompareView',
	ShowSettingsPage = 'gitlean.showSettingsPage',
	ShowSettingsPageAndJumpToBranchesView = 'gitlean.showSettingsPage#branches-view',
	ShowSettingsPageAndJumpToCommitsView = 'gitlean.showSettingsPage#commits-view',
	ShowSettingsPageAndJumpToContributorsView = 'gitlean.showSettingsPage#contributors-view',
	ShowSettingsPageAndJumpToFileHistoryView = 'gitlean.showSettingsPage#file-history-view',
	ShowSettingsPageAndJumpToLineHistoryView = 'gitlean.showSettingsPage#line-history-view',
	ShowSettingsPageAndJumpToRemotesView = 'gitlean.showSettingsPage#remotes-view',
	ShowSettingsPageAndJumpToRepositoriesView = 'gitlean.showSettingsPage#repositories-view',
	ShowSettingsPageAndJumpToSearchAndCompareView = 'gitlean.showSettingsPage#search-compare-view',
	ShowSettingsPageAndJumpToStashesView = 'gitlean.showSettingsPage#stashes-view',
	ShowSettingsPageAndJumpToTagsView = 'gitlean.showSettingsPage#tags-view',
	ShowSettingsPageAndJumpToViews = 'gitlean.showSettingsPage#views',
	ShowStashesView = 'gitlean.showStashesView',
	ShowTagsView = 'gitlean.showTagsView',
	ShowWelcomePage = 'gitlean.showWelcomePage',
	ShowWelcomeView = 'gitlean.showWelcomeView',
	StashApply = 'gitlean.stashApply',
	StashSave = 'gitlean.stashSave',
	StashSaveFiles = 'gitlean.stashSaveFiles',
	SwitchMode = 'gitlean.switchMode',
	ToggleCodeLens = 'gitlean.toggleCodeLens',
	ToggleFileBlame = 'gitlean.toggleFileBlame',
	ToggleFileBlameInDiffLeft = 'gitlean.toggleFileBlameInDiffLeft',
	ToggleFileBlameInDiffRight = 'gitlean.toggleFileBlameInDiffRight',
	ToggleFileChanges = 'gitlean.toggleFileChanges',
	ToggleFileChangesOnly = 'gitlean.toggleFileChangesOnly',
	ToggleFileHeatmap = 'gitlean.toggleFileHeatmap',
	ToggleFileHeatmapInDiffLeft = 'gitlean.toggleFileHeatmapInDiffLeft',
	ToggleFileHeatmapInDiffRight = 'gitlean.toggleFileHeatmapInDiffRight',
	ToggleLineBlame = 'gitlean.toggleLineBlame',
	ToggleReviewMode = 'gitlean.toggleReviewMode',
	ToggleZenMode = 'gitlean.toggleZenMode',
	ViewsOpenDirectoryDiff = 'gitlean.views.openDirectoryDiff',
	ViewsOpenDirectoryDiffWithWorking = 'gitlean.views.openDirectoryDiffWithWorking',

	Deprecated_DiffHeadWith = 'gitlean.diffHeadWith',
	Deprecated_DiffWorkingWith = 'gitlean.diffWorkingWith',
	Deprecated_OpenBranchesInRemote = 'gitlean.openBranchesInRemote',
	Deprecated_OpenBranchInRemote = 'gitlean.openBranchInRemote',
	Deprecated_OpenCommitInRemote = 'gitlean.openCommitInRemote',
	Deprecated_OpenFileInRemote = 'gitlean.openFileInRemote',
	Deprecated_OpenInRemote = 'gitlean.openInRemote',
	Deprecated_OpenRepoInRemote = 'gitlean.openRepoInRemote',
	Deprecated_ShowFileHistoryInView = 'gitlean.showFileHistoryInView',
}

export function executeActionCommand<T extends ActionContext>(action: Action<T>, args: Omit<T, 'type'>) {
	return commands.executeCommand(`${Commands.ActionPrefix}${action}`, { ...args, type: action });
}

export function getMarkdownActionCommand<T extends ActionContext>(action: Action<T>, args: Omit<T, 'type'>): string {
	return Command.getMarkdownCommandArgsCore(`${Commands.ActionPrefix}${action}`, {
		...args,
		type: action,
	});
}

export function executeCommand<T>(command: Commands, args: T) {
	return commands.executeCommand(command, args);
}

export function executeEditorCommand<T>(command: Commands, uri: Uri | undefined, args: T) {
	return commands.executeCommand(command, uri, args);
}

interface CommandConstructor {
	new (): Command;
}

const registrableCommands: CommandConstructor[] = [];

export function command(): ClassDecorator {
	return (target: any) => {
		registrableCommands.push(target);
	};
}

export function registerCommands(context: ExtensionContext): void {
	for (const c of registrableCommands) {
		context.subscriptions.push(new c());
	}
}

export function getCommandUri(uri?: Uri, editor?: TextEditor): Uri | undefined {
	// Always use the editor.uri (if we have one), so we are correct for a split diff
	return editor?.document?.uri ?? uri;
}

export async function getRepoPathOrActiveOrPrompt(uri: Uri | undefined, editor: TextEditor | undefined, title: string) {
	const repoPath = await Container.git.getRepoPathOrActive(uri, editor);
	if (repoPath) return repoPath;

	const pick = await RepositoryPicker.show(title);
	if (pick instanceof CommandQuickPickItem) {
		await pick.execute();
		return undefined;
	}

	return pick?.repoPath;
}

export async function getRepoPathOrPrompt(title: string, uri?: Uri) {
	const repoPath = await Container.git.getRepoPath(uri);
	if (repoPath) return repoPath;

	const pick = await RepositoryPicker.show(title);
	if (pick instanceof CommandQuickPickItem) {
		void (await pick.execute());
		return undefined;
	}

	return pick?.repoPath;
}

export interface CommandContextParsingOptions {
	expectsEditor: boolean;
}

export interface CommandBaseContext {
	command: string;
	editor?: TextEditor;
	uri?: Uri;
}

export interface CommandGitTimelineItemContext extends CommandBaseContext {
	readonly type: 'timeline-item:git';
	readonly item: GitTimelineItem;
	readonly uri: Uri;
}

export interface CommandScmGroupsContext extends CommandBaseContext {
	readonly type: 'scm-groups';
	readonly scmResourceGroups: SourceControlResourceGroup[];
}

export interface CommandScmStatesContext extends CommandBaseContext {
	readonly type: 'scm-states';
	readonly scmResourceStates: SourceControlResourceState[];
}

export interface CommandUnknownContext extends CommandBaseContext {
	readonly type: 'unknown';
}

export interface CommandUriContext extends CommandBaseContext {
	readonly type: 'uri';
}

export interface CommandUrisContext extends CommandBaseContext {
	readonly type: 'uris';
	readonly uris: Uri[];
}

// export interface CommandViewContext extends CommandBaseContext {
//     readonly type: 'view';
// }

export interface CommandViewNodeContext extends CommandBaseContext {
	readonly type: 'viewItem';
	readonly node: ViewNode;
}

export function isCommandContextGitTimelineItem(context: CommandContext): context is CommandGitTimelineItemContext {
	return context.type === 'timeline-item:git';
}

export function isCommandContextViewNodeHasBranch(
	context: CommandContext,
): context is CommandViewNodeContext & { node: ViewNode & { branch: GitBranch } } {
	if (context.type !== 'viewItem') return false;

	return GitBranch.is((context.node as ViewNode & { branch: GitBranch }).branch);
}

export function isCommandContextViewNodeHasCommit<T extends GitCommit>(
	context: CommandContext,
): context is CommandViewNodeContext & { node: ViewNode & { commit: T } } {
	if (context.type !== 'viewItem') return false;

	return GitCommit.is((context.node as ViewNode & { commit: GitCommit }).commit);
}

export function isCommandContextViewNodeHasContributor(
	context: CommandContext,
): context is CommandViewNodeContext & { node: ViewNode & { contributor: GitContributor } } {
	if (context.type !== 'viewItem') return false;

	return GitContributor.is((context.node as ViewNode & { contributor: GitContributor }).contributor);
}

export function isCommandContextViewNodeHasFile(
	context: CommandContext,
): context is CommandViewNodeContext & { node: ViewNode & { file: GitFile; repoPath: string } } {
	if (context.type !== 'viewItem') return false;

	const node = context.node as ViewNode & { file: GitFile; repoPath: string };
	return node.file != null && (node.file.repoPath != null || node.repoPath != null);
}

export function isCommandContextViewNodeHasFileCommit(
	context: CommandContext,
): context is CommandViewNodeContext & { node: ViewNode & { commit: GitCommit; file: GitFile; repoPath: string } } {
	if (context.type !== 'viewItem') return false;

	const node = context.node as ViewNode & { commit: GitCommit; file: GitFile; repoPath: string };
	return node.file != null && GitCommit.is(node.commit) && (node.file.repoPath != null || node.repoPath != null);
}

export function isCommandContextViewNodeHasFileRefs(context: CommandContext): context is CommandViewNodeContext & {
	node: ViewNode & { file: GitFile; ref1: string; ref2: string; repoPath: string };
} {
	if (context.type !== 'viewItem') return false;

	const node = context.node as ViewNode & { file: GitFile; ref1: string; ref2: string; repoPath: string };
	return (
		node.file != null &&
		node.ref1 != null &&
		node.ref2 != null &&
		(node.file.repoPath != null || node.repoPath != null)
	);
}

export function isCommandContextViewNodeHasRef(
	context: CommandContext,
): context is CommandViewNodeContext & { node: ViewNode & { ref: GitReference } } {
	return context.type === 'viewItem' && context.node instanceof ViewRefNode;
}

export function isCommandContextViewNodeHasRemote(
	context: CommandContext,
): context is CommandViewNodeContext & { node: ViewNode & { remote: GitRemote } } {
	if (context.type !== 'viewItem') return false;

	return GitRemote.is((context.node as ViewNode & { remote: GitRemote }).remote);
}

export function isCommandContextViewNodeHasRepository(
	context: CommandContext,
): context is CommandViewNodeContext & { node: ViewNode & { repo: Repository } } {
	if (context.type !== 'viewItem') return false;

	return (context.node as ViewNode & { repo?: Repository }).repo instanceof Repository;
}

export function isCommandContextViewNodeHasRepoPath(
	context: CommandContext,
): context is CommandViewNodeContext & { node: ViewNode & { repoPath: string } } {
	if (context.type !== 'viewItem') return false;

	return typeof (context.node as ViewNode & { repoPath?: string }).repoPath === 'string';
}

export function isCommandContextViewNodeHasTag(
	context: CommandContext,
): context is CommandViewNodeContext & { node: ViewNode & { tag: GitTag } } {
	if (context.type !== 'viewItem') return false;

	return GitTag.is((context.node as ViewNode & { tag: GitTag }).tag);
}

export type CommandContext =
	| CommandGitTimelineItemContext
	| CommandScmGroupsContext
	| CommandScmStatesContext
	| CommandUnknownContext
	| CommandUriContext
	| CommandUrisContext
	// | CommandViewContext
	| CommandViewNodeContext;

function isScmResourceGroup(group: any): group is SourceControlResourceGroup {
	if (group == null) return false;

	return (
		(group as SourceControlResourceGroup).id != null &&
		(group as SourceControlResourceGroup).label != null &&
		(group as SourceControlResourceGroup).resourceStates != null &&
		Array.isArray((group as SourceControlResourceGroup).resourceStates)
	);
}

function isScmResourceState(resource: any): resource is SourceControlResourceState {
	if (resource == null) return false;

	return (resource as SourceControlResourceState).resourceUri != null;
}

function isTimelineItem(item: any): item is TimelineItem {
	if (item == null) return false;

	return (item as TimelineItem).timestamp != null && (item as TimelineItem).label != null;
}

function isGitTimelineItem(item: any): item is GitTimelineItem {
	if (item == null) return false;

	return (
		isTimelineItem(item) &&
		(item as GitTimelineItem).ref != null &&
		(item as GitTimelineItem).previousRef != null &&
		(item as GitTimelineItem).message != null
	);
}

export abstract class Command implements Disposable {
	static getMarkdownCommandArgsCore<T>(
		command: Commands | `${Commands.ActionPrefix}${ActionContext['type']}`,
		args: T,
	): string {
		return `command:${command}?${encodeURIComponent(JSON.stringify(args))}`;
	}

	protected readonly contextParsingOptions: CommandContextParsingOptions = { expectsEditor: false };

	private readonly _disposable: Disposable;

	constructor(command: Commands | Commands[]) {
		if (typeof command === 'string') {
			this._disposable = commands.registerCommand(
				command,
				(...args: any[]) => this._execute(command, ...args),
				this,
			);

			return;
		}

		const subscriptions = command.map(cmd =>
			commands.registerCommand(cmd, (...args: any[]) => this._execute(cmd, ...args), this),
		);
		this._disposable = Disposable.from(...subscriptions);
	}

	dispose() {
		this._disposable.dispose();
	}

	protected preExecute(context: CommandContext, ...args: any[]): Promise<any> {
		return this.execute(...args);
	}

	abstract execute(...args: any[]): any;

	protected _execute(command: string, ...args: any[]): any {
		const [context, rest] = Command.parseContext(command, { ...this.contextParsingOptions }, ...args);
		return this.preExecute(context, ...rest);
	}

	private static parseContext(
		command: string,
		options: CommandContextParsingOptions,
		...args: any[]
	): [CommandContext, any[]] {
		let editor: TextEditor | undefined = undefined;

		let firstArg = args[0];

		if (options.expectsEditor) {
			if (firstArg == null || (firstArg.id != null && firstArg.document?.uri != null)) {
				editor = firstArg;
				args = args.slice(1);
				firstArg = args[0];
			}

			if (args.length > 0 && (firstArg == null || firstArg instanceof Uri)) {
				const [uri, ...rest] = args as [Uri, any];
				if (uri != null) {
					// If the uri matches the active editor (or we are in a left-hand side of a diff), then pass the active editor
					if (
						editor == null &&
						(uri.toString() === window.activeTextEditor?.document.uri.toString() ||
							command.endsWith('InDiffLeft'))
					) {
						editor = window.activeTextEditor;
					}

					const uris = rest[0];
					if (uris != null && Array.isArray(uris) && uris.length !== 0 && uris[0] instanceof Uri) {
						return [
							{ command: command, type: 'uris', editor: editor, uri: uri, uris: uris },
							rest.slice(1),
						];
					}
					return [{ command: command, type: 'uri', editor: editor, uri: uri }, rest];
				}

				args = args.slice(1);
			} else if (editor == null) {
				// If we are expecting an editor and we have no uri, then pass the active editor
				editor = window.activeTextEditor;
			}
		}

		if (firstArg instanceof ViewNode) {
			const [node, ...rest] = args as [ViewNode, any];
			return [{ command: command, type: 'viewItem', node: node, uri: node.uri }, rest];
		}

		if (isScmResourceState(firstArg)) {
			const states = [];
			let count = 0;
			for (const arg of args) {
				if (!isScmResourceState(arg)) break;

				count++;
				states.push(arg);
			}

			return [
				{ command: command, type: 'scm-states', scmResourceStates: states, uri: states[0].resourceUri },
				args.slice(count),
			];
		}

		if (isScmResourceGroup(firstArg)) {
			const groups = [];
			let count = 0;
			for (const arg of args) {
				if (!isScmResourceGroup(arg)) break;

				count++;
				groups.push(arg);
			}

			return [{ command: command, type: 'scm-groups', scmResourceGroups: groups }, args.slice(count)];
		}

		if (isGitTimelineItem(firstArg)) {
			const [item, uri, ...rest] = args as [GitTimelineItem, Uri, any];
			return [{ command: command, type: 'timeline-item:git', item: item, uri: uri }, rest];
		}

		return [{ command: command, type: 'unknown', editor: editor, uri: editor?.document.uri }, args];
	}
}

export abstract class ActiveEditorCommand extends Command {
	protected override readonly contextParsingOptions: CommandContextParsingOptions = { expectsEditor: true };

	constructor(command: Commands | Commands[]) {
		super(command);
	}

	protected override preExecute(context: CommandContext, ...args: any[]): Promise<any> {
		return this.execute(context.editor, context.uri, ...args);
	}

	protected override _execute(command: string, ...args: any[]): any {
		return super._execute(command, undefined, ...args);
	}

	abstract override execute(editor?: TextEditor, ...args: any[]): any;
}

let lastCommand: { command: string; args: any[] } | undefined = undefined;
export function getLastCommand() {
	return lastCommand;
}

export abstract class ActiveEditorCachedCommand extends ActiveEditorCommand {
	constructor(command: Commands | Commands[]) {
		super(command);
	}

	protected override _execute(command: string, ...args: any[]): any {
		lastCommand = {
			command: command,
			args: args,
		};
		return super._execute(command, ...args);
	}

	abstract override execute(editor: TextEditor, ...args: any[]): any;
}

export abstract class EditorCommand implements Disposable {
	private readonly _disposable: Disposable;

	constructor(command: Commands | Commands[]) {
		if (!Array.isArray(command)) {
			command = [command];
		}

		const subscriptions = [];
		for (const cmd of command) {
			subscriptions.push(
				commands.registerTextEditorCommand(
					cmd,
					(editor: TextEditor, edit: TextEditorEdit, ...args: any[]) =>
						this.executeCore(cmd, editor, edit, ...args),
					this,
				),
			);
		}
		this._disposable = Disposable.from(...subscriptions);
	}

	dispose() {
		this._disposable.dispose();
	}

	private executeCore(command: string, editor: TextEditor, edit: TextEditorEdit, ...args: any[]): any {
		return this.execute(editor, edit, ...args);
	}

	abstract execute(editor: TextEditor, edit: TextEditorEdit, ...args: any[]): any;
}

export function findEditor(uri: Uri): TextEditor | undefined {
	const active = window.activeTextEditor;
	const normalizedUri = uri.toString();

	for (const e of [...(active != null ? [active] : []), ...window.visibleTextEditors]) {
		// Don't include diff editors
		if (e.document.uri.toString() === normalizedUri && e?.viewColumn != null) {
			return e;
		}
	}

	return undefined;
}

export async function findOrOpenEditor(
	uri: Uri,
	options?: TextDocumentShowOptions & { throwOnError?: boolean },
): Promise<TextEditor | undefined> {
	const e = findEditor(uri);
	if (e != null) {
		if (!options?.preserveFocus) {
			await window.showTextDocument(e.document, { ...options, viewColumn: e.viewColumn });
		}

		return e;
	}

	return openEditor(uri, { viewColumn: window.activeTextEditor?.viewColumn, ...options });
}

export function findOrOpenEditors(uris: Uri[]): void {
	const normalizedUris = new Map(uris.map(uri => [uri.toString(), uri]));

	for (const e of window.visibleTextEditors) {
		// Don't include diff editors
		if (e?.viewColumn != null) {
			normalizedUris.delete(e.document.uri.toString());
		}
	}

	for (const uri of normalizedUris.values()) {
		void commands.executeCommand(BuiltInCommands.Open, uri, { background: true, preview: false });
	}
}

export async function openEditor(
	uri: Uri,
	options: TextDocumentShowOptions & { rethrow?: boolean } = {},
): Promise<TextEditor | undefined> {
	const { rethrow, ...opts } = options;
	try {
		if (GitUri.is(uri)) {
			uri = uri.documentUri();
		}

		if (uri.scheme === DocumentSchemes.GitLean && ImageMimetypes[paths.extname(uri.fsPath)]) {
			await commands.executeCommand(BuiltInCommands.Open, uri);

			return undefined;
		}

		const document = await workspace.openTextDocument(uri);
		return window.showTextDocument(document, {
			preserveFocus: false,
			preview: true,
			viewColumn: ViewColumn.Active,
			...opts,
		});
	} catch (ex) {
		const msg: string = ex?.toString() ?? '';
		if (msg.includes('File seems to be binary and cannot be opened as text')) {
			await commands.executeCommand(BuiltInCommands.Open, uri);

			return undefined;
		}

		if (rethrow) throw ex;

		Logger.error(ex, 'openEditor');
		return undefined;
	}
}

export enum OpenWorkspaceLocation {
	CurrentWindow = 'currentWindow',
	NewWindow = 'newWindow',
	AddToWorkspace = 'addToWorkspace',
}

export function openWorkspace(
	uri: Uri,
	options: { location?: OpenWorkspaceLocation; name?: string } = { location: OpenWorkspaceLocation.CurrentWindow },
): void {
	if (options?.location === OpenWorkspaceLocation.AddToWorkspace) {
		const count = workspace.workspaceFolders?.length ?? 0;
		return void workspace.updateWorkspaceFolders(count, 0, { uri: uri, name: options?.name });
	}

	return void commands.executeCommand(BuiltInCommands.OpenFolder, uri, {
		forceNewWindow: options?.location === OpenWorkspaceLocation.NewWindow,
	});
}
