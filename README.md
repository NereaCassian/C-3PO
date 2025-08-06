# C-3PO 🤖

A simple AI-powered translation browser extension that uses Google Gemini or OpenAI to provide intelligent translations with context awareness.

## 🌟 Features

- **AI-Powered Translation**: Uses Google Gemini or OpenAI or any OpenAI API compatible provider (Ollama, Anthropic, OpenRouter) for high-quality translations
- **Context Menu Integration**: Right-click to translate selected text instantly
- **Dark Mode Support**: Beautiful dark theme for better user experience
- **Custom Translation Options**: Configure language pairs and translation preferences
- **Secure API Key Storage**: API keys are encrypted and stored locally
- **Multiple AI Providers**: Support for both Google Gemini and OpenAI
- **Real-time Translation**: Instant translation with AI context awareness

## 🚀 Quick Start

### Installation

1. **Download from GitHub Releases**
   - Go to [Releases](https://github.com/NereaCassian/C-3PO/releases)
   - Download the latest `C-3PO-extension.zip`
   - Extract the ZIP file to a folder on your computer

2. **Install in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the extracted folder
   - The extension should now appear in your extensions list

3. **Configure AI Provider**
   - Click on the C-3PO extension icon
   - Go to "AI Provider Settings"
   - Choose your preferred AI provider
   - Enter your API key
   - Save the configuration

## 🛠️ Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/NereaCassian/C-3PO.git
cd C-3PO

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure

```
C-3PO/
├── src/
│   ├── background/          # Background scripts
│   ├── content-script/      # Content scripts
│   ├── popup/              # Extension popup UI
│   ├── components/         # React components
│   ├── services/           # Translation services
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles
├── public/                 # Static assets
├── scripts/                # Build and utility scripts
└── .github/workflows/      # CI/CD workflows
```

## 🔧 Configuration

### AI Provider Setup

#### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key
4. Paste it in the extension settings

#### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the API key
4. Paste it in the extension settings

### Customization

- **Language Pairs**: Configure source and target languages
- **Context Menu**: Customize right-click menu options
- **Translation Style**: Adjust translation preferences
- **UI Theme**: Switch between light and dark modes

## 🎨 Customization

The extension uses:
- **React** for the UI components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn UI** for component library
- **Webpack** for bundling

### Adding New Features

1. Create new components in `src/components/`
2. Add services in `src/services/`
3. Update types in `src/types/`
4. Test thoroughly before submitting PR

## 🔒 Security

- **Local Storage**: API keys are encrypted and stored locally
- **No External Data**: No user data is sent to external servers
- **Secure Communication**: All API calls use HTTPS
- **Privacy First**: No tracking or analytics

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat: add new translation feature
fix: resolve text overflow issue
docs: update README
style: improve UI design
refactor: restructure components
test: add unit tests
chore: update dependencies
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for AI translation capabilities
- **OpenAI** for alternative AI provider
- **React** and **TypeScript** communities
- **Shadcn UI** for beautiful components
- **Tailwind CSS** for utility-first styling

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/NereaCassian/C-3PO/issues)
- **Discussions**: [GitHub Discussions](https://github.com/NereaCassian/C-3PO/discussions)
- **Documentation**: [Wiki](https://github.com/NereaCassian/C-3PO/wiki)

## 🤖 AI-Powered Changelog System

This project uses an advanced AI-powered changelog generation system that automatically:

### ✨ Features

- **Automatic Versioning**: Incremental version tags (v1.0.0, v1.0.1, etc.)
- **AI-Generated Changelogs**: Intelligent changelog based on commits, issues, and PRs
- **Smart Categorization**: Automatically categorizes changes by type:
  - 💥 Breaking Changes
  - 🔒 Security Fixes
  - ✨ Enhancements
  - 🐛 Bug Fixes
  - 📚 Documentation
  - 🎨 Style Changes
  - ♻️ Refactoring
  - ⚡ Performance
  - 🧪 Tests
  - 👷 CI/CD
  - 📦 Build

### 🚀 Workflows

1. **Build Extension** (`.github/workflows/build.yml`)
   - Triggers on push to `main`/`develop` and PRs to `main`
   - Builds extension and creates ZIP
   - Generates AI changelog using [action-github-changelog-generator](https://github.com/marketplace/actions/action-github-changelog-generator)
   - Creates automatic version tags
   - Publishes releases with changelog

2. **AI-Powered Release** (`.github/workflows/release.yml`)
   - Manual workflow for controlled releases
   - Supports major, minor, and patch releases
   - Generates comprehensive changelogs
   - Creates semantic version tags

3. **Changelog Generation** (`.github/workflows/changelog.yml`)
   - Triggers on release creation/editing
   - Updates releases with AI-generated changelogs
   - Provides detailed change analysis

### 🎯 Usage

#### Automatic Releases
- Push to `main` branch triggers automatic release
- Version increments automatically (v1.0.0 → v1.0.1)
- Changelog generated from commits, issues, and PRs

#### Manual Releases
1. Go to **Actions** tab
2. Select **AI-Powered Release**
3. Choose release type (patch/minor/major)
4. Click **Run workflow**
5. Review generated changelog
6. Release is created with AI-powered changelog

**May the translations be with you!** 🌍✨
