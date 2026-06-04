# Contributing to Fake Checker

First off, thank you for considering contributing to Fake Checker! It's people like you who make open-source projects thrive. We welcome all contributions, from bug reports to code patches to narrative design additions.

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to Contribute

There are many ways you can help the Ministry of Verity:

- **Reporting Bugs:** Found a glitch in the CRT styling? Did the timer freeze? Let us know.
- **Suggesting Features:** Have an idea for a new mini-game or narrative twist? Open a feature request.
- **Writing Content:** Add new Information Packages to `cases.json`
- **Writing Code:** Grab an issue labeled `good first issue` or `help wanted`.
- **UI/UX & Sound:** Contribute new soundscapes, music, or pixel-art assets.

---

## Reporting Bugs

Before submitting a bug report, please check the existing issues to ensure it hasn't already been reported.

When you create a bug report, please use our `Bug report` template. Be sure to include:
- A clear description of the issue.
- Step-by-step instructions to reproduce the problem.
- Expected vs. actual behavior.
- Your environment details (OS, Browser, Node version).

---

## Suggesting Features

We love new ideas! If you want to propose a new feature, use the `Feature request` template. 
If your idea constitutes a major rewrite of game mechanics or React architecture, please open a **GitHub Discussion** first before investing time in a Pull Request.

---

## Development Setup

To get your local environment running up to the Ministry's standards, follow these steps:

**1. Fork and clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/FakeChecker.git
cd FakeChecker
```

**2. Install dependencies:**
This project relies on `npm`.
```bash
npm install
```

**3. Start the dev server:**
```bash
npm run dev
```

**4. Run linters before committing:**
```bash
npm run lint
```

There are currently no complex environment variables required to run the game locally, as all logic is bundled and client-side.

---

## Making Changes

### Branch Naming Convention

Please create a specialized branch for your work using the following format: `type/short-description`
Example:
- `feat/new-crashing-minigame`
- `fix/trust-meter-overflow`
- `docs/update-json-schema`

### Commit Message Convention

We enforce the **Conventional Commits** standard. This helps us auto-generate changelogs and maintain a clean history.
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests

**Example:** 
`feat: added independent volume slider for music and sfx controls`

### Keeping Your Fork in Sync

Remember to occasionally sync your fork with the `main` upstream branch to resolve merge conflicts early.

```bash
git fetch upstream
git merge upstream/main
```

---

## Submitting a Pull Request

When you're ready to submit your work:

1. Push your branch to your fork.
2. Open a Pull Request targeting our `main` branch.
3. Fill out the **Pull Request Template** completely.

**What to expect during review:**
Maintainers aim to review PRs within 48-72 hours. We may request UI adjustments (e.g. tweaking a CSS animation duration or adjusting game balance). Please gracefully accept feedback and push updates directly to your open PR branch. 

---

## Getting Help

If you're stuck, drop a message in a GitHub Discussion or directly ping maintainers in an open PR. We're here to help you get your code merged!

Glory to Verity.
