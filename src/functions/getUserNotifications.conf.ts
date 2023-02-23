import { AccountIdParameter, TAG_NAMES } from "openapi.shared";
import { OpenAPIV3_1 } from "openapi-types";
import { AwsFunction, FromApiGatewayParameters } from "serverless-schema";
import { authConfig } from "./authorizer.conf";
import { LeoUserProtectedEvent } from "./authorizer.conf";

export const getUserNotificationsFunction: AwsFunction = {
  events: [
    {
      http: {
        cors: true,
        method: "GET",
        path: "/{accountId}/notification",
        authorizer: authConfig,
      },
    },
  ],
  handler: "src/functions/getUserNotifications.handler",
};

export const GetUserNotificationsParameters = [
  // @ts-ignore
  AccountIdParameter,
  {
    in: "query",
    name: "lastKey",
    required: false,
    schema: {
      type: "string",
    },
    description: "The id of the last notification that was received",
  },
  {
    in: "query",
    name: "size",
    required: false,
    schema: {
      oneOf: [
        {
          type: "number",
          maximum: 25,
          default: 1,
        },
        {
          type: "string",
        },
      ],
    },
    description: "The id of the last notification that was received",
  },
] as const;

export type GetUserNotificationsEvent = Omit<
  LeoUserProtectedEvent,
  "pathParameters" | "queryStringParameters"
> &
  FromApiGatewayParameters<
    // @ts-ignore
    typeof GetUserNotificationsParameters
  >;

export const getUserNotificationsApiDefinition: OpenAPIV3_1.PathItemObject = {
  get: {
    tags: [TAG_NAMES.NOTIFICATIONS],
    operationId: "getUserNotifications",
    // @ts-ignore
    parameters: GetUserNotificationsParameters,
    responses: {},
    security: [
      {
        Bearer: [],
      },
    ],
  },
};
