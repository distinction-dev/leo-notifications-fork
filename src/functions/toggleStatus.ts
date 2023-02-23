import { nullRemoverReviver, response } from "@lib/api-gateway";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import * as Sentry from "@sentry/serverless";
("@lib/sentry");
import { NotificationModel } from "@lib/models";
import { SentryConfig } from "@lib/sentry";
import {
  ToggleStatusHandler,
  ToggleStatusSchema,
} from "@functions/toggleStatus.conf";
Sentry.AWSLambda.init(SentryConfig);

export const lambdaHandler: ToggleStatusHandler = async (
  event
): Promise<any> => {
  // get the element using query
  const [notification] = await NotificationModel.query({
    id: event.pathParameters.id,
  })
    .attributes(["createdAt", "isViewed"])
    .exec();
  await NotificationModel.update(
    {
      id: event.pathParameters.id,
      createdAt: Number(notification.createdAt),
    },
    {
      isViewed: !notification.isViewed,
    }
  );
  return response(200, {
    message: "Notification Updated Successfully",
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
      eventSchema: transpileSchema(ToggleStatusSchema),
    })
  )
  .handler(Sentry.AWSLambda.wrapHandler(lambdaHandler));
