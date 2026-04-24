# 🗳️ The Ballot Engine
## PromptWars — Election Process Education Assistant

### Vertical
**Election Process Education** — A gamified assistant that teaches users the complete democratic election lifecycle through high-stakes scenario-based decision making.

### Approach & Logic
Users play as Chief Election Commissioner of "Verdania" — a fictional democracy. This neutral setting makes election education non-partisan and universally applicable. Eight sequential phases cover the full election process from pre-setup to certification. Each decision maps to internationally recognised electoral best practices (IAEA standards, UN electoral guidelines, and documented real-world examples).

The assistant is "smart" in two ways:
1. **Adaptive difficulty awareness**: XP multipliers and combo scoring reward both correctness and decisiveness
2. **Personalised AI feedback**: Gemini 2.5 Flash generates contextual narration for every decision, citing real countries and electoral events

### How It Works
1. User lands on the Intro screen and optionally signs in with Google
2. Clicking "Begin Election" starts an 8-phase game loop
3. Each phase presents a real-world electoral scenario with 4 choices
4. After selection, Gemini 2.5 Flash analyses the decision and provides educational feedback
5. XP, combo multipliers, and badges reward good decision-making
6. On completion, scores are saved to a secure Firestore leaderboard
7. Users can view their global rank against other players
8. **Security first**: Enforced with Firestore rules, CSP headers, and input sanitisation
9. **Efficiency**: Gemini response caching, rate limiting, and component memoization for smooth 60fps UI

### Google Services Used
| Service | Usage |
|---|---|
| **Gemini 2.5 Flash** | AI narrator — generates personalised educational feedback per decision |
| **Firebase Auth** | Google Sign-In for leaderboard participation |
| **Firestore** | Persistent global leaderboard, best-score tracking |
| **Google Analytics 4** | Phase funnel analysis, badge unlock tracking, game completion events |
| **Firebase Hosting** | Production deployment with custom HTTP security headers (CSP, HSTS, XSS protection) |
| **Firebase Perf** | Real-time latency tracking for Gemini AI narration and score submission |
| **Firestore Rules** | Production-grade security rules restricting leaderboard writes to authenticated owners |

### Assumptions
- Verdania is entirely fictional; all electoral scenarios are grounded in IAEA and UN electoral guidelines
- Users can play as a guest (no sign-in required); sign-in is required only to submit to the leaderboard
- The Gemini AI narration responses are educational, not advisory — they represent established electoral science, not political opinion

### Local Development
```bash
git clone <your-repo-url>
cd ballot-engine
npm install
cp .env.example .env
# Add your API keys to .env
npm run dev
```

### Testing
```bash
npm run test
```

### Deploy
```bash
npm run build
npx firebase deploy
```
