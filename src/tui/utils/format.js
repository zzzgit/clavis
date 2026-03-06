import { format, differenceInDays, isAfter, isBefore, parseISO } from 'date-fns'

export function getTokenStatus(token) {
	if (!token.expiration) {
		return { char: '✓', color: 'green', label: 'Active' }
	}

	const expDate = parseISO(token.expiration)
	const now = new Date()
	const diffDays = differenceInDays(expDate, now)

	if (diffDays < 0) {
		return { char: '✗', color: 'red', label: 'Expired' }
	}

	if (diffDays <= 7) {
		return { char: '!', color: 'yellow', label: `Expires in ${diffDays}d` }
	}

	return { char: '✓', color: 'green', label: 'Active' }
}

export function truncateKey(key, width) {
	if (!key || key.length <= width) { return key }

	const parts = key.split('.')
	let result = ''

	// Try to keep as much of the end as possible
	for (let i = parts.length - 1; i >= 0; i--) {
		const newResult = (i > 0 ? '…' : '') + parts.slice(i).join('.')
		if (newResult.length <= width) {
			result = newResult
		} else {
			break
		}
	}

	// If still too long, truncate from the end
	return result || key.slice(-width)
}

export function truncateTag(tag, width) {
	if (!tag || tag === '') { return '-'.padEnd(width) }
	if (tag.length <= width) { return tag.padEnd(width) }
	return tag.slice(0, width - 1) + '…'
}

export function formatExpiration(expiration, width = 12) {
	if (!expiration) { return 'Never'.padStart(width) }

	const expDate = parseISO(expiration)
	const now = new Date()
	const diffDays = differenceInDays(expDate, now)

	if (diffDays < 0) {
		return format(expDate, 'yyyy-MM-dd').padStart(width)
	}

	if (diffDays <= 7) {
		return `${diffDays}d`.padStart(width)
	}

	return format(expDate, 'yyyy-MM-dd').padStart(width)
}

export function formatCreatedAt(createdAt, width = 10) {
	if (!createdAt) { return '-'.padStart(width) }
	return format(parseISO(createdAt), 'yyyy-MM-dd').padStart(width)
}

export function previewToken(token, width = 20) {
	if (!token || token.length <= 12) {
		return token.padEnd(width)
	}

	const preview = token.slice(0, 8) + '…' + token.slice(-4)
	return preview.padEnd(width)
}

export function calculateColumnWidths(terminalWidth) {
	const minWidths = {
		status: 4,
		key: 20,
		tag: 15,
		expires: 12,
		created: 10,
		token: 20
	}

	const totalMinWidth = Object.values(minWidths).reduce((a, b) => a + b, 0) + 7 // Borders

	if (terminalWidth >= totalMinWidth + 20) {
		// Wide terminal: give extra space to key column
		const extraWidth = terminalWidth - totalMinWidth
		return {
			...minWidths,
			key: minWidths.key + Math.floor(extraWidth * 0.6),
			tag: minWidths.tag + Math.floor(extraWidth * 0.2),
			token: minWidths.token + Math.floor(extraWidth * 0.2)
		}
	}

	if (terminalWidth >= totalMinWidth) {
		// Medium terminal: use minimum widths
		return minWidths
	}

	// Narrow terminal: adjust proportions
	const scale = terminalWidth / totalMinWidth
	return {
		status: Math.max(3, Math.floor(minWidths.status * scale)),
		key: Math.max(10, Math.floor(minWidths.key * scale)),
		tag: Math.max(8, Math.floor(minWidths.tag * scale)),
		expires: Math.max(8, Math.floor(minWidths.expires * scale)),
		created: Math.max(8, Math.floor(minWidths.created * scale)),
		token: Math.max(12, Math.floor(minWidths.token * scale))
	}
}
