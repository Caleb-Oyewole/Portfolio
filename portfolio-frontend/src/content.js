// ---------------------------------------------------------------------------
// Content you can edit freely. Profile, GitHub projects and achievements come
// from your backend; the NICHES below are written here because the backend has
// no field for them. They are drafts based on your bio: make them yours.
// ---------------------------------------------------------------------------

// Only used if the backend has no profile yet or can't be reached.
export const fallbackProfile = {
  name: 'Oyewole Caleb',
  headline: 'CS Student & Full-Stack Developer',
  bio: 'Computer Engineer and Data Engineering specialist crafting scalable backend architectures, intelligent data pipelines, and full-stack web applications. Proficient in Python, FastAPI, Docker, Next.js, and modern JavaScript, with a strong track record of building AI-driven solutions and high-impact hackathon prototypes.',
  location: 'Ile-Ife, Nigeria',
  email: '',
  github_url: '',
  linkedin_url: '',
  photo_url: '/profile.jpg', // put your photo at portfolio-frontend/public/profile.jpg
  available: true,
  stats: [{ value: '25+', label: 'Projects' }],
}

export const fallbackSkills = ['Python', 'FastAPI', 'Docker', 'React', 'Next.js', 'JavaScript', 'Data Pipelines', 'REST APIs']

export const niches = [
  {
    id: 'backend',
    title: 'Backend Engineering',
    summary: 'Scalable, secure APIs and services that other people can build on.',
    points: [
      'REST APIs with FastAPI, validation and clean schemas',
      'Authentication, role-based access and rate limiting',
      'Email flows, background jobs and third-party integrations',
      'Containerised deployments with Docker',
    ],
    tools: ['Python', 'FastAPI', 'Docker', 'REST', 'JWT'],
  },
  {
    id: 'data',
    title: 'Data Engineering',
    summary: 'Turning heavy, messy data into pipelines and models you can trust.',
    points: [
      'Ingestion and transformation pipelines',
      'Data modelling for analytics and applications',
      'Repeatable jobs instead of one-off scripts',
    ],
    tools: ['Python', 'SQL', 'ETL', 'Pipelines'],
  },
  {
    id: 'ai',
    title: 'AI-Driven Solutions',
    summary: 'Practical AI features wired into real products, not just demos.',
    points: [
      'LLM-powered assistants and agents',
      'Chat-based products such as WhatsApp bots',
      'Fast, high-impact hackathon prototypes',
    ],
    tools: ['LLMs', 'Agents', 'Prompting', 'Python'],
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Web',
    summary: 'End-to-end web apps, from the database to the animation on screen.',
    points: [
      'React and Next.js frontends',
      'Accessible, modern JavaScript',
      'Frontend and backend deployed independently',
    ],
    tools: ['React', 'Next.js', 'JavaScript', 'Vite'],
  },
]
