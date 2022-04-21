import type {VercelResponse} from '@vercel/node'
import type {AxiosError} from 'axios'

const storage = new Map<string, [number, number]>()

function unixMs(): number {
	return Date.now()
}

async function sleep(ms: number): Promise<void> {
	await new Promise((resolve: any) => {
		setTimeout(resolve, ms)
	})
}

async function dynamicSleep(name: string): Promise<void> {
	if (!storage.has(name) || unixMs() - storage.get(name)![0] > 2500) {
		storage.set(name, [unixMs(), 0])
	}

	await sleep(400 * storage.get(name)![1]++) // 2000 / 5 = 400ms
}

function handleError(error: AxiosError, response: VercelResponse): void {
	if (error.response) {
		response.status(error.response.status).send(error.response.data)
	} else {
		response.status(400).send({error: error.message})
	}
}

export {dynamicSleep, handleError}
