# AI Interview Simulator

A modern, AI-powered interview practice platform built with Next.js 14, TypeScript, and OpenAI. Practice your interview skills with personalized questions based on your CV and receive instant AI-powered feedback.

![AI Interview Simulator](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)

## 🚀 Features

- **🤖 AI-Powered Questions**: Generate personalized interview questions based on your CV and target position using OpenAI GPT-3.5
- **📄 CV Upload & Analysis**: Upload your resume (PDF) and get it analyzed automatically
- **💬 Real-time Feedback**: Receive instant, detailed feedback on your answers with scores and improvement suggestions
- **📊 Progress Tracking**: Monitor your interview performance with statistics and historical data
- **🔐 Secure Authentication**: Email/password authentication with Supabase
- **📱 Responsive Design**: Beautiful, mobile-friendly UI with Tailwind CSS
- **🎨 Modern UI/UX**: Clean, gradient-based design with smooth animations

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern React patterns
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - Authentication and database
- **OpenAI API** - GPT-3.5 for AI features
- **pdf-parse** - PDF text extraction

### Developer Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Supabase account** (free tier available)
- **OpenAI API key** (requires credits)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/benmevic/ai-interview-web.git
   cd ai-interview-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Update the variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

## 🗄️ Database Setup

### Supabase Configuration

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Set up authentication**
   - Enable Email/Password authentication in Supabase dashboard
   - Configure email templates (optional)

3. **Create database tables**

   Run these SQL commands in your Supabase SQL editor:

   ```sql
   -- Users table (handled by Supabase Auth)
   
   -- Interviews table
   CREATE TABLE interviews (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     position TEXT NOT NULL,
     cv_text TEXT,
     status TEXT DEFAULT 'pending',
     score INTEGER,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Questions table
   CREATE TABLE questions (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
     question_text TEXT NOT NULL,
     order_num INTEGER NOT NULL,
     answer_text TEXT,
     score INTEGER,
     feedback TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
   ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

   -- Policies for interviews
   CREATE POLICY "Users can view their own interviews"
     ON interviews FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can create their own interviews"
     ON interviews FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   -- Policies for questions
   CREATE POLICY "Users can view questions for their interviews"
     ON questions FOR SELECT
     USING (
       EXISTS (
         SELECT 1 FROM interviews
         WHERE interviews.id = questions.interview_id
         AND interviews.user_id = auth.uid()
       )
     );
   ```

## 🚀 Running Locally

1. **Development mode**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Build for production**
   ```bash
   npm run build
   npm start
   # or
   yarn build
   yarn start
   ```

## 📁 Project Structure

```
ai-interview-web/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── interview/            # Interview management
│   │   │   ├── create/
│   │   │   └── [id]/
│   │   └── openai/               # OpenAI integration
│   │       ├── analyze-cv/
│   │       ├── generate-questions/
│   │       └── evaluate-answer/
│   ├── dashboard/                # User dashboard
│   ├── interview/                # Interview pages
│   │   ├── new/                  # Start new interview
│   │   └── [id]/                 # Active interview
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── CVUpload.tsx              # CV upload component
│   ├── Footer.tsx                # Footer
│   ├── InterviewCard.tsx         # Interview card
│   ├── Navbar.tsx                # Navigation bar
│   └── QuestionCard.tsx          # Question display
├── lib/                          # Utility libraries
│   ├── openai.ts                 # OpenAI client
│   ├── supabase.ts               # Supabase client
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Utility functions
├── public/                       # Static assets
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🎯 Usage

### 1. Create an Account
- Navigate to the registration page
- Enter your email and password
- Click "Create Account"

### 2. Start a New Interview
- Go to "Dashboard" or click "New Interview"
- Enter interview title and position
- Upload your CV (PDF format, max 5MB)
- Wait for AI to analyze and generate questions

### 3. Answer Questions
- Read each question carefully
- Type your answer in the text area
- Submit your answer for AI evaluation
- Review feedback and score instantly

### 4. Track Progress
- View all your interviews in the dashboard
- Check scores and statistics
- Review past interviews and feedback

## 🌐 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. **Configure environment variables**
   - Add all variables from `.env.local`
   - Deploy!

4. **Update Supabase URL**
   - Add your Vercel domain to Supabase allowed URLs
   - Update CORS settings if needed

### Alternative Deployment Options
- **Netlify**: Similar process to Vercel
- **AWS Amplify**: Connect GitHub repo
- **Self-hosted**: Build and run with Node.js

## 🔒 Security Notes

- Never commit `.env.local` or API keys to Git
- Use Row Level Security (RLS) in Supabase
- Implement rate limiting for API routes
- Validate all user inputs
- Use HTTPS in production

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Ben Mevic**
- GitHub: [@benmevic](https://github.com/benmevic)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [OpenAI](https://openai.com/) - AI API
- [Supabase](https://supabase.com/) - Backend platform
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vercel](https://vercel.com/) - Deployment platform

## 📧 Support

For support, email support@example.com or open an issue in the repository.

---

Built with ❤️ using Next.js 14, TypeScript, and OpenAI
