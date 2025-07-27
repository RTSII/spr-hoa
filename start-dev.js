// Creating a manual Vite start script to bypass the lightningcss module error
import { createServer } from 'vite'

const server = await createServer()
await server.listen()
server.printUrls()
