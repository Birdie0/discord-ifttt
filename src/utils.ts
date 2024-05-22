import { setTimeout as sleep } from 'node:timers/promises'

import type { VercelResponse } from '@vercel/node'
import type { AxiosError } from 'axios'

const storage = new Map<string, [number, number]>()

function unixMs(): number {
	return Date.now()
}

async function dynamicSleep(name: string): Promise<void> {
	let record = storage.get(name)
	const now = unixMs()

	if (!record || now - record[0] > 2500) {
		record = [now, 0]
		storage.set(name, record)
	}

	// 2000 / 5 = 400ms
	await sleep(400 * record[1]++)
}

function handleError(error: AxiosError, response: VercelResponse): void {
	if (error.response) {
		response.status(error.response.status).send(error.response.data)
	} else {
		response.status(400).send({ error: error.message })
	}
}

export { dynamicSleep, handleError }
