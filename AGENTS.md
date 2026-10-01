# WAYIN Project Instructions

## Product

WAYIN is a community-powered accessibility map.

Tagline:
"Find your way in."

Secondary phrase:
"Know before you go."

WAYIN helps people discover accessible access points before arriving at a place.

The key product distinction is access-point-level information rather than only place-level accessibility information.

Example:

Main Entrance

* Stairs only

Side Entrance

* Ramp
* Good condition
* Verified

---

## Core User Flows

### Explore

Map
→ Search
→ Filter
→ Select Place
→ Place Preview
→ Place Detail
→ Access Point
→ Access Point Detail

### Contribution

Explore
→ Add Access Point
→ Login/Register if required
→ Add Access Point Form
→ Submit
→ Unverified Access Point

### Reporting

Access Point Detail
→ Report Incorrect Information
→ Report Form
→ Submit
→ Report Recorded

---

## Technology Stack

* Next.js
* TypeScript
* React
* Tailwind CSS
* Lucide React
* Mapbox GL JS
* Supabase
* Supabase Auth
* Supabase Storage where appropriate

Use the existing project stack whenever possible.

Do not introduce unnecessary frameworks or dependencies.

---

## Figma / UI Source of Truth

The existing Figma design is the visual source of truth.

Preserve the existing WAYIN visual language.

Do not redesign existing screens unless necessary for usability or functionality.

Do not replace working components with unrelated designs.

Prefer extending existing components over creating duplicate components.

---

## Design System

### Primary

* #172554
* #1E3A8A
* #1D4ED8
* #2563EB
* #3B82F6
* #DBEAFE
* #EFF6FF

### Success

* #15803D
* #16A34A
* #DCFCE7
* #F0FDF4

### Warning

* #B45309
* #D97706
* #FEF3C7
* #FFFBEB

### Error

* #B91C1C
* #DC2626
* #FEE2E2
* #FEF2F2

### Neutral

* #111827
* #1F2937
* #374151
* #4B5563
* #6B7286
* #9CA3AF
* #D1D5DB
* #E5E7EB
* #F3F4F6
* #F9FAFB
* #FFFFFF

Typography should remain consistent with the existing Figma implementation.

Use Lucide icons.

---

## Accessibility

The application itself must be accessible.

Rules:

* Do not communicate status through color alone.
* Use icons and text together.
* Maintain readable font sizes.
* Maintain visible focus states.
* Buttons and interactive controls should have appropriate accessible labels.
* Interactive targets should generally be around 44x44px where practical.
* Avoid unnecessary complexity.
* Mobile layouts must not horizontally overflow.

---

## Accessibility Data Semantics

Supported access point types:

* ramp
* elevator
* accessible_toilet
* accessible_parking
* accessible_entrance
* priority_seating

Condition:

* good
* fair
* poor

Availability:

* available
* unavailable
* unknown

Verification:

* verified
* unverified
* reported

IMPORTANT:

Unknown does NOT mean unavailable.

Missing information must be represented as unknown rather than inaccessible or unavailable.

---

## Recommended Access

WAYIN uses a deterministic scoring system to identify a recommended access point.

Current scoring:

* Ramp: +40
* No stairs: +30
* Good condition: +15
* Verified: +10
* Near accessible parking: +5

The highest suitable score is the recommended access point.

Do not introduce machine learning for this feature.

The algorithm should remain deterministic and understandable.

---

## Map

Mapbox GL JS is the map implementation.

Use:

NEXT_PUBLIC_MAPBOX_TOKEN

Never hardcode the Mapbox token.

WAYIN is responsible for:

* search
* filters
* place cards
* access point information
* accessibility status
* recommendations
* contribution UI

Mapbox is responsible for:

* map rendering
* pan
* zoom
* coordinates
* markers
* map interactions

If the Mapbox token is unavailable, the application should fail gracefully rather than crash.

---

## Backend

Supabase is the backend.

Use Supabase for:

* database
* authentication
* storage where appropriate

Primary data entities:

* profiles
* places
* access_points
* reports

Use environment variables for Supabase configuration.

Never expose service-role credentials in client-side code.

Do not hardcode credentials.

---

## Authentication

Use Supabase Auth for production/demo authentication.

Authentication is required for:

* Add Access Point
* Upload access point photo
* Report information
* Editing a user's own contribution

Public users may:

* browse the map
* search
* filter
* view places
* view access points
* view public accessibility information

Unauthenticated contribution attempts should redirect to login and preserve the intended destination when practical.

---

## Database Security

Use Row Level Security.

Public users should be able to read public place and access point information.

Authenticated users may create appropriate contributions and reports.

Users should only be able to modify their own user-owned records where applicable.

Do not disable RLS simply to make development easier.

Do not expose private user information.

---

## Photos

Access point photos are evidence.

Do not fabricate accessibility evidence.

Generic place imagery must not be presented as proof of a specific access point.

Use Supabase Storage when appropriate.

Photo upload should be optional for the basic contribution flow if storage is unavailable.

---

## Data Strategy

During development, mock data may be used as:

* fallback data
* development data
* seed/reference data

Primary application data should come from Supabase once backend integration is available.

Do not duplicate the same dataset across multiple components.

Keep reusable mock data in:

lib/mock-data.ts

---

## Error Handling

Important flows must have:

* loading states
* error states
* empty states
* success states

Handle gracefully:

* invalid place IDs
* invalid access point IDs
* missing database records
* Supabase errors
* authentication errors
* upload errors
* form validation errors
* missing Mapbox configuration
* empty search results
* missing access points

Do not leave blank screens.

---

## Responsive Design

Primary design targets:

Desktop:
1440x900

Mobile:
390x844

The application must:

* avoid horizontal overflow
* maintain usable controls
* stack cards appropriately
* keep forms usable
* maintain readable typography
* keep map controls accessible

---

## Code Quality

Prefer:

* small focused components
* reusable components
* typed data
* clear naming
* simple functions
* minimal duplication

Avoid:

* unnecessary abstraction
* giant components
* unnecessary dependencies
* duplicated mock data
* hardcoded credentials
* unexplained magic values

Do not rewrite working architecture without a reason.

---

## Development Strategy

Build incrementally.

Recommended order:

1. Stabilize existing Explore page.
2. Configure Supabase.
3. Configure authentication.
4. Connect places/access points to Supabase.
5. Implement Place Detail.
6. Implement Access Point Detail.
7. Implement Report.
8. Implement Add Access Point.
9. Implement photo upload where practical.
10. Seed realistic demo data.
11. Polish responsive/accessibility states.
12. Test complete user flows.
13. Run production build.

After significant changes, run:

npm.cmd run build

Fix TypeScript and build errors before continuing.

---

## Current MVP Scope

The current MVP includes:

* Explore map
* Mapbox
* Search
* Accessibility filters
* Place selection
* Place detail
* Accessibility profile
* Recommended access
* Access point detail
* Access point photos
* Verification status
* Report flow
* Add Access Point
* Authentication
* Registration
* Supabase database
* Supabase Auth
* Supabase Storage where practical
* Responsive UI
* Loading/error/empty/success states

---

## Explicitly Out of Scope

Do NOT implement unless specifically requested later:

* 3D Gaussian Splatting
* AI computer vision
* AI-based accessibility detection
* indoor turn-by-turn navigation
* complex accessibility routing
* machine learning recommendations
* social feed
* chat
* payments
* gamification
* complex admin dashboard
* unnecessary notification systems

Do not spend development time on these while core MVP functionality is incomplete.

---

## Important Agent Behavior

Before modifying the project:

1. Read this AGENTS.md.
2. Inspect the existing implementation.
3. Preserve working functionality.
4. Make the smallest reasonable changes required.
5. Test the result.
6. Run the production build.

Do not merely describe an implementation.

Actually modify the project.

Do not create a new Next.js project.

Do not restart the project.

Do not delete working files without a clear reason.

Do not delete this AGENTS.md.

If a requirement is ambiguous, prefer the existing implementation and Figma design over inventing a new pattern.

The goal is a coherent, usable hackathon MVP rather than maximum feature count.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
