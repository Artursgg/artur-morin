// =============================================================================
// Cookie consent (CookieYes) + Google Tag Manager / Analytics - shared by every page
//   - Google Consent Mode v2 defaults to "denied" for everything
//   - Google tags are only loaded after the visitor accepts "Analytics"
//   - "Cookie settings" links (class="cky-banner-element") reopen the banner
// Loaded synchronously in <head>, right after the meta tags.
// =============================================================================
(function () {
  'use strict';

  var GTM_ID = 'GTM-K97CNH32';
  var GA_ID = 'G-X89C2WMLSL';
  var COOKIEYES_SRC = 'https://cdn-cookieyes.com/client_data/0cc137e141492894816e3e85bd125764/script.js';
  var isProduction = /(^|\.)arturmorin\.page$/.test(window.location.hostname);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  // "Cookie settings" is a link for styling, but must not jump the page
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.cky-banner-element')) e.preventDefault();
  });

  // No banner or tracking on localhost / previews
  if (!isProduction) return;

  function addScript(src, id) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    if (id) s.id = id;
    document.head.appendChild(s);
  }

  var tagsLoaded = false;
  function loadGoogleTags() {
    if (tagsLoaded) return;
    tagsLoaded = true;
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    addScript('https://www.googletagmanager.com/gtm.js?id=' + GTM_ID);
    addScript('https://www.googletagmanager.com/gtag/js?id=' + GA_ID);
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  function applyConsent(analytics, ads) {
    window.gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: ads ? 'granted' : 'denied',
      ad_user_data: ads ? 'granted' : 'denied',
      ad_personalization: ads ? 'granted' : 'denied'
    });
    if (analytics) loadGoogleTags();
  }

  // Returning visitor: CookieYes reports the saved choice when it loads
  document.addEventListener('cookieyes_banner_load', function (e) {
    var c = (e.detail && e.detail.categories) || {};
    applyConsent(!!c.analytics, !!c.advertisement);
  });

  // Visitor clicks Accept / Reject / saves preferences
  document.addEventListener('cookieyes_consent_update', function (e) {
    var accepted = (e.detail && e.detail.accepted) || [];
    applyConsent(accepted.indexOf('analytics') > -1, accepted.indexOf('advertisement') > -1);
  });

  addScript(COOKIEYES_SRC, 'cookieyes');
})();
