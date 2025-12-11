# Aurix

A demonstration of AI-powered customer service for regulated healthcare e-commerce, built to showcase transparent decision-making, compliance boundaries, and multi-system integration.

## Overview

Aurix is a voice AI support agent designed for sensitive healthcare scenarios. It demonstrates how conversational AI can handle customer inquiries while maintaining strict compliance with regulations like HIPAA and GDPR. The platform shows every decision the AI makes in real-time, providing full transparency into the agent's reasoning process.

This project was built as a technical demonstration for ElevenLabs, showcasing the capabilities of their Conversational AI platform in a regulated industry context.

## Key Capabilities at a Glance

| Capability | Description |
|------------|-------------|
| **Voice Conversation** | Natural, real-time voice powered by ElevenLabs |
| **Agent Brain** | Live visualisation of AI decision-making |
| **Compliance Boundaries** | Automatic medical question blocking and escalation |
| **Identity Verification** | HIPAA/GDPR-compliant verification checks |
| **Real SMS** | Actual text messages sent to your phone |
| **Call Summary** | Complete audit trail of every interaction |

## The Problem

Healthcare e-commerce companies face a critical challenge:

**The Cost Problem**  
70% of customer service calls are routine inquiries: "Where's my prescription?" "When will it arrive?" "Can I refill?" At £25-35/hour for human agents, a company handling 10,000 calls monthly spends £300,000 annually answering repetitive questions.

**The Automation Blocker**  
Voice AI should solve this. But legal teams block deployment because:
- They cannot audit AI decisions
- They cannot prove what was said
- They cannot guarantee compliance boundaries
- They lack visibility into AI reasoning

**The Catch-22**  
Companies are stuck paying humans to do work AI could handle—not because the technology doesn't exist, but because they can't get it past legal and compliance teams.

Traditional chatbots fail in healthcare because they lack the nuance to handle competing requirements: helpfulness vs. compliance, automation vs. safety, speed vs. verification.

## The Solution

Aurix demonstrates how transparent, auditable AI unlocks deployment in regulated industries.

**The Core Innovation: Transparency**  
Every decision the AI makes is visible in real-time—not just to developers, but to compliance teams and legal reviewers. When the agent queries a database, checks a compliance rule, or decides to escalate, you see exactly what happened and why.

This transparency changes the conversation with legal teams:
- **Before:** "Can we trust this AI?" (Unanswerable)
- **After:** "Here's exactly what the AI did—verify it yourself." (Auditable)

**How It Works:**

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

## Try It Now

**Live Demo:** [https://aurix-demo.vercel.app](https://aurix-demo.vercel.app)

**Quickstart (60 seconds):**
1. Click "Start Demo" on the landing page
2. Allow microphone access when prompted
3. Select a test scenario (Order Inquiry recommended for first try)
4. Say: "Hi, I'd like to check on my order"
5. Watch the Agent Brain panel update in real-time
6. Optional: Try asking a medical question to see compliance blocking

**What to Watch For:**
- Identity verification before revealing order details
- Medical questions automatically escalated (try asking about side effects)
- Real-time event logging in Agent Brain panel
- SMS prompt when agent offers to send tracking (enter your real phone!)

**Test Credentials:**
- Order Inquiry: DOB "15th March 1985" or Postcode "SW1A 1AA"
- Refill Request: Last 4 card digits "8765"

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

## Demo vs Production

This is a **functional demonstration**, not production software. It showcases architectural patterns and capabilities that would be hardened for production deployment.

**Current Scope (Demo):**
- Three pre-configured customer scenarios
- Simplified identity verification (DOB/postcode)
- Single-session design (no persistent history)
- Seed data for testing
- Optional SMS integration (requires Twilio setup)

**Production Requirements:**
- Multi-factor authentication (SMS OTP, biometrics)
- Customer data management and PII encryption
- Rate limiting and fraud detection
- Comprehensive monitoring and alerting
- Multi-region deployment and disaster recovery
- Audit log retention and immutability
- Load testing and performance optimisation

**The architecture is production-ready. The implementation is demonstration-grade.**

For detailed production considerations, see [docs/TECHNICAL_DECISIONS.md](docs/TECHNICAL_DECISIONS.md).

## About This Project

This project was built as part of an application for the Forward Deployed Strategist (FDS) role at ElevenLabs. The FDS role requires a combination of technical implementation skills, customer understanding, solution architecture, and clear communication.

Aurix demonstrates these competencies:

- **Technical depth**: Full-stack implementation with Next.js, real-time databases, webhook integrations, and voice AI configuration
- **Domain expertise**: Understanding of regulated healthcare requirements, compliance needs, and enterprise customer concerns
- **Solution design**: Architectural decisions that balance capability, security, and user experience
- **Communication**: Clear documentation explaining not just what was built, but why

**Why Healthcare E-commerce?**

Healthcare e-commerce was chosen deliberately as a demonstration domain. It combines:
- Regulatory complexity (HIPAA, GDPR, state-specific pharmacy laws)
- High customer sensitivity (private health matters, stigmatised conditions)
- Clear ROI metrics (cost per call, automation rate, compliance violation cost)
- Representative enterprise buyer concerns (legal approval, audit requirements, risk management)

If conversational AI works in healthcare e-commerce with full transparency and compliance, it can work anywhere. The patterns demonstrated here—transparent decision-making, server-side compliance, identity verification, escalation workflows—apply across regulated industries: financial services, insurance, telehealth, legal, government services.

This isn't a healthcare demo. It's an enterprise AI deployment pattern demonstrated through healthcare.

For a detailed explanation of technical decisions and their rationale, see [docs/TECHNICAL_DECISIONS.md](docs/TECHNICAL_DECISIONS.md).

## Contributing

This project was built as a demonstration. If you have suggestions or find issues, please open a GitHub issue.

## License

MIT License. See LICENSE file for details.

## Acknowledgments

Built with:
- [ElevenLabs](https://elevenlabs.io) - Conversational AI platform with GLM-4.5-Air
- [Supabase](https://supabase.com) - Database and real-time subscriptions
- [Twilio](https://twilio.com) - SMS messaging
- [Vercel](https://vercel.com) - Deployment platform
- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com) - UI components

---

Built by Tom Walsh as a demonstration for the ElevenLabs Forward Deployed Strategist role.  
December 2025
