import { VercelResponse } from '@vercel/node'

const storage: { [key: string]: [number, number] } = {}

function unixMs (): number {
  return +new Date()
}

function sleep (ms: number): any {
  return new Promise((resolve: any) => setTimeout(resolve, ms))
}

function dynamicSleep (str: string): any {
  if (!storage[str] || unixMs() - storage[str][0] > 2500) storage[str] = [unixMs(), 0]
  return sleep(400 * storage[str][1]++) // 2000 / 5 = 400ms
}

function handleError (err: any, response: VercelResponse): void {
  if (err.response) {
    response.status(err.response.status).send(err.response.data)
  } else {
    response.status(400).send({ error: err.message })
  }
}

export { dynamicSleep, handleError }
