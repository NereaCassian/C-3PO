import { translationService } from '../services/translation-service';

// Context menu IDs
const CONTEXT_MENU_ID = 'translate-selected-text';
const SPANISH_TO_ENGLISH_ID = 'translate-spanish-to-english';

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed, creating context menus...');
  createContextMenus();
  setDefaultSettings();
});

// Also create menus on startup (Firefox compatibility)
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup, creating context menus...');
  createContextMenus();
});

// Create context menus
function createContextMenus() {
  console.log('Creating context menus...');
  
  // Remove existing menus
  chrome.contextMenus.removeAll(() => {
    console.log('Removed all existing context menus');
    
    // Main translate menu
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Translate with AI',
      contexts: ['selection'],
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error creating main context menu:', chrome.runtime.lastError);
      } else {
        console.log('Main context menu created successfully');
      }
    });
  });

  // Check if Spanish to English menu should be enabled and load custom menu items
  chrome.storage.sync.get(['enableSpanishToEnglish', 'customMenuItems'], (result) => {
    if (result.enableSpanishToEnglish !== false) { // Default to true
      chrome.contextMenus.create({
        id: SPANISH_TO_ENGLISH_ID,
        title: 'Translate from Spanish to English',
        contexts: ['selection'],
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error creating Spanish to English context menu:', chrome.runtime.lastError);
        } else {
          console.log('Spanish to English context menu created successfully');
        }
      });
    }

    // Create custom menu items
    const customMenuItems = result.customMenuItems || [];
    customMenuItems.forEach((item: any) => {
      if (item.enabled) {
        const sourceName = getLanguageName(item.sourceLang);
        const targetName = getLanguageName(item.targetLang);
        chrome.contextMenus.create({
          id: item.id,
          title: `Translate from ${sourceName} to ${targetName}`,
          contexts: ['selection'],
        }, () => {
          if (chrome.runtime.lastError) {
            console.error(`Error creating custom context menu ${item.id}:`, chrome.runtime.lastError);
          } else {
            console.log(`Custom context menu ${item.id} created successfully`);
          }
        });
      }
    });
  });
}

// Helper function to get language name
function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
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
  
  return languages[code] || code;
}

// Set default settings
function setDefaultSettings() {
  chrome.storage.sync.get([
    'enableSpanishToEnglish',
    'defaultSourceLang',
    'defaultTargetLang'
  ], (result) => {
    const defaults = {
      enableSpanishToEnglish: result.enableSpanishToEnglish ?? true,
      defaultSourceLang: result.defaultSourceLang ?? 'auto',
      defaultTargetLang: result.defaultTargetLang ?? 'en',
    };
    
    chrome.storage.sync.set(defaults);
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id || !info.selectionText) return;

  let sourceLang = 'auto';
  let targetLang = 'en';

  if (info.menuItemId === SPANISH_TO_ENGLISH_ID) {
    sourceLang = 'es';
    targetLang = 'en';
  } else if (info.menuItemId === CONTEXT_MENU_ID) {
    // Get user's default languages from storage
    const result = await chrome.storage.sync.get(['defaultSourceLang', 'defaultTargetLang']);
    sourceLang = result.defaultSourceLang ?? 'auto';
    targetLang = result.defaultTargetLang ?? 'en';
  } else {
    // Check if it's a custom menu item
    const result = await chrome.storage.sync.get(['customMenuItems']);
    const customMenuItems = result.customMenuItems || [];
    const customItem = customMenuItems.find((item: any) => item.id === info.menuItemId);
    
    if (customItem) {
      sourceLang = customItem.sourceLang;
      targetLang = customItem.targetLang;
    }
  }

  try {
    // Translate the selected text
    const translation = await translationService.translate({
      text: info.selectionText,
      sourceLang: sourceLang === 'auto' ? 'auto-detect' : sourceLang,
      targetLang,
    });

    if (translation.success) {
      // Send translation to content script
      chrome.tabs.sendMessage(tab.id, {
        action: 'handleTranslation',
        originalText: info.selectionText,
        translatedText: translation.translatedText,
        sourceLang,
        targetLang,
      });
    } else {
      // Show error notification
      chrome.tabs.sendMessage(tab.id, {
        action: 'showError',
        error: translation.error || 'Translation failed',
      });
    }
  } catch (error) {
    console.error('Translation error:', error);
    chrome.tabs.sendMessage(tab.id, {
      action: 'showError',
      error: 'Translation service unavailable',
    });
  }
});

// Handle messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateContextMenus') {
    createContextMenus();
    sendResponse({ success: true });
  } else if (request.action === 'translate') {
    // Handle translation request from popup
    translationService.translate(request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ 
        success: false, 
        error: error.message 
      }));
    return true; // Will respond asynchronously
  }
});

// Listen for storage changes to update context menus
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.enableSpanishToEnglish) {
    createContextMenus();
  }
});