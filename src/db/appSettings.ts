import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppDownloadSettings } from '../types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SETTINGS_FILE_PATH = path.join(__dirname, 'app-settings.json');

export const DEFAULT_APP_SETTINGS: AppDownloadSettings = {
  windowsDownloadUrl: '',
  macDownloadUrl: '',
  appVersion: 'v2.4.0-DZ',
  lastUpdated: new Date().toISOString()
};

export function loadAppSettings(): AppDownloadSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        windowsDownloadUrl: typeof parsed.windowsDownloadUrl === 'string' ? parsed.windowsDownloadUrl : '',
        macDownloadUrl: typeof parsed.macDownloadUrl === 'string' ? parsed.macDownloadUrl : '',
        appVersion: typeof parsed.appVersion === 'string' ? parsed.appVersion : DEFAULT_APP_SETTINGS.appVersion,
        lastUpdated: parsed.lastUpdated || new Date().toISOString()
      };
    }
  } catch (err) {
    console.warn('Failed to read app-settings.json, using defaults:', err);
  }
  return { ...DEFAULT_APP_SETTINGS };
}

export function saveAppSettings(newSettings: Partial<AppDownloadSettings>): AppDownloadSettings {
  const current = loadAppSettings();
  const updated: AppDownloadSettings = {
    windowsDownloadUrl: newSettings.windowsDownloadUrl !== undefined ? newSettings.windowsDownloadUrl.trim() : current.windowsDownloadUrl,
    macDownloadUrl: newSettings.macDownloadUrl !== undefined ? newSettings.macDownloadUrl.trim() : current.macDownloadUrl,
    appVersion: newSettings.appVersion !== undefined ? newSettings.appVersion.trim() : current.appVersion,
    lastUpdated: new Date().toISOString()
  };

  try {
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write app-settings.json:', err);
  }

  return updated;
}
