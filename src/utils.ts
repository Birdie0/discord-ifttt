import {VercelResponse} from '@vercel/node'
import {AxiosError} from 'axios'

const storage: Record<string, [number, number]> = {}

function unixMs(): number {
	return Date.now()
}

function sleep(ms: number): Promise<unknown> {
	return new Promise((resolve: any) => setTimeout(resolve, ms))
}

function dynamicSleep(name: string): Promise<unknown> {
	if (!storage[name] || unixMs() - storage[name][0] > 2500) {
		storage[name] = [unixMs(), 0]
	}

	return sleep(400 * storage[name][1]++) // 2000 / 5 = 400ms
}

function handleError(error: AxiosError, response: VercelResponse): void {
	if (error.response) {
		response.status(error.response.status).send(error.response.data)
	} else {
		response.status(400).send({error: error.message})
	}
}

export {dynamicSleep, handleError}
