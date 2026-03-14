import { execSync } from 'child_process'

/**
 * Copy text to system clipboard
 * @param {string} text - Text to copy
 * @returns {boolean} - True if successful, false otherwise
 */
export function copyToClipboard(text) {
	if (!text || typeof text !== 'string') {
		return false
	}

	try {
		const platform = process.platform

		if (platform === 'darwin') {
			// macOS
			execSync('pbcopy', { input: text })
			return true
		} else if (platform === 'win32') {
			// Windows
			execSync('clip', { input: text })
			return true
		} else if (platform === 'linux' || platform === 'freebsd' || platform === 'openbsd') {
			// Linux/BSD - try xclip first, then xsel
			try {
				execSync('which xclip', { stdio: 'ignore' })
				execSync('xclip -selection clipboard', { input: text })
				return true
			} catch {
				try {
					execSync('which xsel', { stdio: 'ignore' })
					execSync('xsel --clipboard --input', { input: text })
					return true
				} catch {
					// Fallback to using tee with /dev/clipboard if available
					try {
						execSync(`echo "${text}" | tee /dev/clipboard`, { stdio: 'pipe' })
						return true
					} catch {
						return false
					}
				}
			}
		} else {
			// Unsupported platform
			return false
		}
	} catch (error) {
		console.error('Clipboard error:', error.message)
		return false
	}
}