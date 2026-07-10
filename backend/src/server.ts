import { buildApp } from './app.js';

const start = async () => {
  const app = buildApp();

  try {
    const port = Number(process.env.PORT ?? 4000);
    const host = process.env.HOST ?? '0.0.0.0';

    await app.listen({
      port,
      host,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
