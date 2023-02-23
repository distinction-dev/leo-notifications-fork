import { GetUserNotificationsEvent } from "./getUserNotifications.conf";
import { response } from "@lib/api-gateway";
import { NotificationModel } from "@lib/models";

export const handler = async (
  event: GetUserNotificationsEvent
): Promise<any> => {
  const userInfo = event.requestContext.authorizer;
  const size = event.queryStringParameters?.size
    ? Number(event.queryStringParameters.size)
    : 25;
  console.log(JSON.stringify(event.queryStringParameters, null, 4));
  if (size === 0) {
    const notifications = await NotificationModel.query({
      userId: userInfo.sub,
    })
      .where("isViewed")
      .eq(false)
      .count()
      .exec();
    return response(200, {
      count: notifications.count,
    });
  }
  if (event.queryStringParameters && event.queryStringParameters.lastKey) {
    // get last item
    const [lastItem] = await NotificationModel.query({
      id: event.queryStringParameters.lastKey,
    })
      .attributes(["createdAt"])
      .exec();
    const notifications = await NotificationModel.query({
      userId: userInfo.sub,
    })
      .limit(size)
      .startAt({
        id: event.queryStringParameters.lastKey,
        userId: userInfo.sub,
        createdAt: Number(lastItem.createdAt),
      })
      .sort("descending")
      .exec();
    return response(200, {
      data: notifications,
      lastKey: notifications.lastKey,
    });
  } else {
    const notifications = await NotificationModel.query({
      userId: userInfo.sub,
    })
      .limit(size)
      .sort("descending")
      .exec();
    return response(200, {
      data: notifications,
      lastKey: notifications.lastKey ? notifications.lastKey.id : undefined,
    });
  }
};
