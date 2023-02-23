import { OpenAPIV3_1 } from "openapi-types";
import { writeFileSync } from "fs";
import * as path from "path";
// eslint-disable-next-line max-len
import { sendUserNotificationApiDefinition } from "@functions/sendUserNotification.conf";
import { ToggleStatusApiDefinition } from "@functions/toggleStatus.conf";
// eslint-disable-next-line max-len
import { getUserNotificationsApiDefinition } from "@functions/getUserNotifications.conf";
import { LeoNotificationsApiSecuritySchema, TAG_NAMES } from "./openapi.shared";
import { markAllAsViewedApiDefinition } from "@functions/markAllAsViewed.conf";

const Tags: OpenAPIV3_1.TagObject[] = [
  {
    name: TAG_NAMES.NOTIFICATIONS,
    description: "Collection of endpoints containing notification",
  },
];

const apiSchema: OpenAPIV3_1.Document = {
  openapi: "3.1.0",
  servers: [
    {
      url: "http://y9yle5ib40.execute-api.us-west-2.amazonaws.com/dev",
    },
  ],
  info: {
    title: "Leo Notification Service",
    version: "1.0.0",
    description: "Rest Api for creating and getting user notifications",
  },
  tags: Tags,
  paths: {
    "/{accountId}/notification/": {
      ...sendUserNotificationApiDefinition,
      ...getUserNotificationsApiDefinition,
      ...markAllAsViewedApiDefinition,
    },
    "/{accountId}/notification/{id}": {
      ...ToggleStatusApiDefinition,
    },
  },
  components: {
    securitySchemes: {
      Bearer: LeoNotificationsApiSecuritySchema,
    },
  },
};

writeFileSync(
  path.join(__dirname, "docs", "api.spec.json"),
  JSON.stringify(apiSchema, null, 2)
);
