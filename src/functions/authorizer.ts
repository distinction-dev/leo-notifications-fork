import { APIGatewayRequestAuthorizerEvent } from "aws-lambda";
import { LeoClaims } from "./authorizer.conf";
import {
  AuthorizerResponse,
  AwsPolicy,
  DENY_ALL_RESPONSE,
  HttpVerbsEnum,
  Verifier,
} from "@distinction-dev/lambda-authorizer-utils";
import { pick } from "serverless-schema";
import { UserInfoModel } from "@lib/models";

let leoVerifier: Verifier<LeoClaims> | null = null;

export const LEO_ALLOWED_ROUTES: Array<{
  method: HttpVerbsEnum;
  route: string;
}> = [
  {
    method: "GET",
    route: "leopb/notification",
  },
  {
    method: "PUT",
    route: "leopb/notification/{accountId}",
  },
  {
    method: "PUT",
    route: "leopb/notification/{accountId}/{id}",
  },
];

export async function handler(
  event: APIGatewayRequestAuthorizerEvent
): Promise<AwsPolicy> {
  try {
    if (event.headers && event.headers.Authorization) {
      let claims: LeoClaims;
      if (!leoVerifier) {
        const { verifiedToken, verifier } = await Verifier.fromToken<LeoClaims>(
          event.headers.Authorization,
          ["https://auth.prondo.co"]
        );
        leoVerifier = verifier;
        claims = verifiedToken;
      } else {
        claims = leoVerifier.getParsedToken(event.headers.Authorization);
      }
      // Make sure that this user gets inserted into the database
      const user = new UserInfoModel({
        sub: claims.sub,
        groupId: claims.tenantId,
        accountId: "leopb",
      });
      await user.save();
      const response = AuthorizerResponse.fromMethodArn(
        "apigateway.amazonaws.com",
        event.methodArn,
        false,
        {
          ...pick<
            LeoClaims,
            | "sub"
            | "email"
            | "name"
            | "email_verified"
            | "profilePictureUrl"
            | "tenantId"
          >(
            claims,
            "sub",
            "email",
            "name",
            "email_verified",
            "profilePictureUrl",
            "tenantId"
          ),
        }
      );
      LEO_ALLOWED_ROUTES.forEach(({ method, route }) =>
        response.allowRoute(method, route)
      );
      return response.getPolicy();
    }
    return DENY_ALL_RESPONSE;
  } catch (err) {
    console.error(err);
    return DENY_ALL_RESPONSE;
  }
}
