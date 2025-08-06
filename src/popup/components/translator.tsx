import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { translationService, type AIProviderConfig } from '../../services/translation-service';
import { Copy, Settings, Languages, ExternalLink, Save, Plus, Trash2 } from 'lucide-react';

const LANGUAGES = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

const PROVIDER_PRESETS = {
  gemini: {
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    model: 'gemini-2.0-flash-lite',
    keyUrl: 'https://makersuite.google.com/app/apikey',
  },
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/',
    model: 'gpt-3.5-turbo',
    keyUrl: 'https://platform.openai.com/api-keys',
  },
  custom: {
    name: 'Custom Provider',
    endpoint: '',
    model: '',
    keyUrl: '',
  },
};

export const Translator: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  
  // Settings state
  const [selectedPreset, setSelectedPreset] = useState('gemini');
  const [config, setConfig] = useState<AIProviderConfig>({
    endpoint: '',
    model: '',
    apiKey: '',
  });
  const [enableSpanishToEnglish, setEnableSpanishToEnglish] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [customMenuItems, setCustomMenuItems] = useState<Array<{
    id: string;
    sourceLang: string;
    targetLang: string;
    enabled: boolean;
  }>>([]);

  useEffect(() => {
    checkConfiguration();
  }, []);

  // Apply dark mode when it changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const checkConfiguration = async () => {
    const configured = await translationService.isConfigured();
    setIsConfigured(configured);
    
    if (!configured) {
      setShowSettings(true);
    }
    
    // Load current config
    const currentConfig = await translationService.getConfig();
    setConfig(currentConfig);
    
    // Determine which preset matches current config
    if (currentConfig.endpoint.includes('generativelanguage.googleapis.com')) {
      setSelectedPreset('gemini');
    } else if (currentConfig.endpoint.includes('api.openai.com')) {
      setSelectedPreset('openai');
    } else if (currentConfig.endpoint) {
      setSelectedPreset('custom');
    }

    // Load context menu and dark mode settings
    const result = await chrome.storage.sync.get(['enableSpanishToEnglish', 'darkMode', 'customMenuItems']);
    setEnableSpanishToEnglish(result.enableSpanishToEnglish !== false);
    setDarkMode(result.darkMode || false);
    setCustomMenuItems(result.customMenuItems || []);
    
    // Apply dark mode to document
    if (result.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const presetConfig = PROVIDER_PRESETS[preset as keyof typeof PROVIDER_PRESETS];
    setConfig(prev => ({
      ...prev,
      endpoint: presetConfig.endpoint,
      model: presetConfig.model,
    }));
  };

  const handleSaveConfig = async () => {
    if (!config.endpoint.trim() || !config.model.trim() || !config.apiKey.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await translationService.setConfig(config);
      
      // Save context menu and dark mode settings
      await chrome.storage.sync.set({ enableSpanishToEnglish, darkMode, customMenuItems });
      
      // Apply dark mode immediately
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Update context menus
      await chrome.runtime.sendMessage({ action: 'updateContextMenus' });
      
      setIsConfigured(true);
      setShowSettings(false);
      setError('');
    } catch (err) {
      setError('Failed to save configuration');
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    setIsTranslating(true);
    setError('');
    
    try {
      const result = await translationService.translate({
        text: sourceText,
        sourceLang: sourceLang === 'auto' ? 'auto-detect' : sourceLang,
        targetLang,
      });

      if (result.success) {
        setTranslatedText(result.translatedText);
      } else {
        setError(result.error || 'Translation failed');
      }
    } catch (err) {
      setError('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const swapLanguages = () => {
    if (sourceLang !== 'auto') {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  const addCustomMenuItem = () => {
    const newItem = {
      id: `custom-${Date.now()}`,
      sourceLang: 'en',
      targetLang: 'es',
      enabled: true,
    };
    setCustomMenuItems(prev => [...prev, newItem]);
  };

  const removeCustomMenuItem = (id: string) => {
    setCustomMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const updateCustomMenuItem = (id: string, field: string, value: string | boolean) => {
    setCustomMenuItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const getLanguageName = (code: string) => {
    const lang = LANGUAGES.find(l => l.code === code);
    return lang ? lang.name : code;
  };

  if (showSettings) {
    const currentPreset = PROVIDER_PRESETS[selectedPreset as keyof typeof PROVIDER_PRESETS];
    
    return (
      <div className="w-[400px] p-4 max-h-[500px] overflow-y-auto">
        <Card>
          <CardHeader className="pb-4 p-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 flex-shrink-0" />
              <CardTitle className="text-lg truncate">AI Provider Settings</CardTitle>
            </div>
            <CardDescription className="text-sm leading-relaxed break-words">
              Configure your AI translation provider and context menu settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <Tabs defaultValue="provider" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="provider" className="text-sm">Provider</TabsTrigger>
                <TabsTrigger value="preferences" className="text-sm">Context Menu</TabsTrigger>
              </TabsList>
              
              <TabsContent value="provider" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Provider Preset</Label>
                  <Select value={selectedPreset} onChange={(e) => handlePresetChange(e.target.value)}>
                    <option value="gemini" className="text-sm">Google Gemini (Default)</option>
                    <option value="openai" className="text-sm">OpenAI</option>
                    <option value="custom" className="text-sm">Custom Provider</option>
                  </Select>
                  {currentPreset.keyUrl && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                      <span>Get API key:</span>
                      <a 
                        href={currentPreset.keyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline flex items-center gap-1 hover:no-underline"
                      >
                        {currentPreset.name}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">API Endpoint</Label>
                  <Input
                    type="url"
                    placeholder="https://api.example.com/v1/"
                    value={config.endpoint}
                    onChange={(e) => setConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                    disabled={selectedPreset !== 'custom'}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Model</Label>
                  <Input
                    placeholder="Model name (e.g., gpt-3.5-turbo)"
                    value={config.model}
                    onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                    disabled={selectedPreset !== 'custom'}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">API Key</Label>
                  <Input
                    type="password"
                    placeholder="Enter your API key"
                    value={config.apiKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    API keys are stored encrypted for security
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="preferences" className="space-y-4 mt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <Label className="text-sm font-medium">Spanish to English Context Menu</Label>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Show "Translate from Spanish to English" in right-click menu
                    </p>
                  </div>
                  <Switch
                    checked={enableSpanishToEnglish}
                    onCheckedChange={setEnableSpanishToEnglish}
                    className="flex-shrink-0 mt-1"
                  />
                </div>
                
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <Label className="text-sm font-medium">Dark Mode</Label>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Enable dark theme for the extension interface
                    </p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                    className="flex-shrink-0 mt-1"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <Label className="text-sm font-medium">Custom Context Menu Items</Label>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Add custom translation options to the right-click menu
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addCustomMenuItem}
                      className="flex items-center gap-1 flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>

                  {customMenuItems.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {customMenuItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 p-2 border rounded text-sm">
                          <Switch
                            checked={item.enabled}
                            onCheckedChange={(enabled) => updateCustomMenuItem(item.id, 'enabled', enabled)}
                            className="flex-shrink-0"
                          />
                          
                          <Select
                            value={item.sourceLang}
                            onChange={(e) => updateCustomMenuItem(item.id, 'sourceLang', e.target.value)}
                            className="flex-1 min-w-0 text-xs"
                          >
                            {LANGUAGES.filter(lang => lang.code !== 'auto').map((lang) => (
                              <option key={lang.code} value={lang.code} className="text-xs">
                                {lang.name}
                              </option>
                            ))}
                          </Select>
                          
                          <span className="text-xs text-muted-foreground flex-shrink-0">→</span>
                          
                          <Select
                            value={item.targetLang}
                            onChange={(e) => updateCustomMenuItem(item.id, 'targetLang', e.target.value)}
                            className="flex-1 min-w-0 text-xs"
                          >
                            {LANGUAGES.filter(lang => lang.code !== 'auto').map((lang) => (
                              <option key={lang.code} value={lang.code} className="text-xs">
                                {lang.name}
                              </option>
                            ))}
                          </Select>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomMenuItem(item.id)}
                            className="flex-shrink-0 text-destructive hover:text-destructive p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {customMenuItems.length === 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No custom menu items. Click "Add" to create one.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="text-sm text-destructive p-2 bg-destructive/10 rounded mt-4 break-words">
                {error}
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <Button onClick={handleSaveConfig} className="flex-1 text-sm">
                <Save className="w-4 h-4 mr-2 flex-shrink-0" />
                Save Configuration
              </Button>
              {isConfigured && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowSettings(false)}
                  className="text-sm flex-shrink-0"
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-[400px] p-4 space-y-4 max-h-[500px] overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Languages className="w-5 h-5 flex-shrink-0" />
                          <h1 className="text-lg font-semibold truncate">C-3PO</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(true)}
          className="flex-shrink-0"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="flex-1 min-w-0 text-sm"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="text-sm">
              {lang.name}
            </option>
          ))}
        </Select>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={swapLanguages}
          disabled={sourceLang === 'auto'}
          className="flex-shrink-0"
        >
          ⇄
        </Button>
        
        <Select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="flex-1 min-w-0 text-sm"
        >
          {LANGUAGES.filter(lang => lang.code !== 'auto').map((lang) => (
            <option key={lang.code} value={lang.code} className="text-sm">
              {lang.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Enter text to translate..."
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          className="min-h-[100px] resize-none text-sm"
        />
        
        <Button
          onClick={handleTranslate}
          disabled={!sourceText.trim() || isTranslating || !isConfigured}
          className="w-full text-sm"
        >
          {isTranslating ? 'Translating...' : 'Translate'}
        </Button>
      </div>

      {translatedText && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Translation</Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="flex-shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <Textarea
            value={translatedText}
            readOnly
            className="min-h-[100px] bg-muted resize-none text-sm"
          />
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive p-2 bg-destructive/10 rounded break-words">
          {error}
        </div>
      )}
    </div>
  );
};