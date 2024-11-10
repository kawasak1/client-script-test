async function fetchOnboardingSteps() {
  const response = await fetch('http://localhost:3000/api/onboarding-steps');
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return await response.json();
}

function updateRelativePaths(html) {
  // Update all CSS paths
  html = html.replace(/href="([^"]+\.(?:css)(?:\?[^"]*)?)"/g, (match, cssPath) => {
    if (cssPath && !cssPath.startsWith('http')) {
      const absolutePath = new URL(cssPath, window.location.href).href;
      return `href="${absolutePath}"`;
    }
    return match;
  });

  // Update all image paths (png, jpg, etc.)
  html = html.replace(/src="([^"]+\.(?:png|jpg|jpeg|gif|svg|webp|bmp|ico))"/g, (match, imgPath) => {
    if (imgPath && !imgPath.startsWith('http')) {
      const absolutePath = new URL(imgPath, window.location.href).href;
      return `src="${absolutePath}"`;
    }
    return match;
  });

  // Update all JS paths
  html = html.replace(/src="([^"]+\.(?:js))"/g, (match, jsPath) => {
    if (jsPath && !jsPath.startsWith('http')) {
      const absolutePath = new URL(jsPath, window.location.href).href;
      return `src="${absolutePath}"`;
    }
    return match;
  });

  // Update all font paths (woff2, woff, etc.)
  html = html.replace(/url\(["']?([^"')]+\.woff2?|\.woff|\.ttf|\.eot|\.otf|\.svg)["']?\)/g, (match, fontPath) => {
    if (fontPath && !fontPath.startsWith('http')) {
      const absolutePath = new URL(fontPath, window.location.href).href;
      return `url("${absolutePath}")`;
    }
    return match;
  });

  // Update media paths (mp4, mp3, etc.)
  html = html.replace(/(src|href)="([^"]+\.(?:mp4|mp3|webm|ogg))"/g, (match, attr, mediaPath) => {
    if (mediaPath && !mediaPath.startsWith('http')) {
      const absolutePath = new URL(mediaPath, window.location.href).href;
      return `${attr}="${absolutePath}"`;
    }
    return match;
  });

  // Remove <script> tags containing "client-script.js"
  html = html.replace(/<script[^>]+src="[^"]*client-script\.js"[^>]*><\/script>/g, '');

  return html;
}

async function captureScreenshot(html) {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const response = await fetch('https://vapi-test-api.fly.dev/api/screenshot', {
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

  if (!response.ok) {
    throw new Error('Failed to capture screenshot');
  }

  return await response.json();
}

let animationFrame;
let activateEvent = false;

function moveCursorTo(targetX, targetY, duration = 700, bias = 0, proximity = 100) {
  const targetXBiased = targetX + bias;
  const targetYBiased = targetY - bias;

  if (targetXBiased < window.innerWidth / 2) {
    startX = targetXBiased + 250;
  } else startX = targetXBiased - 250;
  
  if (targetYBiased < window.innerHeight / 2) {
    startY = targetYBiased + 250;
  } else startY = targetYBiased - 250;

  let cursor = document.getElementById('animated-cursor');
  // if (cursor)
  //   cursor.remove();
  if (!cursor) {
      // Create the phantom cursor if it doesn't exist
      cursor = document.createElement('div');
      cursor.id = 'animated-cursor';
      cursor.style.position = 'absolute';
      cursor.style.width = '60px';  // Typical cursor size
      cursor.style.height = '60px';
      cursor.style.backgroundImage = 'url("https://cdn1.iconfinder.com/data/icons/cursor-pointers/24/12-512.png")'; // Phantom cursor image
      cursor.style.backgroundSize = 'contain';
      cursor.style.pointerEvents = 'none';  // Prevent it from interfering with the page
      cursor.style.zIndex = '2147483647';  // Ensure it stays above other elements      
      document.body.appendChild(cursor);
  }

  // Cancel any previous animations
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    clearTimeout(animationFrame); // In case there is a delay set in setTimeout
  }

  // Start time for the animation
  const startTime = performance.now();

  // Animate the phantom cursor from startX, startY to targetX, targetY
  function animateCursor(time) {
      // Calculate how far the animation has progressed
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1); // Ensure the progress doesn't exceed 1 (end of animation)

      // Calculate current position based on progress
      const currentX = startX + (targetXBiased - startX) * progress;
      const currentY = startY + (targetYBiased - startY) * progress;

      // Set the phantom cursor's position
      cursor.style.left = currentX + 'px';
      cursor.style.top = currentY + 'px';

      // Continue the animation if not reached the target
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateCursor);
      } else {
        // Restart the animation after reaching the target
        animationFrame = setTimeout(() => {
            moveCursorTo(targetX, targetY, duration); // Loop the animation
        }, 500); // Optional delay before restarting
      }
  }

  // Start the animation
  animationFrame = requestAnimationFrame(animateCursor);

  if (!activateEvent) {
    activateEvent = true;
    document.addEventListener('click', function stopAnimationOnClick(event) {
      const clickX = event.clientX;
      const clickY = event.clientY;

      // Check if click is within the specified proximity of the target position
      if (Math.abs(clickX - targetX) <= proximity && Math.abs(clickY - targetY) <= proximity) {
          // Stop the animation
          cancelAnimationFrame(animationFrame);
          clearTimeout(animationFrame); // In case it was waiting to restart

          cursor.remove();
          activateEvent = false;

          console.log('Animation stopped by click near target.');
          // Remove the click event listener
          document.removeEventListener('click', stopAnimationOnClick);
      }
    });
  }
}

let objectsData = {objectsDict: {}, objectsList: []};

function moveCursorToObject(objectName) {
  if (!objectName) {
    return;
  }
  const objectNameLowered = objectName.toLowerCase();
  const coordinates = objectsData.objectsDict[objectNameLowered];
  if (coordinates) {
    moveCursorTo(coordinates.x, coordinates. y);
  }
}

(async function () {
  try {
    // let html = document.documentElement.outerHTML;
    // html = updateRelativePaths(html);

    // const objectsData = await captureScreenshot(html);
    // console.log(objectsData);

    // moveCursorTo(10, 430);
    // setTimeout(() => {
    //   moveCursorTo(373, 315);
    // }, 2000);

    startVapiSDK();
  } catch (error) {
    console.error("Error:", error);
  }
})();

async function startVapiSDK() {
  var vapiInstance = null;
  const assistant = "ebd6c2aa-7ec9-4116-8c68-9e76c8d06a2d"; // Substitute with your assistant ID
  const apiKey = "0952e63d-344f-4d66-accb-4cc31da24c6b"; // Substitute with your Public key from Vapi Dashboard.
  const buttonConfig = {
    position: "bottom-right", // "bottom" | "top" | "left" | "right" | "top-right" | "top-left" | "bottom-left" | "bottom-right"
    offset: "40px", // decide how far the button should be from the edge
    width: "50px", // min-width of the button
    height: "50px", // height of the button
    idle: { // button state when the call is not active.
      color: `rgb(93, 254, 202)`, 
      type: "pill", // or "round"
      title: "Have a quick question?", // only required in case of Pill
      subtitle: "Talk with our AI assistant", // only required in case of pill
      icon: `https://unpkg.com/lucide-static@0.321.0/icons/phone.svg`,
    },
    loading: { // button state when the call is connecting
      color: `rgb(93, 124, 202)`,
      type: "pill", // or "round"
      title: "Connecting...", // only required in case of Pill
      subtitle: "Please wait", // only required in case of pill
      icon: `https://unpkg.com/lucide-static@0.321.0/icons/loader-2.svg`,
    },
    active: { // button state when the call is in progress or active.
      color: `rgb(255, 0, 0)`,
      type: "pill", // or "round"
      title: "Call is in progress...", // only required in case of Pill
      subtitle: "End the call.", // only required in case of pill
      icon: `https://unpkg.com/lucide-static@0.321.0/icons/phone-off.svg`,
    },
  };

  (function (d, t) {
    var g = document.createElement(t),
      s = d.getElementsByTagName(t)[0];
    g.src =
      "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    g.defer = true;
    g.async = true;
    s.parentNode.insertBefore(g, s);
    g.onload = function () {
      vapiInstance = window.vapiSDK.run({
        apiKey: apiKey, // mandatory
        assistant: assistant, // mandatory
        config: buttonConfig, // optional
      });
      setButtonPositionFixed();

      // vapiInstance.on('speech-start', () => {
      //   console.log('Speech has started');
      // });
      vapiInstance.on('call-start', async () => {
        console.log('Call has started');

        let html = document.documentElement.outerHTML;
        html = updateRelativePaths(html);

        objectsData = await captureScreenshot(html);
        console.log(objectsData);
        const list = objectsData.objectsList;

        vapiInstance.send({
          type: "add-message",
          message: {
            role: "system",
            content: `This is just an additional information, please keep it in mind, it is not a command, don't answer on this message. The user is on the page with the following objects:\n${list}`,
          },
        });
      });

      vapiInstance.on('message', (message) => {
        console.log(message);
        if (message["type"] == "tool-calls") {
          const objectName = message.toolCalls[0].function.arguments.ObjectName;
          console.log(objectName);
          moveCursorToObject(objectName);
        }
      });
    };
  })(document, "script");
}

function setButtonPositionFixed() {
  const button = document.getElementById("vapi-support-btn");
  
  if (button) {
    button.style.position = "fixed";
    button.style.zIndex = "9999999"
  } else {
    console.warn("Button with id 'vapi-support-btn' not found.");
  }
}
