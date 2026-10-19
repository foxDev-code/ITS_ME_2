import config from './public-config.js';
const form = document.querySelector('#contact-form');
if (form) {
  const status = document.querySelector('#contact-status');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (data.get('_gotcha')) { status.textContent = 'Please email me directly using the link above.'; return; }
    const button = form.querySelector('button[type="submit"]');
    if (!config.contactEndpoint) {
      const subject = encodeURIComponent(`Portfolio enquiry from ${data.get('name')}`);
      const body = encodeURIComponent(`Name: ${data.get('name')}\nReply to: ${data.get('email')}\n\n${data.get('message')}`);
      window.location.href = `mailto:mishrasatyarth61@gmail.com?subject=${subject}&body=${body}`;
      status.textContent = 'Your email app should open with a draft. Send it there to deliver your message. If no app opens, email mishrasatyarth61@gmail.com directly.';
      return;
    }
    button.disabled = true;
    status.textContent = 'Sending…';
    try {
      const response = await fetch(config.contactEndpoint, {method:'POST',body:data,headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000)});
      if (!response.ok) throw Error('Delivery failed');
      form.reset(); status.textContent = 'Message sent. Thank you for getting in touch.';
    } catch { status.textContent = 'Your message was not sent. Please try again or email mishrasatyarth61@gmail.com directly.'; }
    finally { button.disabled = false; }
  });
}
const enabled = Boolean(config.googleAnalyticsId || config.clarityId);
const panel = document.querySelector('#consent-panel');
const settings = document.querySelector('#privacy-settings');
const key = 'foxdev-analytics-consent-v1';
let consent = '';
try { consent = localStorage.getItem(key) || ''; } catch {}
function loadAnalytics() {
  if (config.googleAnalyticsId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){window.dataLayer.push(arguments)};
    window.gtag('js',new Date()); window.gtag('config',config.googleAnalyticsId);
    const script = document.createElement('script'); script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.googleAnalyticsId)}`; document.head.append(script);
  }
  if (config.clarityId) {
    window.clarity = window.clarity || function(){(window.clarity.q=window.clarity.q||[]).push(arguments)};
    window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'granted'});
    const script = document.createElement('script'); script.async = true;
    script.src = `https://www.clarity.ms/tag/${encodeURIComponent(config.clarityId)}`; document.head.append(script);
  }
}
if (enabled && consent === 'accepted') loadAnalytics();
if (panel && enabled && !consent) panel.hidden = false;
if (settings) {
  settings.hidden = !enabled;
  settings.addEventListener('click',()=>{panel.hidden=false;panel.querySelector('button').focus()});
}
panel?.addEventListener('click', event => {
  const choice = event.target.dataset.consent;
  if (!choice) return;
  try {localStorage.setItem(key,choice)} catch {}
  if (choice === 'accepted' && consent !== 'accepted') loadAnalytics();
  if (choice === 'rejected' && consent === 'accepted') {
    if (config.googleAnalyticsId) window[`ga-disable-${config.googleAnalyticsId}`] = true;
    window.clarity?.('consentv2',{ad_Storage:'denied',analytics_Storage:'denied'});
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (/^(_ga|_gid|_gat|_clck|_clsk)/.test(name)) {
        document.cookie = `${name}=; Max-Age=0; path=/`;
        const parts = location.hostname.split('.');
        for (let i=0;i<parts.length-1;i++) document.cookie = `${name}=; Max-Age=0; path=/; domain=${parts.slice(i).join('.')}`;
      }
    }
    location.reload();
  }
  consent = choice; panel.hidden = true;
});
