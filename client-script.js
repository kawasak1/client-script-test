let isRequestInProgress = false;

(async function () {
  if (isRequestInProgress) return;
  isRequestInProgress = true;

  try {
    // const response = await fetch('http://localhost:3000/api/onboarding-steps');
    // if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
    // const steps = await response.json();
    // console.log("Onboarding Steps:", steps);

    console.log('start html');

    let html = document.documentElement.outerHTML;

    console.log('let html');

    html = html.replace(/href="([^"]+\.css)"/g, (match, cssPath) => {
      if (!cssPath.startsWith('http')) {
        const absolutePath = new URL(cssPath, window.location.href).href;
        return `href="${absolutePath}"`;
      }
      return match;
    });

    html = html.replace(/src="([^"]+\.(?:png|jpg|jpeg|gif|svg|webp|bmp|ico))"/g, (match, imgPath) => {
      if (!imgPath.startsWith('http')) {
        const absolutePath = new URL(imgPath, window.location.href).href;
        return `src="${absolutePath}"`;
      }
      return match;
    });

    html = html.replace(/src="([^"]+\.(?:js))"/g, (match, jsPath) => {
      if (!jsPath.startsWith('http')) {
        const absolutePath = new URL(jsPath, window.location.href).href;
        return `src="${absolutePath}"`;
      }
      return match;
    });

    html = html.replace(/url\(["']?([^"')]+\.woff2?|\.woff|\.ttf|\.eot|\.otf|\.svg)["']?\)/g, (match, fontPath) => {
      if (!fontPath.startsWith('http')) {
        const absolutePath = new URL(fontPath, window.location.href).href;
        return `url("${absolutePath}")`;
      }
      return match;
    });

    html = html.replace(/(src|href)="([^"]+\.(?:mp4|mp3|webm|ogg))"/g, (match, attr, mediaPath) => {
      if (!mediaPath.startsWith('http')) {
        const absolutePath = new URL(mediaPath, window.location.href).href;
        return `${attr}="${absolutePath}"`;
      }
      return match;
    });

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    console.log('send');

    const screenshotResponse = await fetch('http://localhost:3000/api/screenshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        html,
        screenWidth,
        screenHeight,
      }),
    });

    if (!screenshotResponse.ok) {
      throw new Error('Failed to capture screenshot');
    }

    const data = await screenshotResponse.json();
    console.log('Screenshot captured successfully:', data);
  } catch (error) {
    console.error("Error fetching onboarding steps:", error);
  } finally {
    isRequestInProgress = false;
  }
})();
