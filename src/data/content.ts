/* ============================================================================
   YOUR DETAILS LIVE HERE.
   This is the only file you need to edit to make the site yours.
   Everything below is placeholder content — swap the strings and you're done.
   ========================================================================== */

export const person = {
  /** Small mark in the top-left of the nav, and the browser tab title. */
  wordmark: 'Ruwaid',
  /** Shown huge on the hero, uppercase. */
  name: 'Ruwaid',
  /**
   * Optional second word, rendered in the gradient italic serif beside the
   * name — a surname works best. Leave '' for a single-word hero.
   */
  nameAccent: '',
  /** Small mono label above the name. */
  tag: 'Software Developer',
  /** Rotating words in the hero sub-line. Keep them short. */
  roles: ['UI/UX', 'Web Development', 'Mobile Development', 'Analysis', 'Prompting'],
  /** One sentence. This is the hook. */
  headline: 'I build interfaces that feel like they have weight, memory, and a pulse.',
  location: 'Earth',
  availability: 'Open to select projects — 2026',
  email: 'ruwaid234@gmail.com',
  resumeUrl: '#',
  /** Browser tab title and the meta description search engines show. */
  pageTitle: 'Ruwaid — Software Developer',
  pageDescription:
    'Software developer — UI/UX, web and mobile development, analysis, and prompting.',
}

export type Project = {
  isPackage?: boolean
  isFlutterPackage?: boolean
  title: string
  year: string
  role: string
  blurb: string
  stack: string[]
  /** Any image URL or local path in /public. Leave '' for a generated gradient. */
  image: string
  href: string
  /** Accent hue in degrees (0–360) — drives the card's glow. */
  hue: number
}

export const projects: Project[] = [
  {
    isPackage: true,
    isFlutterPackage: false,
    title: 'React Status Tracker',
    year: '2026',
    role: 'Creator & Open Source Maintainer',
    blurb:
      'Engineered a reusable React UI library for visualizing multi-step workflows and progress states. Focused on performance, accessibility, developer experience, and composability, enabling teams to integrate production-ready status tracking with minimal effort.',
    stack: ['React', 'TypeScript', 'npm', 'Rollup', 'CSS Modules'],
    image: '',
    href: 'https://www.npmjs.com/package/react-status-tracker',
    hue: 205,
  },
  {
    isPackage: false,
    isFlutterPackage: false,
    title: 'MyExpense',
    year: '2026',
    role: 'Full-Stack Mobile Developer',
    blurb:
      'Designed and developed a cross-platform finance management application featuring expense tracking, investment management, budgeting, and financial insights. Focused on performance, intuitive user experience, and maintainable architecture to deliver a seamless personal finance solution.',
    stack: [
      'Flutter',
      'Dart',
      'SQLite',
      'Firebase',
      'Material Design',
    ],
    image: '',
    href: '#',
    hue: 145,
  },
  {
    isPackage: true,
    isFlutterPackage: false,
    title: 'React Status Pill',
    year: '2026',
    role: 'Creator & Open Source Maintainer',
    blurb:
      'Built and published a lightweight React component library for rendering customizable status badges and pills. Designed with TypeScript-first APIs, flexible theming, accessibility, and seamless integration into modern React applications.',
    stack: ['React', 'TypeScript', 'npm', 'Rollup', 'CSS Modules'],
    image: '',
    href: 'https://www.npmjs.com/package/react-status-pill',
    hue: 360,
  },
  {
    isPackage: true,
    isFlutterPackage: false,
    title: 'GlassGallery',
    year: '2026',
    role: 'Creator & Open Source Maintainer',
    blurb:
      'Built and published a glassmorphic React component library for rendering frosted-glass image galleries and carousels. Ships an Apple-style finish with backdrop blur and saturation, responsive grid and carousel modes, progress-pill indicators, flexible theming via CSS variables, accessibility, and zero runtime dependencies.',
    stack: ['React', 'TypeScript', 'npm', 'Vite', 'CSS'],
    image: '',
    href: 'https://www.npmjs.com/package/glass-gallery',
    hue: 260,
  },
  {
    isPackage: true,
    isFlutterPackage: false,
    title: 'react-request-logger',
    year: '2026',
    role: 'Creator & Open Source Maintainer',
    blurb:
      'Built and published a zero-dependency HTTP request logger for fetch and axios. Auto-logs method, url, status, request/response bodies and duration with secret redaction and body truncation. Streams entries to any database through a batched sink with retry and exponential backoff, ships ready-made MySQL, Postgres, HTTP and JSONL adapters with auto schema, exports to CSV/Excel, and includes an optional React <RequestLog> component with toolbar, card/table views, pagination and a detail modal.',
    stack: ['TypeScript', 'React', 'Vite', 'npm', 'CSS'],
    image: '',
    href: 'https://www.npmjs.com/package/react-request-logger',
    hue: 210,
  },
  {
    isPackage: true,
    isFlutterPackage: false,
    title: 'voice-nav-react',
    year: '2026',
    role: 'Creator & Open Source Maintainer',
    blurb:
      'Built and published a zero-dependency React component for voice navigation on the web. Speaks an elements accessible name to click, focus, or jump to it using the Web Speech API with graceful fallback. Matches names exactly how screen readers compute them (aria-label, aria-labelledby, labels, alt, title) with fuzzy matching, supports whole-page navigation, dictation into text fields, edit commands (clear, delete word, backspace, undo), ordinal selection ("click the second button"), scroll control, browser history, light/dark theming, and a floating live-transcript toggle bar.',
    stack: ['TypeScript', 'React', 'Vite', 'npm', 'CSS'],
    image: '',
    href: 'https://www.npmjs.com/package/voice-nav-react',
    hue: 320,
  },
  {
    isPackage: true,
    isFlutterPackage: true,
    title: 'carousel-banner',
    year: '2026',
    role: 'Creator & Open Source Maintainer',
    blurb:
      'Built and published a zero-dependency Flutter banner carousel on pub.dev. Infinitely looping slides, each with a color or image background and a mandatory title and subtitle anchored to the bottom over a gradient scrim. Autoplay with live progress in the active dot, swipe + dot navigation, optional tap callback, and a pluggable overlay between the text and background — all in a single file with no runtime dependencies.',
    stack: ['Dart', 'Flutter', 'pub.dev', 'Widget'],
    image: '',
    href: 'https://pub.dev/packages/carousel_banner',
    hue: 230,
  },
]


var PackageCount = projects.filter(project => project.isPackage).length;
var FlutterPackageCount = projects.filter(project => project.isFlutterPackage).length;
var ProjectCount = projects.filter(project => !project.isPackage && !project.isFlutterPackage).length;

export const about = {
  eyebrow: 'About',
  title: 'Engineering, but with taste.',
  body: [
    'I sit in the seam between design and engineering — close enough to the pixels to argue about easing curves, close enough to the metal to write the shader that draws them.',
    'For the last few years I have shipped production software for enterprise platforms, then gone home and written render loops for fun. This site is the second thing pretending to be the first.',
  ],
  /** Numbers that scroll-count up. */
  stats: [
    { value: PackageCount, suffix: '', label: 'NPM packages' },
    { value: FlutterPackageCount, suffix: '', label: 'Flutter packages' },
    { value: ProjectCount, suffix: '', label: 'Projects worked on' },
    { value: 2, suffix: '+', label: 'Experience' },
  ],
}


export const skills = [
  {
    group: 'Frontend',
    items: [
      'React',
      'TypeScript',
      'Angular',
      'Flutter',
      'Material UI',
      'PrimeNG',
    ],
  },
  {
    group: 'Backend',
    items: [
      'Python',
      'Django',
      'Django REST Framework',
      'Node.js',
      'REST APIs',
      'JWT Authentication',
    ],
  },
  {
    group: 'Database & Cloud',
    items: [
      'PostgreSQL',
      'MySQL',
      'Docker',
      'Git',
      'GitHub',
      'Multi-Tenant Architecture',
    ],
  },
  {
    group: 'Tools & Platforms',
    items: [
      'Mendix',
      'Jenkins',
      'npm',
      'Android Studio',
      'VS Code',
      'CI/CD',
      'Vercel',
      'Claude',


    ],
  },
]

/** Words that scroll sideways between sections. */
export const marquee = [
  'Building Digital Experiences',
  'Micro Animations',
  'Accessibility',
  'Open Source',
  'Automation',
  // 'Developer Experience',
  'Performance',
  'System Design',
  'Scalable Architecture',
  'API Design',
  'Responsive UI',
  'Motion Design',
  'Modern Web',
  'Cross-Platform',
  'UI/UX',
  'Web Development',
  'Mobile Development',
  'Analysis',
  'Prompting',
  'Hosting & Deployment',
]

export type Experience = {
  company: string
  role: string
  period: string
  detail: string
}

export const experience: Experience[] = [
  {
    company: 'RapidData Technologies',
    role: 'Software Engineer',
    period: '2023 — Present',
    detail:
      'Develop enterprise-grade applications using Mendix and modern web technologies. Delivered scalable solutions for government and enterprise clients by integrating REST/OData services, optimizing business workflows, and building reusable components with a strong focus on performance, maintainability, and user experience.',
  },
  {
    company: 'Open Source',
    role: 'Creator & Maintainer',
    period: '2026 — Present',
    detail:
      'Published and maintain React Status Tracker, an open-source npm package for building customizable workflow and progress tracking interfaces. Focused on developer experience, accessibility, reusable APIs, and modern TypeScript practices.',
  },
  {
    company: 'Independent Projects',
    role: 'Full-Stack Developer',
    period: '2024 — Present',
    detail:
      'Designed and developed full-stack web and mobile applications, including multi-tenant SaaS platforms, Flutter applications, and developer tooling. Experienced across React, Django, PostgreSQL, TypeScript, and REST API architecture.',
  },
  {
    company: 'Independent QA Projects',
    role: 'QA Tester & App/Game Tester',
    period: '2026 — Present',
    detail:
      'Independently tested mobile apps and games for developers, performing exploratory, functional, UI/UX, and regression testing. Identified and documented bugs with clear reproduction steps, severity, screenshots, and actionable feedback while collaborating directly with developers through independent testing projects.',
  },

]

export const socials = [
  {
    label: 'Instagram - UIUX',
    href: 'https://www.instagram.com/designexperiencewithme/'
  },
  {
    label: 'GitHub',
    href: 'https://github.com/I-ruwaid-I',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/mohamed-ruwaid/  ', // Update later
  },
  {
    label: 'IEEE Xplore',
    href: 'https://ieeexplore.ieee.org/document/11041000',
  },
  {
    label: 'npm',
    href: 'https://www.npmjs.com/~thedeadkind',
  },
  {
    label: 'pub.dev [Flutter packages]',
    href: 'https://pub.dev/publishers/ruwaid.in/packages',
  }


]

export type Photo = {
  src: string
  caption: string
  location: string
  date: string
  hue: number
}

export const photography = {
  eyebrow: 'Way of Life',
  title: 'Frames I have captured.',
  body: 'A selection of photographs — moments, light, and composition through my lens.',
  photos: [
    {
      src: '/assets/BNS.jpg',
      caption: 'One fine day, I will capture the perfect sunset.',
      location: 'CH,IN',
      date: '2026',
      hue: 285,
    },
  ] as Photo[],
}
