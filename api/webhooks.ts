import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { AxiosError } from 'axios'
import axios from 'axios'

import { dynamicSleep, handleError } from '../src/utils'

export default async function webhooks(
	request: VercelRequest,
	response: VercelResponse,
): Promise<void> {
	if (request.method !== 'POST') {
		response.status(405).send('this route supports POST only!')
		return
	}

	const { apiVersion, id, token, ...queryParams } = request.query
	const parameters = new URLSearchParams(queryParams)
	const version = apiVersion ?? 'v10'

	const url = new URL(
		`https://discord.com/api/${version}/webhooks/${id}/${token}?${parameters}`,
	).toString()

	const contentType = request.headers['content-type']?.split(';')[0]

	switch (contentType) {
		case 'application/json': {
			try {
				const { body } = request

				await dynamicSleep(`${id}-${token}`)

				axios
					.post(url, body)
					.then((res) => {
						response.status(res.status).send(res.data)
					})
					.catch((error: AxiosError) => {
						handleError(error, response)
					})
			} catch (error) {
				response.status(400).send({
					error: error instanceof Error ? error.message : 'Unknown error',
				})
			}

			break
		}

		case 'text/plain': {
			const body: string = request.body.trim().slice(0, 2000)
			if (body.length === 0) {
				response.status(400).send({ error: 'empty body' })
				return
			}

			await dynamicSleep(`${id}-${token}`)

			axios
				.post(url, { content: body })
				.then((res) => {
					response.status(res.status).send(res.data)
				})
				.catch((error: AxiosError) => {
					handleError(error, response)
				})
			break
		}

		default: {
			response.status(415).send({
				error:
					'This Content-Type is not supported! Use "application/json" or "text/plain".',
			})
			break
		}
	}
}
