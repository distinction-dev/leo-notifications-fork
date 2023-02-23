import { authConfig, LeoUserProtectedEvent } from "@functions/authorizer.conf";
import { APIGatewayProxyResult, Handler } from "aws-lambda";
import { OpenAPIV3_1 } from "openapi-types";
import { AccountIdParameter, getSuccessResponse } from "openapi.shared";
import { AwsFunction, FromApiGatewayParameters } from "serverless-schema";

export const ToggleStatusFunction: AwsFunction = {
  handler: "src/functions/toggleStatus.handler",
  events: [
    {
      http: {
        cors: true,
        method: "PUT",
        path: "/{accountId}/notification/{id}",
        authorizer: authConfig,
      },
    },
  ],
};

export const ToggleStatusSchema = {
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
      },
      required: ["id"],
    },
  },
  required: ["pathParameters"],
} as const;

export const ToggleStatusParameters = [
  AccountIdParameter,
  {
    name: "id",
    in: "path",
    required: true,
    description: "The id of the notification that you want to update",
    schema: {
      type: "string",
    },
  },
] as const;

export const ToggleStatusApiDefinition: OpenAPIV3_1.PathItemObject = {
  put: {
    description:
      // eslint-disable-next-line max-len
      ">This endpoint uses the id of an individual notification and changes the is viewed status of that endpoint.",
    tags: ["Notifications"],
    parameters: [...ToggleStatusParameters],
    operationId: "toggleStatus",
    responses: {
      200: getSuccessResponse("Notification Updated Successfully"),
    },
    security: [
      {
        Bearer: [],
      },
    ],
  },
};

type ToggleStatusParametersType = FromApiGatewayParameters<
  typeof ToggleStatusParameters
>;

type ToggleStatusEvent = Omit<
  LeoUserProtectedEvent,
  keyof ToggleStatusParametersType
> &
  ToggleStatusParametersType;

export type ToggleStatusHandler = Handler<
  ToggleStatusEvent,
  APIGatewayProxyResult
>;
