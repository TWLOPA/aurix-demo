# Technical Decisions Document

This document explains the reasoning behind key architectural, configuration, and design decisions made in the Aurix project. It is intended for technical stakeholders who need to understand not just what was built, but why specific choices were made.

As a Forward Deployed Strategist working with enterprise customers, the ability to articulate these decisions clearly is essential. This document demonstrates the kind of technical communication that bridges engineering implementation with business requirements.

---

## Table of Contents

1. [Model Selection](#model-selection)
2. [Agent Capabilities](#agent-capabilities)
3. [Tool Architecture](#tool-architecture)
4. [System Prompt Design](#system-prompt-design)
5. [Real-time Architecture](#real-time-architecture)
6. [Identity Verification Approach](#identity-verification-approach)
7. [Compliance Enforcement Strategy](#compliance-enforcement-strategy)
8. [Frontend Visualization](#frontend-visualization)
9. [FDS Role Alignment](#fds-role-alignment)

---

## Model Selection

### Why Claude Opus 4.5

The ElevenLabs Conversational AI platform supports multiple LLM backends. We selected Claude Opus 4.5, Anthropic's most capable model, for several reasons:

**Superior Reasoning and Instruction Following**  
Healthcare customer service requires precise adherence to complex rules. The agent must never provide medical advice, always verify identity before disclosing information, and navigate nuanced conversational scenarios. Opus 4.5 represents the current state-of-the-art in instruction following and multi-step reasoning, significantly reducing the risk of the agent deviating from defined behaviour compared to earlier models.

**Advanced Tool Use**  
The agent relies heavily on webhook tools to query databases and enforce compliance. Opus 4.5 demonstrates exceptional tool-calling reliability, correctly determining when to call tools, how to structure parameters, and how to interpret complex responses. This is critical because a missed tool call means a missed compliance check or a failed database lookup. The model's improved agentic capabilities mean fewer edge cases where tool calls are skipped or malformed.

**Latency Optimisation**  
While Opus 4.5 is a larger model, ElevenLabs has optimised their inference infrastructure to maintain acceptable latency for voice conversations. The marginal increase in response time is offset by the significantly improved quality of responses, particularly in complex scenarios involving compliance decisions or multi-turn verification flows.

**Extended Context Window**  
Healthcare conversations can be lengthy, especially when customers have multiple questions, need to provide verification details, or discuss complex order histories. Opus 4.5's extended context window ensures the agent maintains complete conversation context without truncation, even in extended interactions.

**Safety and Alignment**  
In regulated industries, the consequences of a model going off-script are significant. Opus 4.5's advanced safety training provides robust guardrails against harmful outputs, prompt injection attempts, and edge cases that could lead to compliance violations. This is not merely a nice-to-have feature—in healthcare, it is a fundamental requirement.

**Future-Proofing**  
By selecting the most capable available model, we ensure the demonstration represents what is actually possible with current technology. When presenting to enterprise customers, showing best-in-class capabilities sets appropriate expectations for production deployments.

---

## Agent Capabilities

### Why Enable "End Conversation"

The ElevenLabs platform offers a system tool that allows the agent to end conversations. We enabled this for several reasons:

**Cost Management**  
WebSocket connections to ElevenLabs incur costs while open. If a customer says goodbye but the connection remains open, we continue to pay for idle time. Allowing the agent to recognise farewell patterns and end the session prevents unnecessary spend.

**Natural Conversation Flow**  
Human conversations have natural endings. When a customer says "Thank you, goodbye," they expect the interaction to conclude. Without the ability to end conversations, the agent would awkwardly remain silent or continue prompting, creating a poor user experience.

**Resource Efficiency**  
Each active session consumes server resources. In a production deployment with many concurrent users, sessions that linger unnecessarily would reduce overall system capacity.

**Implementation Approach**  
We implemented smart farewell detection on the client side as a backup. The system detects phrases like "take care," "goodbye," and "thank you for calling" at the end of agent messages. After detecting a farewell, it waits 5 seconds for any follow-up before closing the connection. This delay ensures the conversation truly is over and prevents premature disconnection if the customer has additional questions.

The combination of the ElevenLabs system tool and client-side detection provides redundancy. If the agent decides to end the call, great. If not, the client-side logic catches natural conversation endings.

### Why Enable "Skip Turn"

We enabled the skip turn capability to handle situations where the customer pauses mid-thought or ambient noise is detected. Without this, the agent might interpret silence as a turn and respond prematurely, interrupting the customer's thought process.

---

## Tool Architecture

### Why Webhook Tools Instead of Client-Side Logic

All business logic is implemented as server-side webhook endpoints rather than client-side code. This decision was made for several reasons:

**Security**  
Database credentials, Twilio API keys, and other sensitive information must not be exposed to the client. By routing all operations through webhooks, secrets remain on the server.

**Auditability**  
Every tool call is logged to Supabase with timestamps, parameters, and results. This creates a complete audit trail that would be difficult to achieve reliably with client-side logic.

**Centralised Business Logic**  
Compliance rules, identity verification logic, and escalation criteria live in one place. If regulations change, we update the backend endpoints rather than redeploying the frontend or reconfiguring the agent.

**Consistency**  
The same tools can be called by different agents or interfaces. A future mobile app or different voice platform could use the identical backend, ensuring consistent behaviour.

### Why These Specific Tools

**handle_inquiry**  
This is the primary tool, handling the majority of customer requests. It was designed as a single entry point for all inquiries rather than separate tools for each request type. This approach was chosen because:

- The agent doesn't need to decide which tool to call for basic requests
- Compliance checking happens consistently regardless of inquiry type
- Identity verification is enforced uniformly
- The tool can route internally based on `inquiry_type`

Medical questions intentionally go through the same tool. The compliance check inside the tool determines whether to proceed or escalate. This ensures medical questions cannot accidentally bypass compliance by being routed to a different tool.

**request_refill**  
Prescription refills require different verification (card last 4 digits) and different database operations (checking prescription status, refill counts, payment method). A separate tool provides clear separation of concerns and allows the system prompt to guide the agent on when to use each tool.

**update_address**  
Address changes have unique requirements: VIP customer detection, discreet packaging preferences, and potential fraud signals (frequent address changes). Isolating this logic allows for specialised handling.

**book_callback**  
This tool was added specifically to separate the escalation offer from the callback booking. The agent first offers a callback using handle_inquiry, then only books it using book_callback if the customer accepts. This two-step process ensures:

- Customers are not assumed to want callbacks
- The agent explicitly asks for consent
- The booking is logged separately for clinician scheduling

### Tool Parameter Design

Each tool uses specific parameter types:

**Enums for inquiry_type**  
Rather than allowing free-text inquiry types, we defined explicit enum values. This prevents the LLM from inventing new inquiry types that our backend doesn't handle. It also makes the compliance checking logic simpler and more reliable.

**LLM Prompt for question_text**  
The customer's actual question is extracted by the LLM and passed to the tool. This provides context for escalation logging and clinician callbacks. We use LLM Prompt rather than a fixed enum because the actual question could be anything.

**Date Formatting for verification_dob**  
We specify YYYY-MM-DD format in the parameter description. This ensures consistent date handling regardless of how the customer states their birthday (e.g., "March 15th 1985" becomes "1985-03-15").

---

## System Prompt Design

### Structure and Organisation

The system prompt is structured with clear sections and headers for several reasons:

**Scanability**  
During development and debugging, a well-organised prompt is easier to navigate. When behaviour needs adjustment, we can quickly locate the relevant section.

**LLM Comprehension**  
Research suggests that well-structured prompts with clear hierarchies improve LLM instruction following. Headers and bullet points create clear delineation between different behavioural requirements.

**Maintenance**  
As requirements evolve, specific sections can be updated without risk of accidentally affecting other behaviours. The modular structure reduces the chance of unintended side effects from prompt changes.

### Key Design Choices

**Disclosure at Call Start**  
Regulatory requirements mandate informing customers they're speaking to an AI and that the call is recorded. Placing this in the system prompt with explicit example text ensures consistent delivery.

**Identity Verification as a Gate**  
The prompt explicitly states that identity must be verified before calling handle_inquiry with order details. This is reinforced with "NEVER reveal order details without identity verification." The strong language prevents the model from rationalising exceptions.

**Medical Question Handling**  
The prompt dedicates an entire section to medical questions, emphasising that the agent MUST use handle_inquiry even for medical queries. Without this explicit instruction, we observed the agent answering medical questions directly from its training knowledge. By mandating tool use, we force the query through our compliance logic.

**Tone Guidance**  
The prompt includes specific guidance on tone: "Professional but warm," "Empathetic without being patronizing," "Calm - even if customer is frustrated." These are not arbitrary preferences but reflect healthcare customer service best practices. Customers discussing sensitive health products need to feel respected and not judged.

**Example Responses**  
The prompt includes example response patterns for common scenarios. Rather than letting the model improvise phrasing, we provide templates that have been reviewed for compliance and tone. The model adapts these templates to specific situations while maintaining consistent language around sensitive topics.

**Negative Instructions**  
The "WHAT YOU MUST NEVER DO" section uses explicit negative instructions. Research on LLM behaviour shows that sometimes models need to be told what NOT to do, not just what to do. This section acts as a final guardrail against common failure modes.

### Why Not a Shorter Prompt

Shorter prompts are faster to process and cheaper per token. However, healthcare customer service has too many edge cases for a minimal prompt. We prioritised reliability over cost optimisation at this stage. In production, prompt compression techniques could be explored once behaviour is validated.

---

## Real-time Architecture

### Why Supabase Real-time

The Agent Brain panel shows live updates as the agent processes requests. We chose Supabase's real-time subscriptions over alternatives like WebSockets or polling:

**Simplicity**  
Supabase provides real-time out of the box. No additional infrastructure (Redis, custom WebSocket server) was needed.

**Database as Source of Truth**  
Events are written to the database by backend tools and immediately streamed to subscribed clients. This ensures the UI always reflects the actual database state, eliminating sync issues.

**Scalability**  
Supabase handles the WebSocket connections and subscription management. As the number of concurrent users grows, we don't need to manage connection pooling or message broadcasting ourselves.

### Event-Driven Design

Each tool logs discrete events (understanding, compliance_check, querying, results, action) rather than a single "tool completed" event. This granular approach enables:

**Progressive UI Updates**  
Users see the agent's thought process unfold step by step, building trust in the AI's decision-making.

**Debugging**  
When something goes wrong, the event trail shows exactly where the process failed.

**Analytics**  
We can analyse patterns like "how often are compliance checks triggered" or "average time spent on identity verification."

---

## Identity Verification Approach

### Why DOB and Postcode

We chose date of birth and postcode as verification factors because:

**Customer Knowledge**  
Customers reliably know their birthday and address. Unlike security questions or PINs that may be forgotten, these are memorable.

**Availability in Records**  
These fields are commonly stored in healthcare CRM systems, making them practical for verification without requiring new data collection.

**Regulatory Acceptance**  
DOB and postcode verification is accepted under HIPAA and GDPR as appropriate for telephone identity verification when combined with other context (the customer called, knows their order number, etc.).

### Why Not Stronger Verification

Stronger methods like OTP (one-time passwords) or biometric verification were considered but not implemented for this demo because:

- They require additional infrastructure (SMS OTP system, voice biometrics)
- They add friction to the customer experience
- The demo focuses on demonstrating AI capabilities, not authentication infrastructure

In production, a tiered verification approach might be appropriate: simple verification for low-risk inquiries, stronger verification for high-risk actions like address changes or refill requests.

---

## Compliance Enforcement Strategy

### Server-Side Enforcement

Compliance rules are enforced in the backend, not in the system prompt alone. This architectural choice provides defence in depth:

**Prompt Injection Resistance**  
If a user attempts to manipulate the agent into ignoring compliance rules, the backend will still block the request. The compliance check happens in code, not in the LLM's reasoning.

**Consistency**  
System prompt instructions can be interpreted inconsistently by the LLM. Code-based compliance checks are deterministic.

**Auditability**  
Every compliance check is logged with its result, providing evidence for regulatory audits.

### The Escalation Flow

When a medical question is detected:

1. Tool logs `compliance_check` event with `allowed: false`
2. Tool logs `action` event offering callback
3. Tool inserts record to `clinician_escalations` table
4. Tool returns response instructing agent to offer callback
5. Agent asks customer if they want a callback
6. If yes, `book_callback` tool is called
7. Escalation record is updated with callback scheduled

This multi-step flow ensures nothing is assumed. The customer explicitly consents to the callback, and every step is logged.

---

## Frontend Visualization

### Why Show the Agent's Thinking

The Agent Brain panel was a deliberate design choice, not just a debugging tool. In regulated industries, AI transparency is increasingly important:

**Trust Building**  
Customers and regulators are sceptical of "black box" AI. Showing the decision process demonstrates the system operates predictably and within defined bounds.

**Differentiation**  
Most AI customer service demos show only the conversation. The Agent Brain visualization demonstrates a deeper level of capability and thoughtfulness.

**Sales Tool**  
For enterprise customers evaluating AI platforms, the visualization answers the question "how do I know what the AI is doing?" before they ask it.

### Glassy Card Design

The UI uses a consistent design language with glassy cards and subtle gradients. This wasn't arbitrary aesthetic choice:

**Professional Appearance**  
Healthcare is a conservative industry. The design needed to feel trustworthy and premium, not playful or experimental.

**Alignment with ElevenLabs**  
The design takes cues from ElevenLabs' own UI, ensuring visual consistency that positions Aurix as a natural fit within the ElevenLabs ecosystem.

**Information Hierarchy**  
The glassy card effect creates visual separation between different information types without harsh borders, making the dense information easier to parse.

---

## FDS Role Alignment

This project was built as a demonstration of the skills required for a Forward Deployed Strategist role at ElevenLabs. The FDS role sits at the intersection of technical implementation, customer success, and strategic consulting. Aurix demonstrates competency across these dimensions:

### Technical Implementation

The project required hands-on development across the full stack: Next.js frontend, API route backends, database schema design, real-time subscriptions, and third-party integrations (ElevenLabs, Twilio, Supabase). An FDS must be able to build functional prototypes and proof-of-concepts that demonstrate platform capabilities to prospective customers.

### Customer Understanding

Healthcare e-commerce was chosen deliberately as a complex, regulated domain. Understanding customer requirements in such industries—compliance needs, privacy concerns, audit requirements—is essential for an FDS who will work with enterprise customers across various verticals.

### Solution Architecture

The decisions documented here demonstrate the ability to make architectural choices that balance competing requirements: capability vs latency, security vs convenience, flexibility vs simplicity. An FDS must be able to design solutions that are both technically sound and aligned with customer needs.

### Communication

This document itself demonstrates the communication skills required of an FDS. Technical decisions must be articulated clearly to stakeholders with varying levels of technical depth. The ability to explain "why" not just "what" is essential when working with customer engineering teams and executives.

### Product Feedback Loop

Building this demonstration surfaced insights about the ElevenLabs platform: what works well, where documentation could be clearer, which features would benefit from enhancement. An FDS serves as a critical feedback channel between customers and the product team.

### Rapid Prototyping

The project was built quickly, demonstrating the ability to move from concept to working demo efficiently. In the FDS role, the ability to rapidly prototype solutions is essential for customer engagements where time-to-value matters.

---

## Summary

Every decision in Aurix was made with specific goals in mind:

- **Best-in-class technology**: Using Claude Opus 4.5 ensures the demo represents current capabilities
- **Reliability over experimentation**: Proven technologies and conservative designs reduce risk
- **Compliance by architecture**: Rules are enforced in code, not just prompts
- **Transparency as a feature**: The system shows its work, building trust with regulated industries
- **Production patterns**: While this is a demo, the architecture would scale to production
- **Developer experience**: The codebase is structured for maintainability and handoff

These decisions reflect the requirements of deploying AI in regulated industries, where the cost of failure is high and trust must be earned through demonstrated reliability. They also reflect the skills required of a Forward Deployed Strategist: technical depth, customer empathy, clear communication, and strategic thinking.

---

Document prepared for technical review.  
Last updated: December 2025

