import { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'

import { dynamicSleep, handleError } from '../src/utils'

export default async (request: VercelRequest, response: VercelResponse) => {
  if (request.method !== 'POST') {
    response.status(405).send('nope')
    return
  }

  const { id, token, thread_id } = request.query
  const params: Record<string, string> = {wait: 'true'}
  if (thread_id) params.thread_id = `${thread_id}`
  const url = new URL(`https://discord.com/api/webhooks/${id}/${token}?${new URLSearchParams(params)}`).toString()

  const contentType = request.headers['content-type'].split(';')[0]

  switch (contentType) {
    case 'application/json': {
      try {
        const body: object = request.body

        await dynamicSleep(`${id}-${token}`)

        axios
          .post(url, body)
          .then(res => {
            response.status(res.status).send(res.data)
          })
          .catch(err => {
            handleError(err, response)
          })
      } catch (error) {
        response
          .status(400)
          .send({ error: error.message })
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
        .then(res => {
          response.status(res.status).send(res.data)
        })
        .catch(err => {
          handleError(err, response)
        })
      break
    }
    default: {
      response.status(415).send({ error: 'This Content-Type is not supported! Use "application/json" or "text/plain".' })
      break
    }
  }
}
