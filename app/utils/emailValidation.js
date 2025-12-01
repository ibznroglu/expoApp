// Disposable email domain listesi (yaygın olanlar)
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'tempmail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email',
  'temp-mail.org',
  'getnada.com',
  'mohmal.com',
  'fakeinbox.com',
  'trashmail.com',
  'yopmail.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'bccto.me',
  'chitthi.in',
  'dispostable.com',
  'meltmail.com',
  'emailondeck.com',
  'maildrop.cc',
  'mintemail.com',
  'mytrashmail.com',
  'tempail.com',
  'tempr.email',
  'tmpmail.org',
  'getairmail.com',
  '33mail.com',
  'inboxkitten.com',
  'mailcatch.com',
  'mailnesia.com',
  'mailsac.com',
  'mailtemp.info',
  'minuteinbox.com',
  'mytemp.email',
  'nada.email',
  'nada.ltd',
  'throwaway.email',
  'tmpmail.net',
  'tmpmail.org',
  'tmpmailbox.com',
  'tmpmailer.com',
  'tmpmailr.com',
  'tmpr.email',
  'tpmr.email',
  'trashmail.com',
  'trashmailer.com',
  'trashymail.com',
  'tyldd.com',
  'vomoto.com',
  'yapped.net',
  'yeah.net',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'youmailr.com',
  'zippymail.info',
  'zoemail.com',
  'zomg.info'
];

/**
 * E-posta adresinin disposable (geçici) email servisi olup olmadığını kontrol eder
 * @param {string} email - Kontrol edilecek e-posta adresi
 * @returns {boolean} - Eğer disposable email ise true döner
 */
export const isDisposableEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailLower = email.toLowerCase().trim();
  const domain = emailLower.split('@')[1];

  if (!domain) {
    return false;
  }

  // Disposable email domain listesinde var mı kontrol et
  return DISPOSABLE_EMAIL_DOMAINS.some(disposableDomain => 
    domain === disposableDomain || domain.endsWith('.' + disposableDomain)
  );
};

/**
 * E-posta formatını ve disposable email kontrolünü yapar
 * @param {string} email - Kontrol edilecek e-posta adresi
 * @returns {{valid: boolean, error?: string}} - Geçerlilik durumu ve hata mesajı
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'E-posta adresi gerekli' };
  }

  const emailTrimmed = email.trim();

  // Format kontrolü
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailTrimmed)) {
    return { valid: false, error: 'Geçersiz e-posta formatı' };
  }

  // Disposable email kontrolü
  if (isDisposableEmail(emailTrimmed)) {
    return { 
      valid: false, 
      error: 'Geçici e-posta adresleri kullanılamaz. Lütfen gerçek bir e-posta adresi kullanın.' 
    };
  }

  return { valid: true };
};


