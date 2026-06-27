# HR-Gold Product Plan

## Product Overview

**Name:** HR-Gold (working title)
**Target Market:** Vietnam initially, global extensible
**Domain:** HR Technology Platform
**Segments:** Working professionals + Education (students/fresh graduates)
**MVP Timeline:** 6 months

---

## Phase Roadmap

### Phase 1: Foundation (Month 1-2)
**Focus:** Core infrastructure + CV review tool

| Feature | Description |
|---------|-------------|
| CV Parser | Extract data from PDF/DOCX/Images |
| CV Template System | Beautiful, standardized CV builder |
| HR Dashboard | Review, score, filter candidates |
| User Auth | Login/register for HR and candidates |
| Candidate Profile | Create/edit searchable profile |

### Phase 2: Intelligence Assessment (Month 2-4)
**Focus:** Question banks + Games + AI evaluation

| Feature | Description |
|---------|-------------|
| Question Bank System | Categories, difficulty, tagging, segment (School/Work) |
| Cognitive Games - School | Aptitude tests for students/fresh grads |
| Cognitive Games - Work | Assessment for experienced professionals |
| Language Assessment - Vietnamese | Reading, writing, comprehension games |
| Language Assessment - English | TOEIC/IELTS-style games and quizzes |
| AI Scoring Engine | GPT/Gemini-based evaluation |
| Psychological Probing | Implicit questions to detect authenticity, reduce "perfect" mindset |
| Personality Tests | MBTI, Big Five assessments |
| Skill Assessments | Technical skill quizzes |

### Phase 3: Mock Interview (Month 3-5)
**Focus:** AI-powered interview platform

| Feature | Description |
|---------|-------------|
| Audio Interview | Voice-based AI interview |
| Video Interview | Webcam-based AI interview |
| Interview Questions - School | Entry-level, internship, graduate roles |
| Interview Questions - Work | Experienced, senior, management roles |
| Recording & Playback | Review past interviews |
| Feedback Reports | AI-generated interview feedback with authenticity scoring |
| Psychological Questions | Unobtrusive questions to reveal true personality vs. "performed" answers |
| Retry (Free) | Limited free attempts |
| Correction (Paid) | Pay to fix/correct answers after seeing mistakes |

### Phase 4: Job Platform (Month 4-6)
**Focus:** Job listing and matching

| Feature | Description |
|---------|-------------|
| Job Listings | Post/view jobs with filters |
| Company Profiles | Employer company pages |
| Smart Matching | AI candidate-job matching |
| Application System | Apply tracking pipeline |
| Search & Filter | Advanced candidate search |

### Phase 5: Data Marketplace (Month 5-6+)
**Focus:** Candidate profile monetization

| Feature | Description |
|---------|-------------|
| Profile Marketplace | Share/sell candidate profiles |
| Employer Access | Purchase candidate leads |
| Privacy Controls | Candidate consent management |
| Pricing Models | Subscription or per-profile |

### Future Phases (Post-MVP)
- Contract & insurance management
- Profit/sharing management
- Multi-language support
- Enterprise features (ATS, onboarding)
- School/College partnership portal
- University funding programs
- Student internship matching

---

## Technical Architecture

### High-Level Overview

```mermaid
flowchart TB
    subgraph Clients
        Web["Web (Next.js + React Games)"]
        Mobile["Mobile (React Native)"]
        Admin["Admin Dashboard"]
    end

    subgraph CDN
        CDN1["CDN (Cloudflare)"]
    end

    Web --> CDN1
    Mobile --> CDN1
    Admin --> CDN1

    subgraph Gateway
        API["API Gateway (Kong/NGINX)"]
    end

    CDN1 --> API

    subgraph Services
        UserS["User Service (Node.js)"]
        JobS["Job Service (Node.js)"]
        CVS["CV Service (Python)"]
        IntS["Interview Service (Golang + WebRTC)"]
        AssS["Assessment Service (Python + React)"]
        AIS["AI Service (Python + LLM)"]
    end

    API --> UserS
    API --> JobS
    API --> CVS
    API --> IntS
    API --> AssS
    API --> AIS

    subgraph MessageQueue
        MQ["Kafka (cv-parsing, ai-score, interview-events, notify)"]
    end

    UserS --> MQ
    JobS --> MQ
    CVS --> MQ
    IntS --> MQ
    AssS --> MQ
    AIS --> MQ

    subgraph Data
        PG["PostgreSQL"]
        RD["Redis"]
        S3["S3/MinIO"]
        CH["ClickHouse"]
    end

    MQ --> PG
    MQ --> RD
    MQ --> S3
    PG --> CH

    subgraph Supporting
        MON["Prometheus"]
        LOG["ELK Stack"]
        ME["Meilisearch"]
        ES["Elasticsearch"]
    end
```

### Microservices Breakdown

| Service | Tech | Responsibility |
|----------|------|----------------|
| API Gateway | Kong / NGINX | Auth, routing, rate limit |
| User Service | Node.js + TS | Auth, profiles, roles |
| Job Service | Node.js + TS | Job CRUD, applications |
| CV Service | Python + FastAPI | CV parsing, storage |
| Assessment Service | Python + FastAPI | Games, quizzes, scoring |
| Interview Service | Golang + WebRTC | Video/audio calls, recording |
| AI Service | Python + FastAPI | GPT/Gemini integration |
| Notification Service | Node.js | Email, SMS, push notifications |
| Payment Service | Node.js | Subscriptions, transactions |
| Analytics Service | Python | Usage stats, reports |

### Service Communication

#### 1. Client to Gateway

```mermaid
flowchart TB
    subgraph Clients
        Web["Web (Next.js + React)"]
        Mobile["Mobile (React Native)"]
        Admin["Admin Dashboard"]
    end

    subgraph CDN
        CDN["CDN (Cloudflare)"]
    end

    subgraph Gateway
        API["API Gateway (Kong/NGINX)"]
    end

    Web --> CDN
    Mobile --> CDN
    Admin --> CDN
    CDN --> API
```

#### 2. API Gateway to Services (REST)

```mermaid
flowchart LR
    API["API Gateway"]

    subgraph Auth_Services
        US["User Service"]
    end

    subgraph Business_Services
        JS["Job Service"]
        CVS["CV Service"]
    end

    subgraph User_Services
        NS["Notification"]
        PS["Payment"]
    end

    API --> US
    API --> JS
    API --> CVS
    API --> NS
    API --> PS
```

#### 3. Internal Service Communication (gRPC)

```mermaid
flowchart TB
    subgraph Gateway
        G["API Gateway"]
    end

    subgraph Core_Services
        US["User Service"]
        JS["Job Service"]
    end

    subgraph ML_Services
        CVS["CV Service"]
        ASS["Assessment"]
        AIS["AI Service"]
    end

    G --> US
    G --> JS

    US --> CVS
    JS --> CVS

    US --> ASS
    JS --> ASS

    US --> AIS
    JS --> AIS
    CVS --> AIS
```

#### 4. Async Processing (Kafka)

```mermaid
flowchart TB
    subgraph Producers
        US["User Service"]
        JS["Job Service"]
        CVS["CV Service"]
        ASS["Assessment"]
        IntS["Interview"]
    end

    subgraph Kafka
        K["Kafka Cluster"]
        
        subgraph Topics
            T1["cv-parsing"]
            T2["ai-score"]
            T3["interview-events"]
            T4["notifications"]
            T5["analytics"]
        end
    end

    subgraph Consumers
        CP["CV Parser"]
        SC["AI Scorer"]
        NF["Notifier"]
        AnS["Analytics"]
    end

    US --> K
    JS --> K
    CVS --> K
    ASS --> K
    IntS --> K

    K --> T1
    K --> T2
    K --> T3
    K --> T4
    K --> T5

    T1 --> CP
    T2 --> SC
    T3 --> NF
    T4 --> NF
    T5 --> AnS
```

#### 5. Service to Data Stores

```mermaid
flowchart TB
    subgraph Services
        US["User Service"]
        JS["Job Service"]
        CVS["CV Service"]
        ASS["Assessment"]
        IntS["Interview"]
        PS["Payment"]
    end

    subgraph Data_Layer
        PG["PostgreSQL (Primary)"]
        RD["Redis (Cache)"]
        S3["S3/MinIO (Files)"]
        CH["ClickHouse (Warehouse)"]
    end

    US --> PG
    JS --> PG
    CVS --> PG
    ASS --> PG
    IntS --> PG
    PS --> PG

    US --> RD
    JS --> RD
    IntS --> RD

    CVS --> S3
    IntS --> S3

    PG --> CH
```

#### 6. Real-time Communication (WebSocket)

```mermaid
flowchart LR
    subgraph Clients
        WebSocket["Web Client"]
    end

    subgraph Gateway
        WS["WebSocket Gateway"]
    end

    subgraph Realtime_Services
        IntS["Interview Service"]
        NS["Notification Service"]
    end

    WebSocket --> WS
    WS --> IntS
    WS --> NS

    IntS -.-> WebSocket
    NS -.-> WebSocket
```

### Database Schema

#### 1. Core User & Profile

```mermaid
erDiagram
    USER {
        uuid id PK
        string email
        string password_hash
        enum role
        bool is_active
    }

    USER_PROFILE {
        uuid id PK
        uuid user_id FK
        string full_name
        string phone
        string avatar_url
        date date_of_birth
        text bio
    }

    EDUCATION {
        uuid id PK
        uuid profile_id FK
        string school
        string degree
        string field_of_study
    }

    WORK_EXPERIENCE {
        uuid id PK
        uuid profile_id FK
        string company_name
        string job_title
        date start_date
        date end_date
    }

    CERTIFICATION {
        uuid id PK
        uuid profile_id FK
        string name
        string issuer
        date issue_date
    }

    SKILL {
        uuid id PK
        uuid category_id FK
        string name
    }

    SKILL_CATEGORY {
        uuid id PK
        string name
        string name_vi
    }

    USER ||--o{ USER_PROFILE : has
    USER_PROFILE ||--o{ EDUCATION : has
    USER_PROFILE ||--o{ WORK_EXPERIENCE : has
    USER_PROFILE ||--o{ CERTIFICATION : has
    USER_PROFILE ||--o{ USER_SKILL : has
    SKILL }o--|| SKILL_CATEGORY : belongs_to
```

#### 2. Company & Jobs

```mermaid
erDiagram
    COMPANY {
        uuid id PK
        uuid user_id FK
        string name
        uuid industry_id FK
        enum size
        int founded_year
        string website
        string logo_url
        text description
        text address
        bool verified
    }

    COMPANY_IMAGE {
        uuid id PK
        uuid company_id FK
        string image_url
        int sort_order
    }

    JOB {
        uuid id PK
        uuid company_id FK
        uuid function_id FK
        string title
        text description
        decimal salary_min
        decimal salary_max
        string salary_currency
        enum job_type
        string location
        enum remote_type
        enum experience_level
        enum status
        int views_count
    }

COMPANY ||--o{ COMPANY_IMAGE : has
    COMPANY ||--o{ JOB : posts
    JOB }o--|| JOB_FUNCTION : belongs_to
    JOB ||--o{ JOB_SKILL : has
```

> Note: JOB_INDUSTRY, SKILL_CATEGORY, SKILL reference tables in Diagram #11

#### 3. Applications

#### 3. Applications

```mermaid
erDiagram
    APPLICATION {
        uuid id PK
        uuid user_id FK
        uuid job_id FK
        uuid cv_id FK
        text cover_letter
        enum status
        text hr_note
        timestamp interview_scheduled
        timestamp applied_at
        timestamp updated_at
    }

    CV_PARSED {
        uuid id PK
        uuid user_id FK
        string original_filename
        string file_url
        jsonb parsed_data
        jsonb parsed_skills
        jsonb education
        jsonb experience
        enum parsing_status
        timestamp parsed_at
    }

    APPLICATION ||--o{ APPLICATION_STATUS_HISTORY : tracks
    USER ||--o{ APPLICATION : submits
    JOB ||--o{ APPLICATION : receives
    CV_PARSED ||--o{ APPLICATION : used_in
```

#### 4. Assessments & Games

```mermaid
erDiagram
    ASSESSMENT_SESSION {
        uuid id PK
        uuid user_id FK
        enum assessment_type
        enum segment
        enum status
        timestamp started_at
        timestamp completed_at
        int time_spent_seconds
    }

    GAME_SESSION {
        uuid id PK
        uuid assessment_id FK
        uuid game_type_id FK
        int score
        int time_taken_seconds
        enum difficulty
    }

    LANGUAGE_ASSESSMENT {
        uuid id PK
        uuid assessment_id FK
        uuid language_id FK
        uuid level_id FK
        int score
    }

    AI_SCORE {
        uuid id PK
        uuid assessment_id FK
        uuid intelligence_type_id FK
        decimal score
        decimal confidence
    }

    GAME_TYPE {
        uuid id PK
        string code
        string name
        string name_vi
    }

    INTELLIGENCE_TYPE {
        uuid id PK
        string code
        string name
        string name_vi
    }

    INTELLIGENCE_SUBTYPE {
        uuid id PK
        uuid type_id FK
        string name
    }

    LANGUAGE {
        uuid id PK
        string code
        string name
    }

    LANGUAGE_LEVEL {
        uuid id PK
        uuid language_id FK
        string level_code
        string name
    }

    QUESTION_CATEGORY {
        uuid id PK
        string name
        string name_vi
    }

    QUESTION_BANK {
        uuid id PK
        uuid category_id FK
        string question_text
        jsonb options
        string correct_answer
    }

    ASSESSMENT_QUESTION {
        uuid id PK
        uuid session_id FK
        uuid question_id FK
        text user_answer
        bool is_correct
    }

    GAME_TYPE ||--o{ INTELLIGENCE_TYPE : maps_to
    INTELLIGENCE_TYPE ||--o{ INTELLIGENCE_SUBTYPE : has
    LANGUAGE ||--o{ LANGUAGE_LEVEL : has

    ASSESSMENT_SESSION ||--o{ GAME_SESSION : includes
    ASSESSMENT_SESSION ||--o{ LANGUAGE_ASSESSMENT : measures
    ASSESSMENT_SESSION ||--o{ AI_SCORE : generates
    ASSESSMENT_SESSION ||--o{ ASSESSMENT_QUESTION : answers
    GAME_SESSION }o--|| GAME_TYPE : uses
    LANGUAGE_ASSESSMENT }o--|| LANGUAGE : tests
    LANGUAGE_ASSESSMENT }o--|| LANGUAGE_LEVEL : level
    AI_SCORE }o--|| INTELLIGENCE_TYPE : measures
    QUESTION_BANK }o--|| QUESTION_CATEGORY : belongs_to
    QUESTION_BANK ||--o{ ASSESSMENT_QUESTION : provides
```

#### 5. Interviews

```mermaid
erDiagram
    INTERVIEW {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        enum interview_type
        enum segment
        enum status
        int questions_count
        int current_question
        timestamp started_at
        timestamp ended_at
    }

    INTERVIEW_QUESTION {
        uuid id PK
        uuid interview_id FK
        int question_order
        text question_text
        enum question_type
        int expected_duration
        text user_answer
        string audio_url
    }

    INTERVIEW_RECORDING {
        uuid id PK
        uuid interview_id FK
        string file_url
        int file_size
        int duration_seconds
    }

    INTERVIEW_FEEDBACK {
        uuid id PK
        uuid interview_id FK
        decimal overall_score
        jsonb strengths
        jsonb weaknesses
        decimal authenticity_score
    }

    INTERVIEW_RETRY {
        uuid id PK
        uuid interview_id FK
        bool is_paid
        decimal amount
    }

    INTERVIEW_CATEGORY {
        uuid id PK
        string name
        string name_vi
        enum segment
    }

    INTERVIEW ||--o{ INTERVIEW_QUESTION : contains
    INTERVIEW ||--o{ INTERVIEW_RECORDING : stores
    INTERVIEW ||--o{ INTERVIEW_FEEDBACK : generates
    INTERVIEW ||--o{ INTERVIEW_RETRY : allows
    INTERVIEW }o--|| INTERVIEW_CATEGORY : belongs_to
```

#### 6. Candidate Marketplace

```mermaid
erDiagram
    CANDIDATE_PROFILE {
        uuid id PK
        uuid user_id FK
        bool is_public
        bool is_for_sale
        decimal price
        int view_count
        int purchase_count
        timestamp created_at
    }

    CANDIDATE_ACCESS {
        uuid id PK
        uuid candidate_profile_id FK
        uuid company_id FK
        timestamp purchased_at
        timestamp expires_at
    }

    CANDIDATE_ACCESS_LOG {
        uuid id PK
        uuid access_id FK
        uuid viewed_by FK
        timestamp viewed_at
    }

    COMPANY ||--o{ CANDIDATE_ACCESS : purchases
    CANDIDATE_PROFILE ||--o{ CANDIDATE_ACCESS : sold_via
    CANDIDATE_ACCESS ||--o{ CANDIDATE_ACCESS_LOG : tracks
```

#### 7. Payments & Subscriptions

```mermaid
erDiagram
    SUBSCRIPTION {
        uuid id PK
        uuid user_id FK
        string plan_name
        enum plan_type
        decimal amount
        string currency
        timestamp started_at
        timestamp expires_at
        bool is_active
    }

    PAYMENT {
        uuid id PK
        uuid user_id FK
        uuid subscription_id FK
        enum payment_type
        decimal amount
        string currency
        enum status
        enum payment_method
        string transaction_id
        jsonb metadata
        timestamp created_at
    }

    REFUND {
        uuid id PK
        uuid payment_id FK
        decimal amount
        string reason
        enum status
        timestamp processed_at
    }

    USER ||--o{ SUBSCRIPTION : has
    SUBSCRIPTION ||--o{ PAYMENT : generates
    PAYMENT ||--o{ REFUND : can_have
```

#### 8. Notifications & Auth

```mermaid
erDiagram
    NOTIFICATION {
        uuid id PK
        uuid user_id FK
        enum type
        string title
        text message
        jsonb data
        bool is_read
        timestamp created_at
    }

    SESSION {
        uuid id PK
        uuid user_id FK
        string token
        string ip_address
        string user_agent
        timestamp expires_at
        timestamp created_at
    }

    REFRESH_TOKEN {
        uuid id PK
        uuid user_id FK
        string token
        timestamp expires_at
        bool is_revoked
    }

    EMAIL_VERIFICATION {
        uuid id PK
        uuid user_id FK
        string token
        bool is_verified
        timestamp expires_at
    }

    PASSWORD_RESET {
        uuid id PK
        uuid user_id FK
        string token
        bool is_used
        timestamp expires_at
    }

    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ SESSION : has
    USER ||--o{ REFRESH_TOKEN : uses
    USER ||--o{ EMAIL_VERIFICATION : has
    USER ||--o{ PASSWORD_RESET : can_request
```

#### 9. Analytics & Logs

```mermaid
erDiagram
    USER_ACTIVITY_LOG {
        uuid id PK
        uuid user_id FK
        string action
        jsonb metadata
        string ip_address
        timestamp created_at
    }

    JOB_VIEW_LOG {
        uuid id PK
        uuid job_id FK
        uuid user_id FK
        timestamp viewed_at
    }

    SEARCH_LOG {
        uuid id PK
        uuid user_id FK
        string query
        jsonb filters
        int results_count
        timestamp searched_at
    }

    API_LOG {
        uuid id PK
        string method
        string endpoint
        uuid user_id FK
        int status_code
        int response_time
        timestamp created_at
    }

    USER ||--o{ USER_ACTIVITY_LOG : generates
    JOB ||--o{ JOB_VIEW_LOG : viewed
    USER ||--o{ SEARCH_LOG : searches
```

#### 10. Many-to-Many Mappings

```mermaid
erDiagram
    JOB_SKILL {
        uuid id PK
        uuid job_id FK
        uuid skill_id FK
        bool is_required
        enum importance
    }

    USER_SKILL {
        uuid id PK
        uuid profile_id FK
        uuid skill_id FK
        enum proficiency
        int years_experience
    }

    JOB_SAVED {
        uuid id PK
        uuid user_id FK
        uuid job_id FK
    }

    APPLICATION_STATUS_HISTORY {
        uuid id PK
        uuid application_id FK
        enum status
        string note
        uuid changed_by FK
    }

    SKILL ||--o{ JOB_SKILL : required_in
    SKILL ||--o{ USER_SKILL : owned_by
    JOB ||--o{ JOB_SKILL : has
    USER_PROFILE ||--o{ USER_SKILL : has
    USER ||--o{ JOB_SAVED : saves
    APPLICATION ||--o{ APPLICATION_STATUS_HISTORY : tracks
```

#### 11. Reference Data (Master Tables)

```mermaid
erDiagram
    SKILL_CATEGORY {
        uuid id PK
        string name
        string name_vi
        string icon
    }

    INTELLIGENCE_TYPE {
        uuid id PK
        string code
        string name
        string name_vi
        string description
    }

    INTELLIGENCE_SUBTYPE {
        uuid id PK
        uuid type_id FK
        string name
        string name_vi
    }

    GAME_TYPE {
        uuid id PK
        string code
        string name
        string name_vi
    }

    LANGUAGE {
        uuid id PK
        string code
        string name
    }

    LANGUAGE_LEVEL {
        uuid id PK
        uuid language_id FK
        string level_code
        string name
    }

    QUESTION_CATEGORY {
        uuid id PK
        string name
        string name_vi
    }

    INTERVIEW_CATEGORY {
        uuid id PK
        string name
        string name_vi
    }

    JOB_INDUSTRY {
        uuid id PK
        string name
        string name_vi
    }

    JOB_FUNCTION {
        uuid id PK
        uuid industry_id FK
        string name
        string name_vi
    }

    SKILL_CATEGORY ||--o{ SKILL : contains
    INTELLIGENCE_TYPE ||--o{ INTELLIGENCE_SUBTYPE : has
    LANGUAGE ||--o{ LANGUAGE_LEVEL : has
    JOB_INDUSTRY ||--o{ JOB_FUNCTION : has
```

> **Note:** QUESTION_BANK defined in Diagram #4 (Assessments)

#### 12. Database Overview (All Tables)

| # | Table Name | Description |
|---|------------|-------------|
| 1 | USER | Main user accounts |
| 2 | USER_PROFILE | Extended profile info |
| 3 | EDUCATION | Education history |
| 4 | WORK_EXPERIENCE | Work history |
| 5 | CERTIFICATION | Certifications |
| 6 | USER_SKILL | User skills (junction) |
| 7 | COMPANY | Employer companies |
| 8 | COMPANY_IMAGE | Company images |
| 9 | JOB | Job listings |
| 10 | JOB_SKILL | Job required skills (junction) |
| 11 | JOB_SAVED | Saved jobs (junction) |
| 12 | APPLICATION | Job applications |
| 13 | APPLICATION_STATUS_HISTORY | Application audit trail |
| 14 | CV_PARSED | Parsed CV data |
| 15 | ASSESSMENT_SESSION | Assessment sessions |
| 16 | GAME_SESSION | Game results |
| 17 | LANGUAGE_ASSESSMENT | Language test results |
| 18 | AI_SCORE | AI evaluation scores |
| 19 | ASSESSMENT_QUESTION | Assessment questions |
| 20 | INTERVIEW | Interview sessions |
| 21 | INTERVIEW_QUESTION | Interview questions |
| 22 | INTERVIEW_RECORDING | Interview recordings |
| 23 | INTERVIEW_FEEDBACK | Interview feedback |
| 24 | INTERVIEW_RETRY | Retry records |
| 25 | CANDIDATE_PROFILE | Public candidate profiles |
| 26 | CANDIDATE_ACCESS | Purchased profile access |
| 27 | CANDIDATE_ACCESS_LOG | Access logs |
| 28 | SUBSCRIPTION | User subscriptions |
| 29 | PAYMENT | Payment transactions |
| 30 | REFUND | Refunds |
| 31 | NOTIFICATION | User notifications |
| 32 | SESSION | Active sessions |
| 33 | REFRESH_TOKEN | JWT refresh tokens |
| 34 | EMAIL_VERIFICATION | Email verification |
| 35 | PASSWORD_RESET | Password reset tokens |
| 36 | USER_ACTIVITY_LOG | Activity logs |
| 37 | JOB_VIEW_LOG | Job view logs |
| 38 | SEARCH_LOG | Search logs |
| 39 | API_LOG | API logs |
| 40 | SKILL_CATEGORY | Skill categories |
| 41 | SKILL | Skills |
| 42 | INTELLIGENCE_TYPE | Intelligence types |
| 43 | INTELLIGENCE_SUBTYPE | Intelligence subtypes |
| 44 | GAME_TYPE | Game types |
| 45 | LANGUAGE | Languages |
| 46 | LANGUAGE_LEVEL | Language levels |
| 47 | QUESTION_CATEGORY | Question categories |
| 48 | INTERVIEW_CATEGORY | Interview categories |
| 49 | JOB_INDUSTRY | Job industries |
| 50 | JOB_FUNCTION | Job functions |

Total: **50 tables** (27 entity tables + 23 reference tables)

### Tech Stack Recommendation

| Layer | Technology | Reason |
|-------|------------|--------|
| Frontend Web | Next.js 14+ + React | SEO, SSR, dashboard, games |
| Frontend Mobile | React Native / Flutter | Cross-platform apps |
| Backend API (General) | Node.js + TypeScript | Fast iteration, shared team |
| Backend API (Video) | Golang | High performance, WebRTC |
| Data/ML Pipeline | Python (FastAPI) | CV parsing, AI scoring, analytics |
| Database | PostgreSQL | Relational data |
| Data Warehouse | ClickHouse / BigQuery | Analytics, candidate data |
| Cache & Pub/Sub | Redis | Sessions, caching, real-time updates |
| File Storage | AWS S3 / MinIO | CVs, recordings |
| AI Integration | OpenAI + Gemini | Flexible, cost-effective |
| Auth | NextAuth.js / custom | JWT + social login |
| Search | Meilisearch / Elasticsearch | Full-text search |
| Video/Audio | Golang + MediaMTX / LiveKit | Real-time interviews |
| Message Queue | Apache Kafka | Event streaming, async processing |
| Container | Docker + Kubernetes | Orchestration |

### Data Models (High-Level)

```
Candidate
├── profile (name, email, phone, location)
├── cv (parsed data, raw file)
├── assessments (game scores, test results)
├── interviews (recordings, feedback)
├── applications (jobs applied)
└── visibility (public/private, for sale)

Job
├── company (name, logo, description)
├── details (title, salary, location, type)
├── requirements (skills, experience)
├── pipeline (applications, stages)
└── status (active/closed)

Company
├── profile (name, industry, size)
├── jobs (active listings)
├── candidates (purchased/viewed)
└── subscription (plan, limits)
```

---

## MVP Feature Details

### 1. CV Review Tool (Phase 1)
- Upload CV (PDF, DOCX, image)
- Auto-parse: contact info, education, experience, skills
- HR dashboard to view, annotate, score candidates
- Export to standardized format

### 2. Question Bank & Games (Phase 2)
- **Games:** Memory match, pattern recognition, math puzzles
- **Questions:** Technical, behavioral, situational
- **AI Scoring:** Combine game results + answers → intelligence score
- Results saved to candidate profile

### 3. Mock Interview (Phase 3)
- **Audio:** Phone-style interview with AI voice
- **Video:** Face-to-face with avatar/AI avatar
- Real-time speech-to-text, sentiment analysis
- Post-interview: AI feedback report with scores
- Recording storage for review

### 4. Job Listing Platform (Phase 4)
- Employers post jobs with rich details
- Candidates search and filter
- One-click apply with profile
- Application tracking (applied → reviewed → interview → offer)

### 5. Candidate Marketplace (Phase 5)
- Candidates opt-in to share profile
- Employers browse/search candidate database
- Purchase lead (contact info + profile)
- Revenue share with candidate

---

## Team Structure (6 Devs)

| Role | Count | Focus |
|------|-------|-------|
| Full-stack Lead | 1 | Architecture, code review |
| Frontend Dev | 2 | Web + Mobile UI |
| Backend Dev | 2 | API, AI integration, DB |
| DevOps/QA | 1 | CI/CD, testing, deployment |

### Development Approach
- **Sprint:** 2-week sprints
- **Methodology:** Agile with light documentation
- **Code Review:** Required for all PRs
- **Testing:** Unit tests + manual QA

---

## Budget Allocation (100M VND / ~6 months)

| Category | Estimated Cost | Notes |
|----------|----------------|-------|
| Cloud (AWS/Vercel) | 30-40M | Hosting, storage, compute |
| AI APIs (GPT/Gemini) | 20-30M | Interview, scoring, parsing |
| Domain & SSL | 5M | .com, .vn domains |
| Third-party tools | 10M | Email, SMS, analytics |
| Marketing (2 people) | 20-30M | Content, ads, SEO |
| Contingency | 10-15M | Unforeseen costs |

---

## Key Success Metrics

| Metric | Target (MVP) |
|--------|--------------|
| Registered Candidates | 5,000+ |
| Registered Employers | 100+ |
| CVs Processed | 3,000+ |
| Interviews Conducted | 500+ |
| Jobs Posted | 200+ |
| Monthly Active Users | 1,000+ |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| AI cost too high | Optimize prompts, cache responses, use cheaper models for simple tasks |
| Slow candidate adoption | Partner with universities, free CV parsing |
| Employer hesitation | Free trials, case studies, success stories |
| Tech complexity (video) | Use LiveKit/Twilio, start with audio-first |
| Compliance (data privacy) | GDPR-compliant design, clear consent flows |

---

## Next Steps

1. **Week 1-2:** Finalize feature priorities, design system
2. **Week 3:** Setup development environment, CI/CD
3. **Week 4:** Start Phase 1 - Auth + CV parser
4. **Ongoing:** Bi-weekly demos to stakeholders

---

*Document Version: 1.0*
*Last Updated: May 2026*