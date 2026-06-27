# Mockbros Hackathon Tasks - Huy

## Context

Mockbros is a mock interview product. The hackathon demo should communicate one clear idea:

**Job seekers can practice interviews, answer realistic questions, and receive instant AI feedback that helps them improve.**

Deadline: **15:45 today**.

You own business analysis, user need, UI flow, UX decisions, and pitch narrative. Your goal is to make the product feel useful, understandable, and demo-ready even if the backend is minimal.

## Role

You have a business background. Focus on:

- Market problem.
- User pain.
- Persona.
- User journey.
- UI flow.
- Demo story.
- Pitch clarity.

Do not spend time on complex visual polish if the core flow is unclear. The judges need to understand the product in less than 30 seconds.

## Hard Scope

Design for this vertical slice:

1. Candidate lands on Mockbros.
2. Candidate chooses interview type.
3. Candidate answers 3 questions.
4. Candidate submits.
5. Candidate receives AI feedback report.

Do not design today:

- Employer dashboard.
- Candidate marketplace.
- Payment screens.
- Live video room.
- Full account settings.
- Admin management screens.

## Deliverable 1: Target User And Market Need

Define the hackathon target user.

Recommended persona:

```text
Name: Minh
Profile: Junior job seeker or fresh graduate
Problem: Has interviews soon but does not know whether answers are good
Current alternatives: YouTube videos, friends, expensive coaching, random ChatGPT prompts
Need: Structured practice, realistic questions, instant feedback, clear improvement steps
```

Write:

- 3 user pains.
- 3 reasons current solutions are weak.
- 3 reasons Mockbros is better.

Suggested user pains:

- "I do not know if my answer is convincing."
- "I cannot afford repeated interview coaching."
- "I freeze in real interviews because practice is unstructured."

Acceptance:

- Persona can be explained in under 30 seconds.
- Pain points directly connect to the demo flow.

## Deliverable 2: Product Positioning

Create a short positioning statement.

Template:

```text
Mockbros helps job seekers practice realistic interviews and receive instant AI feedback, so they can improve before the real interview instead of guessing what went wrong afterward.
```

Also define:

- Primary user: job seeker.
- First market: students, fresh graduates, and junior professionals.
- Main value: practice + feedback + confidence.
- Differentiator: structured mock interview flow, not just a generic chatbot.

Acceptance:

- Positioning appears in pitch and/or first screen.
- No vague HR platform wording. Focus on mock interviews.

## Deliverable 3: UI Flow

Design a simple UI flow with 4 screens.

### Screen 1: Entry / Interview Selection

Purpose:

- Explain what Mockbros does.
- Let user pick an interview type.

Required elements:

- Product name: Mockbros.
- Short value proposition.
- Interview cards:
  - Software Engineer
  - Product Manager
  - Sales
  - General Behavioral
- CTA: "Start mock interview"

Avoid:

- Long marketing copy.
- Too many options.
- Employer features.

### Screen 2: Interview Practice

Purpose:

- User answers 3 questions.

Required elements:

- Interview title.
- Progress indicator: Question 1 of 3.
- Question text.
- Answer textarea or voice placeholder.
- Next question button.
- Submit button on final question.

Hackathon simplification:

- Text answer is enough.
- You may visually imply voice/video as future capability, but do not block demo on it.

### Screen 3: Loading / Evaluation

Purpose:

- Make AI processing understandable.

Required elements:

- "Analyzing your interview answers..."
- 3 lightweight status lines:
  - Checking clarity.
  - Reviewing answer structure.
  - Generating improvement suggestions.

Keep this short. Do not add long fake processing if backend is fast.

### Screen 4: Feedback Report

Purpose:

- Show value of Mockbros.

Required sections:

- Overall score.
- Readiness level.
- Summary.
- Strengths.
- Weaknesses.
- Recommended improvements.
- Per-question feedback.
- Improved answer example.

Acceptance:

- User can understand what to improve without explanation from the presenter.
- Feedback screen is the strongest screen in the demo.

## Deliverable 4: UX Copy

Write concise UI copy.

Suggested hero copy:

```text
Practice interviews before the real one.
Mockbros gives you realistic questions and instant AI feedback so you know what to improve.
```

Suggested selection copy:

```text
Choose a role and complete a short 3-question mock interview.
```

Suggested feedback copy:

```text
Your interview report is ready.
Review your score, strengths, weak points, and better ways to answer.
```

Acceptance:

- Copy is simple enough for a non-technical judge.
- No overclaiming, such as guaranteed job offers.

## Deliverable 5: Feedback Report Design

Define the final report display in detail.

Report sections:

### Score Summary

Fields:

- Overall score: `0-100`.
- Readiness level:
  - Needs Practice
  - Almost Ready
  - Ready

### Strengths

Show 2-4 bullet points.

Example:

- "You gave concrete examples from past work."
- "Your answer clearly explained the situation and action."

### Weaknesses

Show 2-4 bullet points.

Example:

- "The answer needs a stronger result or impact metric."
- "Some explanations were too general."

### Recommendations

Show 2-4 action-oriented bullets.

Example:

- "Use the STAR structure: Situation, Task, Action, Result."
- "Add one measurable outcome to each story."

### Per-Question Feedback

For each question:

- Question text.
- User answer preview.
- Score.
- Feedback.
- Improved answer.

Acceptance:

- Backend feedback JSON can map directly to this UI.
- The report feels like coaching, not just scoring.

## Deliverable 6: Frontend/API Coordination

Coordinate with backend owner.

Required API data:

- Interview templates.
- Questions for selected interview.
- Submit answer payload.
- Feedback report response.

Ask backend for these exact flows:

1. `GET /interview-templates`
2. `POST /interviews`
3. `POST /interviews/:id/start`
4. `POST /interviews/:id/answers`
5. `POST /interviews/:id/submit`
6. `GET /interviews/:id/feedback`

Acceptance:

- UI flow does not require APIs that backend is not building.
- Any missing backend capability has a demo fallback.

## Deliverable 7: Pitch Narrative

Prepare a 3-minute pitch.

Suggested structure:

### 0:00-0:30 Problem

Job seekers practice interviews poorly. They often do not know whether their answers are clear, structured, or convincing until after they fail a real interview.

### 0:30-1:00 Solution

Mockbros gives structured mock interviews with realistic questions and instant AI feedback.

### 1:00-2:00 Demo

Show:

1. Choose interview.
2. Answer questions.
3. Submit.
4. Read feedback.

### 2:00-2:30 Market

Start with students, fresh graduates, and junior professionals. Expand to universities, bootcamps, and career centers.

### 2:30-3:00 Business Model

Possible models:

- Free basic interviews.
- Paid advanced feedback.
- University/bootcamp subscriptions.
- Premium role-specific question packs.

Acceptance:

- Pitch is under 3 minutes.
- Demo and pitch use the same persona.
- Business model is plausible but not the center of the demo.

## Deliverable 8: Demo Fallback Content

Prepare static fallback content in case backend or AI fails.

Required:

- One complete software engineer interview example.
- Three sample answers.
- One sample feedback report.

Sample score:

```text
Overall score: 74
Readiness: Almost Ready
Summary: The candidate gives relevant examples but should add clearer impact metrics and more structured answers.
```

Acceptance:

- If API fails, team can still present the product value.
- Fallback content matches the real UI design.

## Final Huy Checklist

- [ ] Persona is written.
- [ ] Pain points are written.
- [ ] Positioning statement is written.
- [ ] Four-screen UI flow is defined.
- [ ] Feedback report layout is defined.
- [ ] UI copy is ready.
- [ ] API needs are aligned with backend.
- [ ] 3-minute pitch is ready.
- [ ] Static fallback demo content is ready.
