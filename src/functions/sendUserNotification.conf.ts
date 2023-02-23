import { AwsFunction } from "serverless-schema";
import { FromSchema } from "json-schema-to-ts";
import { Handler, APIGatewayProxyResult } from "aws-lambda";
import {
  LeoNotificationsEventBase,
  LeoNotificationsHeadersSchema,
} from "@lib/models";
import { OpenAPIV3_1 } from "openapi-types";
import { AccountIdParameter, getSuccessResponse } from "openapi.shared";

export const SendUserNotificationFunction: AwsFunction = {
  events: [
    {
      http: {
        cors: true,
        method: "POST",
        path: "/notification",
        private: true,
      },
    },
  ],
  handler: "src/functions/sendUserNotification.handler",
};

export const SendUserNotificationSchema = {
  type: "object",
  properties: {
    ...LeoNotificationsHeadersSchema.properties,
    body: {
      type: "object",
      properties: {
        userIds: {
          type: "array",
          items: {
            type: "string",
          },
        },
        content: {
          type: "object",
          properties: {
            en: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                },
                text: {
                  type: "string",
                },
              },
              additionalProperties: false,
              required: ["title", "text"],
            },
          },
          required: ["en"],
          additionalProperties: false,
        },
        priority: {
          type: "string",
          enum: ["highest", "high", "medium", "low"],
        },
        type: {
          type: "string",
          enum: ["error", "warning", "success", "info"],
        },
        context: {
          anyOf: [
            {
              title: "Export Data",
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["export"],
                },
                data: {
                  type: "object",
                  properties: {
                    exportId: {
                      type: "string",
                    },
                    reasonForFailure: {
                      type: "string",
                    },
                  },
                  required: ["exportId", "reasonForFailure"],
                  additionalProperties: false,
                },
              },
              additionalProperties: false,
              required: ["type", "data"],
            },
            {
              title: "Authorization Lost",
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["authorization-lost"],
                },
                data: {
                  type: "object",
                  properties: {
                    inboxName: {
                      type: "string",
                    },
                    accountName: {
                      type: "string",
                    },
                    appUrl: {
                      type: "string",
                    },
                  },
                  additionalProperties: false,
                  required: ["appUrl", "accountName", "inboxName"],
                },
              },
              additionalProperties: false,
              required: ["type", "data"],
            },
          ],
        },
      },
      required: ["userIds", "content"],
    },
  },
  required: ["body", ...LeoNotificationsHeadersSchema.required],
  additionalProperties: true,
} as const;

export const sendUserNotificationApiDefinition: OpenAPIV3_1.PathItemObject = {
  post: {
    tags: ["Notifications"],
    // @ts-ignore
    parameters: [AccountIdParameter],
    operationId: "sendUserNotification",
    requestBody: {
      content: {
        "application/json": {
          // @ts-ignore
          schema: SendUserNotificationSchema,
        },
      },
    },
    responses: {
      200: getSuccessResponse("Notification saved successfully"),
    },
  },
};

export type SendUserNotificationSchemaType = FromSchema<
  typeof SendUserNotificationSchema
>;

export type SendUserNotificationHandler = Handler<
  Omit<LeoNotificationsEventBase, "body"> &
    FromSchema<typeof SendUserNotificationSchema>,
  APIGatewayProxyResult
>;
