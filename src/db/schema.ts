import { pgTable, serial, text, integer, timestamp, uuid, jsonb, bigint, boolean } from 'drizzle-orm/pg-core';

// Users table with uid and email as unique identifiers
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  password: text('password'),
  phoneNumber: text('phone_number'),
  role: text('role').default('user'),
  wilaya: text('wilaya'),
  primaryGrade: text('primary_grade').default('4AP'),
  schoolName: text('school_name'),
  licenseKey: text('license_key'),
  licenseStatus: text('license_status').default('trial'),
  licensePlan: text('license_plan').default('pro'),
  isFlagged: boolean('is_flagged').default(false),
  flagReason: text('flag_reason'),
  isBlocked: boolean('is_blocked').default(false),
  amountPaidDZD: integer('amount_paid_dzd'),
  paidVia: text('paid_via'),
  orderId: text('order_id'),
  invoiceNumber: text('invoice_number'),
  maxDevices: integer('max_devices').default(1),
  expiresAt: text('expires_at'),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Teacher licenses table
export const licenses = pgTable('licenses', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  userEmail: text('user_email').notNull(),
  userName: text('user_name'),
  plan: text('plan').notNull().default('pro'),
  status: text('status').notNull().default('active'),
  issuedAt: text('issued_at'),
  expiresAt: text('expires_at'),
  paidVia: text('paid_via').default('Chargily Pay v2 (Edahabia/CIB)'),
  amountDZD: integer('amount_dzd').default(3000),
  originalPriceDZD: integer('original_price_dzd'),
  promoCode: text('promo_code'),
  discountPercent: integer('discount_percent'),
  maxDevices: integer('max_devices').default(1),
  orderId: text('order_id'),
  invoiceNumber: text('invoice_number'),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Chargily Pay Orders
export const chargilyOrders = pgTable('chargily_orders', {
  id: serial('id').primaryKey(),
  orderId: text('order_id').notNull().unique(),
  checkoutId: text('checkout_id'),
  planId: text('plan_id'),
  userEmail: text('user_email'),
  userName: text('user_name'),
  amount: integer('amount'),
  licenseKey: text('license_key'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Teacher Support Inquiries & SOS Emergency Tickets
export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  inquiryId: text('inquiry_id'),
  userId: text('user_id'),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  wilaya: text('wilaya'),
  subject: text('subject'),
  category: text('category'),
  message: text('message').notNull(),
  response: text('response'),
  status: text('status').default('pending'),
  isSOS: boolean('is_sos').default(false),
  priority: text('priority').default('normal'),
  adminReply: text('admin_reply'),
  repliedAt: timestamp('replied_at'),
  closedAt: timestamp('closed_at'),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Teacher Mate Payment Orders (for durable checkout and fulfillment)
export const paymentOrders = pgTable('teacher_mate_payment_orders', {
  orderId: uuid('order_id').primaryKey(),
  checkoutId: text('checkout_id').unique(),
  orderData: jsonb('order_data').notNull(),
  processingLeaseUntil: bigint('processing_lease_until', { mode: 'number' }).notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Teacher Mate Chargily Webhook Events (for idempotency and distributed locking)
export const paymentEvents = pgTable('teacher_mate_chargily_events', {
  eventId: text('event_id').primaryKey(),
  eventType: text('event_type').notNull(),
  status: text('status').notNull(),
  leaseUntil: bigint('lease_until', { mode: 'number' }).notNull().default(0),
  attempts: integer('attempts').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Pricing Settings table for persisting plan pricing and details across app restarts
export const pricingSettingsTable = pgTable('pricing_settings', {
  id: text('id').primaryKey().default('current'),
  currencyDZD: text('currency_dzd').default('دج / DZD'),
  promoNoticeAr: text('promo_notice_ar'),
  promoNoticeFr: text('promo_notice_fr'),
  promoNoticeEn: text('promo_notice_en'),
  plans: jsonb('plans').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Promo Codes table for durable discounts
export const promoCodes = pgTable('promo_codes', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  discountPercent: integer('discount_percent').notNull(),
  isActive: integer('is_active').default(1),
  maxUses: integer('max_uses'),
  uses: integer('uses').default(0),
  expirationDate: text('expiration_date'),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Video Tutorials table
export const tutorials = pgTable('tutorials', {
  id: text('id').primaryKey(),
  titleAr: text('title_ar').notNull(),
  titleFr: text('title_fr'),
  descriptionAr: text('description_ar'),
  videoUrl: text('video_url').notNull(),
  embedUrl: text('embed_url'),
  thumbnailUrl: text('thumbnail_url'),
  duration: text('duration').default('05:00'),
  category: text('category'),
  keySteps: jsonb('key_steps'),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Articles & Pedagogical Blog Posts table
export const blogPosts = pgTable('blog_posts', {
  id: text('id').primaryKey(),
  titleAr: text('title_ar').notNull(),
  titleFr: text('title_fr'),
  excerptAr: text('excerpt_ar'),
  excerptFr: text('excerpt_fr'),
  category: text('category').default('Pedagogical Guidelines'),
  publishDate: text('publish_date'),
  readTime: text('read_time').default('5 min'),
  author: text('author'),
  contentAr: text('content_ar'),
  imageUrl: text('image_url'),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Desktop Application Download Links & Releases
export const appDownloadSettings = pgTable('app_download_settings', {
  id: text('id').primaryKey().default('current'),
  windowsUrl: text('windows_url').notNull(),
  macUrl: text('mac_url').notNull(),
  version: text('version').notNull(),
  releaseDate: text('release_date'),
  notesAr: text('notes_ar'),
  notesEn: text('notes_en'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
