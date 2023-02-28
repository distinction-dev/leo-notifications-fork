import { cleanEnv, str, url } from "envalid";

export default cleanEnv(process.env, {
  NOTIFICATIONS_TABLE: str(),
  USERS_TABLE: str(),
  ENVIRONMENT_NAME: str(),
  RELEASE_VERSION: str(),
  SENTRY_DSN: url(),
});
