/**
 * The interface containing data definition that needs to be sent to user.
 * This should be sent when triggering Inbox authorization lost email
 */
export interface InboxAuthorizationLost {
  /**
   * The name of the inbox, can be email and or identifier name
   */
  inboxName: string;

  /**
   * Something to specify Leo Account, idk what it is
   * Todo:- Need to confirm with Yuri what this is.
   */
  accountName: string;
  /**
   * The url where user should go to re-authorizer url
   */
  appUrl: string;
}
