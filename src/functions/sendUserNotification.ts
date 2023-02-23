import { nullRemoverReviver, response } from "@lib/api-gateway";
import middy from "@middy/core";
import {
  SendUserNotificationHandler,
  SendUserNotificationSchema,
} from "./sendUserNotification.conf";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import * as Sentry from "@sentry/serverless";
("@lib/sentry");
import { NotificationModel, Notification } from "@lib/models";
import { nanoid } from "nanoid";
import { SentryConfig } from "@lib/sentry";
Sentry.AWSLambda.init(SentryConfig);

export const lambdaHandler: SendUserNotificationHandler = async (
  event
): Promise<any> => {
  await NotificationModel.batchPut(
    event.body.userIds.map((u) => {
      const notification: Notification = {
        id: nanoid(),
        content: event.body.content,
        userId: u,
        groupId: u,
        accountId: event.headers.accountId,
        context: event.body.context,
        priority: event.body.priority || "medium",
        type: event.body.type || "info",
        channels: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return notification;
    })
  );
  return response(200, {
    message: "Successfully saved notification",
  });
};

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    jsonBodyParser({
      reviver: nullRemoverReviver,
    })
  )
  .use(
    validator({
      eventSchema: transpileSchema(SendUserNotificationSchema),
    })
  )
  .handler(Sentry.AWSLambda.wrapHandler(lambdaHandler));
