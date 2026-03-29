import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

const CONFIG_DIR =
  process.platform === 'win32'
    ? path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'clavis')
    : path.join(os.homedir(), '.config', 'clavis')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.toml')

/** Minimal TOML parser: reads integer and quoted-string fields */
const parseTOML = (content) => {
  const result = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const intMatch = trimmed.match(/^(\w+)\s*=\s*(\d+)$/)
    if (intMatch) {
      result[intMatch[1]] = parseInt(intMatch[2], 10)
      continue
    }
    const strMatch = trimmed.match(/^(\w+)\s*=\s*"(.*)"$/)
    if (strMatch) {
      result[strMatch[1]] = strMatch[2]
    }
  }
  return result
}

/** Minimal TOML serializer: writes integers as bare values and strings as quoted */
const serializeTOML = (data) => {
  const lines = ['# Clavis configuration', '']
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      lines.push(`${key} = "${value}"`)
    } else {
      lines.push(`${key} = ${value}`)
    }
  }
  return lines.join('\n') + '\n'
}

class ConfigService {
  constructor() {
    this.configFile = CONFIG_FILE
    this.config = { next_sid: 1 }
  }

  async init() {
    await fs.mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 })
    try {
      const content = await fs.readFile(this.configFile, 'utf8')
      this.config = { next_sid: 1, ...parseTOML(content) }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      await this.save()
    }
  }

  async save() {
    await fs.mkdir(path.dirname(this.configFile), { recursive: true, mode: 0o700 })
    await fs.writeFile(this.configFile, serializeTOML(this.config), 'utf8')
  }

  /** Returns the next sid and increments the counter in config.toml */
  async getNextSid() {
    const sid = this.config.next_sid
    this.config.next_sid = sid + 1
    await this.save()
    return sid
  }

	/** Returns the current next_sid value without incrementing */
	peekNextSid() {
		return this.config.next_sid
	}

	/** Sets the next_sid value */
	async setNextSid(sid) {
		this.config.next_sid = sid
		await this.save()
	}

	getGistToken() {
		return this.config.gist_token || null
	}

	async setGistToken(token) {
		this.config.gist_token = token
		await this.save()
	}

	getGistId() {
		return this.config.gist_id || null
	}

	async setGistId(id) {
		this.config.gist_id = id
		await this.save()
	}
}

export default ConfigService
