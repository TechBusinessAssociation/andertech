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
    { label: "1 year", url: null as string | null },
    { label: "2 years", url: null as string | null },
    { label: "3 years", url: null as string | null },
    { label: "1.5 years (MSBA / MFE / MQE)", url: null as string | null },
  ],
};
