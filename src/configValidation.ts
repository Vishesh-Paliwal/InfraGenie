import * as vscode from 'vscode';
import { getLogger } from './logger';

/**
 * Configuration validation result.
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates the Infra Genie configuration settings.
 * 
 * @returns ValidationResult with validation status and any errors/warnings
 */
export function validateConfiguration(): ValidationResult {
  const config = vscode.workspace.getConfiguration('infraGenie');
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate API endpoint
  const apiEndpoint = config.get<string>('apiEndpoint');
  if (!apiEndpoint) {
    errors.push('API endpoint is required');
  } else if (typeof apiEndpoint !== 'string') {
    errors.push('API endpoint must be a string');
  } else if (!isValidURL(apiEndpoint)) {
    errors.push('API endpoint must be a valid URL (e.g., https://api.example.com)');
  } else if (apiEndpoint.startsWith('http://')) {
    warnings.push('API endpoint should use HTTPS for security');
  }

  // Validate API timeout
  const apiTimeout = config.get<number>('apiTimeout');
  if (apiTimeout === undefined || apiTimeout === null) {
    errors.push('API timeout is required');
  } else if (typeof apiTimeout !== 'number') {
    errors.push('API timeout must be a number');
  } else if (apiTimeout < 1000) {
    errors.push('API timeout must be at least 1000ms (1 second)');
  } else if (apiTimeout > 300000) {
    warnings.push('API timeout is very high (>5 minutes). This may cause poor user experience.');
  } else if (apiTimeout < 5000) {
    warnings.push('API timeout is very low (<5 seconds). Requests may timeout frequently.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates if a string is a valid URL.
 * 
 * @param urlString - The URL string to validate
 * @returns true if valid, false otherwise
 */
function isValidURL(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Gets the validated configuration values with defaults.
 * If validation fails, returns default values and logs errors.
 * 
 * @returns Configuration object with apiEndpoint and apiTimeout
 */
export function getValidatedConfiguration(): { apiEndpoint: string; apiTimeout: number } {
  const logger = getLogger();
  const config = vscode.workspace.getConfiguration('infraGenie');
  const validation = validateConfiguration();

  // Log validation results
  if (!validation.isValid) {
    logger.error('Configuration validation failed', undefined, 'getValidatedConfiguration');
    validation.errors.forEach(error => {
      logger.error(`  ${error}`, undefined, 'getValidatedConfiguration');
    });
  }
  
  if (validation.warnings.length > 0) {
    logger.warning('Configuration warnings', 'getValidatedConfiguration');
    validation.warnings.forEach(warning => {
      logger.warning(`  ${warning}`, 'getValidatedConfiguration');
    });
  }

  // Get values with defaults
  const apiEndpoint = config.get<string>('apiEndpoint', 'https://api.infragenie.com');
  const apiTimeout = config.get<number>('apiTimeout', 30000);

  // If validation failed, show error message and use defaults
  if (!validation.isValid) {
    vscode.window.showErrorMessage(
      `Infra Genie configuration is invalid. Using default values. Errors: ${validation.errors.join(', ')}`,
      'View Logs'
    ).then(selection => {
      if (selection === 'View Logs') {
        logger.show();
      }
    });
    
    return {
      apiEndpoint: 'https://api.infragenie.com',
      apiTimeout: 30000,
    };
  }

  // Show warnings if any
  if (validation.warnings.length > 0) {
    vscode.window.showWarningMessage(
      `Infra Genie configuration warnings: ${validation.warnings.join(', ')}`
    );
  }

  return { apiEndpoint, apiTimeout };
}
