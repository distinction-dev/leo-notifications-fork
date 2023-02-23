import { InboxAuthorizationLost } from "@lib/emails/templates";
import env from "@lib/env";
import { APIGatewayProxyEvent } from "aws-lambda";
import * as dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item";
import { FromSchema } from "json-schema-to-ts";
import { OpenAPIV3 } from "openapi-types";

export interface Notification {
  id: string;
  content: {
    en: {
      title: string;
      text: string;
    };
  };
  userId: string;
  groupId: string;
  /**
   * This is the id of the app
   * An app is like an account that can be matched to a billing account
   */
  accountId: "leopb" | "smartleads";
  /**
   * This items tracks whether an individual notification has been viewed or not
   */
  isViewed?: boolean;
  /**
   * Will use this to track if the notification was delivered or not
   */
  failedToDeliver?: boolean;
  /**
   * This property is used to track the status from the internal service that
   * generated this notification, For example:- If an underlying process failed
   * then the status would be "failure".
   * Use this in the UI to color code for the user
   * Default is "success"
   */
  type: "error" | "warning" | "success" | "info";
  priority: "highest" | "high" | "medium" | "low";
  context:
    | {
        type: "export";
        data: {
          exportId: string;
          reasonForFailure: string;
        };
      }
    | {
        type: "authorization-lost";
        data: InboxAuthorizationLost;
      };
  channels: Array<"push" | "emails" | "sms">;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationItem extends Item implements Notification {
  id: string;
  content: {
    en: {
      title: string;
      text: string;
    };
  };
  userId: string;
  groupId: string;
  /**
   * This is the id of the app
   * An app is like an account that can be matched to a billing account
   */
  accountId: "leopb" | "smartleads";
  /**
   * This items tracks whether an individual notification has been viewed or not
   */
  isViewed?: boolean;
  /**
   * Will use this to track if the notification was delivered or not
   */
  failedToDeliver?: boolean;
  /**
   * This property is used to track the status from the internal service that
   * generated this notification, For example:- If an underlying process failed
   * then the status would be "failure".
   * Use this in the UI to color code for the user
   * Default is "success"
   */
  type: "error" | "warning" | "success" | "info";
  priority: "highest" | "high" | "medium" | "low";
  context:
    | {
        type: "export";
        data: {
          exportId: string;
          reasonForFailure: string;
        };
      }
    | {
        type: "authorization-lost";
        data: InboxAuthorizationLost;
      };
  channels: Array<"push" | "emails" | "sms">;
  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
      required: true,
    },
    content: {
      type: Object,
      schema: {
        en: {
          type: Object,
          schema: {
            title: {
              type: String,
              required: true,
            },
            text: {
              type: String,
              required: true,
            },
          },
          required: true,
        },
      },
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: {
        type: "global",
        name: "gsiUserId",
      },
    },
    groupId: {
      type: String,
      required: true,
      index: {
        type: "global",
      },
    },
    accountId: {
      type: String,
      enum: ["leopb", "smartleads"],
      required: true,
    },
    isViewed: {
      type: Boolean,
      default: false,
    },
    failedToDeliver: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["error", "warning", "success", "info"],
    },
    priority: {
      type: String,
      enum: ["highest", "high", "medium", "low"],
    },
    context: {
      type: Object,
    },
    channels: {
      type: Array,
      schema: [
        {
          type: String,
          enum: ["push", "emails", "sms"],
        },
      ],
    },
    createdAt: {
      type: Date,
      required: true,
      rangeKey: true,
    },
    updatedAt: {
      type: Date,
      required: true,
    },
  },
  {
    saveUnknown: ["context"],
  }
);

export const NotificationModel = dynamoose.model<NotificationItem>(
  env.NOTIFICATIONS_TABLE,
  NotificationSchema
);

/**
 * @type {JSONSchema}
 */
export const LeoNotificationsHeadersSchema = {
  type: "object",
  properties: {
    headers: {
      type: "object",
      properties: {
        accountId: {
          type: "string",
          enum: ["leopb", "smartleads"],
        },
      },
      required: ["accountId"],
    },
  },
  required: ["headers"],
} as const;

export const LeoNotificationHeaderParameters: OpenAPIV3.ParameterObject[] = [
  {
    in: "header",
    name: "accountId",
    required: true,
    description:
      "The identifier for an account for which we're sending notification",
    schema: {
      type: "string",
    },
  },
];

export type LeoNotificationsEventBase = Omit<APIGatewayProxyEvent, "headers"> &
  FromSchema<typeof LeoNotificationsHeadersSchema>;
