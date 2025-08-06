#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * AI-Powered Changelog Generator for C-3PO Extension
 * 
 * This script provides local changelog generation capabilities
 * and can be used as a fallback when the GitHub Action is not available.
 */

class AIChangelogGenerator {
  constructor() {
    this.config = {
      types: {
        feat: { emoji: '✨', title: 'Features' },
        fix: { emoji: '🐛', title: 'Bug Fixes' },
        docs: { emoji: '📚', title: 'Documentation' },
        style: { emoji: '🎨', title: 'Styles' },
        refactor: { emoji: '♻️', title: 'Refactoring' },
        perf: { emoji: '⚡', title: 'Performance' },
        test: { emoji: '🧪', title: 'Tests' },
        chore: { emoji: '🔧', title: 'Chores' },
        ci: { emoji: '👷', title: 'CI/CD' },
        build: { emoji: '📦', title: 'Build' },
        revert: { emoji: '⏪', title: 'Reverts' }
      },
      breakingChange: '💥',
      security: '🔒',
      translation: '🌍'
    };
  }

  /**
   * Get the latest tag
   */
  getLatestTag() {
    try {
      return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'v0.0.0';
    }
  }

  /**
   * Get commits since the last tag
   */
  getCommitsSinceTag(tag) {
    try {
      const commits = execSync(`git log --pretty=format:"%H|%s|%an|%ad" --date=short ${tag}..HEAD`, { encoding: 'utf8' });
      return commits.split('\n').filter(Boolean).map(commit => {
        const [hash, subject, author, date] = commit.split('|');
        return { hash, subject, author, date };
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Analyze commit message and categorize it
   */
  analyzeCommit(commit) {
    const { subject } = commit;
    const lowerSubject = subject.toLowerCase();
    
    // Check for breaking changes
    const isBreaking = subject.includes('BREAKING CHANGE') || subject.includes('!');
    
    // Check for security fixes
    const isSecurity = lowerSubject.includes('security') || lowerSubject.includes('vulnerability') || lowerSubject.includes('cve');
    
    // Check for translation-related changes
    const isTranslation = lowerSubject.includes('translation') || lowerSubject.includes('language') || lowerSubject.includes('locale');
    
    // Determine commit type
    let type = 'chore';
    for (const [commitType, config] of Object.entries(this.config.types)) {
      if (lowerSubject.startsWith(commitType + ':') || lowerSubject.startsWith(commitType + '(')) {
        type = commitType;
        break;
      }
    }
    
    // Special cases
    if (lowerSubject.includes('fix') || lowerSubject.includes('bug')) type = 'fix';
    if (lowerSubject.includes('feat') || lowerSubject.includes('add') || lowerSubject.includes('new')) type = 'feat';
    if (lowerSubject.includes('docs') || lowerSubject.includes('readme')) type = 'docs';
    if (lowerSubject.includes('style') || lowerSubject.includes('ui') || lowerSubject.includes('design')) type = 'style';
    if (lowerSubject.includes('refactor')) type = 'refactor';
    if (lowerSubject.includes('perf') || lowerSubject.includes('performance')) type = 'perf';
    if (lowerSubject.includes('test')) type = 'test';
    if (lowerSubject.includes('ci') || lowerSubject.includes('workflow') || lowerSubject.includes('action')) type = 'ci';
    if (lowerSubject.includes('build') || lowerSubject.includes('webpack')) type = 'build';
    
    return {
      type,
      isBreaking,
      isSecurity,
      isTranslation,
      config: this.config.types[type] || this.config.types.chore
    };
  }

  /**
   * Group commits by type
   */
  groupCommits(commits) {
    const groups = {};
    
    for (const commit of commits) {
      const analysis = this.analyzeCommit(commit);
      const type = analysis.type;
      
      if (!groups[type]) {
        groups[type] = {
          config: analysis.config,
          commits: [],
          breaking: [],
          security: [],
          translation: []
        };
      }
      
      const commitEntry = {
        ...commit,
        analysis,
        formatted: this.formatCommitMessage(commit.subject, analysis)
      };
      
      groups[type].commits.push(commitEntry);
      
      if (analysis.isBreaking) {
        groups[type].breaking.push(commitEntry);
      }
      
      if (analysis.isSecurity) {
        groups[type].security.push(commitEntry);
      }
      
      if (analysis.isTranslation) {
        groups[type].translation.push(commitEntry);
      }
    }
    
    return groups;
  }

  /**
   * Format commit message for changelog
   */
  formatCommitMessage(subject, analysis) {
    let formatted = subject;
    
    // Remove conventional commit prefixes
    formatted = formatted.replace(/^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+?\))?:\s*/i, '');
    
    // Add emojis for special cases
    if (analysis.isBreaking) {
      formatted = `${this.config.breakingChange} ${formatted}`;
    }
    
    if (analysis.isSecurity) {
      formatted = `${this.config.security} ${formatted}`;
    }
    
    if (analysis.isTranslation) {
      formatted = `${this.config.translation} ${formatted}`;
    }
    
    return formatted;
  }

  /**
   * Generate changelog content
   */
  generateChangelog(newVersion, latestTag, commitGroups) {
    const totalCommits = Object.values(commitGroups).reduce((sum, group) => sum + group.commits.length, 0);
    const breakingChanges = Object.values(commitGroups).reduce((sum, group) => sum + group.breaking.length, 0);
    const securityFixes = Object.values(commitGroups).reduce((sum, group) => sum + group.security.length, 0);
    
    let changelog = `## C-3PO ${newVersion}\n\n`;
    changelog += `### 🤖 AI-Generated Changelog\n\n`;
    changelog += `**Release Type:** ${this.getReleaseType(newVersion, latestTag)} Release  \n`;
    changelog += `**Commits:** ${totalCommits}  \n`;
    changelog += `**Breaking Changes:** ${breakingChanges}  \n`;
    changelog += `**Security Fixes:** ${securityFixes}  \n`;
    changelog += `**Since:** ${latestTag}\n\n`;
    
    // Breaking changes section
    if (breakingChanges > 0) {
      changelog += `### 💥 Breaking Changes\n\n`;
      for (const [type, group] of Object.entries(commitGroups)) {
        for (const commit of group.breaking) {
          changelog += `- ${commit.formatted} (${commit.hash.substring(0, 7)}) - ${commit.author}\n`;
        }
      }
      changelog += '\n';
    }
    
    // Security fixes section
    if (securityFixes > 0) {
      changelog += `### 🔒 Security Fixes\n\n`;
      for (const [type, group] of Object.entries(commitGroups)) {
        for (const commit of group.security) {
          changelog += `- ${commit.formatted} (${commit.hash.substring(0, 7)}) - ${commit.author}\n`;
        }
      }
      changelog += '\n';
    }
    
    // Grouped changes
    const orderedTypes = ['feat', 'fix', 'perf', 'refactor', 'style', 'docs', 'test', 'ci', 'build', 'chore'];
    
    for (const type of orderedTypes) {
      if (commitGroups[type] && commitGroups[type].commits.length > 0) {
        const group = commitGroups[type];
        changelog += `### ${group.config.emoji} ${group.config.title}\n\n`;
        
        for (const commit of group.commits) {
          if (!commit.analysis.isBreaking && !commit.analysis.isSecurity) {
            changelog += `- ${commit.formatted} (${commit.hash.substring(0, 7)}) - ${commit.author}\n`;
          }
        }
        changelog += '\n';
      }
    }
    
    // Add standard sections
    changelog += this.getStandardSections(newVersion);
    
    return changelog;
  }

  /**
   * Determine release type based on version change
   */
  getReleaseType(newVersion, latestTag) {
    const newParts = newVersion.replace('v', '').split('.').map(Number);
    const oldParts = latestTag.replace('v', '').split('.').map(Number);
    
    if (newParts[0] > oldParts[0]) return 'Major';
    if (newParts[1] > oldParts[1]) return 'Minor';
    return 'Patch';
  }

  /**
   * Get standard changelog sections
   */
  getStandardSections(version) {
    return `### 🎉 Features
- AI-powered translation using Google Gemini or OpenAI
- Context menu integration for instant translations
- Dark mode support for better user experience
- Custom translation options and language pairs
- Secure API key storage with encryption

### 🚀 Installation
1. Download the \`C-3PO-extension.zip\` file above
2. Extract it to a folder on your computer
3. Open Chrome and go to \`chrome://extensions/\`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extracted folder

### ⚙️ Configuration
- Open the extension and go to "AI Provider Settings"
- Choose your preferred AI provider (Gemini or OpenAI)
- Enter your API key
- Customize context menu options as needed
- Save the configuration

### 🔗 Quick Links
- [GitHub Repository](https://github.com/NereaCassian/C-3PO)
- [Issues](https://github.com/NereaCassian/C-3PO/issues)
- [Documentation](https://github.com/NereaCassian/C-3PO#readme)

---

**May the translations be with you!** 🌍✨`;
  }

  /**
   * Main generation method
   */
  generate(newVersion) {
    const latestTag = this.getLatestTag();
    const commits = this.getCommitsSinceTag(latestTag);
    const commitGroups = this.groupCommits(commits);
    
    return this.generateChangelog(newVersion, latestTag, commitGroups);
  }
}

// CLI usage
if (require.main === module) {
  const generator = new AIChangelogGenerator();
  const newVersion = process.argv[2] || 'v1.0.0';
  
  try {
    const changelog = generator.generate(newVersion);
    console.log(changelog);
    
    // Save to file
    fs.writeFileSync('CHANGELOG.md', changelog);
    console.log('\n✅ Changelog saved to CHANGELOG.md');
  } catch (error) {
    console.error('❌ Error generating changelog:', error.message);
    process.exit(1);
  }
}

module.exports = AIChangelogGenerator; 