/** The one address a buyer is ever told to write to. Client-safe (no deps).
 *  As of 2026-09-14: hello@ does not exist on the mail host (550), and james@
 *  is accepted by SiteGround's gateway but was not forwarding to the inbox
 *  James reads. Whatever this is set to must have a forwarder behind it. */
export const SUPPORT_EMAIL = "james@slptransitions.com";
