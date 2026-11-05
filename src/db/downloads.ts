import { createPool } from './index.ts';
import fs from 'node:fs';
import path from 'node:path';
import { DownloadSettings } from '../types.ts';

export const DEFAULT_DOWNLOAD_SETTINGS: DownloadSettings = {
  windowsUrl: 'https://github.com/TeacherCompanion/releases/download/v2.4/TeacherCompanion_v2.4_Setup.exe',
  macUrl: 'https://github.com/TeacherCompanion/releases/download/v2.4/TeacherCompanion_v2.4_macOS.dmg',
  version: '2.4.0-DZ',
  releaseDate: '2026-09-01',
  notesAr: 'الإصدار الرسمي 2.4.0 المعتمد لأساتذة التعليم الابتدائي الجزائري (3AP, 4AP, 5AP)',
  notesEn: 'Official Desktop Release v2.4.0 for Algerian Primary Educators (3AP, 4AP, 5AP)',
  updatedAt: new Date().toISOString()
};

const BACKUP_PATH = path.join(process.cwd(), 'src/db/downloads-settings.json');

export async function loadDownloadSettings(): Promise<DownloadSettings> {
  try {
    const pool = createPool();
    const res = await pool.query(
      "SELECT windows_url, mac_url, version, release_date, notes_ar, notes_en, updated_at FROM app_download_settings WHERE id = 'current' LIMIT 1;"
    );
    if (res.rows[0]) {
      const row = res.rows[0];
      const loaded: DownloadSettings = {
        windowsUrl: row.windows_url || DEFAULT_DOWNLOAD_SETTINGS.windowsUrl,
        macUrl: row.mac_url || DEFAULT_DOWNLOAD_SETTINGS.macUrl,
        version: row.version || DEFAULT_DOWNLOAD_SETTINGS.version,
        releaseDate: row.release_date || DEFAULT_DOWNLOAD_SETTINGS.releaseDate,
        notesAr: row.notes_ar ?? DEFAULT_DOWNLOAD_SETTINGS.notesAr,
        notesEn: row.notes_en ?? DEFAULT_DOWNLOAD_SETTINGS.notesEn,
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
      };
      try {
        fs.writeFileSync(BACKUP_PATH, JSON.stringify(loaded, null, 2), 'utf-8');
      } catch {}
      return loaded;
    }
  } catch (err: any) {
    console.warn('Could not read download settings from PostgreSQL, checking disk fallback:', err?.message || err);
  }

  // Fallback to local JSON file
  if (fs.existsSync(BACKUP_PATH)) {
    try {
      const raw = fs.readFileSync(BACKUP_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.windowsUrl || parsed.macUrl)) {
        return {
          ...DEFAULT_DOWNLOAD_SETTINGS,
          ...parsed
        };
      }
    } catch {}
  }

  return JSON.parse(JSON.stringify(DEFAULT_DOWNLOAD_SETTINGS));
}

export async function persistDownloadSettings(settings: DownloadSettings): Promise<DownloadSettings> {
  const cleanSettings: DownloadSettings = {
    windowsUrl: (settings.windowsUrl || '').trim() || DEFAULT_DOWNLOAD_SETTINGS.windowsUrl,
    macUrl: (settings.macUrl || '').trim() || DEFAULT_DOWNLOAD_SETTINGS.macUrl,
    version: (settings.version || '').trim() || DEFAULT_DOWNLOAD_SETTINGS.version,
    releaseDate: (settings.releaseDate || '').trim() || DEFAULT_DOWNLOAD_SETTINGS.releaseDate,
    notesAr: settings.notesAr !== undefined ? settings.notesAr.trim() : DEFAULT_DOWNLOAD_SETTINGS.notesAr,
    notesEn: settings.notesEn !== undefined ? settings.notesEn.trim() : DEFAULT_DOWNLOAD_SETTINGS.notesEn,
    updatedAt: new Date().toISOString()
  };

  // 1. Write to local disk file
  try {
    const dir = path.dirname(BACKUP_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(cleanSettings, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write local download settings backup:', err);
  }

  // 2. Persist to PostgreSQL
  try {
    const pool = createPool();
    await pool.query(
      `INSERT INTO app_download_settings (id, windows_url, mac_url, version, release_date, notes_ar, notes_en, updated_at)
       VALUES ('current', $1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (id) DO UPDATE SET
         windows_url = EXCLUDED.windows_url,
         mac_url = EXCLUDED.mac_url,
         version = EXCLUDED.version,
         release_date = EXCLUDED.release_date,
         notes_ar = EXCLUDED.notes_ar,
         notes_en = EXCLUDED.notes_en,
         updated_at = NOW();`,
      [
        cleanSettings.windowsUrl,
        cleanSettings.macUrl,
        cleanSettings.version,
        cleanSettings.releaseDate || null,
        cleanSettings.notesAr || null,
        cleanSettings.notesEn || null
      ]
    );
    console.log('[Downloads] Download settings successfully saved to PostgreSQL database.');
  } catch (err: any) {
    console.error('Failed to persist download settings to PostgreSQL:', err?.message || err);
  }

  return cleanSettings;
}
