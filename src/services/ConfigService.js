import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

const CONFIG_DIR = path.join(os.homedir(), 'clavis')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.toml')

/** Minimal TOML parser for integer fields: reads "key = <integer>" lines */
const parseTOML = (content) => {
  const result = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^(\w+)\s*=\s*(\d+)$/)
    if (match) {
      result[match[1]] = parseInt(match[2], 10)
    }
  }
  return result
}

/** Minimal TOML serializer: writes integer fields as "key = value" */
const serializeTOML = (data) => {
  const lines = ['# Clavis configuration', '']
  for (const [key, value] of Object.entries(data)) {
    lines.push(`${key} = ${value}`)
  }
  return lines.join('\n') + '\n'
}

class ConfigService {
  constructor() {
    this.configFile = CONFIG_FILE
    this.config = { next_sid: 1 }
  }

  async init() {
    await fs.mkdir(CONFIG_DIR, { recursive: true })
    try {
      const content = await fs.readFile(this.configFile, 'utf8')
      this.config = { next_sid: 1, ...parseTOML(content) }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      await this.save()
    }
  }

  async save() {
    await fs.mkdir(path.dirname(this.configFile), { recursive: true })
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
}

export default ConfigService
