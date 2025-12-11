# Aurix

A demonstration of AI-powered customer service for regulated healthcare e-commerce, built to showcase transparent decision-making, compliance boundaries, and multi-system integration.

## Overview

Aurix is a voice AI support agent designed for sensitive healthcare scenarios. It demonstrates how conversational AI can handle customer inquiries while maintaining strict compliance with regulations like HIPAA and GDPR. The platform shows every decision the AI makes in real-time, providing full transparency into the agent's reasoning process.

This project was built as a technical demonstration for ElevenLabs, showcasing the capabilities of their Conversational AI platform in a regulated industry context.

## The Problem

Healthcare e-commerce presents unique challenges for customer service automation:

- Customers need help with orders, refills, and deliveries
- Medical questions must be handled carefully and escalated to licensed clinicians
- Identity verification is mandatory before disclosing health-related information
- Privacy and discretion are paramount for sensitive products
- Compliance violations can have serious regulatory consequences

Traditional chatbots struggle in this environment because they lack the nuance to handle these competing requirements safely.

## The Solution

Aurix demonstrates how a well-designed AI agent can navigate these challenges:

**Transparent Decision-Making**  
Every decision the agent makes is visible in real-time. When it queries a database, checks compliance rules, or decides to escalate, you can see exactly what's happening and why.

**Compliance Boundaries**  
The agent knows what it can and cannot discuss. Medical questions about side effects, dosage, or drug interactions are automatically detected and escalated to human clinicians. The customer is offered a callback rather than receiving potentially harmful advice.

**Identity Verification**  
Before revealing any order or health information, the agent verifies the customer's identity using date of birth or postcode. This isn't just good practice—it's a regulatory requirement.

**Multi-System Integration**  
The agent queries customer records, prescription data, billing information, and order status in real-time. It demonstrates how voice AI can serve as the interface to complex backend systems.

**Multimodal Communication**  
Beyond voice, the agent can send real SMS messages with order details, demonstrating how AI agents can operate across multiple channels within a single conversation.

## Key Features

### Voice Conversation
Natural, real-time voice interaction powered by ElevenLabs Conversational AI. The agent speaks naturally, handles interruptions, and maintains context throughout the conversation.

### Agent Brain Visualization
A live view into the agent's decision-making process. Watch as it:
- Parses and understands customer requests
- Runs compliance checks against defined rules
- Queries databases for customer and order information
- Verifies customer identity before disclosing information
- Triggers actions like SMS notifications

### Compliance Enforcement
Medical inquiries are automatically detected and blocked. The agent explains why it cannot provide medical advice and offers to schedule a clinician callback. Every escalation is logged for audit purposes.

### Identity Verification
HIPAA and GDPR-compliant identity checks using date of birth or postcode verification. The agent will not reveal sensitive information until identity is confirmed.

### Real SMS Integration
When the agent mentions sending tracking information, users can enter their real phone number to receive an actual SMS with their order details. This demonstrates multimodal capabilities in a tangible way.

### Call Summary
After each conversation, a detailed summary shows what was discussed, what actions were taken, whether identity was verified, and if any compliance boundaries were triggered.

### Escalation Tracking
A dedicated view for clinician escalations shows all medical inquiries that were blocked, the customer's original question, and the status of any scheduled callbacks.

## Architecture

### Frontend
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Real-time updates via Supabase subscriptions

### Voice AI
- ElevenLabs Conversational AI for speech-to-text and text-to-speech
- WebRTC for low-latency audio streaming
- Custom webhook tools for backend integration

### Database
- Supabase (PostgreSQL) for data storage
- Real-time subscriptions for live UI updates
- Tables for customers, orders, prescriptions, billing, and call events

### SMS
- Twilio for sending real SMS messages
- Configurable message templates based on context

## Project Structure

```
aurix/
├── app/
│   ├── api/tools/           # Backend webhook endpoints
│   │   ├── handle-inquiry/  # Order lookups and compliance checks
│   │   ├── request-refill/  # Prescription refill processing
│   │   ├── update-address/  # Address changes with VIP detection
│   │   ├── book-callback/   # Clinician callback scheduling
│   │   └── send-sms/        # Real SMS sending via Twilio
│   ├── escalations/         # Clinician escalation tracking page
│   ├── logs/                # Call history and audit logs
│   └── page.tsx             # Main application page
├── components/
│   ├── panels/
│   │   ├── AgentBrainPanel  # Real-time decision visualization
│   │   └── ConversationPanel # Live transcript
│   ├── CallSummaryModal     # Post-call summary
│   ├── CostCalculator       # AI vs human cost comparison
│   ├── PersonaToolbar       # Test scenario information
│   ├── SMSPrompt            # Real SMS demonstration modal
│   └── WaitingState         # Landing page
├── hooks/
│   └── useCallEvents        # Real-time event subscription
├── lib/
│   └── supabase/            # Database client and queries
├── supabase/
│   └── migrations/          # Database schema
└── types/                   # TypeScript definitions
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- A Supabase account and project
- An ElevenLabs account with Conversational AI access
- Optionally, a Twilio account for real SMS

### Environment Variables

Create a `.env.local` file with the following:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ElevenLabs
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id

# Twilio (optional, for real SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Database Setup

Run the migrations in `supabase/migrations/` against your Supabase project:

1. `001_health_ecommerce.sql` - Creates core tables and seed data
2. `002_clinician_escalations.sql` - Adds escalation tracking

### ElevenLabs Agent Configuration

Create a new agent in ElevenLabs with the following tools configured as webhooks:

- `handle_inquiry` - For order lookups and medical question handling
- `request_refill` - For prescription refill requests
- `update_address` - For delivery address changes
- `book_callback` - For scheduling clinician callbacks

Each tool should point to the corresponding `/api/tools/` endpoint on your deployed application.

### Installation

```bash
# Clone the repository
git clone https://github.com/TWLOPA/aurix-demo.git
cd aurix-demo/aurix

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 to see the application.

## Test Scenarios

The demo includes three pre-configured customer scenarios:

### Order Inquiry (John Smith)
- Order: ORD-7823
- Verification: DOB 15th March 1985 or postcode SW1A 1AA
- Tests: Identity verification, order lookup, SMS sending

### Medical Question
- Ask about side effects, dosage, or drug interactions
- Tests: Compliance blocking, escalation flow, callback booking

### Prescription Refill (Michael Chen)
- Prescription: RX-002
- Verification: Last 4 card digits 8765
- Tests: Identity verification, multi-system query, order creation

## How It Works

### Call Flow

1. Customer starts a conversation
2. Agent greets and asks how it can help
3. Customer makes a request
4. Agent determines request type and calls appropriate backend tool
5. Tool logs understanding, runs compliance checks, queries databases
6. Agent responds with information or escalation offer
7. All events appear in real-time in the Agent Brain panel
8. Call ends naturally when customer is satisfied
9. Summary modal shows complete interaction audit

### Compliance Logic

The `handle_inquiry` endpoint checks every request against a compliance ruleset:

**Allowed inquiries:**
- Order status, delivery date, tracking number
- Refill requests, payment updates, address changes

**Blocked inquiries (require clinician):**
- Side effects, dosage changes, drug interactions
- Medical advice, medical conditions

When a blocked inquiry is detected, the agent offers a clinician callback rather than providing potentially harmful information.

### Identity Verification

Before revealing any health-related order information:

1. Agent requests verification (DOB or postcode)
2. Customer provides verification
3. Backend compares against stored customer record
4. Only if match: order details are returned
5. If mismatch: access denied, alternative verification offered

## Deployment

The application is designed for deployment on Vercel:

```bash
vercel deploy
```

Ensure all environment variables are configured in your Vercel project settings.

## Technical Decisions

**Why Next.js?**  
Server-side API routes make it easy to securely call external services. The App Router provides clean code organization.

**Why Supabase?**  
Real-time subscriptions are essential for the live Agent Brain visualization. PostgreSQL provides robust relational data modeling.

**Why ElevenLabs?**  
Low-latency voice AI with high-quality synthesis. The Conversational AI platform handles the complexity of real-time speech while allowing custom tool integration.

**Why webhook tools instead of client-side logic?**  
Security. API keys and business logic stay on the server. The agent calls webhooks which log events and return structured responses.

## Limitations

This is a demonstration, not production software. Notable limitations:

- Seed data only; no real customer management
- Identity verification is simplified for demo purposes
- SMS requires Twilio configuration
- No persistent conversation history across sessions
- Single demo session ID for all calls

## About This Project

This project was built as part of an application for the Forward Deployed Strategist (FDS) role at ElevenLabs. The FDS role requires a combination of technical implementation skills, customer understanding, solution architecture, and clear communication.

Aurix demonstrates these competencies:

- **Technical depth**: Full-stack implementation with Next.js, real-time databases, webhook integrations, and voice AI configuration
- **Domain expertise**: Understanding of regulated healthcare requirements, compliance needs, and enterprise customer concerns
- **Solution design**: Architectural decisions that balance capability, security, and user experience
- **Communication**: Clear documentation explaining not just what was built, but why

For a detailed explanation of technical decisions and their rationale, see [docs/TECHNICAL_DECISIONS.md](docs/TECHNICAL_DECISIONS.md).

## Contributing

This project was built as a demonstration. If you have suggestions or find issues, please open a GitHub issue.

## License

MIT License. See LICENSE file for details.

## Acknowledgments

Built with:
- [ElevenLabs](https://elevenlabs.io) - Conversational AI platform
- [Anthropic Claude](https://anthropic.com) - Claude Sonnet 4 for agent reasoning
- [Supabase](https://supabase.com) - Database and real-time subscriptions
- [Vercel](https://vercel.com) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com) - UI components

---

Built by Tom Walsh as a demonstration for the ElevenLabs Forward Deployed Strategist role.  
December 2025
