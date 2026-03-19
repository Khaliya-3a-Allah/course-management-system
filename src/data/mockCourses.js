export const mockCourses = [
  {
    id: "c1",
    title: "React from Zero to Hero",
    category: "Development",
    level: "Beginner",
    instructorName: "Sarah Chen",
    description:
      "A comprehensive introduction to React — components, hooks, routing, and state management. You will build three full projects by the end of this course.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80",
    rating: 4.8,
    tags: ["React", "JavaScript", "Frontend"],
    modules: [
      {
        id: "m1",
        title: "Getting Started",
        courseId: "c1",
        lessons: [
          { id: "l1", title: "What is React?", moduleId: "m1", duration: "8 min", contentPreview: "React is a JavaScript library for building user interfaces. We'll explore why it exists and how it differs from vanilla JS.", videoUrl: "" },
          { id: "l2", title: "Setting up Vite", moduleId: "m1", duration: "12 min", contentPreview: "We use Vite as our build tool. It's faster than Create React App and gives you a cleaner dev experience.", videoUrl: "" },
        ],
      },
      {
        id: "m2",
        title: "Components & Props",
        courseId: "c1",
        lessons: [
          { id: "l3", title: "Functional Components", moduleId: "m2", duration: "15 min", contentPreview: "Everything in React is a component. We'll build our first reusable UI block.", videoUrl: "" },
          { id: "l4", title: "Passing Props", moduleId: "m2", duration: "10 min", contentPreview: "Props let you pass data into components. Think of them as function arguments.", videoUrl: "" },
        ],
      },
    ],
  },
  {
    id: "c2",
    title: "Advanced CSS & Animation",
    category: "Design",
    level: "Intermediate",
    instructorName: "Marcus Webb",
    description:
      "Go beyond basic styling. Master CSS Grid, custom properties, keyframe animations, scroll-driven effects, and responsive design systems.",
    thumbnail: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=600&q=80",
    rating: 4.6,
    tags: ["CSS", "Animation", "Design"],
    modules: [
      {
        id: "m3",
        title: "CSS Grid Mastery",
        courseId: "c2",
        lessons: [
          { id: "l5", title: "Grid Fundamentals", moduleId: "m3", duration: "14 min", contentPreview: "CSS Grid is a two-dimensional layout system. We'll cover rows, columns, and grid areas.", videoUrl: "" },
          { id: "l6", title: "Auto-fill vs Auto-fit", moduleId: "m3", duration: "9 min", contentPreview: "Understanding the difference between auto-fill and auto-fit is key to responsive grid layouts.", videoUrl: "" },
        ],
      },
    ],
  },
  {
    id: "c3",
    title: "Node.js & REST APIs",
    category: "Backend",
    level: "Intermediate",
    instructorName: "Priya Nair",
    description:
      "Build scalable REST APIs with Node.js and Express. Covers routing, middleware, authentication with JWT, and connecting to databases.",
    thumbnail: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=600&q=80",
    rating: 4.7,
    tags: ["Node.js", "Express", "API", "Backend"],
    modules: [
      {
        id: "m4",
        title: "Express Basics",
        courseId: "c3",
        lessons: [
          { id: "l7", title: "Setting Up Express", moduleId: "m4", duration: "11 min", contentPreview: "Express is a minimal web framework for Node. We'll set up our first server in minutes.", videoUrl: "" },
        ],
      },
    ],
  },
  {
    id: "c4",
    title: "UI/UX Design Fundamentals",
    category: "Design",
    level: "Beginner",
    instructorName: "Lena Hoffman",
    description:
      "Learn the principles behind great user interfaces — typography, color theory, spacing, hierarchy, and how to prototype in Figma.",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
    rating: 4.5,
    tags: ["UI", "UX", "Figma", "Design"],
    modules: [
      {
        id: "m5",
        title: "Design Principles",
        courseId: "c4",
        lessons: [
          { id: "l8", title: "Typography Basics", moduleId: "m5", duration: "13 min", contentPreview: "Choosing the right typeface can make or break a design. We'll look at font pairings and hierarchy.", videoUrl: "" },
          { id: "l9", title: "Color Theory", moduleId: "m5", duration: "16 min", contentPreview: "Understanding hue, saturation, and value — and how to build a cohesive color palette.", videoUrl: "" },
        ],
      },
    ],
  },
  {
    id: "c5",
    title: "Python for Data Analysis",
    category: "Data Science",
    level: "Beginner",
    instructorName: "James Okafor",
    description:
      "Start your data science journey with Python. Covers pandas, numpy, matplotlib, and real-world data cleaning and visualization projects.",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
    rating: 4.9,
    tags: ["Python", "Pandas", "Data Science"],
    modules: [
      {
        id: "m6",
        title: "Python Basics",
        courseId: "c5",
        lessons: [
          { id: "l10", title: "Lists and Dicts", moduleId: "m6", duration: "10 min", contentPreview: "Python's core data structures — how to create, access, and manipulate them.", videoUrl: "" },
        ],
      },
    ],
  },
  {
    id: "c6",
    title: "DevOps & CI/CD Pipelines",
    category: "DevOps",
    level: "Advanced",
    instructorName: "Reza Mohamadi",
    description:
      "Master Docker, GitHub Actions, Kubernetes basics, and deploy production-grade apps with automated CI/CD pipelines.",
    thumbnail: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=600&q=80",
    rating: 4.4,
    tags: ["Docker", "CI/CD", "DevOps", "Kubernetes"],
    modules: [
      {
        id: "m7",
        title: "Docker Fundamentals",
        courseId: "c6",
        lessons: [
          { id: "l11", title: "Containers vs VMs", moduleId: "m7", duration: "12 min", contentPreview: "Understanding why containers revolutionized deployment workflows.", videoUrl: "" },
        ],
      },
    ],
  },
];
