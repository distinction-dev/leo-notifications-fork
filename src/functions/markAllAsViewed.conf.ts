import {
  AccountIdParameter,
  getSuccessResponse,
  TAG_NAMES,
} from "openapi.shared";
import { OpenAPIV3_1 } from "openapi-types";
import { AwsFunction } from "serverless-schema";
import { authConfig } from "@functions/authorizer.conf";

export const markAllAsViewedFunction: AwsFunction = {
  handler: "src/functions/markAllAsViewed.handler",
  events: [
    {
      http: {
        authorizer: authConfig,
        cors: true,
        method: "PUT",
        path: "{accountId}/notification",
      },
    },
  ],
};

/**
 * Open api definition for the mark all as viewed endpoint
 */
export const markAllAsViewedApiDefinition: OpenAPIV3_1.PathItemObject = {
  put: {
    tags: [TAG_NAMES.NOTIFICATIONS],
    operationId: "markAllAsViewed",
    // @ts-ignore
    parameters: [AccountIdParameter],
    description:
      // eslint-disable-next-line max-len
      ">Marks all the notifications of the current user as read. The accountId is read from the path. The user ID will be read from the authentication header",
    responses: {
      // @ts-ignore
      202: getSuccessResponse(
        "Successfully marked all notifications as read for this user"
      ),
    },
    security: [
      {
        Bearer: [],
      },
    ],
  },
};
