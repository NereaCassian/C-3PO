export interface ExtensionSettings {
  geminiApiKey?: string;
  enableSpanishToEnglish: boolean;
  defaultSourceLang: string;
  defaultTargetLang: string;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enableSpanishToEnglish: true,
  defaultSourceLang: 'auto',
  defaultTargetLang: 'en',
};

export class SettingsManager {
  static async get<K extends keyof ExtensionSettings>(
    keys: K[]
  ): Promise<Pick<ExtensionSettings, K>> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, (result) => {
        resolve(result as Pick<ExtensionSettings, K>);
      });
    });
  }

  static async set<K extends keyof ExtensionSettings>(
    settings: Pick<ExtensionSettings, K>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(settings, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  static async getAll(): Promise<ExtensionSettings> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(null, (result) => {
        resolve({ ...DEFAULT_SETTINGS, ...result } as ExtensionSettings);
      });
    });
  }

  static async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.clear(() => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  static onChanged(
    callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void
  ): void {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync') {
        callback(changes);
      }
    });
  }
}