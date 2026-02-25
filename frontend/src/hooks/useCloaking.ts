export function useCloaking() {
  const cloak = () => {
    const newWindow = window.open('about:blank', '_blank');
    if (!newWindow) {
      alert('Popup blocked. Please allow popups for this site.');
      return;
    }

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
</body>
</html>`;

    newWindow.document.open();
    newWindow.document.write(html);
    newWindow.document.close();
  };

  return { cloak };
}
