# AI-Powered GitHub PR Generator 🚀

![GitHub PR Generator](https://img.shields.io/badge/GitHub-PR%20Generator-blue)
![Version](https://img.shields.io/badge/version-0.1.0-green)
![Next.js](https://img.shields.io/badge/Next.js-latest-black)

An intelligent web application that automatically generates high-quality Pull Request titles and descriptions based on your commit messages using AI.

<!-- Add a demo screenshot or banner here when available -->

## 🌟 Features

- **GitHub Integration**: Seamlessly connect with your GitHub account
- **Repository Selection**: Browse and select from your repositories
- **Branch Comparison**: Compare different branches to see pending commits
- **AI-Powered Generation**: Automatically generate PR titles and descriptions based on commit messages
- **Custom Editing**: Edit AI-generated content before creating the PR
- **One-Click PR Creation**: Create Pull Requests directly from the interface

## 📋 Project Overview

This tool is designed to streamline the Pull Request creation process by leveraging AI to automatically generate meaningful PR titles and descriptions from your commit history. It connects to your GitHub account, retrieves your repositories and branch information, and uses AI to analyze your commits and generate appropriate content for your PRs.

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or later)
- GitHub account
- DeepSeek API key (or compatible AI service)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/peal-26/ai-powered-github-pr-generator.git
   cd ai-powered-github-pr-generator/web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file based on the `.env.example` file:
   ```
   GITHUB_CLIENT_ID=your_github_client_id
   NEXT_PUBLIC_REDIRECT_URL=http://localhost:3000
   NEXT_PUBLIC_AI_API_URL=your_ai_api_url
   AI_API_KEY=your_ai_api_key
   AI_MODEL=ai_model
   ENCRYPT_SECRET_KEY=your_encrypt_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Usage

1. **Connect your GitHub account**
   - Log in with your GitHub credentials
   - Authorize the application to access your repositories

2. **Select a repository and branches**
   - Choose the repository you want to create a PR for
   - Select the base branch (where changes will be merged)
   - Select the compare branch (containing your changes)

3. **Fetch and view commits**
   - View the commits that will be included in your PR
   - See details like commit messages, authors, and timestamps

4. **Generate PR content with AI**
   - Click "Generate PR with AI" to create a title and description
   - The AI analyzes your commit messages to create relevant content

5. **Edit and customize the PR**
   - Modify the generated title and description as needed
   - Format the description using Markdown

6. **Create the Pull Request**
   - Click "Create Pull Request" to submit it to GitHub
   - Get a confirmation when your PR is successfully created

## ⚙️ Configuration

You can configure the application through environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_CLIENT_ID` | Your GitHub OAuth client ID | - |
| `NEXT_PUBLIC_REDIRECT_URL` | Callback URL for GitHub OAuth | http://localhost:3000 |
| `NEXT_PUBLIC_AI_API_URL` | API URL for your AI service | your_ai_api_url |
| `AI_API_KEY` | API key for your AI service | - |
| `AI_MODEL` | Model for your AI service | deepseek-r1:1.5b |
| `ENCRYPT_SECRET_KEY` | Secret key for encryption of settings | - |

You can also adjust settings directly in the application:
- Custom AI API endpoints
- AI API keys
- AI Model
- Other preferences

## 🧩 Technologies Used

This project leverages the following technologies:

- **Frontend**: Next.js 15.2.4, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI components
- **APIs**: GitHub API (Octokit), DeepSeek R1 AI
- **Authentication**: GitHub OAuth

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Projects

Check out the VSCode extension version of this tool in the [vsc-extension]([../vsc-extension](https://github.com/PEAL-26/ai-powered-github-pr-generator-vsc-extension)) directory.

---

Built with ❤️ by [peal-26](https://github.com/peal-26)
