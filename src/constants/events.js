/**
 * ═══════════════════════════════════════════════════════════
 *  EVENTS CONFIGURATION
 *  
 *  To add an event:   Add an object to the EVENTS array below.
 *  To remove events:  Empty the array → no banner shown.
 *  
 *  Each event object:
 *    title       — Short event name (required)
 *    description — One-line summary (required)
 *    link        — URL or route to learn more (optional)
 *    linkText    — Button label, defaults to "Learn More" (optional)
 *    tag         — Small badge label like "NEW" or "LIMITED" (optional)
 *    endsAt      — ISO date string; event auto-hides after this (optional)
 *
 *  Example:
 *    { title: '2× Votes Weekend', description: 'All vote packages doubled!', tag: 'LIMITED', endsAt: '2026-04-05T23:59:59Z' }
 * ═══════════════════════════════════════════════════════════
 */

const EVENTS = [
  {
    title: '200 Votes',
    description: 'Contact us on Discord or Facebook to get you free redeem code with 200 votes',
    tag: 'FREE',
    linkText: 'Contact Us',
    endsAt: '2026-04-05T23:59:59Z',
  },
];

export default EVENTS;
