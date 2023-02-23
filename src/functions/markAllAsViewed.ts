import { LeoUserProtectedEvent } from "@functions/authorizer.conf";
import { response } from "@lib/api-gateway";
import { APIGatewayProxyResult, Handler } from "aws-lambda";
import { NotificationModel, Notification } from "../lib/models";

export const handler: Handler<
  LeoUserProtectedEvent,
  APIGatewayProxyResult
> = async (event) => {
  // get all notifications for user that are no viewed
  const notifications = await NotificationModel.query({
    userId: event.requestContext.authorizer.sub,
  })
    .where("isViewed")
    .eq(false)
    .exec();
  await NotificationModel.batchPut(
    notifications.map((n) => {
      const newItem: Notification = {
        ...n,
        isViewed: false,
      };
      return newItem;
    })
  );
  return response(200, {
    message:
      // eslint-disable-next-line max-len
      "Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!",
    input: event,
  });
};
