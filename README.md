# Gemini Foundry 🚀

**Gemini Foundry is your AI Co-Founder.** Powered by Google Gemini Pro.

![Gemini Foundry](https://img.shields.io/badge/Status-Beta-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-green?style=for-the-badge)
![Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=for-the-badge)

## 📖 About The Project

Founders often struggle to validate ideas, value their markets, or prepare for the grueling questions investors ask. **Gemini Foundry** acts not just as a chatbot, but as a **Founding Partner**—bringing structure, financial rigor, and ruthless feedback to the table.

### ✨ Key Features

1.  **MVP Generator**: Transforms a rough idea into a structured product roadmap, complete with core features and technical architecture.
2.  **Investor Simulator**: A "Shark Tank" style agent that grills founders on their pitch, exposing weaknesses in their business model before they face real VCs.
3.  **CFO Mode**: Instantly generates financial projections, burn rate, and runway analysis using beautiful interactive charts.
4.  **Market Synthesis**: Analyzes competitors and market size (TAM/SAM/SOM), presenting the data in clear, actionable formats.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
- **AI Model**: [Google Gemini Pro 1.5](https://ai.google.dev/) (via `@google/generative-ai`)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Auth Helpers)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Visualization**: [Recharts](https://recharts.org/), [Mermaid.js](https://mermaid.js.org/)
- **Validation**: [Zod](https://zod.dev/)

---

## 🚀 Getting Started

Follow these steps to get the project running locally.

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Supabase project
- A Google Gemini API Key

### Installation

1.  **Clone the repo**

    ```bash
    git clone https://github.com/psu6810110402/gemini-foundry.git
    cd gemini-foundry
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add the following:

    ```env
    # Supabase (Auth & DB)
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

    # Google Gemini AI
    GEMINI_API_KEY=your_gemini_api_key

    # Admin Access (for Dashboard)
    ADMIN_EMAIL=your_admin_email@example.com
    ```

4.  **Run the development server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📸 Screenshots

_(Add screenshots of your dashboard, investor simulator, and financial charts here)_

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ for the **Gemini Hackathon**.
