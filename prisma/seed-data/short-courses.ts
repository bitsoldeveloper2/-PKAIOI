/**
 * Short courses: one-month and three-month offerings in AI and digital media marketing.
 *
 * Each short course is a Program (so it appears on /programs, carries tuition, format and
 * admissions, and can be applied to) with exactly one Course of lessons attached (so it runs
 * on the campus with quizzes, labs and a certificate).
 */
import type { SeedProgram } from "./programs";
import type { SeedCourse } from "./courses";

const SAMPLE_VIDEO = "/media/sample-lecture.webm";

// ─────────────────────────────────────────────────────────────────────────────
// Programs
// ─────────────────────────────────────────────────────────────────────────────

export const shortCoursePrograms: SeedProgram[] = [
  {
    slug: "short-course-ai-essentials",
    title: "AI Essentials · One-Month Short Course",
    tagline: "Four weeks to use AI confidently at work, and to know when not to.",
    level: "SHORT_COURSE",
    format: "Online · Three evenings a week for four weeks",
    durationWeeks: 4,
    tuitionPkr: 35_000,
    summary:
      "A one-month short course for professionals, students and founders who want a working understanding of modern AI: what the tools can do, how to use them well, and how to judge the results. No programming required.",
    description: `Most people now use AI every week and understand it hardly at all. This short course closes that gap in four weeks. You learn what a language model is actually doing, how to brief it so that it does useful work, how to use it with your own documents and data, and how to recognise the failures — hallucination, bias, leakage — before they reach a customer or a boss.

Classes run live online on Monday, Wednesday and Thursday evenings, with recordings and a campus workspace for everything you miss. Each week ends with a short practical: a prompt library for your own role, an analysis of a real document, and finally a one-page AI plan for your team.

The course is deliberately tool-agnostic. You will work with the assistants and office tools you already have access to, and leave able to evaluate the next one that appears.`,
    outcomes: [
      "Explain, in plain language, how language models and generative AI produce their output and why they fail.",
      "Brief an AI assistant with role, task, context and format so that first drafts are usable.",
      "Summarise, extract from and analyse documents and spreadsheets with AI, and verify the result.",
      "Apply a practical checklist for privacy, bias and hallucination risk, and write a one-page AI plan for your team.",
    ],
    curriculum: [
      { title: "Week 1 · What AI is, and is not", items: ["AI, machine learning and generative models in plain language", "How a language model produces an answer", "Live clinic: your questions about the tools you use"] },
      { title: "Week 2 · Working with AI assistants", items: ["Prompting as briefing", "A prompt pattern library for everyday work", "Lab: build a reusable prompt template"] },
      { title: "Week 3 · AI for documents, data and decisions", items: ["Summarising, extracting and analysing documents", "Spreadsheets meet AI", "Practical: analyse a real report"] },
      { title: "Week 4 · Judgement, risk and your AI plan", items: ["Hallucination, bias and privacy checklist", "Where AI fits in your organisation", "Final assessment and your one-page plan"] },
    ],
    admissions: {
      intake: "Monthly · Starts the first Monday of every month",
      deadline: "Enrol by the Friday before the start date",
      requirements: ["No programming or technical background required.", "A laptop and reliable internet for live evening sessions.", "Willingness to try the tools on your own work between classes."],
    },
  },
  {
    slug: "short-course-applied-ai",
    title: "Applied AI for Professionals · Three-Month Short Course",
    tagline: "Twelve weeks from AI user to AI builder, with a project you can show.",
    level: "SHORT_COURSE",
    format: "Hybrid · Two evenings a week plus a Saturday lab",
    durationWeeks: 12,
    tuitionPkr: 95_000,
    summary:
      "A three-month short course that takes professionals from using AI to building with it: Python from zero, a first predictive model, a retrieval-backed assistant over your own documents, and a capstone built for your workplace.",
    description: `Applied AI for Professionals is for people who have outgrown the chat window. Analysts, product managers, marketers, operations leads and founders who want to build small AI features and automations themselves, and to brief engineers credibly when something bigger is needed.

The course runs for twelve weeks in three month-long blocks. Month one teaches the Python and data handling you need — nothing more — and gets you cleaning real datasets by week two. Month two builds your first predictive model and, more importantly, teaches you to read its results honestly. Month three is generative AI: calling a model from code, retrieval over your own documents, and automations with guardrails.

Evening sessions are live online on Tuesdays and Thursdays. Saturday labs are in person at the Lahore campus or live online for remote learners, and are where the capstone gets built. You finish with a working AI feature for your own workplace, demonstrated to faculty and your cohort.`,
    outcomes: [
      "Write and read enough Python to clean data, call APIs and automate repetitive work.",
      "Train, validate and explain a simple predictive model, including precision, recall and the cost of being wrong.",
      "Build a retrieval-backed assistant over a document set and evaluate its answers.",
      "Scope, build and present an AI feature or automation for a real business problem.",
    ],
    curriculum: [
      { title: "Month 1 · Python and data for AI work", items: ["Python in a week: the parts you need", "Lab: clean a customer list", "Tables, joins and the questions that matter", "Practical: your own dataset, cleaned and described"] },
      { title: "Month 2 · Machine learning without the mystery", items: ["Your first predictive model", "Reading a model's results honestly", "Lab: precision, recall and the cost of errors", "Practical: a validated model on a business dataset"] },
      { title: "Month 3 · Generative AI, automation and capstone", items: ["Calling a language model from code", "Retrieval: giving the model your documents", "Automation with guardrails", "Capstone demonstration"] },
    ],
    admissions: {
      intake: "Monthly · New cohorts start the first week of every month",
      deadline: "Enrol two weeks before the start date to secure a Saturday lab place",
      requirements: ["Comfort with spreadsheets; no programming experience required.", "AI Essentials, or equivalent familiarity with AI assistants, is recommended.", "Around six hours a week outside class for practicals and the capstone."],
    },
    featured: true,
  },
  {
    slug: "short-course-digital-media-marketing-essentials",
    title: "Digital Media Marketing Essentials · One-Month Short Course",
    tagline: "Four weeks to plan, run and measure a digital campaign.",
    level: "SHORT_COURSE",
    format: "Online · Three evenings a week for four weeks",
    durationWeeks: 4,
    tuitionPkr: 30_000,
    summary:
      "A one-month short course covering the whole digital marketing loop: audience and funnel, content for social platforms, paid media on Meta and Google, and the handful of numbers that tell you whether any of it worked.",
    description: `Digital Media Marketing Essentials is built for people who have to make marketing work with a small budget and no agency: small-business owners, freelancers, early-career marketers and founders. In four weeks you plan a campaign, create content for it, set up paid media around it and learn to read the results without being fooled by vanity metrics.

Sessions are live online on Monday, Wednesday and Thursday evenings, each pairing a short lecture with hands-on work in the platforms themselves. You work on a real business throughout — your own, your employer's, or one we assign — so that by week four you have a one-page marketing plan and a campaign ready to launch.

The course uses AI assistants throughout for research, copy drafts and reporting, and is honest about where they help and where they produce confident nonsense.`,
    outcomes: [
      "Map a customer journey and choose the channels where your audience's attention actually is.",
      "Produce a four-week content calendar with platform-appropriate posts for Instagram, TikTok, LinkedIn and YouTube.",
      "Set up and structure a paid campaign on Meta and Google with sensible targeting, budget and creative.",
      "Read a marketing dashboard and compute CTR, CPA and ROAS to decide what to scale and what to stop.",
    ],
    curriculum: [
      { title: "Week 1 · The digital marketing landscape", items: ["Channels, funnels and where attention lives", "Audience first: personas, intent and the customer journey", "Practical: your audience and funnel map"] },
      { title: "Week 2 · Content and social media", items: ["Content that earns attention on each platform", "A four-week content calendar you can keep", "Writing for the feed: hooks, captions and calls to action"] },
      { title: "Week 3 · Paid media and search", items: ["Meta and Google ads: campaign structure", "Search basics: keywords, intent and landing pages", "Lab: campaign maths"] },
      { title: "Week 4 · Measurement and your plan", items: ["Reading the dashboard: the six numbers that matter", "Building your one-page marketing plan", "Final assessment"] },
    ],
    admissions: {
      intake: "Monthly · Starts the first Monday of every month",
      deadline: "Enrol by the Friday before the start date",
      requirements: ["No prior marketing experience required.", "A business, product or personal brand to work on during the course (we can assign one).", "A laptop and reliable internet for live evening sessions."],
    },
  },
  {
    slug: "short-course-digital-media-marketing-professional",
    title: "Digital Media Marketing Professional · Three-Month Short Course",
    tagline: "Twelve weeks to run full-funnel marketing across search, social, content and analytics.",
    level: "SHORT_COURSE",
    format: "Hybrid · Two evenings a week plus a Saturday studio",
    durationWeeks: 12,
    tuitionPkr: 85_000,
    summary:
      "A three-month short course for people who will own a brand's digital growth: strategy and positioning, content systems, performance marketing on search and social, owned channels, an analytics stack you can trust, and AI in the daily workflow.",
    description: `The Professional short course is the full discipline in twelve weeks. It is for marketers moving into a lead role, founders taking marketing in-house, and career changers who want a portfolio rather than a certificate.

Month one is strategy: positioning, brand voice and a content system that survives contact with a real calendar. Month two is performance: Google Ads and SEO, Meta, TikTok and LinkedIn advertising with proper creative testing, and the owned channels — email and WhatsApp — that compound. Month three builds the analytics stack (GA4, pixels, UTM discipline, attribution), puts AI to work across research, creative and reporting, and ends with a 90-day growth plan for a real business, presented to faculty and a panel of practitioners.

Evening sessions run live online on Tuesdays and Thursdays. Saturday studios are in person in Lahore or live online, and are where campaigns are built, launched and reviewed together.`,
    outcomes: [
      "Write a positioning statement, messaging hierarchy and content strategy for a brand, and defend them with evidence.",
      "Plan, launch and optimise performance campaigns on Google, Meta, TikTok and LinkedIn with a creative testing framework.",
      "Build owned-channel programmes on email and WhatsApp with segmentation and measurable retention.",
      "Set up a trustworthy analytics stack, allocate budget across channels by expected return, and present a 90-day growth plan.",
    ],
    curriculum: [
      { title: "Month 1 · Strategy, brand and content", items: ["Positioning and the marketing strategy canvas", "Brand voice and messaging hierarchy", "Content strategy: pillars, formats and distribution", "Studio: brand and content system for a real client"] },
      { title: "Month 2 · Performance: search, social and owned channels", items: ["Google Ads and SEO: intent-driven growth", "Meta, TikTok and LinkedIn ads: creative testing frameworks", "Email and WhatsApp: owned channels that compound", "Lab: budget allocation across channels"] },
      { title: "Month 3 · Analytics, AI and the capstone", items: ["Analytics stack: GA4, pixels, UTM discipline and attribution", "AI in the marketing workflow", "Capstone: a 90-day growth plan", "Presentation to a practitioner panel"] },
    ],
    admissions: {
      intake: "Monthly · New cohorts start the first week of every month",
      deadline: "Enrol two weeks before the start date to secure a Saturday studio place",
      requirements: ["Some marketing exposure, or completion of Digital Media Marketing Essentials.", "A business or client to work with for the capstone (we can arrange one).", "Around six hours a week outside class for studio work."],
    },
    featured: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Courses
// ─────────────────────────────────────────────────────────────────────────────

export const shortCourses: SeedCourse[] = [
  // ───────────────────────────────────────────────────────────────────────
  {
    slug: "ai-essentials",
    title: "AI Essentials",
    subtitle: "A working understanding of modern AI in four weeks",
    description: `AI Essentials is the campus course for the one-month short course of the same name. Four modules, one per week, take you from “I use the chat thing sometimes” to a working understanding you can act on: how the models produce their output, how to brief them, how to use them with your own documents and data, and how to judge the result.

No programming is required. The one lab in the course is a short Python exercise that runs in your browser and exists to make one idea concrete: a prompt is a structured brief, and structure is what makes it reusable.

Every module ends with a quiz; the final assessment covers the whole course and unlocks your certificate.`,
    level: "BEGINNER",
    category: "Applied AI",
    durationHours: 16,
    accent: "sky",
    publishedDaysAgo: 21,
    tags: ["generative ai", "prompting", "productivity", "ai literacy", "short course"],
    learningOutcomes: [
      "Explain how language models and generative AI produce output, and why they fail.",
      "Brief an assistant with role, task, context and format to get usable first drafts.",
      "Use AI to summarise, extract from and analyse documents and spreadsheets, and verify the result.",
      "Apply a privacy, bias and hallucination checklist and write a one-page AI plan for a team.",
    ],
    prerequisites: ["No programming required", "Comfort with a web browser and everyday office tools"],
    instructorKey: "ayesha",
    programSlug: "short-course-ai-essentials",
    modules: [
      {
        title: "Week 1 · What AI is, and is not",
        summary: "The vocabulary, the mechanism and the limits, in plain language.",
        lessons: [
          {
            title: "AI, machine learning and generative models in plain language",
            type: "VIDEO",
            durationMinutes: 16,
            isPreview: true,
            videoUrl: SAMPLE_VIDEO,
            content: `## AI, machine learning and generative models in plain language

Three terms do most of the work in any conversation about AI, and they are routinely confused.

- **Artificial intelligence** is the broad ambition: software that does things we would call intelligent if a person did them.
- **Machine learning** is the method that delivered most of it: instead of writing rules, you show a program many examples and let it find the pattern. A spam filter learns from millions of labelled emails; it was never told what spam looks like.
- **Generative AI** is machine learning that produces new content — text, images, code, audio — rather than a label or a number. The assistants you use at work are generative models trained on a very large amount of text.

### What a model actually is

A model is a very large set of numbers that was adjusted, over months of training, so that it predicts well. For a language model, the prediction is simply *what comes next*. Everything else — answering questions, drafting emails, writing code — falls out of being extraordinarily good at that one task across an enormous amount of human writing.

### Why this matters for you

- A model has no access to the truth, only to patterns in what it was trained on and what you put in front of it.
- It does not know what it does not know. Confidence in the writing is not evidence.
- Its quality depends heavily on what you give it. The next three weeks are mostly about that.`,
          },
          {
            title: "How a language model produces an answer",
            type: "ARTICLE",
            durationMinutes: 12,
            content: `## How a language model produces an answer

When you send a message to an assistant, the following happens, in order.

1. **Tokenisation.** Your text is split into tokens — pieces of words — and turned into numbers. An Urdu sentence often costs more tokens than its English translation, which is why some tools feel weaker in Urdu.
2. **Context.** Your message is placed after a hidden instruction from the tool's maker and after the earlier turns of the conversation. Everything the model can “see” is this context window, and it has a limit.
3. **Prediction.** The model produces a probability for every possible next token, picks one, appends it, and repeats. It is generating one token at a time, not retrieving a stored answer.
4. **Stopping.** It stops when it predicts an end-of-message token or hits a length limit.

### Three consequences you will meet constantly

| What you see | Why it happens |
| --- | --- |
| A fluent, confident, wrong answer | The model predicts plausible text; plausibility and truth are different things |
| It “forgets” something from earlier | The earlier turn fell outside the context window |
| Different answers to the same question | Token choice has randomness; set temperature low or ask for determinism where the tool allows |

### A useful mental model

Think of the assistant as a very well-read colleague who has read almost everything but remembers none of your company's documents, cannot look anything up unless you give it the means, and will answer confidently either way. Brief that colleague well and check their work, and they are enormously useful.`,
          },
          {
            title: "Check your understanding",
            type: "QUIZ",
            durationMinutes: 6,
            content: "Three questions on the first two lessons. Retake freely; only your best score counts.",
            quiz: {
              questions: [
                { id: "ae1", prompt: "A language model is best described as…", options: ["A database of facts", "A system that predicts the next token given the context", "A search engine with a chat interface", "A set of hand-written rules"], answer: 1, explanation: "Everything a language model does emerges from predicting the next token over a very large amount of text." },
                { id: "ae2", prompt: "An assistant gives a confident answer that turns out to be false. The most likely reason is…", options: ["It was hacked", "It predicted plausible text; plausibility is not truth", "The question was too short", "The model is out of date"], answer: 1, explanation: "Fluency is a property of the writing, not evidence of accuracy. Verification is your job." },
                { id: "ae3", prompt: "The assistant has ‘forgotten’ a detail you mentioned twenty messages ago. What happened?", options: ["The detail fell outside the context window", "The model was retrained", "You used the wrong language", "It is being deliberately unhelpful"], answer: 0, explanation: "A model only sees what fits in its context window. Restate important details or start a fresh, well-briefed conversation." },
              ],
            },
          },
        ],
      },
      {
        title: "Week 2 · Working with AI assistants",
        summary: "Prompting as briefing: role, task, context, format.",
        lessons: [
          {
            title: "Prompting as briefing",
            type: "VIDEO",
            durationMinutes: 15,
            videoUrl: SAMPLE_VIDEO,
            content: `## Prompting as briefing

The word “prompt” suggests a magic phrase. Drop it. What works is the same thing that works with a capable new colleague: a clear brief.

A good brief has four parts, and in this lecture we build one live for a real task — a reply to a difficult customer email.

1. **Role.** Who should the assistant be? “You are a customer-support lead at a logistics company.” This sets tone and assumed knowledge.
2. **Task.** What exactly do you want, as a verb? “Draft a reply that apologises, explains the delay and offers a concrete remedy.”
3. **Context.** What does it need to know? The original email, your policy on refunds, the fact that this is the customer's second complaint.
4. **Format.** What should the output look like? “Under 150 words, three short paragraphs, no bullet points, sign off as Hamza.”

We then show the same task with and without each part, so that you can see what each one buys you. Role changes tone; task changes what gets done; context changes accuracy; format saves you editing time.

### Iterate, do not restart

The first draft is a draft. “Shorter.” “Less formal.” “Mention the tracking number.” Each follow-up refines; you rarely need to start over.`,
          },
          {
            title: "A prompt pattern library for everyday work",
            type: "ARTICLE",
            durationMinutes: 14,
            content: `## A prompt pattern library for everyday work

Patterns are reusable briefs. Save the ones below, adapt them to your role, and keep them where you can reach them.

### Summarise for a decision
> Summarise the document below for a busy manager who needs to decide whether to approve it. Give: the decision being asked for, three key facts, two risks, and your recommended question to ask the author. Under 200 words.

### Extract structured data
> From the text below, extract every invoice as a table with columns: supplier, invoice number, date, amount in PKR, due date. If a value is missing, write “missing”. Do not invent values.

### Rewrite for an audience
> Rewrite the following for first-year university students. Keep every fact, remove jargon, add one concrete example per paragraph.

### Red-team my plan
> Here is a plan. Act as a sceptical finance director and list the five strongest objections, each with the question you would ask me. Then say which objection is most likely to be fatal.

### Draft, then critique
> Draft a job advert for the role below. Then, in a separate section, critique your own draft against this checklist: clarity of responsibilities, inclusive language, salary transparency, realistic requirements.

### Rules that make all of these work better

- Put the material **after** the instruction, clearly delimited (for example between lines of three dashes).
- Say what to do when information is missing. Otherwise the model fills the gap.
- Ask for the format you will actually paste into: a table, a bulleted list, an email.
- Never paste personal data, passwords or anything you would not email to a stranger. Week 4 covers this properly.`,
          },
          {
            title: "Lab · Build a reusable prompt template",
            type: "LAB",
            durationMinutes: 30,
            content: `## Lab · Build a reusable prompt template

This lab makes one idea concrete: a prompt is a structured brief, and structure is what lets you reuse it.

Write \`build_prompt(role, task, context, output_format)\` in Python. It returns a single string with four lines, in this order and with these labels:

\`\`\`
Role: <role>
Task: <task>
Context: <context>
Format: <output_format>
\`\`\`

You do not need any programming experience: fill in the function body with one \`return\` statement that joins the four labelled lines with newline characters. The tests check that each label appears with its value and that the lines are in the right order.`,
            lab: {
              language: "python",
              starterCode: `def build_prompt(role, task, context, output_format):
    """Return a prompt with four labelled lines: Role, Task, Context, Format."""
    raise NotImplementedError
`,
              hint: "Build four strings like \"Role: \" + role, then join them with \"\\n\".join([...]).",
              tests: [
                { name: "includes the role and task", code: "p = build_prompt(\"marketing analyst\", \"summarise this report\", \"Q3 sales data\", \"three bullet points\")\nassert \"Role: marketing analyst\" in p\nassert \"Task: summarise this report\" in p" },
                { name: "includes the context and format", code: "p = build_prompt(\"analyst\", \"summarise\", \"Q3 sales data\", \"three bullet points\")\nassert \"Context: Q3 sales data\" in p and \"Format: three bullet points\" in p" },
                { name: "keeps the sections in order", code: "p = build_prompt(\"a\", \"b\", \"c\", \"d\")\nassert p.index(\"Role:\") < p.index(\"Task:\") < p.index(\"Context:\") < p.index(\"Format:\")" },
              ],
            },
          },
        ],
      },
      {
        title: "Week 3 · AI for documents, data and decisions",
        summary: "Summarise, extract, analyse — and verify.",
        lessons: [
          {
            title: "Summarising, extracting and analysing documents",
            type: "VIDEO",
            durationMinutes: 14,
            videoUrl: SAMPLE_VIDEO,
            content: `## Summarising, extracting and analysing documents

Documents are where AI assistants earn their keep: contracts, reports, policies, meeting transcripts, customer feedback. In this session we work through a forty-page procurement report together and do three things with it.

**Summarise** — but for a purpose. “Summarise this” produces a bland précis. “Summarise this for the question: should we renew with this supplier?” produces something you can act on.

**Extract** — pull structured facts into a table: every deadline, every amount, every named responsibility. Then verify a sample against the source. Extraction is where models quietly invent a date that looks right.

**Analyse** — ask for themes across fifty pieces of customer feedback, with a count and three verbatim quotes per theme. Verbatim quotes are your verification: search the source for them.

### The verification habit

For anything that will leave your desk: pick three claims from the output, find them in the source. If one is wrong, assume the rest need checking. Ten minutes of verification is cheaper than one wrong number in a board paper.`,
          },
          {
            title: "Spreadsheets meet AI: analysis without code",
            type: "ARTICLE",
            durationMinutes: 12,
            content: `## Spreadsheets meet AI: analysis without code

Most business data lives in spreadsheets, and most assistants can now read them. The useful workflow has four steps.

1. **Describe the data first.** Ask the assistant to list the columns, their types, the number of rows and anything odd (blank cells, mixed formats, duplicates). This catches the problems that make every later answer wrong.
2. **Ask questions in business language.** “Which region's sales fell most between Q2 and Q3, and by how much?” The assistant will write and run the calculation, or write the formula for you.
3. **Ask for the method.** “Show me how you computed that.” A formula or a short description you can check beats a bare number.
4. **Chart only after you trust the numbers.** Charts persuade; make sure the thing they persuade with is true.

### Where it fails

- **Dirty data.** “Lahore”, “lahore ” and “LHR” are three regions to a model unless you clean them. Ask it to find and fix inconsistencies, then check.
- **Hidden assumptions.** Fiscal year or calendar year? Gross or net? State them in the brief.
- **Averages of averages.** Models make the same statistical mistakes people do. If a number matters, ask for the calculation at the row level.

### A good habit

Keep a sheet called *Questions asked* with the question, the answer and the method. It becomes your audit trail and, usefully, a list of prompts that worked.`,
          },
          {
            title: "Module quiz · Working with information",
            type: "QUIZ",
            durationMinutes: 6,
            content: "Three questions on using AI with documents and data.",
            quiz: {
              questions: [
                { id: "ai1", prompt: "You asked an assistant to extract every deadline from a contract. Before relying on the table you should…", options: ["Ask it to confirm it is correct", "Check a sample of entries against the source document", "Export it to a spreadsheet", "Ask a second assistant"], answer: 1, explanation: "Models invent plausible values. Only the source document is evidence; spot-check it every time." },
                { id: "ai2", prompt: "The most useful first step when giving an assistant a spreadsheet is…", options: ["Ask for a chart", "Ask it to describe the columns, types and anything odd", "Delete the header row", "Convert it to PDF"], answer: 1, explanation: "Blank cells, mixed formats and duplicates make every later answer wrong. Find them first." },
                { id: "ai3", prompt: "A summary is most useful when…", options: ["It is as short as possible", "It is written for a specific decision or question", "It uses bullet points", "It is in formal English"], answer: 1, explanation: "Purpose shapes what to keep and what to drop. ‘Summarise this for the question X’ beats ‘summarise this’." },
              ],
            },
          },
        ],
      },
      {
        title: "Week 4 · Judgement, risk and your AI plan",
        summary: "A practical checklist, and a one-page plan you can take to your team.",
        lessons: [
          {
            title: "Hallucination, bias and privacy: a practical checklist",
            type: "ARTICLE",
            durationMinutes: 14,
            content: `## Hallucination, bias and privacy: a practical checklist

You do not need a policy document to use AI responsibly at work. You need habits. Here are the ones that matter, as a checklist you can print.

### Before you paste anything in
- [ ] Is there personal data (names with phone numbers, CNIC numbers, medical or financial details)? Remove or anonymise it.
- [ ] Is this confidential to a client or your employer? Check whether your tool keeps or trains on inputs, and whether your organisation has approved it.
- [ ] Would you be comfortable if this appeared in a stranger's inbox? If not, do not paste it.

### Before you use the output
- [ ] Have I verified every number, name, date and quotation against a source?
- [ ] Have I asked “what might be missing?” — models omit as confidently as they invent.
- [ ] Could this output treat a group of people unfairly (hiring, lending, pricing, policing)? If the decision affects people, a human decides and the model only drafts.

### Before you ship it
- [ ] Does the reader know AI helped produce it, where that matters (publications, legal and medical contexts, anything regulated)?
- [ ] Is there a person whose name is on it and who has read it? There must be.

### Why bias happens
A model learns from text written by people, and inherits their patterns — including the unfair ones. It will, unprompted, assume a doctor is a man and a nurse a woman, or write a stricter rejection letter for one name than another. The fix is not to trust it with those decisions, and to test it with varied examples when it drafts anything about people.

### Why hallucination happens
Recall from Week 1: the model predicts plausible text. When the truth is not in its training or your context, the most plausible text is still produced — and it is wrong. The cure is context (give it the source) and verification (check the output).`,
          },
          {
            title: "Where AI fits in your organisation",
            type: "VIDEO",
            durationMinutes: 15,
            videoUrl: SAMPLE_VIDEO,
            content: `## Where AI fits in your organisation

The final lecture turns four weeks of skills into a plan. We use a simple grid.

**High volume, low stakes** — first drafts, meeting notes, internal summaries, FAQ replies. Adopt now; the cost of a mistake is an edit.

**High volume, high stakes** — customer communications at scale, pricing, eligibility decisions. Pilot with a human in the loop and measurement before anything is automated.

**Low volume, high stakes** — board papers, legal documents, medical decisions. AI assists research and drafting; a named person is accountable and reads every word.

**Low volume, low stakes** — leave it; the setup is not worth it.

### Your one-page AI plan

By the end of this week you will write one page with five sections: the three tasks you will adopt now, the one pilot you will measure, what is off-limits and why, which tool your team will use and who approved it, and how you will know in ninety days whether it worked. Bring it to the final live session; we review a selection together.

### What next

If this course has made you want to build rather than only use, the three-month Applied AI short course continues from here, starting with Python from zero.`,
          },
          {
            title: "Final assessment",
            type: "QUIZ",
            durationMinutes: 10,
            content: "Four questions covering the whole course. Pass this to unlock your certificate.",
            quiz: {
              questions: [
                { id: "af1", prompt: "Which of these is NOT one of the four parts of a good brief?", options: ["Role", "Task", "Temperature", "Format"], answer: 2, explanation: "Role, task, context and format. Temperature is a model setting, not part of a brief." },
                { id: "af2", prompt: "A colleague wants to use an assistant to screen job applications and reject the weakest automatically. The right response is…", options: ["Fine, if the prompt is well written", "Decisions about people need a human; the model may draft, not decide", "Use two models and compare", "Only reject if the model is 90% confident"], answer: 1, explanation: "Hiring is high-stakes and models inherit bias. A human decides; the model can help organise information." },
                { id: "af3", prompt: "Before pasting a client contract into an assistant you should first…", options: ["Shorten it", "Check for personal or confidential data and whether the tool is approved", "Translate it to English", "Ask the assistant if it is safe"], answer: 1, explanation: "Privacy and confidentiality are checked before input, not after. The tool cannot make that judgement for you." },
                { id: "af4", prompt: "The best place to start adopting AI in a team is…", options: ["High-volume, low-stakes tasks like first drafts and meeting notes", "The most important decisions, to get the biggest gain", "Nowhere until there is a policy", "Customer-facing automation"], answer: 0, explanation: "Where mistakes are cheap and volume is high, the gain is immediate and the risk is small. Pilot the rest with measurement." },
              ],
            },
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  {
    slug: "applied-ai-for-professionals",
    title: "Applied AI for Professionals",
    subtitle: "Build with Python, data and language models over twelve weeks",
    description: `Applied AI for Professionals is the campus course for the three-month short course. It is organised in three month-long modules plus a capstone, and assumes no programming experience at the start.

Month one teaches exactly the Python and data handling you need to clean, join and describe real datasets. Month two builds a first predictive model and spends as much time on reading its results honestly as on training it. Month three is generative AI: calling a language model from code, retrieval over your own documents, and automation with guardrails.

Labs run in your browser. The capstone is an AI feature or automation for your own workplace, scoped in week nine and demonstrated in week twelve.`,
    level: "INTERMEDIATE",
    category: "Applied AI",
    durationHours: 48,
    accent: "jade",
    publishedDaysAgo: 14,
    tags: ["python", "machine learning", "generative ai", "retrieval", "automation", "short course"],
    learningOutcomes: [
      "Write and read enough Python to clean data, call APIs and automate repetitive work.",
      "Train, validate and explain a simple predictive model, including precision, recall and the cost of errors.",
      "Build a retrieval-backed assistant over a document set and evaluate its answers.",
      "Scope, build and present an AI feature or automation for a real business problem.",
    ],
    prerequisites: ["Comfort with spreadsheets", "AI Essentials or equivalent familiarity with AI assistants (recommended)"],
    instructorKey: "usman",
    programSlug: "short-course-applied-ai",
    modules: [
      {
        title: "Month 1 · Python and data for AI work",
        summary: "The smallest useful subset of Python, applied to real, messy data.",
        lessons: [
          {
            title: "Python in a week: the parts you need",
            type: "VIDEO",
            durationMinutes: 20,
            isPreview: true,
            videoUrl: SAMPLE_VIDEO,
            content: `## Python in a week: the parts you need

You do not need to “learn Python”. You need about a fifth of it, and this lecture is that fifth.

- **Values and variables.** Numbers, text (strings), true/false, and names for them.
- **Collections.** Lists for sequences, dictionaries for labelled data — which is what every row of every spreadsheet is.
- **Functions.** A named block of steps that takes inputs and returns an output. Everything you build in this course is a function.
- **Loops and conditions.** Do something for each item; do something only if a condition holds.
- **Strings.** Strip whitespace, change case, split and join. Most data cleaning is string handling.

We write a function live that takes a messy list of customer names and returns them cleaned and sorted, and we deliberately make the mistakes you will make — off-by-one, wrong indentation, comparing text to numbers — so that the error messages are familiar before you meet them alone.

### How to practise this week

Twenty minutes a day in the browser lab beats three hours on Sunday. Type the code; do not paste it.`,
          },
          {
            title: "Lab · Clean a customer list",
            type: "LAB",
            durationMinutes: 30,
            content: `## Lab · Clean a customer list

Real customer lists have the same email three times with different capitalisation and stray spaces. Write two functions:

- \`normalise_email(s)\` returns the email with surrounding whitespace removed and all letters in lower case.
- \`dedupe(emails)\` returns a list of normalised emails with duplicates removed, keeping the order in which each address first appeared.

This is the first real data-cleaning task of the course, and the pattern — normalise, then compare — is one you will use constantly.`,
            lab: {
              language: "python",
              starterCode: `def normalise_email(s):
    """Strip surrounding whitespace and lower-case the address."""
    raise NotImplementedError


def dedupe(emails):
    """Return normalised emails without duplicates, first occurrence first."""
    raise NotImplementedError
`,
              hint: "s.strip().lower() handles normalisation. For dedupe, keep a set of seen addresses and a list of results; add to both only when unseen.",
              tests: [
                { name: "normalise_email strips and lower-cases", code: "assert normalise_email(\"  Ali.Hassan@Example.com \") == \"ali.hassan@example.com\"" },
                { name: "dedupe removes case and whitespace duplicates", code: "assert dedupe([\"a@x.com\", \"A@X.com \", \"b@x.com\"]) == [\"a@x.com\", \"b@x.com\"]" },
                { name: "dedupe handles an empty list", code: "assert dedupe([]) == []" },
              ],
            },
          },
          {
            title: "Tables, joins and the questions that matter",
            type: "ARTICLE",
            durationMinutes: 15,
            content: `## Tables, joins and the questions that matter

Almost all business data is tables, and almost all useful questions need two of them joined.

### The pandas vocabulary you need

| Operation | What it answers |
| --- | --- |
| \`df.describe()\` | What does each column look like? Any impossible values? |
| \`df[df.region == "Lahore"]\` | Filter: which rows match a condition? |
| \`df.groupby("region").sales.sum()\` | Aggregate: totals per group |
| \`orders.merge(customers, on="customer_id")\` | Join: bring customer attributes onto each order |
| \`df.sort_values("sales", ascending=False).head(10)\` | Rank: top ten |

### The questions that matter

Before touching code, write the question in business language and name the two tables it needs. “Which customer segments are growing?” needs orders (with dates and amounts) and customers (with a segment). If a question needs a table you do not have, that is the finding.

### Join carefully

A join that silently drops rows (because an ID is missing on one side) or multiplies them (because an ID is repeated) is the most common source of wrong totals. After every join, check the row count against your expectation and explain any difference.

### This month's practical

Bring a dataset from your own work — anonymised — and produce a one-page description: rows, columns, oddities, and the three questions it could answer. This dataset becomes your month-two model.`,
          },
          {
            title: "Module quiz · Python and data",
            type: "QUIZ",
            durationMinutes: 6,
            content: "Three questions on the first month.",
            quiz: {
              questions: [
                { id: "ap1", prompt: "A row of a spreadsheet is best represented in Python as a…", options: ["String", "Dictionary of column name to value", "Number", "Function"], answer: 1, explanation: "Labelled data maps naturally to a dictionary; a table is a list of them, which is what pandas wraps." },
                { id: "ap2", prompt: "After joining two tables, the row count has doubled. Most likely…", options: ["The join key is repeated on one side", "Python ran twice", "The data is sorted wrongly", "The columns are in the wrong order"], answer: 0, explanation: "Repeated keys multiply rows. Always check counts after a join." },
                { id: "ap3", prompt: "The first thing to do with a new dataset is…", options: ["Train a model", "Describe it: rows, columns, types and oddities", "Delete blank rows", "Make a chart"], answer: 1, explanation: "You cannot judge any later result without knowing what the data looks like and what is wrong with it." },
              ],
            },
          },
        ],
      },
      {
        title: "Month 2 · Machine learning without the mystery",
        summary: "A first predictive model, and the discipline of reading its results honestly.",
        lessons: [
          {
            title: "Your first predictive model",
            type: "VIDEO",
            durationMinutes: 20,
            videoUrl: SAMPLE_VIDEO,
            content: `## Your first predictive model

A predictive model takes columns you know (features) and predicts a column you want (the label). We build one live in a dozen lines: will this customer churn next month, from their tenure, usage and complaints?

The steps never change:

1. **Split** the rows into training and test sets before doing anything else. The test set is touched once, at the end.
2. **Fit** a simple model — logistic regression or a small decision tree — on the training rows.
3. **Predict** on the test rows and compare to the truth.
4. **Inspect** which features mattered and whether that makes sense. A model that predicts churn from the customer ID has found a leak, not a pattern.

We deliberately start with the simplest model that could work. For most business tables it is also close to the best, and you can explain it to the person who has to act on it.`,
          },
          {
            title: "Reading a model's results honestly",
            type: "ARTICLE",
            durationMinutes: 14,
            content: `## Reading a model's results honestly

“The model is 94% accurate” is the most misleading sentence in applied AI. If 94% of customers do not churn, a model that predicts “no churn” for everyone is 94% accurate and completely useless.

### The confusion matrix

Every prediction falls into one of four boxes.

| | Predicted churn | Predicted stay |
| --- | --- | --- |
| **Actually churned** | True positive | False negative (missed) |
| **Actually stayed** | False positive (false alarm) | True negative |

From these four numbers come the two that matter:

- **Precision** = true positives ÷ (true positives + false positives). Of the customers we flagged, how many really churned? Low precision wastes retention budget on people who were staying anyway.
- **Recall** = true positives ÷ (true positives + false negatives). Of the customers who churned, how many did we catch? Low recall means the model misses the people we most wanted to find.

**F1** combines the two into a single number when you need one: 2 × precision × recall ÷ (precision + recall).

### Cost decides, not the metric

A retention call costs PKR 300; a lost customer costs PKR 9,000. Then a false alarm is cheap and a miss is expensive, so you tune the model for recall and accept lower precision. In fraud detection the costs flip. Decide the costs with the business first; choose the threshold second.

### Honest reporting

Report precision and recall on the untouched test set, state the base rate (how common the outcome is), and say what the model is *not* for. That paragraph is what separates an analyst from a demo.`,
          },
          {
            title: "Lab · Precision, recall and the cost of being wrong",
            type: "LAB",
            durationMinutes: 30,
            content: `## Lab · Precision, recall and the cost of being wrong

Implement the three metrics from the previous lesson from counts of true positives (\`tp\`), false positives (\`fp\`) and false negatives (\`fn\`):

- \`precision(tp, fp)\`
- \`recall(tp, fn)\`
- \`f1(tp, fp, fn)\`

When a denominator would be zero, return \`0.0\` rather than raising an error — a model that flags nobody has a precision of zero, not a crash.`,
            lab: {
              language: "python",
              starterCode: `def precision(tp, fp):
    raise NotImplementedError


def recall(tp, fn):
    raise NotImplementedError


def f1(tp, fp, fn):
    raise NotImplementedError
`,
              hint: "Guard each division: if the denominator is 0, return 0.0. For f1, compute p and r first and guard p + r == 0.",
              tests: [
                { name: "precision", code: "assert abs(precision(8, 2) - 0.8) < 1e-9" },
                { name: "recall", code: "assert abs(recall(8, 8) - 0.5) < 1e-9" },
                { name: "f1 combines precision and recall", code: "assert abs(f1(8, 2, 8) - (2 * 0.8 * 0.5 / (0.8 + 0.5))) < 1e-9" },
                { name: "zero denominators return 0.0", code: "assert precision(0, 0) == 0.0 and recall(0, 0) == 0.0 and f1(0, 0, 0) == 0.0" },
              ],
            },
          },
          {
            title: "Module quiz · Models and metrics",
            type: "QUIZ",
            durationMinutes: 6,
            content: "Three questions on the second month.",
            quiz: {
              questions: [
                { id: "am1", prompt: "A churn model is 96% accurate on a dataset where 96% of customers stay. The model is…", options: ["Excellent", "Possibly useless; check precision and recall against the base rate", "Overfitting", "Underfitting"], answer: 1, explanation: "Predicting ‘stay’ for everyone achieves the same accuracy. Accuracy hides everything when classes are imbalanced." },
                { id: "am2", prompt: "A missed churner costs far more than an unnecessary retention call. You should tune for…", options: ["Precision", "Recall", "Accuracy", "Speed"], answer: 1, explanation: "When misses are expensive and false alarms are cheap, catch more of the positives even at the cost of more false alarms." },
                { id: "am3", prompt: "The test set should be…", options: ["Used to choose the model", "Touched once, at the end", "The largest part of the data", "The same as the training set"], answer: 1, explanation: "Any decision made using the test set leaks into the model and inflates the reported performance." },
              ],
            },
          },
        ],
      },
      {
        title: "Month 3 · Generative AI and automation",
        summary: "Call a model from code, give it your documents, automate with guardrails.",
        lessons: [
          {
            title: "Calling a language model from code",
            type: "VIDEO",
            durationMinutes: 18,
            videoUrl: SAMPLE_VIDEO,
            content: `## Calling a language model from code

Using a model from Python instead of a chat window changes what you can do: process a thousand documents, not one; produce structured output a spreadsheet can read; plug the result into the next step.

In this session we:

- Make a first API call with a system prompt and a user message, and read the response.
- Ask for **structured output** (JSON with named fields) and validate it before trusting it — a field that is missing or the wrong type is a signal to retry or flag, not to guess.
- Loop over a folder of customer emails, classify each by intent and urgency, and write the results to a CSV.
- Watch the **cost**: tokens in and out, per call and per thousand calls, and the two levers that control it — shorter context and a smaller model where quality allows.

### Keys and safety

Your API key is a password. It lives in an environment variable, never in code, never in a shared notebook. We set this up properly in the first ten minutes and never discuss it again.`,
          },
          {
            title: "Retrieval: giving the model your documents",
            type: "ARTICLE",
            durationMinutes: 15,
            content: `## Retrieval: giving the model your documents

A model knows nothing about your policies, products or past tickets. Retrieval-augmented generation (RAG) fixes this in three steps, and the idea is simpler than the acronym.

1. **Chunk** your documents into passages of a few hundred words. Chunks that overlap slightly avoid cutting an answer in half.
2. **Index** each chunk so that you can find the ones relevant to a question — by keywords, by embeddings (vectors that capture meaning), or both.
3. **Answer** by placing the top few chunks in the context along with the question and the instruction: *answer only from the passages below; say so if they do not contain the answer.*

### What makes it work in practice

- **Chunk size is a decision.** Too small and context is lost; too large and the relevant sentence is buried. Start around 300–500 words with 10–20% overlap and measure.
- **Citations.** Ask the model to quote the passage it used. A quote you can find in the source is your verification.
- **Evaluation.** Write twenty real questions with known answers before you build. Score every change against them. Without this you are guessing.

### Where it fails

Questions that need information from many documents at once (“what changed between the 2023 and 2025 policies?”) need more than top-k retrieval. Recognising that a question is out of scope for your assistant is a feature, and the instruction above gives the model permission to say so.`,
          },
          {
            title: "Lab · Chunk a document for retrieval",
            type: "LAB",
            durationMinutes: 30,
            content: `## Lab · Chunk a document for retrieval

Write \`chunk_text(text, size, overlap)\` that splits a string into chunks of at most \`size\` characters. Start a new chunk every \`size - overlap\` characters until the text is exhausted, so that neighbouring chunks share \`overlap\` characters. An empty text produces an empty list.

In production you would chunk by tokens or sentences, but the mechanics are identical and this version runs in your browser.`,
            lab: {
              language: "python",
              starterCode: `def chunk_text(text, size, overlap=0):
    """Split text into chunks of at most \`size\` characters, stepping by size - overlap."""
    raise NotImplementedError
`,
              hint: "Compute step = max(1, size - overlap). Loop start from 0 while start < len(text), appending text[start:start + size].",
              tests: [
                { name: "splits without overlap", code: "assert chunk_text(\"abcdefghij\", 4, 0) == [\"abcd\", \"efgh\", \"ij\"]" },
                { name: "overlapping chunks share characters", code: "cs = chunk_text(\"abcdefghij\", 4, 2)\nassert cs[0] == \"abcd\" and cs[1] == \"cdef\" and all(len(c) <= 4 for c in cs)" },
                { name: "empty text gives no chunks", code: "assert chunk_text(\"\", 4, 1) == []" },
              ],
            },
          },
          {
            title: "Automation with guardrails",
            type: "ARTICLE",
            durationMinutes: 12,
            content: `## Automation with guardrails

Once a model can read your documents and produce structured output, the temptation is to let it act: send the reply, update the record, approve the refund. Sometimes that is right. The rules below keep it safe.

### The three tiers

| Tier | Example | Who acts |
| --- | --- | --- |
| **Draft** | Reply to a customer email | Model drafts, person sends |
| **Propose** | Categorise and route a ticket | Model acts, person reviews a sample daily |
| **Act** | Tag incoming documents by type | Model acts, with monitoring and an undo |

Start every automation one tier lower than you think it deserves. Promote it when the measured error rate justifies it.

### Guardrails that cost nothing

- **Allow-lists.** The automation can only call the functions you listed. Everything else is refused.
- **Confirmation for irreversible actions.** Sending money, deleting data, emailing a customer: a person clicks.
- **Validation before action.** If the structured output is malformed or a field is out of range, stop and flag — never “do your best”.
- **Logs you can read.** Every input, output and action, with a timestamp. When something goes wrong, this is how you find out what.

### The capstone brief, in short

Pick a task in your workplace that is high-volume and currently done by hand. Decide its tier. Build it with the tools from this month. Measure it against twenty real examples. Present what it gets right, what it gets wrong and what you would need before promoting it a tier. That is a professional AI feature, and it is what you will demonstrate in week twelve.`,
          },
        ],
      },
      {
        title: "Capstone",
        summary: "Scope, build, measure and present an AI feature for your workplace.",
        lessons: [
          {
            title: "Capstone brief · An AI feature for your workplace",
            type: "ARTICLE",
            durationMinutes: 20,
            content: `## Capstone brief · An AI feature for your workplace

### What you deliver
1. A **one-page scope**: the task, who does it today, how often, what good looks like, and the tier (draft, propose, act).
2. A **working feature** built with the tools from this course: a script or small app that performs the task on real (anonymised) inputs.
3. An **evaluation** on at least twenty real examples with a short table of results — for predictive work, precision and recall against the cost of errors; for generative work, a rubric scored by you and one colleague.
4. A **ten-minute demonstration** to faculty and your cohort, ending with what you would need before promoting it a tier.

### Suggested projects from past cohorts
- Classifying and routing incoming supplier invoices (propose tier).
- A policy assistant for a HR team, with citations, over the staff handbook (draft tier).
- Weekly churn-risk list for a subscription business, with a retention call script (propose tier).
- Drafting first responses to customer reviews across three platforms (draft tier).

### How it is assessed
Honesty of the evaluation weighs more than how impressive the demo looks. A feature that does one thing reliably and reports its own failure rate scores higher than a wide one that cannot say how often it is wrong.

### Timeline
Scope agreed in week nine. Build in weeks ten and eleven with Saturday lab support. Demonstrations in week twelve.`,
          },
          {
            title: "Final assessment",
            type: "QUIZ",
            durationMinutes: 10,
            content: "Four questions across the course. Pass this to unlock your certificate.",
            quiz: {
              questions: [
                { id: "ac1", prompt: "A retrieval assistant should be instructed to…", options: ["Answer from general knowledge when the documents are silent", "Answer only from the retrieved passages and say when they do not contain the answer", "Always produce an answer", "Use the longest passages available"], answer: 1, explanation: "Permission to say ‘not in the documents’ is what stops the model inventing an answer that sounds like your policy." },
                { id: "ac2", prompt: "Your automation sends refunds. Which tier should it start at?", options: ["Act, since it is simple", "Draft or propose, with a person confirming the irreversible action", "Act, with daily review", "It should never be automated"], answer: 1, explanation: "Sending money is irreversible. Start low, measure, promote when the error rate justifies it." },
                { id: "ac3", prompt: "The model's structured output is missing a required field. You should…", options: ["Fill in a sensible default", "Stop and flag it; never guess", "Ask the model to try harder", "Ignore the field"], answer: 1, explanation: "Validation before action is the cheapest guardrail there is. Malformed output is a signal, not an inconvenience." },
                { id: "ac4", prompt: "Which capstone would score highest?", options: ["A wide assistant with an impressive demo and no evaluation", "A narrow feature evaluated on twenty real examples with a stated failure rate", "A model with the highest accuracy", "The one with the most features"], answer: 1, explanation: "The course assesses honesty and reliability. Knowing how often it is wrong is the professional skill." },
              ],
            },
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  {
    slug: "digital-media-marketing-essentials",
    title: "Digital Media Marketing Essentials",
    subtitle: "Plan, run and measure a campaign in four weeks",
    description: `Digital Media Marketing Essentials is the campus course for the one-month short course. Four weekly modules take you around the whole loop: understanding where your audience's attention is, making content that earns it, paying for reach sensibly on Meta and Google, and reading the results without being fooled.

You work on a real business throughout — your own, your employer's, or one we assign — and finish with a one-page marketing plan and a campaign ready to launch. AI assistants are used throughout for research, drafts and reporting, with clear guidance on where they help and where they mislead.

One short lab teaches the campaign arithmetic (CTR, CPA, ROAS) that every later decision depends on. Quizzes close each week; the final assessment unlocks your certificate.`,
    level: "BEGINNER",
    category: "Digital Marketing",
    durationHours: 16,
    accent: "coral",
    publishedDaysAgo: 18,
    tags: ["social media", "content marketing", "paid media", "google ads", "meta ads", "analytics", "short course"],
    learningOutcomes: [
      "Map a customer journey and pick the channels where your audience's attention actually is.",
      "Produce a four-week content calendar with platform-appropriate posts.",
      "Structure a paid campaign on Meta and Google with sensible targeting, budget and creative.",
      "Compute CTR, CPA and ROAS from a dashboard and decide what to scale and what to stop.",
    ],
    prerequisites: ["No prior marketing experience required", "A business, product or personal brand to work on (we can assign one)"],
    instructorKey: "mahnoor",
    programSlug: "short-course-digital-media-marketing-essentials",
    modules: [
      {
        title: "Week 1 · The digital marketing landscape",
        summary: "Channels, funnels and the audience you are actually trying to reach.",
        lessons: [
          {
            title: "Channels, funnels and where attention lives",
            type: "VIDEO",
            durationMinutes: 15,
            isPreview: true,
            videoUrl: SAMPLE_VIDEO,
            content: `## Channels, funnels and where attention lives

Digital marketing is a loop: reach people, earn their attention, earn their trust, earn the sale, earn the repeat. Every channel is good at one or two of those and poor at the others.

### The funnel, honestly

- **Awareness** — they learn you exist. Short video, display, influencer content, PR.
- **Consideration** — they weigh you against alternatives. Search, reviews, comparison content, email.
- **Conversion** — they buy or sign up. Landing pages, retargeting, offers, WhatsApp.
- **Retention** — they come back and tell others. Email, community, loyalty, service.

Most small businesses spend at the top and measure at the bottom, then conclude marketing does not work. Spend where your bottleneck is.

### Where attention is in Pakistan right now

We look at current usage data for Pakistan: time spent on YouTube, TikTok, Facebook, Instagram and WhatsApp by age group, and what each is used for. The point is not the numbers, which change, but the habit of checking them before choosing a channel.

### Your week-one practical

Pick your business. Write down who buys, where they spend their attention, and which funnel stage is your bottleneck. That one page drives every decision for the next three weeks.`,
          },
          {
            title: "Audience first: personas, intent and the customer journey",
            type: "ARTICLE",
            durationMinutes: 12,
            content: `## Audience first: personas, intent and the customer journey

Nothing in this course works without a clear picture of who you are talking to. Not “women 25–40”; a person.

### A persona that is useful

A useful persona answers six questions:

1. What problem are they trying to solve when they find you?
2. What have they already tried?
3. What would make them hesitate to buy from you?
4. Where do they spend attention, and at what time of day?
5. Who else influences the decision?
6. What does a good outcome look like to them, in their words?

Build it from evidence: ten conversations with real customers, your reviews and your competitors' reviews, the comments under popular posts in your category. AI assistants are excellent at summarising this material into themes; they are poor at inventing personas from nothing, and you should not ask them to.

### Intent

The same person has different intent at different moments. Someone searching “best laptop for students under 100,000” is comparing. Someone searching your brand name is nearly ready. Someone scrolling TikTok at 11pm is not shopping at all. Match the message to the moment: inform the comparer, reassure the nearly-ready, entertain the scroller.

### The journey map

Draw the stages from first contact to repeat purchase, and at each stage write what they are thinking, what they need from you and which channel reaches them. Gaps in that table are your marketing plan.`,
          },
          {
            title: "Module quiz · Landscape and audience",
            type: "QUIZ",
            durationMinutes: 6,
            content: "Three questions on week one.",
            quiz: {
              questions: [
                { id: "de1", prompt: "A business gets plenty of website visitors but few purchases. The bottleneck is most likely at…", options: ["Awareness", "Conversion", "Retention", "Reach"], answer: 1, explanation: "Traffic is arriving; it is not turning into sales. Fix the landing page, offer and trust signals before buying more traffic." },
                { id: "de2", prompt: "Which persona statement is most useful?", options: ["Women, 25–40, urban", "A new mother in Karachi comparing baby-food brands at night, worried about ingredients, influenced by mothers' groups on WhatsApp", "Anyone who likes our page", "Middle-income families"], answer: 1, explanation: "It names a problem, a moment, a hesitation and an influence. Each of those tells you something to do." },
                { id: "de3", prompt: "Someone searching your brand name has…", options: ["Low intent", "High intent; reassure and make buying easy", "No intent", "The same intent as a TikTok scroller"], answer: 1, explanation: "Brand searches come from people who already know you and are close to deciding." },
              ],
            },
          },
        ],
      },
      {
        title: "Week 2 · Content and social media",
        summary: "Content that earns attention, on a calendar you can keep.",
        lessons: [
          {
            title: "Content that earns attention on each platform",
            type: "VIDEO",
            durationMinutes: 16,
            videoUrl: SAMPLE_VIDEO,
            content: `## Content that earns attention on each platform

Each platform rewards a different behaviour, and the same post performs very differently across them. In this session we take one idea — a behind-the-scenes look at how a product is made — and produce it four ways.

- **Instagram.** Reels for reach, carousels for saves, stories for the people who already follow you. Visual first; the caption is secondary.
- **TikTok.** The first second decides everything. Native, unpolished, with a hook spoken or on screen. Trends are a vehicle, not the message.
- **LinkedIn.** Text posts with a strong first line, a story and a lesson. Professional, but personal beats corporate every time.
- **YouTube.** Search-driven. Titles and thumbnails do most of the work; retention in the first thirty seconds does the rest. Shorts for discovery, long-form for trust.

### The three content jobs

Every piece of content does one of three jobs: **reach** new people, **build trust** with people who know you, or **convert** people who are ready. Plan a mix, label each post with its job, and judge it by the metric for that job — reach by views and shares, trust by saves and comments, conversion by clicks and sales. Judging a trust post by sales is how good content gets cancelled.`,
          },
          {
            title: "A four-week content calendar you can keep",
            type: "ARTICLE",
            durationMinutes: 12,
            content: `## A four-week content calendar you can keep

Consistency beats brilliance. The calendar below is designed to be sustainable by one person with a phone and three hours a week.

### The structure

| Day | Job | Format |
| --- | --- | --- |
| Monday | Trust | Story or lesson from the work (text or talking-head) |
| Wednesday | Reach | Short video on a trend or a common question |
| Friday | Convert | Offer, testimonial or product demonstration |
| Daily | Presence | Stories: behind the scenes, polls, replies |

Three pillars, repeated. Twelve posts a month, not sixty.

### Batch, then schedule

Film or write all of next week's content in one two-hour block. Use a scheduling tool so that posting does not depend on your mood. Keep a running list of questions customers ask; it is an inexhaustible source of Wednesday posts.

### Where AI helps

Drafting captions from your bullet points, suggesting hooks, turning one long video into six short ones, writing alt text. Where it does not help: deciding what you stand for, and anything that needs to sound like a real person who runs this business. Edit everything it writes until it sounds like you.

### Measure weekly, change monthly

Look at the numbers once a week; change the plan once a month. Reacting to a single post's performance is how calendars die.`,
          },
          {
            title: "Writing for the feed: hooks, captions and calls to action",
            type: "ARTICLE",
            durationMinutes: 12,
            content: `## Writing for the feed: hooks, captions and calls to action

People do not read feeds; they scan them. Writing for the feed is writing for someone deciding, in under a second, whether to stop.

### Hooks that stop the scroll

- **A specific result.** “We cut our delivery time from 5 days to 2. Here is what changed.”
- **A contrarian claim.** “Most Lahore restaurants waste their marketing budget on one thing.”
- **A question they ask themselves.** “Why does your ad get clicks but no sales?”
- **A number.** “3 mistakes I made launching a clothing brand.”

Write ten hooks for every post and keep the best one. This is the single highest-leverage habit in the course.

### Captions

One idea per post. Short sentences. Line breaks. Say the useful thing early; people rarely tap “more”. Write in the language your customers use — if they mix Urdu and English, so should you.

### Calls to action

One per post, and make it small: “Save this for later”, “Reply with your city”, “DM us the word PRICE”. Big asks (“Buy now”) belong on Friday's conversion post and in ads, not on every piece of content.

### A test you can apply to anything

Read it on your phone. If the first line would not stop *you*, rewrite it.`,
          },
        ],
      },
      {
        title: "Week 3 · Paid media and search",
        summary: "Buying reach without wasting it.",
        lessons: [
          {
            title: "Meta and Google ads: campaign structure in one hour",
            type: "VIDEO",
            durationMinutes: 18,
            videoUrl: SAMPLE_VIDEO,
            content: `## Meta and Google ads: campaign structure in one hour

Paid media is the fastest way to reach people and the fastest way to lose money. Structure is what separates the two. In this session we build one campaign on each platform, live, for the same business.

### Meta (Facebook and Instagram)

- **Campaign** — one objective: awareness, traffic, leads or sales. Pick the one that matches your bottleneck from week one.
- **Ad set** — audience, placement, budget and schedule. Start broad; the system finds buyers better than your guesses do. Use a custom audience of past customers for retargeting.
- **Ads** — at least three creatives per ad set so that the platform can learn which works. Vertical video, a strong first second, and a clear offer.

### Google

- **Search** — bid on words people type when they want what you sell. Match types control how loosely. Negative keywords stop you paying for “free” and “jobs”.
- **Performance Max and Shopping** for products; **YouTube** for awareness.
- Every click lands on a page that matches the words in the ad. A mismatch is the most common reason search campaigns fail.

### Budget and patience

Start small, PKR 1,000–2,000 a day, for a week. Do not touch anything for the first three days; the platforms need data. Then kill the worst creative, not the campaign.`,
          },
          {
            title: "Search basics: keywords, intent and landing pages",
            type: "ARTICLE",
            durationMinutes: 13,
            content: `## Search basics: keywords, intent and landing pages

Search is the one channel where the customer tells you exactly what they want. Both paid search and organic search (SEO) begin with the same work.

### Keyword research in an afternoon

1. List the ten things customers ask you most.
2. Type each into Google and note the autocomplete suggestions and the “People also ask” box.
3. Use a free keyword tool to get rough volumes and the competition level.
4. Sort by intent: **informational** (“how to clean leather shoes”), **comparison** (“best leather shoes Lahore”), **transactional** (“buy leather shoes online Pakistan”).

Pay for transactional words. Write content for informational and comparison ones.

### Landing pages

The page a click lands on decides whether the money was wasted. A good landing page:

- repeats the words from the ad in the headline;
- shows the product or outcome above the fold, on a phone;
- has one clear next step (buy, book, WhatsApp us) and no navigation to wander off into;
- loads in under three seconds on a mobile connection;
- includes trust: reviews, delivery terms, a returns policy, a real address.

### SEO in one paragraph

Write the genuinely best page on the internet for each informational and comparison query that matters to you, in the language your customers search in, make it fast, and earn links and mentions from people who matter in your category. It takes months, it compounds for years, and it is the cheapest traffic you will ever get.`,
          },
          {
            title: "Lab · Campaign maths",
            type: "LAB",
            durationMinutes: 25,
            content: `## Lab · Campaign maths

Three numbers decide whether a campaign lives or dies. Implement them in JavaScript.

- \`ctr(clicks, impressions)\` — click-through rate as a percentage. Return \`0\` when there are no impressions.
- \`cpa(spend, conversions)\` — cost per acquisition. Return \`null\` when there are no conversions (the cost is undefined, not zero).
- \`roas(revenue, spend)\` — return on ad spend as a multiple. Return \`0\` when there is no spend.

A campaign with 2,500 impressions and 50 clicks has a CTR of 2%. PKR 12,000 spent for 40 sales is a CPA of PKR 300. PKR 90,000 of revenue from PKR 30,000 of spend is a ROAS of 3.`,
            lab: {
              language: "javascript",
              starterCode: `function ctr(clicks, impressions) {
  // percentage, e.g. 2 for 2%
}

function cpa(spend, conversions) {
  // cost per acquisition, or null when there are no conversions
}

function roas(revenue, spend) {
  // multiple, e.g. 3 for 3x
}
`,
              hint: "Check the denominator first in each function, then divide. CTR multiplies by 100.",
              tests: [
                { name: "ctr is a percentage", code: "if (Math.abs(ctr(50, 2500) - 2) > 1e-9) throw new Error(String(ctr(50, 2500)));" },
                { name: "cpa divides spend by conversions", code: "if (cpa(12000, 40) !== 300) throw new Error(String(cpa(12000, 40)));" },
                { name: "roas is a multiple", code: "if (Math.abs(roas(90000, 30000) - 3) > 1e-9) throw new Error(String(roas(90000, 30000)));" },
                { name: "zero denominators are handled", code: "if (ctr(5, 0) !== 0 || cpa(500, 0) !== null || roas(100, 0) !== 0) throw new Error('zero handling');" },
              ],
            },
          },
        ],
      },
      {
        title: "Week 4 · Measurement and your plan",
        summary: "The numbers that matter, and a plan on one page.",
        lessons: [
          {
            title: "Reading the dashboard: the six numbers that matter",
            type: "ARTICLE",
            durationMinutes: 14,
            content: `## Reading the dashboard: the six numbers that matter

Every platform dashboard shows forty numbers. Six of them tell you what to do.

| Number | What it tells you | What to do when it is bad |
| --- | --- | --- |
| **Reach** | How many people saw you | Creative is not being distributed; change format or budget |
| **CTR** | Whether the creative earns the click | The hook or offer is weak; test new creatives |
| **Landing-page conversion rate** | Whether the page turns clicks into actions | Fix the page before buying more clicks |
| **CPA** | What each customer costs | Compare to what a customer is worth; cut what is above it |
| **ROAS** | Revenue per rupee of spend | Below break-even, stop or fix; above it, scale carefully |
| **Retention / repeat rate** | Whether customers come back | Marketing cannot fix a product problem; find out why |

### Vanity metrics

Likes, follower counts and impressions feel good and decide nothing. Report them if you must; never act on them alone.

### Attribution, briefly

Platforms each claim credit for the same sale. Expect the sum of their reported conversions to exceed reality. Use a single source of truth — your own sales data, with UTM-tagged links — and treat platform numbers as directional.

### Weekly review, in fifteen minutes

Open your six numbers. For each one below target, write one sentence: what you will change this week. Scale one thing, stop one thing. Close the dashboard.`,
          },
          {
            title: "Building your one-page marketing plan",
            type: "VIDEO",
            durationMinutes: 14,
            videoUrl: SAMPLE_VIDEO,
            content: `## Building your one-page marketing plan

Four weeks of work fits on one page, and a plan that fits on one page is one that gets followed. Together we complete the template for a real business from the cohort.

1. **Who** — the persona from week one, in three lines.
2. **Bottleneck** — the funnel stage you are fixing this quarter, with the number that proves it.
3. **Channels** — two organic, one paid. Not more.
4. **Content calendar** — the three-pillar weekly rhythm from week two.
5. **Paid plan** — objective, audience, daily budget, three creatives, landing page.
6. **Numbers** — your six, with current values and a 90-day target.
7. **Review rhythm** — fifteen minutes weekly, one hour monthly.

### Then launch

A plan that is not launched within a week of being written usually never is. Launch the paid campaign at a small budget before the final session; bring the first three days of numbers.

### What next

If you want to own the whole discipline — strategy, performance across every major platform, analytics you can trust and AI across the workflow — the three-month Digital Media Marketing Professional short course continues from here.`,
          },
          {
            title: "Final assessment",
            type: "QUIZ",
            durationMinutes: 10,
            content: "Four questions across the course. Pass this to unlock your certificate.",
            quiz: {
              questions: [
                { id: "df1", prompt: "A campaign has a high CTR and a low landing-page conversion rate. The first fix is…", options: ["More budget", "New ad creatives", "The landing page", "A different platform"], answer: 2, explanation: "The ad is doing its job; the page is not. Buying more clicks to a page that does not convert wastes money faster." },
                { id: "df2", prompt: "Which of these is a vanity metric?", options: ["CPA", "ROAS", "Follower count", "Landing-page conversion rate"], answer: 2, explanation: "Followers feel good and decide nothing on their own. The others connect directly to money." },
                { id: "df3", prompt: "A sustainable weekly content rhythm for one person is…", options: ["Two posts a day on every platform", "Three pillar posts a week plus daily stories, batched in one block", "One post a month", "Whatever trends that day"], answer: 1, explanation: "Consistency beats volume. Three jobs, three posts, batched, scheduled." },
                { id: "df4", prompt: "After launching a Meta campaign you should…", options: ["Edit it every few hours", "Leave it for about three days so that the platform can learn, then cut the worst creative", "Pause it if the first day is poor", "Double the budget on day one"], answer: 1, explanation: "Platforms need data to optimise. Early edits reset learning; patient, small changes win." },
              ],
            },
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  {
    slug: "digital-media-marketing-professional",
    title: "Digital Media Marketing Professional",
    subtitle: "Full-funnel marketing across search, social, content and analytics",
    description: `Digital Media Marketing Professional is the campus course for the three-month short course. Three month-long modules cover the whole discipline: strategy and content systems in month one; performance marketing across Google, Meta, TikTok, LinkedIn and owned channels in month two; analytics, AI in the workflow and a 90-day growth plan in month three.

The course is built for people who will own a brand's growth. It is practical throughout — campaigns are built and launched in Saturday studios — and insists on measurement you can defend. One lab teaches budget allocation by expected return, the decision that most separates professionals from enthusiasts.

Quizzes close each month; the final assessment and the capstone presentation complete the course.`,
    level: "INTERMEDIATE",
    category: "Digital Marketing",
    durationHours: 48,
    accent: "gold",
    publishedDaysAgo: 10,
    tags: ["marketing strategy", "performance marketing", "seo", "google ads", "meta ads", "email marketing", "analytics", "short course"],
    learningOutcomes: [
      "Write a positioning statement, messaging hierarchy and content strategy for a brand, and defend them with evidence.",
      "Plan, launch and optimise performance campaigns on Google, Meta, TikTok and LinkedIn with a creative testing framework.",
      "Build owned-channel programmes on email and WhatsApp with segmentation and measurable retention.",
      "Set up a trustworthy analytics stack, allocate budget by expected return, and present a 90-day growth plan.",
    ],
    prerequisites: ["Some marketing exposure, or Digital Media Marketing Essentials", "A business or client to work with for the capstone (we can arrange one)"],
    instructorKey: "mahnoor",
    programSlug: "short-course-digital-media-marketing-professional",
    modules: [
      {
        title: "Month 1 · Strategy, brand and content",
        summary: "Positioning, voice and a content system that survives a real calendar.",
        lessons: [
          {
            title: "Positioning and the marketing strategy canvas",
            type: "VIDEO",
            durationMinutes: 20,
            isPreview: true,
            videoUrl: SAMPLE_VIDEO,
            content: `## Positioning and the marketing strategy canvas

Tactics without positioning is noise with a budget. This opening session builds a one-page strategy canvas for a real Pakistani brand, live, and the same canvas is the first deliverable of your capstone.

### Positioning in one sentence

*For* [who] *who* [need], [brand] *is the* [category] *that* [key benefit], *unlike* [alternative], *because* [reason to believe].

Every word is a decision. “For busy professionals in Lahore who want restaurant-quality meals at home, Dastarkhwan is the meal-kit service that delivers in 30 minutes, unlike supermarket ready-meals, because we cook to order from a central kitchen.” You can market that. You cannot market “quality food for everyone”.

### The canvas

Nine boxes: customer and problem, alternatives, positioning statement, proof, pricing and offer, channels by funnel stage, the one metric that matters this quarter, budget, and the risks you are choosing to accept. We fill each one and show what changes downstream when a box changes.

### Evidence

Positioning is a hypothesis. Test it with five customer conversations and one small paid test before building a calendar around it. We show how a cohort client discovered their real buyer was not the one on the canvas, and what that saved them.`,
          },
          {
            title: "Brand voice and messaging hierarchy",
            type: "ARTICLE",
            durationMinutes: 14,
            content: `## Brand voice and messaging hierarchy

A brand with a clear voice can hand content to a freelancer, an agency or an AI assistant and get back something that sounds like itself. One without it rewrites everything.

### Voice in four dials

Set each dial from one to five and write one example line at that setting.

| Dial | 1 | 5 |
| --- | --- | --- |
| Formal ↔ Casual | “We are pleased to announce” | “Big news, people” |
| Serious ↔ Playful | Plain statement | Jokes, wordplay |
| Expert ↔ Companion | Teaches | Sits beside you |
| Restrained ↔ Bold | Understated | Loud, opinionated |

Add the words you always use, the words you never use, and how you handle Urdu and English together. That page is your voice guide.

### Messaging hierarchy

- **Core message** — the positioning benefit, in the customer's words. One line.
- **Pillars** — three reasons to believe it. Each becomes a content pillar.
- **Proof points** — specific facts under each pillar: numbers, named customers, process details, awards.
- **Objection handlers** — the three hesitations from your persona, each with a one-line answer and proof.

Every post, ad and email draws from this hierarchy. When content strays from it, you will notice, and so will the audience.

### Using AI without losing the voice

Paste the voice guide and the hierarchy at the top of any brief. Ask for three drafts at different dial settings and pick the one that sounds right, then edit. Never publish a first draft; the voice is in the edit.`,
          },
          {
            title: "Content strategy: pillars, formats and distribution",
            type: "ARTICLE",
            durationMinutes: 15,
            content: `## Content strategy: pillars, formats and distribution

A content strategy answers three questions: what we talk about, in what forms, and how it reaches people. Most brands answer only the first.

### Pillars

Three to four topics that connect your expertise to your customer's problems, drawn from the messaging hierarchy. A fintech for freelancers might choose: getting paid from abroad, managing irregular income, tax for the self-employed, and stories of freelancers who scaled. Everything you publish fits a pillar or it does not get published.

### Formats, by job

| Job | Formats |
| --- | --- |
| Reach | Short vertical video, carousels, collaborations with creators |
| Trust | Long-form video, case studies, founder posts, newsletters |
| Convert | Demos, comparison pages, testimonials, offers |
| Retain | Email series, community, customer education |

### The hub-and-spoke system

Produce one substantial piece a week — a long video, an in-depth article, a webinar — and cut it into ten to fifteen spokes: clips, quotes, carousels, a newsletter section, a thread. One idea, fifteen appearances, three hours of production. This is the only content system that survives contact with a real calendar.

### Distribution is half the work

Publishing is not distribution. For each piece: the platforms it goes to, the communities and groups where it is relevant, the people who might share it, the paid boost if it performs organically, and the email list. Plan distribution before production; it changes what you make.

### Measure by job

Reach pieces by views and shares. Trust pieces by saves, comments and newsletter sign-ups. Convert pieces by clicks and sales. A monthly review, not a daily one.`,
          },
          {
            title: "Module quiz · Strategy and content",
            type: "QUIZ",
            durationMinutes: 6,
            content: "Three questions on month one.",
            quiz: {
              questions: [
                { id: "dp1", prompt: "Which positioning statement is usable?", options: ["Quality products for everyone", "For first-time car buyers in Karachi who fear being cheated, CarCheck is the inspection service that sends a certified mechanic within 24 hours, unlike dealer inspections, because we are paid by the buyer", "The best brand in Pakistan", "Innovative solutions for modern life"], answer: 1, explanation: "It names a customer, a fear, a category, a benefit, an alternative and a reason to believe. Each is a lever you can pull." },
                { id: "dp2", prompt: "The hub-and-spoke system means…", options: ["Posting the same thing on every platform", "One substantial piece a week, cut into many platform-specific spokes", "Hiring a spokesperson", "Only publishing long-form content"], answer: 1, explanation: "One idea, many appearances, little production time. It is the sustainable way to be present everywhere." },
                { id: "dp3", prompt: "The best way to keep an AI assistant on-brand is…", options: ["Ask it to be creative", "Brief it with the voice guide and messaging hierarchy, then edit", "Use a different assistant for each platform", "Never use it for copy"], answer: 1, explanation: "Voice lives in the brief and in the edit. A model given the guide produces drafts worth editing." },
              ],
            },
          },
        ],
      },
      {
        title: "Month 2 · Performance: search, social and owned channels",
        summary: "Buying growth on every major platform, and building the channels you own.",
        lessons: [
          {
            title: "Google Ads and SEO: intent-driven growth",
            type: "VIDEO",
            durationMinutes: 22,
            videoUrl: SAMPLE_VIDEO,
            content: `## Google Ads and SEO: intent-driven growth

Search is the channel where demand already exists; your job is to be the best answer. We build a professional search account live and audit a real site for SEO.

### Google Ads account structure

- **Campaigns by intent and margin**, not by product. Brand, high-intent generic, comparison, competitor.
- **Ad groups** of tightly related keywords with ads that repeat them.
- **Match types** used deliberately: exact for proven terms, phrase for discovery, broad only with strong conversion data and smart bidding.
- **Negative keyword lists** shared across campaigns, reviewed weekly from the search terms report.
- **Conversion tracking that you trust** before any bidding automation. Smart bidding optimises to whatever you tell it is a conversion; tell it the truth.
- **Performance Max** for e-commerce catalogues, with brand exclusions so that it does not claim credit for people who were coming anyway.

### SEO, the professional version

Technical health (speed, mobile, crawlability, no duplicate pages), content mapped to query intent, and authority earned through mentions and links from sites that matter in your category. We run a crawl, read the Search Console reports and build a six-month content roadmap from the keyword gaps.

### How search and social work together

Social creates demand; search captures it. Watch brand-search volume rise after a strong social campaign; that lift is the metric most dashboards miss.`,
          },
          {
            title: "Meta, TikTok and LinkedIn ads: creative testing frameworks",
            type: "VIDEO",
            durationMinutes: 20,
            videoUrl: SAMPLE_VIDEO,
            content: `## Meta, TikTok and LinkedIn ads: creative testing frameworks

On social platforms the targeting is increasingly automated and the creative is the strategy. Professionals win by testing creative systematically.

### The testing framework

1. **Hypothesis.** “A customer-testimonial video will outperform a product demonstration for cold audiences.”
2. **Variables.** Change one thing at a time: hook, format, offer, length, voice. Hold the rest constant.
3. **Structure.** One campaign with the platform's testing feature, or separate ad sets with equal budgets, so that results are comparable.
4. **Decision rule, set in advance.** “Winner is the lowest CPA after 50 conversions or seven days, whichever is first.”
5. **Log.** A sheet of every test, result and learning. After three months the sheet is worth more than the account.

### Platform notes

- **Meta.** Advantage+ for scale, with broad targeting and a dozen creatives it can rotate. Retargeting for people who visited and did not buy.
- **TikTok.** Creative decays fast; plan for a new batch every two weeks. Spark Ads to boost creator content that already works.
- **LinkedIn.** Expensive clicks, precise job-title targeting. Use for B2B lead generation with a document or event, and retarget visitors with thought-leadership posts.

### Creative production at scale

A monthly creative sprint: ten hooks, three formats, two offers. AI tools for variations, captions and translations between Urdu and English; people for the idea and the final cut.`,
          },
          {
            title: "Email and WhatsApp: owned channels that compound",
            type: "ARTICLE",
            durationMinutes: 13,
            content: `## Email and WhatsApp: owned channels that compound

Every rented channel can raise its prices or change its algorithm tomorrow. The list of people who gave you permission to contact them is the only asset in marketing that compounds.

### Building the list

- A reason to join that is worth more than a discount: a guide, a tool, early access, a weekly note people actually want.
- Capture on every page, every receipt, every ad landing page, and in-store with a QR code.
- Ask for WhatsApp opt-in separately and explicitly; it is a more intimate channel, and spam burns it fast.

### Segmentation that pays

Three segments beat thirty. New subscribers (welcome series), customers (replenishment and cross-sell), lapsed customers (win-back). Each gets a different rhythm and message.

### The automations worth building first

| Automation | Trigger | Why it pays |
| --- | --- | --- |
| Welcome series | Sign-up | Highest open rates you will ever see; set expectations and make the first offer |
| Abandoned cart or enquiry | Left without buying | Recovers 5–15% of lost sales |
| Post-purchase | Order delivered | Reviews, referrals, the second purchase |
| Win-back | 90 days inactive | Cheaper than acquiring a new customer |

### WhatsApp specifically

Business API, approved templates, replies within minutes, and a human available when the conversation needs one. Order updates, appointment reminders and considered-purchase conversations work; broadcast promotions three times a week do not. Measure reply rate and block rate, not just delivery.

### Measurement

Revenue per subscriber per month, list growth net of unsubscribes, and the share of total revenue that comes from owned channels. A healthy direct-to-consumer brand gets 25–40% of revenue from email and WhatsApp.`,
          },
          {
            title: "Lab · Budget allocation across channels",
            type: "LAB",
            durationMinutes: 30,
            content: `## Lab · Budget allocation across channels

Allocating a budget by expected return is the decision that most separates professionals from enthusiasts. Implement it in JavaScript.

- \`allocateBudget(total, channels)\` takes a total budget and an array of \`{ name, expectedRoas }\`. Return an object mapping each channel name to its share of the budget, allocated in proportion to its expected ROAS and rounded to whole rupees. A channel with an expected ROAS of zero receives nothing.
- \`breakEvenRoas(marginPct)\` returns the ROAS at which an ad spend breaks even for a given gross margin percentage: at a 25% margin you need PKR 4 of revenue for every PKR 1 of spend.

Proportional allocation is a starting point, not the end: in the studio we refine it with diminishing returns and minimum test budgets.`,
            lab: {
              language: "javascript",
              starterCode: `function allocateBudget(total, channels) {
  // return { [name]: amount } proportional to expectedRoas, rounded to whole rupees
}

function breakEvenRoas(marginPct) {
  // the ROAS at which spend breaks even for a gross margin percentage
}
`,
              hint: "Sum the expectedRoas values, then each channel gets total * (its roas / sum), rounded. Break-even ROAS is 100 / marginPct.",
              tests: [
                { name: "allocates in proportion to expected ROAS", code: "const r = allocateBudget(100000, [{name:'search',expectedRoas:4},{name:'social',expectedRoas:1}]);\nif (r.search !== 80000 || r.social !== 20000) throw new Error(JSON.stringify(r));" },
                { name: "allocations add up to the total", code: "const r = allocateBudget(90000, [{name:'a',expectedRoas:1},{name:'b',expectedRoas:1},{name:'c',expectedRoas:1}]);\nconst sum = Object.values(r).reduce((n,v)=>n+v,0);\nif (Math.abs(sum - 90000) > 1) throw new Error('total '+sum);" },
                { name: "a zero-ROAS channel gets nothing", code: "const r = allocateBudget(50000, [{name:'x',expectedRoas:0},{name:'y',expectedRoas:2}]);\nif (r.x !== 0 || r.y !== 50000) throw new Error(JSON.stringify(r));" },
                { name: "break-even ROAS from margin", code: "if (Math.abs(breakEvenRoas(25) - 4) > 1e-9) throw new Error(String(breakEvenRoas(25)));" },
              ],
            },
          },
          {
            title: "Module quiz · Performance",
            type: "QUIZ",
            durationMinutes: 6,
            content: "Three questions on month two.",
            quiz: {
              questions: [
                { id: "dq1", prompt: "Before enabling smart bidding in Google Ads you must have…", options: ["A large budget", "Conversion tracking you trust", "At least ten campaigns", "Broad match on every keyword"], answer: 1, explanation: "Automation optimises to whatever you call a conversion. If that signal is wrong, it optimises confidently in the wrong direction." },
                { id: "dq2", prompt: "A good creative test changes…", options: ["Everything at once to find the best combination", "One variable at a time with a decision rule set in advance", "The budget daily", "Platforms every week"], answer: 1, explanation: "Changing one thing is the only way to learn why something won. The decision rule stops you fooling yourself." },
                { id: "dq3", prompt: "Owned channels matter because…", options: ["They are free", "The list of people who gave permission is the only marketing asset that compounds and cannot be repriced by a platform", "They have the highest reach", "Algorithms favour them"], answer: 1, explanation: "Rented reach can change tomorrow. Permission-based relationships are yours." },
              ],
            },
          },
        ],
      },
      {
        title: "Month 3 · Analytics, AI and the capstone",
        summary: "Numbers you can defend, AI across the workflow, and a 90-day plan.",
        lessons: [
          {
            title: "Analytics stack: GA4, pixels, UTM discipline and attribution",
            type: "ARTICLE",
            durationMinutes: 16,
            content: `## Analytics stack: GA4, pixels, UTM discipline and attribution

A professional can say where every sale came from, within reason, and knows exactly how much to trust that answer.

### The stack

1. **Web analytics (GA4)** for behaviour on your site: sources, pages, events, conversions. Configure the events that matter — purchase, lead, sign-up — and nothing else until those are right.
2. **Platform pixels and conversion APIs** (Meta, TikTok, Google, LinkedIn) so that each platform can optimise. Server-side where possible; browser restrictions have halved what pixels alone can see.
3. **A tag manager** so that adding or changing tracking does not need a developer every time.
4. **A single source of truth** — your orders or CRM — against which every platform's claims are checked.

### UTM discipline

Every link you control gets \`utm_source\`, \`utm_medium\` and \`utm_campaign\`, from a shared naming sheet, in lower case, with no spaces. One person owns the sheet. Without this, GA4 reports a growing pile of “direct” traffic that is actually your own campaigns.

### Attribution, honestly

Each platform claims the sales it touched; summed, they exceed reality, sometimes by double. Use GA4's data-driven model as one view, platform numbers as another, and your sales data as the truth. For big decisions, run a **geo or holdout test**: pause a channel in one city for two weeks and see what actually happens to sales. It is the only attribution that does not depend on anyone's model.

### The weekly report

One page: the six numbers from Essentials, by channel, with week-on-week change, and three sentences on what you will do. If it takes more than an hour to produce, automate it; AI assistants write the three sentences well when given the table.`,
          },
          {
            title: "AI in the marketing workflow: research, creative, reporting",
            type: "VIDEO",
            durationMinutes: 18,
            videoUrl: SAMPLE_VIDEO,
            content: `## AI in the marketing workflow: research, creative, reporting

AI has not replaced marketers. It has changed what a marketer's week looks like. We walk through one real week and show where the tools go.

### Research (Monday)

Summarise 200 reviews into themes with verbatim quotes. Analyse competitors' ad libraries for hooks and offers. Draft the persona update from interview transcripts. Verify every quote exists; the summaries are excellent, the quotes occasionally invented.

### Creative (Tuesday to Thursday)

Ten hooks from a brief. Thirty caption variants in the brand voice. Translations between Urdu and English with a native-speaker check. Image and video variations for testing. Script outlines for the week's hub piece. People own the idea, the final line and the decision to publish.

### Operations (daily)

Classify inbound messages by intent. Draft replies for a person to send. Clean and tag the UTM sheet. Spot anomalies in the daily numbers and write a one-line note.

### Reporting (Friday)

Turn the weekly table into three sentences for the client. Draft the monthly narrative. Build a first-draft deck. Always from the real numbers, never from memory — give the model the data.

### The rules

Verify anything factual. Edit anything public. Never paste customer personal data. Keep a prompt library per client. And measure: the hours saved per week, and whether the content performs as well as before. A tool that saves time and lowers CTR has not helped.`,
          },
          {
            title: "Capstone brief · A 90-day growth plan for a real business",
            type: "ARTICLE",
            durationMinutes: 20,
            content: `## Capstone brief · A 90-day growth plan for a real business

### What you deliver
1. **Strategy canvas** — positioning, persona, bottleneck, the one metric that matters.
2. **Messaging and content system** — voice guide, hierarchy, pillars, a four-week calendar with the hub-and-spoke plan.
3. **Performance plan** — channels chosen with reasons, a budget allocated by expected return with a break-even ROAS, campaign structures for at least two platforms, and a creative testing plan with decision rules.
4. **Owned-channel plan** — list-building mechanism, three segments, the first four automations.
5. **Analytics plan** — events, UTM sheet, source of truth, the weekly one-page report.
6. **Evidence** — at least one live test run during the course, with results, and what changed in the plan because of it.
7. **A fifteen-minute presentation** to faculty and a panel of practitioners, with the plan on no more than twelve slides.

### How it is assessed
Coherence (does every tactic serve the positioning?), evidence (did you test anything, and did you change your mind?), and honesty about measurement (do you know what you cannot know?). Budget size and production polish are not assessed.

### Timeline
Client and canvas agreed by week four. Live test launched by week eight. Plan complete in week eleven. Presentations in week twelve.`,
          },
          {
            title: "Final assessment",
            type: "QUIZ",
            durationMinutes: 10,
            content: "Four questions across the course. Pass this to unlock your certificate.",
            quiz: {
              questions: [
                { id: "dz1", prompt: "The platforms together report 400 conversions; your orders system shows 250. The likely explanation is…", options: ["Your orders system is broken", "Each platform claims the sales it touched, so platform totals overlap", "Fraud", "Tracking is doubled on the site"], answer: 1, explanation: "Overlapping attribution is normal. Treat platform numbers as directional and your sales data as the truth." },
                { id: "dz2", prompt: "The most reliable way to learn what a channel actually contributes is…", options: ["Its own dashboard", "GA4 last-click", "A geo or holdout test", "Asking customers"], answer: 2, explanation: "Turning a channel off somewhere and measuring the effect does not depend on any attribution model." },
                { id: "dz3", prompt: "At a 20% gross margin, the break-even ROAS is…", options: ["2", "5", "20", "0.2"], answer: 1, explanation: "100 ÷ 20 = 5. Every rupee of spend must return five rupees of revenue just to cover itself." },
                { id: "dz4", prompt: "Which capstone would score highest?", options: ["A large budget plan with polished slides and no tests", "A coherent plan that ran one live test, changed because of it, and states what it cannot measure", "The plan with the most channels", "A plan built entirely by an AI assistant"], answer: 1, explanation: "Coherence, evidence and honest measurement are the assessment criteria. Polish and budget are not." },
              ],
            },
          },
        ],
      },
    ],
  },
];
