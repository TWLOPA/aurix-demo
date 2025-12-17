# AURIX
A conversational AI prototype demonstrating deployment in regulated industries

**Live Demo:** https://aurix-demo.vercel.app

A technical prototype exploring how voice AI can work in highly regulated environments like healthcare. 
Built to understand deployment requirements, architecture decisions, and trust challenges when implementing 
AI in industries with strict compliance requirements.

## Purpose

AURIX demonstrates AI prototype development in challenging deployment environments:

- **Environment Selection**: Healthcare e-commerce was chosen specifically because it represents one of the 
  hardest deployment environments - HIPAA compliance, liability concerns, legal team skepticism, and 
  workflows involving multiple systems (inventory, CRM, prescription verification)

- **Technical Architecture**: Shows how to build AI systems that earn enterprise trust through 
  server-side compliance enforcement (not prompt-based), transparent decision-making, and 
  realistic system integration

- **Prototype Methodology**: Demonstrates balancing technical sophistication with accessibility - 
  complex enough to show real capabilities, simple enough to understand quickly

## Why Healthcare?

Healthcare was chosen as the test case for several strategic reasons:

1. **Regulatory Complexity**: HIPAA compliance requirements force robust architecture decisions
2. **High Stakes**: Medical advice liability means compliance can't be prompt-based - it must be enforced server-side
3. **Legal Skepticism**: Healthcare legal teams typically block AI adoption, making this a true test of earning trust
4. **Multi-System Integration**: Real healthcare workflows require coordination across inventory, CRM, and prescription systems
5. **Transparency Requirements**: Healthcare demands visible decision-making and audit trails

If conversational AI can work in healthcare, the architecture patterns apply to other regulated industries 
(finance, legal, government).

## Technical Architecture

### Core Design Decisions

**Server-Side Compliance Enforcement**
- Compliance checks happen in webhook layer before AI processes requests
- Legal teams won't trust "the AI promised not to give medical advice" - enforcement must be deterministic
- Pattern: `compliance check → database query → AI processing → action execution`

**Real-Time Decision Transparency**  
- "Agent Brain" panel shows every decision: understanding intent, checking compliance, querying data, taking actions
- Enterprise trust requires understanding how AI makes decisions, not just trusting outputs
- Crucial for regulated industries where decisions must be auditable

**Production-Ready Integration**
- Supabase integration demonstrates realistic data operations (not mocked responses)
- Shows how webhook architecture connects to existing enterprise systems
- Patterns transferable to EHR systems (Epic, Cerner) and other healthcare infrastructure

### Stack Details

**Frontend**
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Real-time updates via Supabase subscriptions

**Voice AI**
- ElevenLabs Conversational AI for speech-to-text and text-to-speech
- WebRTC for low-latency audio streaming
- Custom webhook tools for backend integration

**Database**
- Supabase (PostgreSQL) for data storage
- Real-time subscriptions for live UI updates
- Tables for customers, orders, prescriptions, billing, and call events

**SMS**
- Twilio for sending real SMS messages
- Configurable message templates based on context

### Project Structure

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

## Demo Scenarios

Three scenarios with increasing complexity:

1. **Product Inquiry** - Demonstrates natural conversation and basic database operations
2. **Prescription Refill** - Shows multi-system orchestration and secure data handling  
3. **Medical Advice Detection** - Proves server-side compliance enforcement works

Each scenario teaches something about enterprise deployment challenges and solutions.

### Order Inquiry (John Smith)
- **Order**: ORD-7823
- **Verification**: DOB 15th March 1985 or postcode SW1A 1AA
- **Tests**: Identity verification, order lookup, SMS sending

### Medical Question
- **Ask about**: Side effects, dosage, or drug interactions
- **Tests**: Compliance blocking, escalation flow, callback booking

### Prescription Refill (Michael Chen)
- **Prescription**: RX-002
- **Verification**: Last 4 card digits 8765
- **Tests**: Identity verification, multi-system query, order creation

## Lessons Learned

Building AURIX taught several key lessons about AI prototype development:

**Scoping for Impact**
- Most effective prototypes balance technical depth with accessibility
- Healthcare was chosen deliberately as a "hard mode" test case
- Three scenarios show increasing complexity without overwhelming viewers

**Architecture for Trust**
- Server-side compliance enforcement is non-negotiable for regulated industries
- Transparency (Agent Brain panel) helps overcome "black box" concerns
- Real database integration (not mocked data) proves production readiness

**Prototype vs Production**
- Prototype demonstrates feasibility and earns stakeholder trust
- Production deployment requires: multi-factor auth, customer-managed encryption, comprehensive compliance rules, 
  BAAs with all vendors, enterprise monitoring, QA workflows
- Gap between prototype and production is organizational (legal approval, change management) not technical

**Platform Evaluation**
- Best way to evaluate AI platforms is building real prototypes, not reading documentation
- Healthcare use case revealed platform strengths: latency, orchestration reliability, webhook flexibility
- Patterns learned here transfer to other conversational AI deployments

## Built With

- **ElevenLabs Conversational AI** - Voice interface and conversation orchestration
- **Next.js** - Web application framework
- **Supabase** - Database and real-time operations
- **TypeScript** - Type-safe development
- **Twilio** - SMS messaging
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Vercel** - Deployment platform

## Running Locally

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

## Deployment

The application is designed for deployment on Vercel:

```bash
vercel deploy
```

Ensure all environment variables are configured in your Vercel project settings.

For detailed production considerations, see [docs/TECHNICAL_DECISIONS.md](docs/TECHNICAL_DECISIONS.md).

## License

MIT License. See LICENSE file for details.
