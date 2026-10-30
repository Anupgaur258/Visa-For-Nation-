const COUNTRY_FLAGS = {
  canada: '🇨🇦', australia: '🇦🇺', germany: '🇩🇪', portugal: '🇵🇹',
  singapore: '🇸🇬', sweden: '🇸🇪', uk: '🇬🇧', usa: '🇺🇸',
  france: '🇫🇷', ireland: '🇮🇪', italy: '🇮🇹', newzealand: '🇳🇿',
  hongkong: '🇭🇰', denmark: '🇩🇰', spain: '🇪🇸', norway: '🇳🇴',
  slovakia: '🇸🇰', luxembourg: '🇱🇺', malta: '🇲🇹', greece: '🇬🇷',
  netherlands: '🇳🇱', switzerland: '🇨🇭',
};

const COUNTRY_NAMES = Object.keys(COUNTRY_FLAGS).sort((a, b) => b.length - a.length);

export function heroBackgroundForPage(page = {}) {
  return {
    backgroundColor: '#0b1121',
    backgroundImage: 'radial-gradient(ellipse at 14% 16%, rgba(69,82,105,.30) 0%, transparent 46%), linear-gradient(112deg, #202a3b 0%, #111a2b 48%, #0b1121 100%)',
  };
}

export function countryFlagForPage(page = {}) {
  const key = `${page.fullUrl || ''} ${page.country || ''} ${page.heroTitle || ''} ${page.title || ''} ${page.metaDescription || ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
  const country = COUNTRY_NAMES.find(name => key.includes(name));
  return COUNTRY_FLAGS[country] || '';
}
