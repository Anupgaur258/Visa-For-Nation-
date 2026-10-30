# Page and section image folders

These folders hold the canonical copies of static images used by each page and section. Legacy originals remain in their previous folders for compatibility; frontend image aliases and direct references point to these page-specific copies. Admin-uploaded content continues to load from the backend upload store.

```text
home/
  banner/
  goals/
  immigration-consultants/
  about-us/
  immigration-visa-services/
  study-visa/
  how-it-works/
  success-stories/
  our-media/
  latest-updates/
careers/
  banner/
gallery/
  banner/
about/
  banner/
  about-us/
  awards/
  team/
contact/
  banner/
  contact-details/
  office/
visa-services/
  banner/
  immigration-consultants/
  immigration-visa-services/
study-visa/
  banner/
  study-visa/
```

Folders with real static assets contain copies of the original project images. Empty folders are reserved for artwork not currently used as a static file (for example, inline illustrations or CMS-managed uploads). Admin-uploaded goal cards are stored in `Backend/uploads/goals/`; homepage banners remain in `Backend/uploads/banner/`.
