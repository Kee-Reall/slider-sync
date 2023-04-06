import { server as app } from "./app"

async function bootstrap(): Promise<void> {
  await app.listen(3000)
  console.log('Application has started on port: ' + 3000)
}
bootstrap().catch((e? : Error)=> console.error(e?.message))