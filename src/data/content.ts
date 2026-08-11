/* ============================================================================
   YOUR DETAILS LIVE HERE.
   This is the only file you need to edit to make the site yours.
   Everything below is placeholder content — swap the strings and you're done.
   ========================================================================== */

export const person = {
  /** Small mark in the top-left of the nav, and the browser tab title. */
  wordmark: 'Dhanush',
  /** Shown huge on the hero, uppercase. */
  name: 'Dhanush',
  /**
   * Optional second word, rendered in the gradient italic serif beside the
   * name — a surname works best. Leave '' for a single-word hero.
   */
  nameAccent: '',
  /** Small mono label above the name. */
  tag: 'React Native Developer | Software Engineer',
  /** Rotating words in the hero sub-line. Keep them short. */
  roles: ['React Native', 'iOS & Android', 'State Management', 'API Integration', 'System Design'],
  /** One sentence. This is the hook. */
  headline: 'I build scalable, high-performance cross-platform mobile applications for Android and iOS.',
  location: 'Chennai, India',
  availability: 'Open to select opportunities — 2026',
  email: 'dhanush8939s@gmail.com',
  resumeUrl: '#',
  /** Browser tab title and the meta description search engines show. */
  pageTitle: 'Dhanush Kumar S — Portfolio',
  pageDescription:
    'React Native Developer & Software Engineer with 4+ years of experience building scalable, high-performance cross-platform mobile applications.',
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
    isPackage: false,
    isFlutterPackage: false,
    title: 'Ajman One',
    year: '2025 – Present',
    role: 'React Native Developer & System Designer',
    blurb:
      'Contributed to the development of 50+ digital services for Ajman Ports & Customs within Ajman One (government mobile app). Integrated HAJT E-Payment Gateway and architected config-driven component layouts using the Strategy pattern.',
    stack: ['React Native', 'System Design', 'Custom Hooks', 'Axios', 'E-Payment Gateway'],
    image: '',
    href: '#',
    hue: 205,
  },
  {
    isPackage: false,
    isFlutterPackage: false,
    title: 'RapidHR',
    year: '2022 – Present',
    role: 'React Native Developer',
    blurb:
      'Developed a comprehensive HR platform for workforce management. Engineered an offline-first synchronization layer using AsyncStorage with FIFO queuing, plus features like shift rostering, geo-tracking/geo-fencing, and Microsoft SSO.',
    stack: ['React Native', 'Firebase', 'Native Modules', 'AsyncStorage', 'SignalR', 'SSO'],
    image: '',
    href: '#',
    hue: 145,
  },
  {
    isPackage: false,
    isFlutterPackage: false,
    title: 'RapidATS',
    year: '2024 – 2025',
    role: 'React Native Developer',
    blurb:
      'Built a scalable Applicant Tracking System to streamline recruitment. Integrated AI-based resume parsing, skill extraction, custom interview pipelines, role-based access control (RBAC), and dashboards for recruitment analytics.',
    stack: ['React Native', 'TypeScript', 'REST APIs', 'RBAC', 'AI Integration'],
    image: '',
    href: '#',
    hue: 360,
  },
  {
    isPackage: false,
    isFlutterPackage: false,
    title: 'Erada HRMS',
    year: '2025 – Present',
    role: 'React Native Developer',
    blurb:
      'Customized and deployed the RapidHR platform for Erada Center for Treatment and Rehabilitation (UAE), tailoring business workflows and UI components to meet specific healthcare regulatory requirements.',
    stack: ['React Native', 'REST API', 'UI Customization', 'Performance Optimization'],
    image: '',
    href: '#',
    hue: 260,
  },
]

export const about = {
  eyebrow: 'About',
  title: 'Engineering, but with taste.',
  body: [
    'I am a React Native Developer & Software Engineer based in Chennai, India, with a passion for crafting fluid, native-quality user interfaces for both Android and iOS platforms.',
    'Over the last 4+ years, I have architected and delivered enterprise-grade HRMS, ATS, and Government applications—focusing on scalable component architectures, secure auth systems, and offline-first data synchronization.',
  ],
  /** Numbers that scroll-count up. */
  stats: [
    { value: 4, suffix: '+', label: 'Years of Experience' },
    { value: 4, suffix: '', label: 'Major Projects' },
    { value: 50, suffix: '+', label: 'Digital Services Dev' },
    { value: 2, suffix: '', label: 'Platforms (iOS/Android)' },
  ],
}

export const skills = [
  {
    group: 'Languages & Frameworks',
    items: [
      'TypeScript',
      'JavaScript (ES6+)',
      'React Native',
      'React Hooks',
      'Redux',
    ],
  },
  {
    group: 'Architecture & State',
    items: [
      'Component-based Architecture',
      'Context API',
      'Custom Hooks',
      'State Management',
    ],
  },
  {
    group: 'APIs & Realtime',
    items: [
      'REST API Integration',
      'Axios & Interceptors',
      'Firebase',
      'SignalR',
      'WebSockets',
    ],
  },
  {
    group: 'Mobile & Developer Tools',
    items: [
      'Android Development',
      'Native Modules & Bridge',
      'Push Notifications',
      'JWT / Role-Based Access Control',
      'VS Code / Xcode / Android Studio',
      'Postman / Git',
    ],
  },
]

/** Words that scroll sideways between sections. */
export const marquee = [
  'React Native',
  'iOS & Android',
  'Cross-Platform',
  'Mobile Architecture',
  'Performance Optimization',
  'Offline-First Sync',
  'API Integration',
  'Realtime Apps',
  'Custom Native Modules',
  'State Management',
  'Interactive UI',
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
    period: 'Jul 2022 — Present',
    detail:
      'Architect and build high-performance, cross-platform React Native applications for iOS and Android. Design responsive interfaces, integrate secure REST APIs with custom Axios interceptors, implement custom native modules, and deliver production-ready HRMS, ATS, and government applications.',
  },
  {
    company: 'Dhanalakshmi Srinivasan College of Engineering & Technology',
    role: 'Bachelor of Engineering in Computer Science',
    period: 'Aug 2017 — Sep 2021',
    detail:
      'Completed a Bachelor of Engineering degree in Computer Science, building solid fundamentals in software engineering, data structures, and algorithms.',
  },
]

export const socials = [
  {
    label: 'GitHub',
    href: 'https://github.com',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
  },
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
