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
	// Create output channel for logging
	outputChannel = vscode.window.createOutputChannel('Infra Genie');
	context.subscriptions.push(outputChannel);

	// Initialize logger
	Logger.initialize(outputChannel);
	const logger = Logger.getInstance();

	// Log activation
	logger.info('Infra Genie extension activated');

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

	// Register the 'infra-genie.open' command
	const openCommand = vscode.commands.registerCommand('infra-genie.open', () => {
		logger.info('Opening Infra Genie', 'infra-genie.open');
		WebviewPanelManager.createOrShow(context.extensionUri);
	});

	context.subscriptions.push(openCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (outputChannel) {
		const logger = Logger.getInstance();
		logger.info('Infra Genie extension deactivated', 'deactivate');
		outputChannel.dispose();
	}
}
