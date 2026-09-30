// Membership dues, paid through Crowded (the club's payment platform).
// Checkout happens entirely on Crowded's own site, in a new tab -- this
// site never handles card details or any part of the payment itself, only
// this outbound link, same as any other external tool (Google Form,
// Calendar, ...).
//
// Each term needs its own checkout URL (Crowded, like most checkout
// platforms, gives one distinct link per plan rather than one URL that
// takes a parameter). Set a term's url to turn it on; leave it null to
// hide just that option. If every term is null, the whole "Become a
// member" button on the home page hides itself.
export const membership = {
  terms: [
    {
      label: "1 year",
      url: "https://collect.bankingcrowded.com/collection/505d49e4-afb2-4552-bf02-826859f4b181" as string | null,
    },
    {
      label: "2 years",
      url: "https://collect.bankingcrowded.com/collection/9817d8c9-f48c-4a0f-ac39-c6a27c02a55a" as string | null,
    },
    {
      label: "3 years",
      url: "https://collect.bankingcrowded.com/collection/f4332a13-0650-4ee9-b86a-09df61c8de12" as string | null,
    },
    {
      label: "1.5 years (MSBA / MFE / MQE)",
      url: "https://collect.bankingcrowded.com/collection/142ad376-6263-437f-9fcb-2660508ef502" as string | null,
    },
  ],
};
