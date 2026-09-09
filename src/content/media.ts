// Non-translated structural data: links, images, dates, tech stacks, numbers.
// Editing this file changes what shows on the site for BOTH languages at once.
// For the words that describe these things (labels, summaries, headlines),
// edit src/content/en.json and src/content/ar.json instead.

// `label` is the short screen name (e.g. "Due Today") shown as an eyebrow
// above `caption`, a longer explanatory line — both shown in the modal's
// slider as it advances, distinct from `alt` (a11y-only text). Like `alt`,
// they're kept in plain English rather than routed through en.json/ar.json:
// supplementary screenshot chrome, not core page copy.
export type CarouselItem = { image: string; alt: string; caption?: string; label?: string };

export type ProjectMedia = {
  id: string;
  year: string;
  // Absent for the rare project whose source can't be shared at all (client
  // confidentiality) — everything else here still has a real, readable repo.
  repo?: string;
  live?: string;
  image?: string;
  // Grid-tile crop anchor for `image`. "top" (the default) suits a tall
  // page screenshot, where the top is the most representative part; "center"
  // is for a screenshot where the real content sits away from the top edge
  // (e.g. a popup card floating in a mostly-empty window), so the crop lands
  // on the actual content instead of the dead space above it.
  imagePosition?: "top" | "center";
  gallery?: CarouselItem[];
  access: "public" | "internal";
  wide?: boolean;
  imageWidth?: number;
  imageHeight?: number;
  fallbackIcon?: "courses" | "extension";
  // Headline figure for projects with no screenshots — the tile composes this
  // into a designed typographic card instead of showing a lone icon on an
  // empty gradient. The words that describe it live in en.json / ar.json as
  // `statLabel`, since those need translating and this does not.
  statValue?: string;
  stack: string[];
};

const caption = (project: string, section: string) => `${project} — ${section}`;

const TASK_SYSTEM_GALLERY: CarouselItem[] = [
  { image: "/images/projects/task-system/dashboardPage.png", alt: caption("Task System", "Dashboard") },
  { image: "/images/projects/task-system/login.png", alt: caption("Task System", "Login") },
  {
    image: "/images/projects/task-system/Support-Ticket-publicLink.png",
    alt: caption("Task System", "Support Ticket — Public Link"),
  },
  {
    image: "/images/projects/task-system/Workspaces/list-workspaces.png",
    alt: caption("Workspaces", "List"),
  },
  {
    image: "/images/projects/task-system/Workspaces/workspace-details.png",
    alt: caption("Workspaces", "Details"),
  },
  {
    image: "/images/projects/task-system/Workspaces/create-edit-workspace.png",
    alt: caption("Workspaces", "Create / Edit"),
  },
  {
    image: "/images/projects/task-system/Workspaces/add-mamber-to-workspace.png",
    alt: caption("Workspaces", "Add Member"),
  },
  {
    image: "/images/projects/task-system/Workspaces/todo-details.png",
    alt: caption("Workspaces", "Todo Details"),
  },
  {
    image: "/images/projects/task-system/Workspaces/create-edit-todo.png",
    alt: caption("Workspaces", "Create / Edit Todo"),
  },
  {
    image: "/images/projects/task-system/project/projects.png",
    alt: caption("Projects", "List"),
  },
  {
    image: "/images/projects/task-system/project/grid-projects.png",
    alt: caption("Projects", "Grid View"),
  },
  {
    image: "/images/projects/task-system/project/create project.png",
    alt: caption("Projects", "Create"),
  },
  {
    image: "/images/projects/task-system/project/project details.png",
    alt: caption("Projects", "Details"),
  },
  {
    image: "/images/projects/task-system/project/kanban-project-page.png",
    alt: caption("Projects", "Kanban Board"),
  },
  {
    image: "/images/projects/task-system/tasks-page/list-tasks.png",
    alt: caption("Tasks", "List"),
  },
  {
    image: "/images/projects/task-system/tasks-page/list-grid-tasks.png",
    alt: caption("Tasks", "Grid View"),
  },
  {
    image: "/images/projects/task-system/tasks-page/create and edit task.png",
    alt: caption("Tasks", "Create / Edit"),
  },
  {
    image: "/images/projects/task-system/tasks-page/details-page.png",
    alt: caption("Tasks", "Details"),
  },
  {
    image: "/images/projects/task-system/tasks-page/details task with subtask form.png",
    alt: caption("Tasks", "Details with Subtasks"),
  },
  {
    image: "/images/projects/task-system/tasks-page/rate task page.png",
    alt: caption("Tasks", "Rate Task"),
  },
  {
    image: "/images/projects/task-system/rating/list-tasks-rating.png",
    alt: caption("Ratings", "List Tasks to Rate"),
  },
  {
    image: "/images/projects/task-system/rating/final-rating.png",
    alt: caption("Ratings", "Final Rating"),
  },
  {
    image: "/images/projects/task-system/rating-configuration/list-configurations.png",
    alt: caption("Rating Configuration", "List"),
  },
  {
    image: "/images/projects/task-system/rating-configuration/details-config.png",
    alt: caption("Rating Configuration", "Details"),
  },
  {
    image: "/images/projects/task-system/rating-configuration/create-edit-config-page.png",
    alt: caption("Rating Configuration", "Create / Edit"),
  },
  {
    image: "/images/projects/task-system/tickets/list-tickets.png",
    alt: caption("Tickets", "List"),
  },
  {
    image: "/images/projects/task-system/tickets/details-tickets.png",
    alt: caption("Tickets", "Details"),
  },
  {
    image: "/images/projects/task-system/tickets/create-edit-tickets.png",
    alt: caption("Tickets", "Create / Edit"),
  },
  {
    image: "/images/projects/task-system/Help-Requests/list-helps.png",
    alt: caption("Help Requests", "List"),
  },
  {
    image: "/images/projects/task-system/Help-Requests/details-help.png",
    alt: caption("Help Requests", "Details"),
  },
  {
    image: "/images/projects/task-system/Help-Requests/create-edit-help.png",
    alt: caption("Help Requests", "Create / Edit"),
  },
  {
    image: "/images/projects/task-system/Help-Requests/assign-user-to-help.png",
    alt: caption("Help Requests", "Assign User"),
  },
  {
    image: "/images/projects/task-system/clocking-in-out/Live-Dashboard.png",
    alt: caption("Clocking", "Live Dashboard"),
  },
  {
    image: "/images/projects/task-system/clocking-in-out/clock-in.png",
    alt: caption("Clocking", "Clock In"),
  },
  {
    image: "/images/projects/task-system/clocking-in-out/clock-out.png",
    alt: caption("Clocking", "Clock Out"),
  },
  {
    image: "/images/projects/task-system/clocking-in-out/start-break.png",
    alt: caption("Clocking", "Start Break"),
  },
  {
    image: "/images/projects/task-system/clocking-in-out/end-breal.png",
    alt: caption("Clocking", "End Break"),
  },
  {
    image: "/images/projects/task-system/clocking-in-out/clocking-record.png",
    alt: caption("Clocking", "Record"),
  },
  {
    image: "/images/projects/task-system/clocking-in-out/All-Records.png",
    alt: caption("Clocking", "All Records"),
  },
  {
    image: "/images/projects/task-system/clocking-in-out/Edit-Session.png",
    alt: caption("Clocking", "Edit Session"),
  },
  {
    image: "/images/projects/task-system/clocking-in-out/Correction-Request.png",
    alt: caption("Clocking", "Correction Request"),
  },
  {
    image: "/images/projects/task-system/clocking-in-out/Corrections.png",
    alt: caption("Clocking", "Corrections"),
  },
  {
    image: "/images/projects/task-system/role/list-role.png",
    alt: caption("Roles", "List"),
  },
  {
    image: "/images/projects/task-system/role/details-role.png",
    alt: caption("Roles", "Details"),
  },
  {
    image: "/images/projects/task-system/role/create-edite-role.png",
    alt: caption("Roles", "Create / Edit"),
  },
  {
    image: "/images/projects/task-system/users/users.png",
    alt: caption("Users", "List"),
  },
  {
    image: "/images/projects/task-system/users/list-user-as-grid.png",
    alt: caption("Users", "Grid View"),
  },
  {
    image: "/images/projects/task-system/users/details-user.png",
    alt: caption("Users", "Details"),
  },
  {
    image: "/images/projects/task-system/users/edit-creat-user.png",
    alt: caption("Users", "Create / Edit"),
  },
  {
    image: "/images/projects/task-system/users/delete.png",
    alt: caption("Users", "Delete Confirmation"),
  },
];

const WEB2API_GALLERY: CarouselItem[] = [
  { image: "/images/projects/ai/ai-dashboard.png", alt: caption("Web2API", "Welcome") },
  { image: "/images/projects/ai/chat-page.png", alt: caption("Web2API", "Chat") },
  { image: "/images/projects/ai/admin-ai-dashboard.png", alt: caption("Web2API", "Admin Dashboard") },
  { image: "/images/projects/ai/list-agent.png", alt: caption("Agents", "List") },
  { image: "/images/projects/ai/create-edit-agent.png", alt: caption("Agents", "Create / Edit") },
  { image: "/images/projects/ai/Agent-Details.png", alt: caption("Agents", "Details") },
  { image: "/images/projects/ai/create-edit-widget.png", alt: caption("Widgets", "Create / Edit") },
  { image: "/images/projects/ai/Embed-Widgets.png", alt: caption("Widgets", "Embed") },
  { image: "/images/projects/ai/Live-preview-widget.png", alt: caption("Widgets", "Live Preview") },
  { image: "/images/projects/ai/list-user.png", alt: caption("Admin", "User List") },
  {
    image: "/images/projects/ai/Connect-Gemini-popup.png",
    alt: caption("Lumina Connector", "Connect Gemini Popup"),
  },
  { image: "/images/projects/ai/extention.png", alt: caption("Lumina Connector", "Browser Extension") },
];

const PIZZA_DASHBOARD_GALLERY: CarouselItem[] = [
  {
    image: "/images/projects/pizza-dashboard/break-timer-1.png",
    alt: caption("Break Timer", "Start"),
    label: "Break Timer",
    caption:
      "Staff clock their breaks into one running daily total, with a configurable alert threshold instead of tracking each break separately.",
  },
  {
    image: "/images/projects/pizza-dashboard/break-timer-2.png",
    alt: caption("Break Timer", "On Break"),
    label: "Break Timer",
    caption: "The active timer counts up live, with a one-tap reset and an editable alert minute-mark.",
  },
  {
    image: "/images/projects/pizza-dashboard/due-today.png",
    alt: caption("Cleaning Chart", "Due Today"),
    label: "Due Today",
    caption:
      "The daily checklist for one store — every cleaning task with its status, weight, and frequency, filterable by Pending/Done/Overdue with live counts.",
  },
  {
    image: "/images/projects/pizza-dashboard/tasks.png",
    alt: caption("Cleaning Chart", "Task Templates"),
    label: "Task Templates",
    caption:
      "The master template list cleaning specialists use to define every task company-wide — name, frequency, weight, and photo requirement — which then ripples into Due Today and Evaluation.",
  },
  {
    image: "/images/projects/pizza-dashboard/evaluation.png",
    alt: caption("Cleaning Chart", "Evaluation"),
    label: "Evaluation",
    caption:
      "The core grading workspace — inspection items and the cleaning chart graded per store per period, with a live progress banner and a Finalize step to lock scores in.",
  },
  {
    image: "/images/projects/pizza-dashboard/reports.png",
    alt: caption("Cleaning Chart", "Reports"),
    label: "Reports",
    caption:
      "A read-only, ranked leaderboard of every store's score for the period, exportable as CSV or a themed PNG image.",
  },
  {
    image: "/images/projects/pizza-dashboard/my-store.png",
    alt: caption("Cleaning Chart", "My Store"),
    label: "My Store",
    caption:
      "A store manager's read-only view of their own scores — the same breakdown as Evaluation, without any grading controls.",
  },
  {
    image: "/images/projects/pizza-dashboard/units.png",
    alt: caption("Inventory", "Units"),
    label: "Units",
    caption:
      "The base measurement vocabulary — case, box, LB, and so on — that every inventory item's unit-conversion chain is built from.",
  },
  {
    image: "/images/projects/pizza-dashboard/items.png",
    alt: caption("Inventory", "Items"),
    label: "Items",
    caption:
      "The product catalog, each item with an image, a unit-conversion chain (case → box → LB), a counting-cycle type, and a store scope.",
  },
  {
    image: "/images/projects/pizza-dashboard/links.png",
    alt: caption("Inventory", "Links"),
    label: "Links",
    caption: "Generates single-use, employee-specific counting links — no login needed to submit a count.",
  },
  {
    image: "/images/projects/pizza-dashboard/entries.png",
    alt: caption("Inventory", "Entries"),
    label: "Entries",
    caption: "The historical record of every submitted count, with edit history preserved rather than overwritten.",
  },
];

const LUMINA_GALLERY: CarouselItem[] = [
  { image: "/images/projects/extention/extention.png", alt: caption("Lumina Connector", "Browser Extension") },
  {
    image: "/images/projects/extention/Connect-Gemini-popup.png",
    alt: caption("Lumina Connector", "Connect Gemini Popup"),
  },
];

// Keyed by the same `id` used in en.json / ar.json's projects.items — that is
// how a project's words and its media/links are joined back together.
export const PROJECTS_MEDIA: Record<string, ProjectMedia> = {
  ftt: {
    id: "ftt",
    year: "2026",
    repo: "https://github.com/naya2matter/ftt-website",
    live: "https://ftt-website.vercel.app",
    image: "/images/projects/ftt-website.png",
    imageWidth: 1600,
    imageHeight: 9325,
    access: "public",
    wide: true,
    stack: ["Next.js", "TypeScript", "Tailwind", "Radix UI", "TanStack Table", "Zustand", "Zod"],
  },
  cvg: {
    id: "cvg",
    year: "2026",
    repo: "https://github.com/naya2matter/cvg-website",
    live: "https://cvg.construction/",
    image: "/images/projects/cvg-construction.png",
    imageWidth: 1600,
    imageHeight: 5469,
    access: "public",
    stack: ["Next.js", "TypeScript", "Tailwind", "GSAP", "Framer Motion", "Zustand"],
  },
  inventory: {
    id: "inventory",
    year: "2026",
    repo: "https://github.com/naya2matter/inventory",
    live: "https://inventory-ochre-five.vercel.app",
    image: "/images/projects/inventory.png",
    imageWidth: 1600,
    imageHeight: 1683,
    access: "public",
    stack: ["React", "TypeScript", "Vite", "Tailwind", "TanStack Table", "Recharts", "dnd-kit"],
  },
  "task-system": {
    id: "task-system",
    year: "2026",
    repo: "https://github.com/naya2matter/task-system",
    // The dashboard's own cover (dashboardPage.png) is mostly zero-state
    // placeholders (seeded demo with no activity yet) — the kanban board
    // actually shows populated cards, so it reads as a real, used app.
    image: "/images/projects/task-system/project/kanban-project-page.png",
    gallery: TASK_SYSTEM_GALLERY,
    access: "internal",
    stack: ["React", "TypeScript", "Vite", "Tailwind", "dnd-kit", "Laravel Echo", "Pusher", "Zustand"],
  },
  courses: {
    id: "courses",
    year: "2026",
    repo: "https://github.com/naya2matter/courses",
    access: "internal",
    fallbackIcon: "courses",
    statValue: "~500",
    stack: ["React", "TypeScript", "Vite", "Tailwind", "TanStack Table", "TinyMCE", "react-pdf", "Zustand"],
  },
  "web2api-ui": {
    id: "web2api-ui",
    year: "2026",
    repo: "https://github.com/naya2matter/web2api-ui",
    live: "https://ai.lcportal.cloud/",
    image: "/images/projects/ai/ai-dashboard.png",
    gallery: WEB2API_GALLERY,
    access: "internal",
    wide: true,
    stack: ["React", "TypeScript", "Vite", "AI SDK", "Streamdown", "React Flow", "Shiki", "Rive"],
  },
  "lumina-connector": {
    id: "lumina-connector",
    year: "2026",
    repo: "https://github.com/naya2matter/lumina-extension",
    // The popup card sits mid-frame in a mostly-empty window — cropping
    // from the top would land on that dead space above it instead.
    image: "/images/projects/extention/extention.png",
    imagePosition: "center",
    gallery: LUMINA_GALLERY,
    access: "internal",
    stack: ["JavaScript", "Chrome MV3", "Go", "Node scripts"],
  },
  "pizza-dashboard": {
    id: "pizza-dashboard",
    year: "2026",
    // No repo link — the client's confidentiality means only screenshots
    // are shareable here, not the source.
    image: "/images/projects/pizza-dashboard/due-today.png",
    gallery: PIZZA_DASHBOARD_GALLERY,
    access: "internal",
    wide: true,
    stack: ["Next.js", "TypeScript", "Tailwind", "Radix UI", "Zustand", "ApexCharts", "next-intl", "react-hook-form"],
  },
};

// Order the grid renders in — en.json / ar.json don't need to agree on key
// order for this to stay stable.
export const PROJECT_ORDER = [
  "ftt",
  "cvg",
  "inventory",
  "task-system",
  "pizza-dashboard",
  "courses",
  "web2api-ui",
  "lumina-connector",
];

export type ExperienceMedia = {
  id: string;
  kind: "work" | "education";
  // The date RANGE is translated prose (Arabic uses Levantine month names and
  // Arabic-Indic digits), so it lives in en.json / ar.json with the rest of
  // the words. `year` is just the watermark numeral behind the card.
  year: string;
  current?: boolean;
};

export const EXPERIENCE_MEDIA: ExperienceMedia[] = [
  { id: "nvt", kind: "work", year: "2026", current: true },
  { id: "vica", kind: "work", year: "2024" },
  { id: "damascus-university", kind: "education", year: "2019" },
];

export const SITE_LINKS = {
  github: "https://github.com/naya2matter",
  email: "nayamatternaya@gmail.com",
  phoneDisplay: "+963 981 401 383",
  whatsappNumber: "963981401383",
  telegramHandle: "nayamatter",
  cv: "/cv/naya-matter-cv.pdf",
};

// The name the browser saves the CV under, independent of the path it is
// served from — so replacing the file in public/cv doesn't change what
// lands in someone's Downloads folder.
export const CV_FILENAME = "Naya-Matter-CV.pdf";
