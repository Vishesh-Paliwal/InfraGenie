// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { WebviewPanelManager } from './WebviewPanelManager';
import { validateConfiguration } from './configValidation';
import { Logger } from './logger';

// Output channel for logging
let outputChannel: vscode.OutputChannel;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Infra Genie: activate() called');
	try {
		// Create output channel for logging
		outputChannel = vscode.window.createOutputChannel('Infra Genie');
		context.subscriptions.push(outputChannel);
		console.log('Infra Genie: output channel created');

		// Initialize logger
		Logger.initialize(outputChannel);
		const logger = Logger.getInstance();
		console.log('Infra Genie: logger initialized');

		// Log activation
		logger.info('Infra Genie extension activated');
		console.log('Infra Genie: logged activation');

		// Register the 'infra-genie.open' command FIRST
		const openCommand = vscode.commands.registerCommand('infra-genie.open', () => {
			console.log('Infra Genie: command handler called');
			try {
				logger.info('Opening Infra Genie', 'infra-genie.open');
				WebviewPanelManager.createOrShow(context.extensionUri);
			} catch (error: any) {
				console.error('Infra Genie: error in command handler', error);
				logger.error('Error opening Infra Genie', error, 'infra-genie.open');
				vscode.window.showErrorMessage(`Failed to open Infra Genie: ${error.message}`);
			}
		});

		context.subscriptions.push(openCommand);
		console.log('Infra Genie: command registered');

		// Validate configuration on activation
		const validation = validateConfiguration();
		if (!validation.isValid) {
			logger.error('Configuration validation failed on activation', undefined, 'activate');
			validation.errors.forEach(error => {
				logger.error(`  ${error}`, undefined, 'activate');
			});
			vscode.window.showWarningMessage(
				`Infra Genie: Configuration has errors. Using default values. Check output for details.`,
				'View Logs'
			).then(selection => {
				if (selection === 'View Logs') {
					logger.show();
				}
			});
		}

		if (validation.warnings.length > 0) {
			logger.warning('Configuration warnings on activation', 'activate');
			validation.warnings.forEach(warning => {
				logger.warning(`  ${warning}`, 'activate');
			});
		}

		// Listen for configuration changes
		const configChangeListener = vscode.workspace.onDidChangeConfiguration(event => {
			if (event.affectsConfiguration('infraGenie')) {
				logger.info('Configuration changed, validating...', 'configChangeListener');
				
				const newValidation = validateConfiguration();
				
				if (!newValidation.isValid) {
					logger.error('Configuration validation failed', undefined, 'configChangeListener');
					newValidation.errors.forEach(error => {
						logger.error(`  ${error}`, undefined, 'configChangeListener');
					});
					vscode.window.showErrorMessage(
						`Infra Genie: Invalid configuration. Errors: ${newValidation.errors.join(', ')}`,
						'View Logs'
					).then(selection => {
						if (selection === 'View Logs') {
							logger.show();
						}
					});
				} else {
					logger.info('Configuration validated successfully', 'configChangeListener');
					
					if (newValidation.warnings.length > 0) {
						logger.warning('Configuration warnings', 'configChangeListener');
						newValidation.warnings.forEach(warning => {
							logger.warning(`  ${warning}`, 'configChangeListener');
						});
						vscode.window.showWarningMessage(
							`Infra Genie: ${newValidation.warnings.join(', ')}`
						);
					}
				}
				
				// Notify WebviewPanelManager to update BackendAPIClient configuration
				WebviewPanelManager.notifyConfigurationChanged();
			}
		});

		context.subscriptions.push(configChangeListener);

		logger.info('Infra Genie extension activation complete');
		console.log('Infra Genie: activation complete successfully');
	} catch (error: any) {
		console.error('Infra Genie: activation error', error);
		vscode.window.showErrorMessage(`Failed to activate Infra Genie: ${error.message}`);
		throw error;
	}
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (outputChannel) {
		const logger = Logger.getInstance();
		logger.info('Infra Genie extension deactivated', 'deactivate');
		outputChannel.dispose();
	}
}
