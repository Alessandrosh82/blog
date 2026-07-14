(function () {
  const defaults = {
    bodyFont: { css: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', google: '' },
    titleFont: { css: '"Dancing Script", cursive', google: 'Dancing+Script:wght@700' },
    colors: {
      siteBackground: '#f7f6f3', bodyText: '#333333', headerTitle: '#2c3e50',
      subtitle: '#6c7a89', quote: '#3a6351', accent: '#1b6b54',
      articleBackground: '#ffffff', articleTitle: '#2a3d45', link: '#0066cc',
      latestBackground: '#f0fbff', latestBorder: '#5b86a3',
      postBackground: '#fff8dc', footer: '#aaaaaa'
    }
  };

  function apply(config) {
    const root = document.documentElement;
    const colors = { ...defaults.colors, ...(config.colors || {}) };
    const bodyFont = config.bodyFont || defaults.bodyFont;
    const titleFont = config.titleFont || defaults.titleFont;

    root.style.setProperty('--body-font', bodyFont.css || defaults.bodyFont.css);
    root.style.setProperty('--title-font', titleFont.css || defaults.titleFont.css);
    Object.entries(colors).forEach(([key, value]) => {
      const cssName = '--' + key.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase());
      root.style.setProperty(cssName, value);
    });

    const googleFamilies = [bodyFont.google, titleFont.google].filter(Boolean);
    if (googleFamilies.length) {
      const id = 'dynamic-google-fonts';
      let link = document.getElementById(id);
      if (!link) {
        link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = `https://fonts.googleapis.com/css2?${googleFamilies.map(f => `family=${f}`).join('&')}&display=swap`;
    }
  }

  apply(defaults);
  fetch(`site-config.json?v=${Date.now()}`, { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('Configuração não encontrada')))
    .then(apply)
    .catch(() => apply(defaults));
})();
