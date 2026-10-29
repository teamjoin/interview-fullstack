import { createApp } from './app';
const runtime = createApp(process.env.DATABASE_PATH ?? './data/studio.sqlite');
const server = runtime.app.listen(Number(process.env.PORT ?? 3001), '0.0.0.0', () => {
  process.stdout.write('JOIN interview API ready\n');
});
function stop() { server.close(() => { runtime.close(); process.exit(0); }); }
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
