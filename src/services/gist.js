import { Octokit } from '@octokit/rest'

const desc = 'clavis cloud backup'
const META_FILE = '...clavis'
const TOKENS_FILE = 'tokens.json'

const getOctokit = (token) => {
	return new Octokit({ auth: token })
}

/** Build metadata file content with current timestamp and app version */
const buildMeta = (version) => {
	return JSON.stringify({
		lastUpload: new Date().toISOString(),
		version,
	})
}

export default {
	createGist(token, version) {
		const octokit = getOctokit(token)
		return octokit.gists.create({
			description: desc,
			files: {
				[META_FILE]: {
					content: buildMeta(version),
				},
			},
			public: false,
		}).then((result) => {
			return result.data.id
		})
	},

	deleteGist(token, id) {
		const octokit = getOctokit(token)
		return octokit.gists.delete({
			gist_id: id,
		})
	},

	/** Upload tokens.json content and update metadata file */
	upload(token, id, tokensContent, version) {
		const octokit = getOctokit(token)
		return octokit.gists.update({
			gist_id: id,
			description: desc,
			files: {
				[TOKENS_FILE]: {
					content: tokensContent,
				},
				[META_FILE]: {
					content: buildMeta(version),
				},
			},
		})
	},

	/** Download tokens.json content from gist */
	download(token, id) {
		const octokit = getOctokit(token)
		return octokit.gists.get({
			gist_id: id,
		}).then((result) => {
			const file = result.data.files[TOKENS_FILE]
			if (!file) {
				throw new Error(`"${TOKENS_FILE}" not found in gist`)
			}
			return file.content
		})
	},
}
