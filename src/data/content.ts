/* ============================================================================
   ALL PORTFOLIO CONTENT LIVES HERE.
   Sections read from this file, so most updates are string edits.
   ========================================================================== */

export const person = {
  /** Small mark in the top-left of the nav. */
  wordmark: 'Dhanush',
  /** Shown huge on the hero, uppercase. */
  name: 'Dhanush',
  /** Rendered in the gradient italic serif beside the name. */
  nameAccent: '',
  /** Small mono label above the name. */
  tag: 'Mobile Application Developer',
  /** Rotating words in the hero sub-line. Keep them short. */
  roles: ['React Native', 'iOS & Android', 'Real-time Apps', 'Native Modules', 'System Design'],
  /** One sentence. This is the hook. */
  headline:
    'I build interfaces that feel like they have weight, memory, and a pulse.',
  /** Smaller supporting line under the headline. */
  headlineSub:
    'Fusing tactile motion design, clean software engineering, and production performance to deliver memorable digital experiences.',
  /** Small chips under the hero headline. */
  stack: ['React Native', 'iOS', 'Android', 'TypeScript', 'Firebase', 'Redux'],
  location: 'Chennai, India',
  availability: 'Open for mobile application development',
  email: 'dhanush8939s@gmail.com',
  phone: '+91 91235 03662',
  phoneHref: 'tel:+919123503662',
  status: 'Open to new roles & independent projects — 2026',
  timezone: 'IST [UTC+5:30]',
  contactPitch:
    'Hiring for a React Native or full-stack role, or need a product built end to end — from API to app store? My inbox is open.',
  resumeUrl: '/Dhanush_Kumar_RN.pdf',
  /** Browser tab title and the meta description search engines show. */
  pageTitle: 'Dhanush — Mobile Application Developer (React Native)',
  pageDescription:
    'Mobile application developer with 4+ years building reliable React Native apps for Android and iOS — HRMS, recruitment and government platforms. Open for mobile application development.',
}

export type Project = {
  title: string
  /** 'independent' = live client sites; 'professional' = shipped at RapidData. */
  category: 'independent' | 'professional'
  year: string
  role: string
  blurb: string
  stack: string[]
  /** Local path in /public or a URL. Leave '' for no thumbnail. */
  image: string
  /** Live site URL. Leave '' for projects with no public link. */
  href: string
  /** Accent hue in degrees (0–360) — drives the card's glow. */
  hue: number
}

export const projects: Project[] = [
  {
    title: 'Elite Startup School',
    category: 'independent',
    year: '2026 – Present',
    role: 'Team Lead & Full-Stack Developer',
    blurb:
      'Full-stack platform for a Chennai entrepreneurship school: a Next.js 14 site (programs, campus, events, blog, funding-pitch and admissions forms) with an admin dashboard, backed by a TypeScript Express REST API on Supabase — JWT auth, Zod validation, rate limiting, CSV export and Swagger docs.',
    stack: ['Next.js 14', 'React', 'TypeScript', 'Tailwind', 'Express.js', 'Supabase', 'JWT', 'Zod'],
    image: '',
    href: 'https://www.elitestartupschool.com/',
    hue: 28,
  },
  {
    title: 'TiruVeedu',
    category: 'independent',
    year: '2026 – Present',
    role: 'Team Lead & Full-Stack Developer',
    blurb:
      'Local directory for Tiruvannamalai with 600+ listings across stays, transport, restaurants and services. A bilingual (English + Tamil) installable React app on Supabase — Postgres with row-level security, edge functions, map-based listings, admin tools and OTP sign-in — deployed on Netlify.',
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind', 'Supabase', 'Edge Functions', 'Leaflet', 'Netlify'],
    image: '',
    href: 'https://tiruveedu.com/',
    hue: 262,
  },
  {
    title: 'Ajman One',
    category: 'professional',
    year: '2025 – Present',
    role: 'React Native Developer & System Designer',
    blurb:
      'Delivered 50+ digital services for Ajman Ports & Customs inside the Ajman One government app. Integrated the HAJT E-Payment Gateway and designed a config-driven UI (Strategy pattern) plus a payment workflow built on a custom hook, Facade, state machine and Builder pattern.',
    stack: ['React Native', 'System Design', 'Strategy', 'Facade', 'State Machine', 'Axios'],
    image: '',
    href: '',
    hue: 205,
  },
  {
    title: 'RapidHR',
    category: 'professional',
    year: 'Nov 2022 – Present',
    role: 'React Native Developer',
    blurb:
      'Enterprise HR platform for attendance, approvals, shift rostering, LMS, help desk and chat. Built a resilient attendance sync (AsyncStorage + FIFO queue), geo-fencing via custom native modules, Microsoft SSO and multi-tenant client setup.',
    stack: ['React Native', 'Firebase', 'Native Modules', 'SignalR', 'Microsoft SSO'],
    image: '',
    href: '',
    hue: 145,
  },
  {
    title: 'RapidATS',
    category: 'professional',
    year: '2024 – 2025',
    role: 'React Native Developer',
    blurb:
      'Applicant tracking system covering job posting, interview pipelines, offer letters and a candidate portal. Added AI resume parsing and skill extraction, role-based access control and hiring-funnel dashboards.',
    stack: ['React Native', 'TypeScript', 'REST APIs', 'RBAC', 'AI Integration'],
    image: '',
    href: '',
    hue: 350,
  },
  {
    title: 'Erada HRMS',
    category: 'professional',
    year: '2025 – Present',
    role: 'React Native Developer',
    blurb:
      'Customised and deployed RapidHR for the Erada Center for Treatment and Rehabilitation (UAE), adapting workflows and UI to healthcare requirements while keeping performance and stability.',
    stack: ['React Native', 'REST API', 'UI Customisation', 'Performance'],
    image: '',
    href: '',
    hue: 285,
  },
]

export const about = {
  eyebrow: 'About',
  title: 'Engineering, but with taste.',
  body: [
    'I engineer digital experiences with **precision, performance, and purpose.**',
    'With 4+ years in **React Native**, I build reliable **Android and iOS** applications — from HRMS workflows that keep running on poor networks to government digital services. My focus is **scalable architecture**, **native integrations**, **real-time systems**, and seamless user experiences.',
    'Beyond mobile, I build full-stack products with **React, Next.js, Node.js, and Supabase**, turning complex requirements into maintainable, production-ready software.',
  ],
  /** Numbers that scroll-count up. */
  stats: [
    { value: 4, suffix: '+', label: 'Years of Experience' },
    { value: 1000, suffix: '+', label: 'Users Served' },
    { value: 10, suffix: '+', label: 'Client Organisations' },
    { value: 2, suffix: '', label: 'Live Products Led' },
  ],
  /** Quick status rows under the stats. */
  now: [
    { label: 'Now', value: 'Leading two live products as team lead' },
    { label: 'Learning', value: 'Node.js, Next.js and AI / LLM apps' },
    { label: 'Open to', value: 'React Native · Full-stack · Team lead roles' },
  ],
  /** What a recruiter or client gets. */
  pillars: [
    {
      title: 'Ship reliably',
      text: 'Reliable data sync and real-time updates that keep working on bad networks, proven with 1,000+ users.',
    },
    {
      title: 'Build to scale',
      text: 'Clean architecture (Strategy, Facade, State Machine) so a growing codebase stays easy to change.',
    },
    {
      title: 'Own it end to end',
      text: 'API, database, mobile and web. I lead delivery from the first sketch to the production release.',
    },
  ],
}

export type Capability = {
  title: string
  blurb: string
  /** Three short words shown top-right of the card. */
  tagline: [string, string, string]
  icon: 'mobile' | 'server' | 'cloud' | 'layers'
  /** Accent hue in degrees (0-360). */
  hue: number
  items: string[]
}

export const capabilities: Capability[] = [
  {
    title: 'Mobile & Frontend',
    blurb: 'Fast, native-feeling apps and responsive web interfaces.',
    tagline: ['Build', 'Beautiful', 'Interfaces'],
    icon: 'mobile',
    hue: 190,
    items: ['React Native (Android & iOS)', 'Expo', 'Native Modules & Bridge', 'Push Notifications', 'React & Next.js', 'TypeScript', 'Redux / Context API', 'Tailwind CSS'],
  },
  {
    title: 'Backend & APIs',
    blurb: 'Secure, documented APIs and real-time services.',
    tagline: ['Build', 'Scalable', 'Systems'],
    icon: 'server',
    hue: 250,
    items: ['Node.js', 'Express.js', 'REST APIs', 'Axios & Interceptors', 'JWT & RBAC', 'Microsoft SSO', 'SignalR / WebSockets', 'Zod & Swagger'],
  },
  {
    title: 'Data & Cloud',
    blurb: 'Reliable data, auth and storage, shipped to production.',
    tagline: ['Store', 'Sync', 'Deploy'],
    icon: 'cloud',
    hue: 160,
    items: ['Supabase / PostgreSQL', 'Firebase', 'Edge Functions', 'Background data sync', 'Vercel & Netlify', 'Google Play Console'],
  },
  {
    title: 'Architecture & Tools',
    blurb: 'Patterns that keep big codebases easy to change.',
    tagline: ['Design', 'Test', 'Ship'],
    icon: 'layers',
    hue: 300,
    items: ['Strategy / Facade / Builder', 'State machines', 'Custom hooks & reusable components', 'List & network optimisation', 'Git & Postman', 'Android Studio & Xcode', 'VS Code & Mendix'],
  },
]

/** Words that scroll sideways between sections. */
export const marquee = [
  'React Native',
  'iOS & Android',
  'Background Sync',
  'Geo-Fencing',
  'Real-time Apps',
  'Microsoft SSO',
  'Custom Native Modules',
  'State Machines',
  'Design Patterns',
  'Performance Optimisation',
]

export type Experience = {
  company: string
  role: string
  period: string
  detail: string
  kind?: 'work' | 'education' | 'independent'
}

export const experience: Experience[] = [
  {
    company: 'Independent Projects',
    role: 'Team Lead & Full-Stack Developer — Elite Startup School & TiruVeedu',
    period: '2026 — Present',
    detail:
      'Building live full-stack products with React/Next.js frontends, an Express + Supabase REST API and Supabase edge functions, shipped to Vercel and Netlify for an entrepreneurship school in Chennai and a Tiruvannamalai local-services directory.',
    kind: 'independent',
  },
  {
    company: 'RapidData Technologies',
    role: 'Software Engineer · Chennai',
    period: 'Jul 2022 — Sep 2026',
    detail:
      'Owned React Native features end to end — API integration, testing and production release — across HRMS, ATS and government apps. Built reusable components and custom hooks, background sync, geo-fencing, real-time chat, Microsoft SSO and RBAC, and tuned performance on Android and iOS for 1,000+ users across 10+ client organisations.',
    kind: 'work',
  },
  {
    company: 'Kovaion Consulting',
    role: 'Full Stack Developer (Internship) · Chennai',
    period: 'Jan 2022 — May 2022',
    detail:
      'Five-month full-stack internship working with JavaScript and Firebase — my first professional step before moving into React Native at RapidData.',
    kind: 'work',
  },
  {
    company: 'Dhanalakshmi Srinivasan College of Engineering & Technology',
    role: 'B.E. Computer Science · Chennai',
    period: 'Aug 2017 — Sep 2021',
    detail:
      'Web and mobile mini-projects built around real-world use cases, using version control, modular design and testing in team settings.',
    kind: 'education',
  },
]

export const socials = [
  {
    label: 'GitHub',
    href: 'https://github.com/dhanush20s',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/dhanush-kumar-64a5a3227/',
  },
]
