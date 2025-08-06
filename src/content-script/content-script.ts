// Content script for handling text replacement and clipboard operations

interface TranslationMessage {
  action: 'handleTranslation' | 'showError';
  originalText?: string;
  translatedText?: string;
  sourceLang?: string;
  targetLang?: string;
  error?: string;
}

// Track the current selection and its context
let currentSelection: Selection | null = null;
let currentRange: Range | null = null;
let isEditableField = false;

// Update selection tracking on mouse up
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    currentSelection = selection;
    currentRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    // Check if selection is in an editable field
    const activeElement = document.activeElement;
    isEditableField = !!(
      activeElement &&
      (activeElement.tagName === 'INPUT' || 
       activeElement.tagName === 'TEXTAREA' || 
       activeElement.hasAttribute('contenteditable'))
    );
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message: TranslationMessage, sender, sendResponse) => {
  if (message.action === 'handleTranslation') {
    handleTranslation(message);
  } else if (message.action === 'showError') {
    showErrorNotification(message.error || 'An error occurred');
  }
});

function handleTranslation(message: TranslationMessage) {
  const { originalText, translatedText, sourceLang, targetLang } = message;
  
  if (!translatedText) {
    showErrorNotification('No translation received');
    return;
  }

  if (isEditableField && currentRange) {
    // Replace text in editable field
    replaceTextInEditableField(translatedText);
    showSuccessNotification(`Translated from ${getLanguageName(sourceLang)} to ${getLanguageName(targetLang)}`);
  } else {
    // Copy to clipboard for non-editable fields
    copyToClipboard(translatedText)
      .then(() => {
        showSuccessNotification(`Translation copied to clipboard (${getLanguageName(sourceLang)} → ${getLanguageName(targetLang)})`);
      })
      .catch(() => {
        showErrorNotification('Failed to copy translation to clipboard');
      });
  }
}

function replaceTextInEditableField(newText: string) {
  const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
  
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    // Handle input and textarea elements
    const start = activeElement.selectionStart || 0;
    const end = activeElement.selectionEnd || 0;
    const value = activeElement.value;
    
    activeElement.value = value.substring(0, start) + newText + value.substring(end);
    
    // Set cursor position after the inserted text
    const newPosition = start + newText.length;
    activeElement.setSelectionRange(newPosition, newPosition);
    
    // Trigger input event for React and other frameworks
    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
  } else if (currentRange) {
    // Handle contenteditable elements
    try {
      currentRange.deleteContents();
      const textNode = document.createTextNode(newText);
      currentRange.insertNode(textNode);
      
      // Move cursor to end of inserted text
      currentRange.setStartAfter(textNode);
      currentRange.setEndAfter(textNode);
      
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(currentRange);
      }
      
      // Trigger input event
      const element = currentRange.commonAncestorContainer.parentElement;
      if (element) {
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch (error) {
      console.error('Failed to replace text in contenteditable:', error);
      // Fallback to clipboard
      copyToClipboard(newText);
      showErrorNotification('Could not replace text, copied to clipboard instead');
    }
  }
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback for older browsers or when clipboard API is not available
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } catch (err) {
      throw new Error('Clipboard operation failed');
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

function showSuccessNotification(message: string) {
  showNotification(message, 'success');
}

function showErrorNotification(message: string) {
  showNotification(message, 'error');
}

function showNotification(message: string, type: 'success' | 'error') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: white;
    background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease-out;
    max-width: 300px;
    word-wrap: break-word;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  // Animate out and remove
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

function getLanguageName(code?: string): string {
  const languages: Record<string, string> = {
    'auto': 'Auto',
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
  };
  
  return languages[code || 'auto'] || code || 'Unknown';
}