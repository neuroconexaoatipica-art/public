/**
 * SECURITY UTILITIES — NeuroConexao Atipica
 * 
 * Camada de seguranca do frontend:
 * - Sanitizacao de HTML (anti-XSS)
 * - Validacao de inputs
 * - Rate limiting local
 * - Whitelist de URLs
 * - Log de eventos de seguranca
 */

import DOMPurify from 'dompurify';
import { supabase } from './supabase';

// ─── SANITIZACAO HTML (Anti-XSS) ──────────────────────────────────────────

/**
 * Sanitiza HTML do usuario — OBRIGATORIO antes de dangerouslySetInnerHTML.
 * Remove scripts, event handlers, iframes maliciosos, etc.
 * Permite apenas tags seguras para conteudo de paginas legais.
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'b', 'i', 'u', 's', 'mark',
      'a', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'section', 'article',
      'img',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'title', 'alt',
      'src', 'width', 'height',
      'class', 'id',
      'colspan', 'rowspan',
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    // Forcar target="_blank" em links e adicionar rel seguro
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur', 'onsubmit', 'onchange'],
  });
}

/**
 * Remove TODAS as tags HTML — retorna texto puro.
 * Usar para: bio, about_text, nomes, comentarios, posts.
 */
export function stripHTML(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Sanitiza texto de post/comentario — permite apenas formatting basico.
 */
export function sanitizePostContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'br', 'p', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload'],
  });
}

// ─── VALIDACAO DE INPUTS ──────────────────────────────────────────────────

/** Limpa e valida texto: trim + remove tags + max length */
export function cleanTextInput(input: string, maxLength: number = 500): string {
  if (!input) return '';
  return stripHTML(input.trim()).slice(0, maxLength);
}

/** Valida formato de email */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/** Valida formato de WhatsApp brasileiro */
export function isValidWhatsApp(phone: string): boolean {
  if (!phone) return true; // opcional
  const cleaned = phone.replace(/\D/g, '');
  // 10 ou 11 digitos (com DDD)
  return cleaned.length === 10 || cleaned.length === 11;
}

/** Formata WhatsApp para armazenamento */
export function formatWhatsApp(phone: string): string {
  return phone.replace(/\D/g, '');
}

/** Valida forca da senha */
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Senha deve ter no minimo 8 caracteres' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Senha muito longa (max 128 caracteres)' };
  }
  return { valid: true, message: '' };
}

// ─── WHITELIST DE URLs ────────────────────────────────────────────────────

const ALLOWED_URL_DOMAINS = [
  'youtube.com', 'www.youtube.com', 'youtu.be',
  'vimeo.com', 'player.vimeo.com',
  'meet.google.com',
  'zoom.us',
  'teams.microsoft.com',
  'discord.gg',
  'instagram.com', 'www.instagram.com',
  // Supabase Storage
  'ieieohtnaymykxiqnmlc.supabase.co',
];

/** Valida se URL esta na whitelist de dominios permitidos */
export function isAllowedURL(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ALLOWED_URL_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

/** Valida se e uma URL valida (qualquer dominio) */
export function isValidURL(url: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ─── VALIDACAO DE UPLOAD ──────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/** Valida arquivo de imagem para upload */
export function validateImageFile(file: File): { valid: boolean; message: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, message: 'Tipo de arquivo nao permitido. Use JPG, PNG, GIF ou WebP.' };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, message: `Arquivo muito grande. Maximo: ${MAX_IMAGE_SIZE / 1024 / 1024}MB` };
  }
  return { valid: true, message: '' };
}

// ─── RATE LIMITING LOCAL ──────────────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiter local (frontend) — protecao extra contra spam.
 * O backend (RLS + Supabase Auth) tem seu proprio rate limit.
 * Este e uma camada adicional de UX.
 */
export function checkRateLimit(action: string, maxAttempts: number, windowMs: number): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(action);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(action, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

/** Rate limits pre-definidos */
export const RATE_LIMITS = {
  /** Criar post: max 5 por minuto */
  CREATE_POST: (action = 'create_post') => checkRateLimit(action, 5, 60_000),
  /** Criar comentario: max 10 por minuto */
  CREATE_COMMENT: (action = 'create_comment') => checkRateLimit(action, 10, 60_000),
  /** Enviar formulario contato: max 3 por 5 minutos */
  CONTACT_FORM: (action = 'contact_form') => checkRateLimit(action, 3, 300_000),
  /** Enviar denuncia: max 5 por hora */
  REPORT: (action = 'report') => checkRateLimit(action, 5, 3_600_000),
  /** Enviar conexao: max 20 por hora */
  CONNECTION: (action = 'connection') => checkRateLimit(action, 20, 3_600_000),
  /** Enviar mensagem privada: max 30 por minuto */
  PRIVATE_MESSAGE: (action = 'private_message') => checkRateLimit(action, 30, 60_000),
  /** Enviar pergunta para live: max 5 por evento */
  LIVE_QUESTION: (eventId: string) => checkRateLimit(`live_question_${eventId}`, 5, 3_600_000),
} as const;

// ─── LOG DE EVENTOS DE SEGURANCA ──────────────────────────────────────────

type SecurityEventType = 
  | 'failed_login'
  | 'suspicious_signup'
  | 'rate_limit_hit'
  | 'rls_violation'
  | 'admin_login'
  | 'data_export'
  | 'account_deleted'
  | 'mass_report'
  | 'content_flagged'
  | 'unauthorized_access_attempt';

type Severity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Registra evento de seguranca no Supabase.
 * Fail-safe: nunca bloqueia a UI se der erro.
 */
export async function logSecurityEvent(
  eventType: SecurityEventType,
  severity: Severity,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('security_events').insert({
      event_type: eventType,
      user_id: user?.id || null,
      severity,
      metadata: metadata || {},
    });
  } catch (err) {
    // Silencioso — nunca bloqueia a UI por causa de log de seguranca
    console.warn('[Security] Falha ao registrar evento:', err);
  }
}

// ─── PROTECAO DE DADOS SENSIVEIS ──────────────────────────────────────────

/** 
 * Mascara email para exibicao publica.
 * ex: "camila@gmail.com" → "c***a@g***l.com"
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const maskedLocal = local.length <= 2 
    ? local[0] + '***' 
    : local[0] + '***' + local[local.length - 1];
  const [domainName, ...tld] = domain.split('.');
  const maskedDomain = domainName.length <= 2
    ? domainName[0] + '***'
    : domainName[0] + '***' + domainName[domainName.length - 1];
  return `${maskedLocal}@${maskedDomain}.${tld.join('.')}`;
}

/**
 * Mascara WhatsApp para exibicao.
 * ex: "11999887766" → "(11) *****-7766"
 */
export function maskWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10) return '***';
  const ddd = cleaned.slice(0, 2);
  const lastFour = cleaned.slice(-4);
  return `(${ddd}) *****-${lastFour}`;
}

// ─── CONSTANTES DE SEGURANCA ──────────────────────────────────────────────

/** UUID da super_admin (Mila) — NUNCA expor no frontend alem de checks internos */
export const SUPER_ADMIN_UUID = 'ce83116b-9593-49f5-a72a-032caa7283ad';

/** Versao atual dos termos de uso */
export const CURRENT_TERMS_VERSION = '1.0';

/** Idade minima obrigatoria */
export const MIN_AGE = 18;

/** Tamanhos maximos de campos */
export const MAX_LENGTHS = {
  NAME: 100,
  DISPLAY_NAME: 50,
  BIO: 280,
  ABOUT_TEXT: 1000,
  WHAT_CROSSES_ME: 1000,
  DEEP_STATEMENT: 500,
  POST_CONTENT: 5000,
  COMMENT_CONTENT: 2000,
  MESSAGE_CONTENT: 2000,
  REPORT_REASON: 1000,
  MANIFESTO: 5000,
  EVENT_DESCRIPTION: 3000,
  QUESTION_TEXT: 500,
  TESTIMONIAL: 1000,
  CONNECTION_NOTE: 500,
  CALMING_STATEMENT: 500,
  PRONOUNS: 30,
  SOCIAL_HANDLE: 100,
} as const;