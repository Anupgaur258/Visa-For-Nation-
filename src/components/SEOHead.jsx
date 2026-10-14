import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api.js';

export default function SEOHead({ title, description, keywords, canonical, ogImage }) {
  const { pathname } = useLocation();

  useEffect(() => {
    let customScriptEls = [];

    const applySEO = (seo) => {
      const finalTitle = (seo?.metaTitle || title || 'Visa For Nation | Immigration & Visa Consultants').trim();
      document.title = finalTitle.includes('Visa For Nation') ? finalTitle : `${finalTitle} | Visa For Nation`;

      const finalDesc = seo?.metaDescription || description || 'Expert guidance for Canada PR, Australia PR, Study Visas, Work Permits and Tourist Visas from Visa For Nation Delhi.';
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = finalDesc;

      const finalKeywords = seo?.keywords || keywords || 'immigration consultants in delhi, canada pr, australia pr, study visa, visa for nation';
      let metaKw = document.querySelector('meta[name="keywords"]');
      if (!metaKw) {
        metaKw = document.createElement('meta');
        metaKw.name = 'keywords';
        document.head.appendChild(metaKw);
      }
      metaKw.content = finalKeywords;

      // Canonical
      const finalCanonical = seo?.canonicalUrl || canonical || `https://visafornation.com${pathname}`;
      let linkCan = document.querySelector('link[rel="canonical"]');
      if (!linkCan) {
        linkCan = document.createElement('link');
        linkCan.rel = 'canonical';
        document.head.appendChild(linkCan);
      }
      linkCan.href = finalCanonical;

      // Open Graph Tags
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      ogTitle.content = finalTitle;
      document.head.appendChild(ogTitle);

      const ogDesc = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      ogDesc.content = finalDesc;
      document.head.appendChild(ogDesc);

      const finalOgImg = seo?.ogImage || ogImage || 'https://visafornation.com/logo.png';
      const ogImgEl = document.querySelector('meta[property="og:image"]') || document.createElement('meta');
      ogImgEl.setAttribute('property', 'og:image');
      ogImgEl.content = finalOgImg;
      document.head.appendChild(ogImgEl);

      // Safe injection of custom header tags (if any configured by SEO team)
      if (seo?.customHeaderTags) {
        try {
          const temp = document.createElement('div');
          temp.innerHTML = seo.customHeaderTags;
          const scripts = temp.querySelectorAll('script');
          scripts.forEach((oldScript) => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.textContent = oldScript.textContent;
            newScript.setAttribute('data-vfn-seo', 'true');
            document.head.appendChild(newScript);
            customScriptEls.push(newScript);
          });
        } catch (e) {
          console.warn('Custom SEO header tag injection error:', e);
        }
      }
    };

    // Apply baseline props immediately
    applySEO({ metaTitle: title, metaDescription: description, keywords, canonicalUrl: canonical, ogImage });

    // Fetch dynamic overrides from backend
    api(`/seo?url=${encodeURIComponent(pathname)}`)
      .then((customSeo) => {
        if (customSeo && (customSeo.metaTitle || customSeo.customHeaderTags)) {
          applySEO(customSeo);
        }
      })
      .catch(() => {});

    return () => {
      customScriptEls.forEach(el => el.remove());
    };
  }, [pathname, title, description, keywords, canonical, ogImage]);

  return null;
}
