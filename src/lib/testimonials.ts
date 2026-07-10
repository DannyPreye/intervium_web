// Real customer testimonials for the landing page.
//
// LEAVE THIS EMPTY until you have genuine, permission-granted quotes. The
// Testimonials section renders nothing while the array is empty, so shipping
// with it empty is safe. NEVER add invented quotes, names, logos, ratings, or
// usage numbers — fabricated social proof is deceptive and risks the site.
//
// To go live: drop real entries below (optionally add an avatar image under
// /public) and the section appears automatically — no other code changes.

export type Testimonial = {
  /** The quote, in the customer's own words. */
  quote: string;
  /** Person's name, e.g. "Jordan Lee". */
  name: string;
  /** Role / context, e.g. "New-grad SWE" or "Hired at a FAANG". */
  role: string;
  /** Optional avatar image path under /public, e.g. "/testimonials/jordan.jpg". */
  avatar?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  // Example shape (delete and replace with real, permission-granted quotes):
  // {
  //   quote:
  //     "Two weeks of mock interviews with Alex and I finally stopped freezing up. Landed the offer.",
  //   name: "Jordan Lee",
  //   role: "New-grad SWE",
  //   avatar: "/testimonials/jordan.jpg",
  // },
];
