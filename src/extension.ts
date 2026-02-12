// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { WebviewPanelManager } from './WebviewPanelManager';

// Output channel for logging
let outputChannel: vscode.OutputChannel;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Create output channel for logging
	outputChannel = vscode.window.createOutputChannel('Infra Genie');
	context.subscriptions.push(outputChannel);

	// Log activation
	outputChannel.appendLine(`[${new Date().toISOString()}] Infra Genie extension activated`);

	// Register the 'infra-genie.open' command
	const openCommand = vscode.commands.registerCommand('infra-genie.open', () => {
		outputChannel.appendLine(`[${new Date().toISOString()}] Opening Infra Genie`);
		WebviewPanelManager.createOrShow(context.extensionUri);
	});

	context.subscriptions.push(openCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (outputChannel) {
		outputChannel.appendLine(`[${new Date().toISOString()}] Infra Genie extension deactivated`);
		outputChannel.dispose();
	}
}
