import OpenAI from 'openai';

export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationResponse {
  translatedText: string;
  success: boolean;
  error?: string;
}

export interface AIProviderConfig {
  endpoint: string;
  model: string;
  apiKey: string;
}

// Default configuration for Gemini via OpenAI-compatible endpoint
const DEFAULT_CONFIG: AIProviderConfig = {
  endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  model: 'gemini-2.0-flash-lite',
  apiKey: '',
};

class TranslationService {
  private client: OpenAI | null = null;
  private config: AIProviderConfig = { ...DEFAULT_CONFIG };

  constructor() {
    this.initializeAI();
  }

  private async initializeAI() {
    try {
      const result = await chrome.storage.sync.get(['aiConfig']);
      if (result.aiConfig) {
        const decryptedConfig = await this.decryptConfig(result.aiConfig);
        this.config = { ...DEFAULT_CONFIG, ...decryptedConfig };
      }
      
      if (this.config.apiKey) {
        this.createClient();
      }
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
    }
  }

  private createClient() {
    if (!this.config.apiKey) return;
    
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.endpoint,
      dangerouslyAllowBrowser: true,
    });
  }

  async setConfig(config: Partial<AIProviderConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...config };
      const encryptedConfig = await this.encryptConfig(this.config);
      await chrome.storage.sync.set({ aiConfig: encryptedConfig });
      
      if (this.config.apiKey) {
        this.createClient();
      }
    } catch (error) {
      console.error('Failed to set AI config:', error);
      throw error;
    }
  }

  async getConfig(): Promise<AIProviderConfig> {
    try {
      const result = await chrome.storage.sync.get(['aiConfig']);
      if (result.aiConfig) {
        const decryptedConfig = await this.decryptConfig(result.aiConfig);
        return { ...DEFAULT_CONFIG, ...decryptedConfig };
      }
      return { ...DEFAULT_CONFIG };
    } catch (error) {
      console.error('Failed to get AI config:', error);
      return { ...DEFAULT_CONFIG };
    }
  }

  private async encryptConfig(config: AIProviderConfig): Promise<string> {
    try {
      // Simple encryption using Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(config));
      
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      
      // Export key for storage
      const exportedKey = await crypto.subtle.exportKey('raw', key);
      
      // Combine key, iv, and encrypted data
      const combined = new Uint8Array(exportedKey.byteLength + iv.length + encrypted.byteLength);
      combined.set(new Uint8Array(exportedKey), 0);
      combined.set(iv, exportedKey.byteLength);
      combined.set(new Uint8Array(encrypted), exportedKey.byteLength + iv.length);
      
      // Return as base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      // Fallback to simple base64 encoding if encryption fails
      return btoa(JSON.stringify(config));
    }
  }

  private async decryptConfig(encryptedData: string): Promise<AIProviderConfig> {
    try {
      const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
      
      // Extract components
      const keyData = combined.slice(0, 32);
      const iv = combined.slice(32, 44);
      const encrypted = combined.slice(44);
      
      // Import key
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
      
      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );
      
      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
      console.error('Decryption failed, trying fallback:', error);
      // Fallback to simple base64 decoding
      try {
        return JSON.parse(atob(encryptedData));
      } catch (fallbackError) {
        console.error('Fallback decryption failed:', fallbackError);
        return { ...DEFAULT_CONFIG };
      }
    }
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    if (!this.client) {
      return {
        translatedText: '',
        success: false,
        error: 'AI service not initialized. Please configure your AI provider settings.',
      };
    }

    try {
      const prompt = `Translate the following text from ${request.sourceLang} to ${request.targetLang}. 
Only return the translated text, nothing else.

Text to translate: "${request.text}"`;

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.3,
      });

      const translatedText = response.choices[0]?.message?.content?.trim() || '';

      return {
        translatedText,
        success: true,
      };
    } catch (error) {
      console.error('Translation failed:', error);
      return {
        translatedText: '',
        success: false,
        error: error instanceof Error ? error.message : 'Translation failed',
      };
    }
  }

  async isConfigured(): Promise<boolean> {
    try {
      const config = await this.getConfig();
      return !!(config.apiKey && config.endpoint && config.model);
    } catch {
      return false;
    }
  }

  getDefaultConfig(): AIProviderConfig {
    return { ...DEFAULT_CONFIG };
  }
}

export const translationService = new TranslationService();