import { ServerlessFrameworkConfiguration } from "serverless-schema";
// eslint-disable-next-line max-len
import { SendUserNotificationFunction } from "@functions/sendUserNotification.conf";
import { ToggleStatusFunction } from "@functions/toggleStatus.conf";
import env from "@lib/env";
import { Dynamodb } from "iam-floyd";
import { authorizerFunction } from "@functions/authorizer.conf";
// eslint-disable-next-line max-len
import { getUserNotificationsFunction } from "@functions/getUserNotifications.conf";
import { markAllAsViewedFunction } from "@functions/markAllAsViewed.conf";

const NOTIFICATIONS_TABLE_NAME = "Leo-Notifications-${env:ENVIRONMENT_NAME}";

const serviceConfiguration: ServerlessFrameworkConfiguration = {
  service: "leo-notification-service",
  provider: {
    name: "aws",
    runtime: "nodejs16.x",
    region: "us-west-2",
    memorySize: 128,
    apiGateway: {
      apiKeys: [
        {
          name: "leo-notification-service",
          description: "Api Key to prevent access to api without a signed key",
          enabled: true,
        },
      ],
    },
    versionFunctions: false,
    stage: "${env:ENVIRONMENT_NAME}",
    environment: {
      ...env,
      NOTIFICATIONS_TABLE: "Leo-Notifications-${env:ENVIRONMENT_NAME}",
      USER_TABLE: "Leo-Notifications-Users-${env:ENVIRONMENT_NAME}",
    },
    iamRoleStatements: [
      new Dynamodb()
        .allow()
        .toConditionCheckItem()
        .toBatchGetItem()
        .toDescribeTable()
        .toScan()
        .toPutItem()
        .toDeleteItem()
        .toUpdateItem()
        .toBatchWriteItem()
        .toQuery()
        .toGetItem()
        .onTable(NOTIFICATIONS_TABLE_NAME)
        .onIndex(NOTIFICATIONS_TABLE_NAME, "gsiUserId")
        .toJSON(),
    ],
  },
  plugins: ["serverless-esbuild"],
  custom: {
    esbuild: {
      bundle: true,
      minify: true,
      sourcemap: true,
    },
  },
  functions: {
    sendUserNotification: SendUserNotificationFunction,
    toggleStatus: ToggleStatusFunction,
    authorizer: authorizerFunction,
    getUserNotifications: getUserNotificationsFunction,
    markAllAsViewed: markAllAsViewedFunction,
  },
  resources: {
    Resources: {
      NotificationsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: NOTIFICATIONS_TABLE_NAME,
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
            {
              AttributeName: "createdAt",
              KeyType: "RANGE",
            },
          ],
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
            {
              AttributeName: "createdAt",
              AttributeType: "N",
            },
            {
              AttributeName: "userId",
              AttributeType: "S",
            },
          ],
          BillingMode: "PAY_PER_REQUEST",
          GlobalSecondaryIndexes: [
            {
              IndexName: "gsiUserId",
              KeySchema: [
                {
                  AttributeName: "userId",
                  KeyType: "HASH",
                },
              ],
              Projection: {
                ProjectionType: "ALL",
              },
            },
          ],
        },
      },
    },
  },
  package: {
    individually: true,
    exclude: [
      "coverage/**",
      "scripts/**",
      "serverless.yml",
      ".vscode",
      "dist",
      ".eslintrc.js",
      ".eslintignore",
      ".nvmrc",
      ".prettierrc.json",
      ".env",
      ".envrc",
      ".tool-versions",
      "tsconfig.json",
      ".nyc_output/**",
      ".idea/**",
      "test/**",
      "package-lock.json",
      "yarn.lock",
      ".gitlab-ci.yml",
      "README.md",
      "serverless.yml.example",
    ],
  },
};

module.exports = serviceConfiguration;
