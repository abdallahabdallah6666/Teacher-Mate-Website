import fs from 'node:fs';
import path from 'node:path';
import { createPool } from './index.ts';

const DB_STORAGE_FILE = path.join(process.cwd(), 'src/db/persistent-db.json');

// Memory Maps shared with server.ts
export const dbUsers = new Map<string, any>();
export const dbLicenses = new Map<string, any>();
export const dbInquiries = new Map<string, any>();
export const dbPromoCodes = new Map<string, any>();
export const dbTutorials = new Map<string, any>();
export const dbBlogPosts = new Map<string, any>();

let saveTimeout: NodeJS.Timeout | null = null;
export function scheduleSaveDiskBackup() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const data = {
        users: Array.from(dbUsers.entries()),
        licenses: Array.from(dbLicenses.entries()),
        inquiries: Array.from(dbInquiries.entries()),
        promoCodes: Array.from(dbPromoCodes.entries()),
        tutorials: Array.from(dbTutorials.entries()),
        blogPosts: Array.from(dbBlogPosts.entries()),
      };
      const dir = path.dirname(DB_STORAGE_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[SolidDB] Warning saving disk backup:', e);
    }
  }, 150);
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------
export async function persistUser(user: any): Promise<void> {
  const cleanEmail = String(user.email || '').trim().toLowerCase();
  if (!cleanEmail) return;

  // 1. Update in-memory Map
  dbUsers.set(cleanEmail, user);
  if (user.email && user.email !== cleanEmail) {
    dbUsers.set(user.email, user);
  }
  scheduleSaveDiskBackup();

  // 2. Persist to PostgreSQL Database
  try {
    const pool = createPool();
    const uid = user.uid || user.id || `user-${Date.now()}`;
    const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Teacher';

    await pool.query(`
      INSERT INTO users (
        uid, email, full_name, password, phone_number, role, wilaya, primary_grade,
        school_name, license_key, license_status, license_plan, is_flagged, flag_reason,
        is_blocked, amount_paid_dzd, paid_via, order_id, invoice_number, max_devices,
        expires_at, data, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW())
      ON CONFLICT (email) DO UPDATE SET
        uid = EXCLUDED.uid,
        full_name = EXCLUDED.full_name,
        password = COALESCE(EXCLUDED.password, users.password),
        phone_number = EXCLUDED.phone_number,
        role = EXCLUDED.role,
        wilaya = EXCLUDED.wilaya,
        primary_grade = EXCLUDED.primary_grade,
        school_name = EXCLUDED.school_name,
        license_key = EXCLUDED.license_key,
        license_status = EXCLUDED.license_status,
        license_plan = EXCLUDED.license_plan,
        is_flagged = EXCLUDED.is_flagged,
        flag_reason = EXCLUDED.flag_reason,
        is_blocked = EXCLUDED.is_blocked,
        amount_paid_dzd = EXCLUDED.amount_paid_dzd,
        paid_via = EXCLUDED.paid_via,
        order_id = EXCLUDED.order_id,
        invoice_number = EXCLUDED.invoice_number,
        max_devices = EXCLUDED.max_devices,
        expires_at = EXCLUDED.expires_at,
        data = EXCLUDED.data,
        updated_at = NOW();
    `, [
      uid,
      cleanEmail,
      fullName,
      user.password || null,
      user.phoneNumber || user.phone || null,
      user.role || 'user',
      user.wilaya || '16 - Algiers',
      user.primaryGrade || '4AP',
      user.schoolName || null,
      user.licenseKey || null,
      user.licenseStatus || 'trial',
      user.licensePlan || 'pro',
      Boolean(user.isFlagged),
      user.flagReason || null,
      Boolean(user.isBlocked),
      user.amountPaidDZD ? Number(user.amountPaidDZD) : null,
      user.paidVia || null,
      user.orderId || null,
      user.invoiceNumber || null,
      user.maxDevices ? Number(user.maxDevices) : 1,
      user.expiresAt || null,
      JSON.stringify(user)
    ]);
  } catch (err) {
    console.error('[SolidDB] Error persisting user to PostgreSQL:', err);
  }
}

export async function deleteUserFromDb(email: string): Promise<boolean> {
  const cleanEmail = String(email || '').trim().toLowerCase();
  dbUsers.delete(cleanEmail);
  scheduleSaveDiskBackup();

  try {
    const pool = createPool();
    await pool.query('DELETE FROM users WHERE LOWER(email) = $1;', [cleanEmail]);
    return true;
  } catch (err) {
    console.error('[SolidDB] Error deleting user from PostgreSQL:', err);
    return false;
  }
}

// -------------------------------------------------------------
// LICENSE OPERATIONS
// -------------------------------------------------------------
export async function persistLicense(lic: any): Promise<void> {
  const cleanKey = String(lic.key || '').trim();
  if (!cleanKey) return;

  dbLicenses.set(cleanKey, lic);
  scheduleSaveDiskBackup();

  try {
    const pool = createPool();
    await pool.query(`
      INSERT INTO licenses (
        key, user_email, user_name, plan, status, issued_at, expires_at,
        paid_via, amount_dzd, original_price_dzd, promo_code, discount_percent,
        max_devices, order_id, invoice_number, data, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      ON CONFLICT (key) DO UPDATE SET
        user_email = EXCLUDED.user_email,
        user_name = EXCLUDED.user_name,
        plan = EXCLUDED.plan,
        status = EXCLUDED.status,
        issued_at = EXCLUDED.issued_at,
        expires_at = EXCLUDED.expires_at,
        paid_via = EXCLUDED.paid_via,
        amount_dzd = EXCLUDED.amount_dzd,
        original_price_dzd = EXCLUDED.original_price_dzd,
        promo_code = EXCLUDED.promo_code,
        discount_percent = EXCLUDED.discount_percent,
        max_devices = EXCLUDED.max_devices,
        order_id = EXCLUDED.order_id,
        invoice_number = EXCLUDED.invoice_number,
        data = EXCLUDED.data;
    `, [
      cleanKey,
      String(lic.userEmail || '').trim().toLowerCase(),
      lic.userName || null,
      lic.plan || 'pro',
      lic.status || 'active',
      lic.issuedAt || new Date().toISOString().split('T')[0],
      lic.expiresAt || null,
      lic.paidVia || 'Chargily Pay v2 (Edahabia/CIB)',
      lic.amountDZD ? Number(lic.amountDZD) : 3000,
      lic.originalPriceDZD ? Number(lic.originalPriceDZD) : null,
      lic.promoCode || null,
      lic.discountPercent ? Number(lic.discountPercent) : null,
      lic.maxDevices ? Number(lic.maxDevices) : 1,
      lic.orderId || null,
      lic.invoiceNumber || null,
      JSON.stringify(lic)
    ]);
  } catch (err) {
    console.error('[SolidDB] Error persisting license to PostgreSQL:', err);
  }
}

// -------------------------------------------------------------
// PROMO CODES OPERATIONS
// -------------------------------------------------------------
export async function persistPromoCode(promo: any): Promise<void> {
  const cleanCode = String(promo.code || '').trim().toUpperCase();
  if (!cleanCode) return;

  const fullPromo = {
    code: cleanCode,
    discountPercent: Number(promo.discountPercent || 15),
    isActive: promo.isActive !== false && promo.isActive !== 0 ? 1 : 0,
    uses: Number(promo.uses || 0),
    maxUses: promo.maxUses !== undefined && promo.maxUses !== null && promo.maxUses !== '' ? Number(promo.maxUses) : null,
    expirationDate: promo.expirationDate || null,
    createdAt: promo.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dbPromoCodes.set(cleanCode, fullPromo);
  scheduleSaveDiskBackup();

  try {
    const pool = createPool();
    await pool.query(`
      INSERT INTO promo_codes (
        code, discount_percent, is_active, uses, max_uses, expiration_date, data, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (code) DO UPDATE SET
        discount_percent = EXCLUDED.discount_percent,
        is_active = EXCLUDED.is_active,
        uses = EXCLUDED.uses,
        max_uses = EXCLUDED.max_uses,
        expiration_date = EXCLUDED.expiration_date,
        data = EXCLUDED.data,
        updated_at = NOW();
    `, [
      cleanCode,
      fullPromo.discountPercent,
      fullPromo.isActive,
      fullPromo.uses,
      fullPromo.maxUses,
      fullPromo.expirationDate,
      JSON.stringify(fullPromo)
    ]);
    console.log(`[SolidDB] Promo code ${cleanCode} permanently saved to PostgreSQL.`);
  } catch (err) {
    console.error('[SolidDB] Error persisting promo code to PostgreSQL:', err);
  }
}

export async function deletePromoCodeFromDb(code: string): Promise<boolean> {
  const cleanCode = String(code || '').trim().toUpperCase();
  dbPromoCodes.delete(cleanCode);
  scheduleSaveDiskBackup();

  try {
    const pool = createPool();
    await pool.query('DELETE FROM promo_codes WHERE code = $1;', [cleanCode]);
    console.log(`[SolidDB] Promo code ${cleanCode} deleted from PostgreSQL.`);
    return true;
  } catch (err) {
    console.error('[SolidDB] Error deleting promo code from PostgreSQL:', err);
    return false;
  }
}

// -------------------------------------------------------------
// SUPPORT INQUIRIES & SOS OPERATIONS
// -------------------------------------------------------------
export async function persistInquiry(inq: any): Promise<void> {
  const inqId = String(inq.id || inq.inquiryId || `inq-${Date.now()}`).trim();
  inq.id = inqId;

  dbInquiries.set(inqId, inq);
  scheduleSaveDiskBackup();

  try {
    const pool = createPool();
    await pool.query(`
      INSERT INTO inquiries (
        inquiry_id, user_id, full_name, email, phone, wilaya, subject,
        category, message, response, status, is_sos, priority, admin_reply,
        replied_at, closed_at, data, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        wilaya = EXCLUDED.wilaya,
        subject = EXCLUDED.subject,
        category = EXCLUDED.category,
        message = EXCLUDED.message,
        response = EXCLUDED.response,
        status = EXCLUDED.status,
        is_sos = EXCLUDED.is_sos,
        priority = EXCLUDED.priority,
        admin_reply = EXCLUDED.admin_reply,
        replied_at = EXCLUDED.replied_at,
        closed_at = EXCLUDED.closed_at,
        data = EXCLUDED.data;
    `, [
      inqId,
      inq.userId || null,
      inq.userName || inq.fullName || 'Teacher',
      String(inq.userEmail || inq.email || '').trim().toLowerCase(),
      inq.phone || inq.phoneNumber || null,
      inq.wilaya || null,
      inq.subject || 'Teacher Inquiry',
      inq.category || null,
      inq.message || '',
      inq.adminReply || inq.response || null,
      inq.status || 'pending',
      Boolean(inq.isSOS),
      inq.priority || (inq.isSOS ? 'urgent' : 'normal'),
      inq.adminReply || inq.response || null,
      inq.repliedAt ? new Date(inq.repliedAt) : null,
      inq.closedAt ? new Date(inq.closedAt) : null,
      JSON.stringify(inq)
    ]);
  } catch (err) {
    console.error('[SolidDB] Error persisting inquiry to PostgreSQL:', err);
  }
}

export async function deleteInquiryFromDb(inqId: string): Promise<boolean> {
  const cleanId = String(inqId || '').trim();
  dbInquiries.delete(cleanId);
  scheduleSaveDiskBackup();

  try {
    const pool = createPool();
    await pool.query('DELETE FROM inquiries WHERE inquiry_id = $1 OR id::text = $1;', [cleanId]);
    return true;
  } catch (err) {
    console.error('[SolidDB] Error deleting inquiry from PostgreSQL:', err);
    return false;
  }
}

// -------------------------------------------------------------
// TUTORIALS & BLOG OPERATIONS
// -------------------------------------------------------------
export async function persistTutorial(tut: any): Promise<void> {
  const tutId = String(tut.id || `tut-${Date.now()}`).trim();
  tut.id = tutId;

  dbTutorials.set(tutId, tut);
  scheduleSaveDiskBackup();

  try {
    const pool = createPool();
    await pool.query(`
      INSERT INTO tutorials (
        id, title_ar, title_fr, description_ar, video_url, embed_url,
        thumbnail_url, duration, category, key_steps, data, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title_ar = EXCLUDED.title_ar,
        title_fr = EXCLUDED.title_fr,
        description_ar = EXCLUDED.description_ar,
        video_url = EXCLUDED.video_url,
        embed_url = EXCLUDED.embed_url,
        thumbnail_url = EXCLUDED.thumbnail_url,
        duration = EXCLUDED.duration,
        category = EXCLUDED.category,
        key_steps = EXCLUDED.key_steps,
        data = EXCLUDED.data;
    `, [
      tutId,
      tut.titleAr || '',
      tut.titleFr || null,
      tut.descriptionAr || null,
      tut.videoUrl || '',
      tut.embedUrl || null,
      tut.thumbnailUrl || null,
      tut.duration || '05:00',
      tut.category || null,
      JSON.stringify(tut.keySteps || []),
      JSON.stringify(tut)
    ]);
  } catch (err) {
    console.error('[SolidDB] Error persisting tutorial to PostgreSQL:', err);
  }
}

export async function deleteTutorialFromDb(id: string): Promise<boolean> {
  const tutId = String(id || '').trim();
  dbTutorials.delete(tutId);
  scheduleSaveDiskBackup();

  try {
    const pool = createPool();
    await pool.query('DELETE FROM tutorials WHERE id = $1;', [tutId]);
    return true;
  } catch (err) {
    console.error('[SolidDB] Error deleting tutorial from PostgreSQL:', err);
    return false;
  }
}

export async function persistBlogPost(post: any): Promise<void> {
  const postId = String(post.id || `post-${Date.now()}`).trim();
  post.id = postId;

  dbBlogPosts.set(postId, post);
  scheduleSaveDiskBackup();

  try {
    const pool = createPool();
    await pool.query(`
      INSERT INTO blog_posts (
        id, title_ar, title_fr, excerpt_ar, excerpt_fr, category,
        publish_date, read_time, author, content_ar, image_url, data, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title_ar = EXCLUDED.title_ar,
        title_fr = EXCLUDED.title_fr,
        excerpt_ar = EXCLUDED.excerpt_ar,
        excerpt_fr = EXCLUDED.excerpt_fr,
        category = EXCLUDED.category,
        publish_date = EXCLUDED.publish_date,
        read_time = EXCLUDED.read_time,
        author = EXCLUDED.author,
        content_ar = EXCLUDED.content_ar,
        image_url = EXCLUDED.image_url,
        data = EXCLUDED.data;
    `, [
      postId,
      post.titleAr || '',
      post.titleFr || null,
      post.excerptAr || null,
      post.excerptFr || null,
      post.category || 'Pedagogical Guidelines',
      post.publishDate || new Date().toISOString().split('T')[0],
      post.readTime || '5 min',
      post.author || 'Pedagogical Inspector',
      post.contentAr || '',
      post.imageUrl || null,
      JSON.stringify(post)
    ]);
  } catch (err) {
    console.error('[SolidDB] Error persisting blog post to PostgreSQL:', err);
  }
}

export async function deleteBlogPostFromDb(id: string): Promise<boolean> {
  const postId = String(id || '').trim();
  dbBlogPosts.delete(postId);
  scheduleSaveDiskBackup();

  try {
    const pool = createPool();
    await pool.query('DELETE FROM blog_posts WHERE id = $1;', [postId]);
    return true;
  } catch (err) {
    console.error('[SolidDB] Error deleting blog post from PostgreSQL:', err);
    return false;
  }
}

// -------------------------------------------------------------
// MASTER BOOTSTRAP: Load all data from PostgreSQL & sync backup
// -------------------------------------------------------------
export async function initSolidDatabase(initialUser: any, initialLicense: any): Promise<void> {
  console.log('[SolidDB] Initializing solid database connections and loading data...');

  // 1. First, check if disk backup exists to seed historical data if PG is fresh
  if (fs.existsSync(DB_STORAGE_FILE)) {
    try {
      const raw = fs.readFileSync(DB_STORAGE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.users)) {
        for (const [k, v] of data.users) dbUsers.set(k.toLowerCase(), v);
      }
      if (Array.isArray(data.licenses)) {
        for (const [k, v] of data.licenses) dbLicenses.set(k, v);
      }
      if (Array.isArray(data.inquiries)) {
        for (const [k, v] of data.inquiries) dbInquiries.set(k, v);
      }
      if (Array.isArray(data.promoCodes)) {
        for (const [k, v] of data.promoCodes) dbPromoCodes.set(k.toUpperCase(), v);
      }
      if (Array.isArray(data.tutorials)) {
        for (const [k, v] of data.tutorials) dbTutorials.set(k, v);
      }
      if (Array.isArray(data.blogPosts)) {
        for (const [k, v] of data.blogPosts) dbBlogPosts.set(k, v);
      }
      console.log(`[SolidDB] Pre-loaded from disk backup: ${dbUsers.size} users, ${dbLicenses.size} licenses, ${dbPromoCodes.size} promos`);
    } catch (e) {
      console.warn('[SolidDB] Warning reading disk backup:', e);
    }
  }

  // Ensure default master admin exists in map
  if (!dbUsers.has(initialUser.email.toLowerCase())) {
    dbUsers.set(initialUser.email.toLowerCase(), initialUser);
  }
  if (!dbLicenses.has(initialLicense.key)) {
    dbLicenses.set(initialLicense.key, initialLicense);
  }

  // 2. Load and reconcile directly with PostgreSQL (The Source of Truth)
  try {
    const pool = createPool();

    // Query all users from PostgreSQL
    const usersRes = await pool.query('SELECT * FROM users ORDER BY created_at ASC;');
    for (const row of usersRes.rows) {
      const cleanEmail = (row.email || '').toLowerCase().trim();
      if (!cleanEmail) continue;
      
      const parsedData = row.data || {};
      const mergedUser = {
        id: row.uid || `user-${row.id}`,
        uid: row.uid,
        email: cleanEmail,
        fullName: row.full_name,
        role: row.role || 'user',
        password: row.password || parsedData.password || 'teacher123',
        phoneNumber: row.phone_number || parsedData.phoneNumber || '',
        wilaya: row.wilaya || '16 - Algiers',
        primaryGrade: row.primary_grade || '4AP',
        schoolName: row.school_name || parsedData.schoolName || '',
        licenseKey: row.license_key || parsedData.licenseKey || '',
        licenseStatus: row.license_status || 'trial',
        licensePlan: row.license_plan || 'pro',
        isFlagged: Boolean(row.is_flagged),
        flagReason: row.flag_reason || parsedData.flagReason || '',
        isBlocked: Boolean(row.is_blocked),
        amountPaidDZD: row.amount_paid_dzd || parsedData.amountPaidDZD,
        paidVia: row.paid_via || parsedData.paidVia,
        orderId: row.order_id || parsedData.orderId,
        invoiceNumber: row.invoice_number || parsedData.invoiceNumber,
        maxDevices: row.max_devices || 1,
        expiresAt: row.expires_at || parsedData.expiresAt,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
      };
      dbUsers.set(cleanEmail, mergedUser);
    }

    // Query all licenses from PostgreSQL
    const licensesRes = await pool.query('SELECT * FROM licenses ORDER BY created_at ASC;');
    for (const row of licensesRes.rows) {
      if (!row.key) continue;
      const parsedData = row.data || {};
      const mergedLic = {
        id: `lic-${row.id}`,
        key: row.key,
        userEmail: (row.user_email || '').toLowerCase().trim(),
        userName: row.user_name || parsedData.userName || '',
        plan: row.plan || 'pro',
        status: row.status || 'active',
        issuedAt: row.issued_at || (row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '2026-01-10'),
        expiresAt: row.expires_at || parsedData.expiresAt || '2027-01-10',
        paidVia: row.paid_via || 'Chargily Pay v2 (Edahabia/CIB)',
        amountDZD: row.amount_dzd || 3000,
        originalPriceDZD: row.original_price_dzd || parsedData.originalPriceDZD,
        promoCode: row.promo_code || parsedData.promoCode,
        discountPercent: row.discount_percent || parsedData.discountPercent,
        maxDevices: row.max_devices || 1,
        orderId: row.order_id || parsedData.orderId,
        invoiceNumber: row.invoice_number || parsedData.invoiceNumber,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
      };
      dbLicenses.set(row.key, mergedLic);
    }

    // Query all promo codes from PostgreSQL
    const promosRes = await pool.query('SELECT * FROM promo_codes ORDER BY created_at ASC;');
    for (const row of promosRes.rows) {
      if (!row.code) continue;
      const parsedData = row.data || {};
      const promoObj = {
        code: row.code.toUpperCase(),
        discountPercent: Number(row.discount_percent || 15),
        isActive: row.is_active !== undefined ? row.is_active : 1,
        uses: Number(row.uses || 0),
        maxUses: row.max_uses !== null && row.max_uses !== undefined ? Number(row.max_uses) : null,
        expirationDate: row.expiration_date || parsedData.expirationDate || null,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
      };
      dbPromoCodes.set(row.code.toUpperCase(), promoObj);
    }

    // Query all inquiries from PostgreSQL
    const inqRes = await pool.query('SELECT * FROM inquiries ORDER BY created_at ASC;');
    for (const row of inqRes.rows) {
      const inqId = row.inquiry_id || `inq-${row.id}`;
      const parsedData = row.data || {};
      const inqObj = {
        id: inqId,
        inquiryId: inqId,
        userId: row.user_id || parsedData.userId || 'guest',
        userEmail: (row.email || parsedData.userEmail || '').toLowerCase().trim(),
        userName: row.full_name || parsedData.userName || 'Teacher',
        phone: row.phone || parsedData.phone || '',
        wilaya: row.wilaya || parsedData.wilaya || '',
        subject: row.subject || parsedData.subject || '',
        category: row.category || parsedData.category || 'General',
        message: row.message || parsedData.message || '',
        status: row.status || 'pending',
        isSOS: Boolean(row.is_sos || parsedData.isSOS),
        priority: row.priority || (row.is_sos ? 'urgent' : 'normal'),
        adminReply: row.admin_reply || row.response || parsedData.adminReply || null,
        repliedAt: row.replied_at ? new Date(row.replied_at).toISOString() : null,
        closedAt: row.closed_at ? new Date(row.closed_at).toISOString() : null,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
      };
      dbInquiries.set(inqId, inqObj);
    }

    // Query all tutorials from PostgreSQL
    const tutRes = await pool.query('SELECT * FROM tutorials ORDER BY created_at ASC;');
    for (const row of tutRes.rows) {
      if (!row.id) continue;
      const tutObj = {
        id: row.id,
        titleAr: row.title_ar,
        titleFr: row.title_fr || '',
        descriptionAr: row.description_ar || '',
        videoUrl: row.video_url,
        embedUrl: row.embed_url || row.video_url,
        thumbnailUrl: row.thumbnail_url || '',
        duration: row.duration || '05:00',
        category: row.category || '',
        keySteps: Array.isArray(row.key_steps) ? row.key_steps : [],
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
      };
      dbTutorials.set(row.id, tutObj);
    }

    // Query all blog posts from PostgreSQL
    const blogRes = await pool.query('SELECT * FROM blog_posts ORDER BY created_at ASC;');
    for (const row of blogRes.rows) {
      if (!row.id) continue;
      const postObj = {
        id: row.id,
        titleAr: row.title_ar,
        titleFr: row.title_fr || '',
        excerptAr: row.excerpt_ar || '',
        excerptFr: row.excerpt_fr || '',
        category: row.category || 'Pedagogical Guidelines',
        publishDate: row.publish_date || (row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '2026-09-01'),
        readTime: row.read_time || '5 min',
        author: row.author || 'Pedagogical Inspector',
        contentAr: row.content_ar || '',
        imageUrl: row.image_url || '',
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
      };
      dbBlogPosts.set(row.id, postObj);
    }

    console.log(`[SolidDB] Successfully loaded from PostgreSQL: ${dbUsers.size} users, ${dbLicenses.size} licenses, ${dbPromoCodes.size} promos, ${dbInquiries.size} inquiries, ${dbTutorials.size} tutorials, ${dbBlogPosts.size} blog posts.`);

    // 3. Sync any preloaded backup items to PostgreSQL if missing from PG
    if (dbUsers.size > 0 && usersRes.rows.length === 0) {
      for (const u of dbUsers.values()) await persistUser(u);
    } else {
      // Ensure master admin is synced to PostgreSQL
      await persistUser(initialUser);
    }

    if (dbLicenses.size > 0 && licensesRes.rows.length === 0) {
      for (const l of dbLicenses.values()) await persistLicense(l);
    } else {
      await persistLicense(initialLicense);
    }

    if (dbPromoCodes.size > 0 && promosRes.rows.length === 0) {
      for (const p of dbPromoCodes.values()) await persistPromoCode(p);
    }

    if (dbInquiries.size > 0 && inqRes.rows.length === 0) {
      for (const i of dbInquiries.values()) await persistInquiry(i);
    }

    // Write synchronized disk snapshot
    scheduleSaveDiskBackup();

  } catch (err) {
    console.error('[SolidDB] Error during PostgreSQL sync:', err);
  }
}
