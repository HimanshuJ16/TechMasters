<div align="center">
 
  <div>
    <img src="https://img.shields.io/badge/-Next.JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=black" alt="next.js" />
    <img src="https://img.shields.io/badge/-Vapi-white?style=for-the-badge&color=5dfeca" alt="vapi" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="tailwindcss" />
    <img src="https://img.shields.io/badge/-Firebase-black?style=for-the-badge&logoColor=white&logo=firebase&color=DD2C00" alt="firebase" />
  </div>

  <h3 align="center">Prepwise: A job interview preparation platform powered by Vapi AI Voice agents</h3>

</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)
5. 🕸️ [Snippets (Code to Copy)](#snippets)
6. 🔗 [Assets](#links)
7. 🚀 [More](#more)

## <a name="introduction">🤖 Introduction</a>

Built with Next.js for the user interface and backend logic, Firebase for authentication and data storage, styled with TailwindCSS and using Vapi's voice agents, Prepwise is a website project designed to help you learn integrating AI models with your apps. The platform offers a sleek and modern experience for job interview preparation.

## <a name="tech-stack">⚙️ Tech Stack</a>

- Next.js
- Firebase
- Tailwind CSS
- Vapi AI
- shadcn/ui
- Google Gemini
- Zod

<a name="features">🔋 Features</a>

👉 **Authentication**: Secure Sign Up and Sign In using email/password, powered by Firebase Authentication.

👉 **Create Interviews**: Quickly generate job interviews with the help of Vapi Voice Assistants and Google Gemini, tailored to the job role and domain.

👉 **AI-Powered Interviewing**: Engage in voice-based interviews with an AI voice agent that understands context and evaluates responses in real time.

👉 **Instant Feedback from AI**: Get instant, actionable feedback based on your performance, communication style, and content understanding.

👉 **Real-Time Coding Interface**: Integrated live coding environment where candidates solve problems during the interview. Supports syntax highlighting, auto-evaluation, and live execution.

👉 **Cheating Detection**: Built-in cheating detection using Python, including:

- Face detection via webcam
- Multiple face alerts
- Background voice monitoring
- Tab-switch monitoring

👉 **Modern UI/UX**: Minimal, intuitive, and responsive UI for both interviewers and candidates, enhancing usability.

👉 **Interview Page**: Clean and focused interface to conduct AI-led interviews with real-time transcripts, sentiment analysis, and response tracking.

👉 **Dashboard**: Centralized dashboard to manage candidates, view past interviews, feedback summaries, and performance analytics.

👉 **Responsiveness**: Fully responsive design that works seamlessly across mobile, tablet, and desktop devices.

👉 **Modular Architecture**: Clean and scalable code architecture with reusable components, efficient state management, and well-structured API layers.

👉 **More Features Coming Soon**: Including team collaboration, multi-language support, and role-based access control for organizations.

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)

**Cloning the Repository**

```bash
git clone
cd ai_mock_interviews
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

Create a new file named `.env.local` in the root of your project and add the following content:

```env
NEXT_PUBLIC_VAPI_WEB_TOKEN=
NEXT_PUBLIC_VAPI_WORKFLOW_ID=

GOOGLE_GENERATIVE_AI_API_KEY=

NEXT_PUBLIC_BASE_URL=

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Replace the placeholder values with your actual **[Firebase](https://firebase.google.com/)**, **[Vapi](https://vapi.ai/)** credentials.

**Running the Project**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.
