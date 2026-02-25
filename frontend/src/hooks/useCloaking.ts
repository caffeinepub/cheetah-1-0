export type CloakMode = 'about:blank' | 'https://error' | '123456789101112';

export function useCloaking() {
  const cloak = (mode: CloakMode = 'about:blank') => {
    const currentUrl = window.location.href;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title></title>
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #1a1a1a; }
    iframe { width: 100%; height: 100%; border: none; display: block; }
  </style>
</head>
<body>
  <iframe src="${currentUrl}" allowfullscreen></iframe>
  <script>
    (function() {
      var mode = ${JSON.stringify(mode)};
      if (mode === 'about:blank') {
        // already about:blank from window.open, nothing to do
      } else {
        try {
          window.history.replaceState(null, '', mode);
        } catch(e) {}
      }
    })();
  </script>
</body>
</html>`;

    if (mode === 'about:blank') {
      const newWindow = window.open('about:blank', '_blank');
      if (!newWindow) {
        alert('Popup blocked. Please allow popups for this site.');
        return;
      }
      newWindow.document.open();
      newWindow.document.write(html);
      newWindow.document.close();
    } else {
      // Open a blank popup first, then write content and push state
      const newWindow = window.open('about:blank', '_blank');
      if (!newWindow) {
        alert('Popup blocked. Please allow popups for this site.');
        return;
      }
      newWindow.document.open();
      newWindow.document.write(html);
      newWindow.document.close();
      // Push state after write so the address bar shows the chosen disguise
      try {
        newWindow.history.replaceState(null, '', mode);
      } catch (_) {
        // Some browsers may restrict this; silently ignore
      }
    }
  };

  return { cloak };
}
