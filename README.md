# AURIX - Voice AI Customer Success Platform

A real-time voice AI customer success agent demonstration platform built with Next.js, ElevenLabs, Anthropic Claude, and Supabase. Test.

## Features

- 🎙️ **Real-time voice AI conversations** powered by ElevenLabs
- 🧠 **Live agent thinking visualization** - See entity extraction, SQL generation, and decision-making
- 📊 **Database query visualization** - Watch SQL queries execute in real-time
- 📱 **Action tracking** - See automated SMS, email, and CRM updates
- 💾 **CRM integration** - All interactions logged and searchable
- 📱 **Fully responsive** - Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Voice AI:** ElevenLabs Conversational AI
- **NLP:** Anthropic Claude (Sonnet 3.5)
- **Database:** Supabase (PostgreSQL + Real-time)
- **Deployment:** Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (or npm)
- Supabase account
- ElevenLabs API key
- Anthropic API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TWLOPA/aurix-demo.git
   cd aurix-demo
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. Set up Supabase:
   - Create a new project at supabase.com
   - Run the SQL schema from `/supabase/schema.sql`
   - Copy your project URL and keys to `.env.local`

5. Run development server:
   ```bash
   pnpm dev
   ```

6. Open http://localhost:3000

## Project Structure

```
aurix/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── crm/               # CRM view page
│   └── page.tsx           # Main demo page
├── components/            # React components
│   ├── panels/           # Demo panels (Conversation, Agent Brain, etc.)
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities
│   ├── supabase/         # Supabase client & queries
│   └── services/         # API integrations (Claude, etc.)
├── hooks/                 # React hooks
└── types/                 # TypeScript types
```

## Demo Flow

1. Click "Start Demo Call"
2. Simulated conversation begins (Order #417 inquiry)
3. Watch real-time visualization:
   - **Left Panel:** Conversation transcript
   - **Right Panel:** Agent brain (thinking, querying, actions)
4. See complete interaction logged in CRM view

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# ElevenLabs
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_key

# Anthropic
ANTHROPIC_API_KEY=your_key
```

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Or use the Vercel dashboard to import from GitHub.

## License

MIT

## Contact

Built by Tom for ElevenLabs FDE-S role application
