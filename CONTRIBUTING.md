# Contributing to Laundry Management App

Thank you for your interest in contributing! We welcome contributions from everyone. By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

1.  Check the [Issue Tracker](../../issues) to see if the bug has already been reported.
2.  If not, open a new issue. Include a clear title, description, steps to reproduce, and any relevant logs or screenshots.

### Suggesting Enhancements

1.  Open a new issue describing your proposal.
2.  Explain why this enhancement would be useful to most users.

### Pull Requests

1.  **Fork** the repository.
2.  Create a new branch for your feature or fix:
    ```bash
    git checkout -b feature/amazing-feature
    ```
3.  **Commit** your changes with clear, descriptive messages.
    - We follow [Conventional Commits](https://www.conventionalcommits.org/).
    - Example: `feat(frontend): add dark mode toggle` or `fix(backend): resolve race condition in turn assignment`.
4.  **Test** your changes locally.
5.  **Push** to your fork and submit a Pull Request.

## Development Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/laundry-app.git
    cd laundry-app
    ```

2.  **Start the environment**:
    ```bash
    ./start.sh
    ```
    This script sets up the Python backend (fastapi) and Node.js frontend (next.js) and streams logs to your console.

3.  **Backend Development**:
    - Located in `laundry-app/backend`.
    - Install deps: `pip install -r requirements.txt`.
    - Run logic located in `app/`.

4.  **Frontend Development**:
    - Located in `laundry-app/frontend`.
    - Install deps: `npm install`.
    - Run `npm run dev` for hot-reloading.

## Style Guidelines

- **Python**: Follow PEP 8.
- **TypeScript/React**: Use functional components and hooks. Maintain the "Glassmorphism" aesthetic.
- **Commits**: Keep them atomic and descriptive.

Thank you for helping make this project better! 🚀
