import { server as app } from "./app"

async function bootstrap(): Promise<void> {
  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.log('Application has started on port: ' + port)

}
bootstrap().catch((e? : Error)=> console.error(e?.message))