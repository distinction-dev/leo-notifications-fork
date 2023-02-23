import env from "@lib/env";
import { NodeOptions } from "@sentry/node/types";

export const SentryConfig: NodeOptions = {
  dsn: env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: env.ENVIRONMENT_NAME,
  release: env.RELEASE_VERSION,
};
