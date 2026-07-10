export async function getFilePreview(file: File): Promise<string> {
  return new Promise((resolve) => {
    let resolved = false;
    const safeResolve = (val: string) => {
      if (!resolved) {
        resolved = true;
        resolve(val);
      }
    };

    const timeout = setTimeout(() => {
      safeResolve("");
    }, 3000);

    try {
      if (file.type.startsWith("image/")) {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        img.onload = () => {
          clearTimeout(timeout);
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const maxDim = 150;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
            URL.revokeObjectURL(objectUrl);
            safeResolve(dataUrl);
          } catch (e) {
            URL.revokeObjectURL(objectUrl);
            safeResolve("");
          }
        };
        img.onerror = () => {
          clearTimeout(timeout);
          URL.revokeObjectURL(objectUrl);
          safeResolve("");
        };
      } else if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;
        const objectUrl = URL.createObjectURL(file);
        video.src = objectUrl;

        video.onloadeddata = () => {
          video.currentTime = 50;
        };

        video.onseeked = () => {
          clearTimeout(timeout);
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const maxDim = 150;
            let width = video.videoWidth;
            let height = video.videoHeight;
            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(video, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
            URL.revokeObjectURL(objectUrl);
            safeResolve(dataUrl);
          } catch (e) {
            URL.revokeObjectURL(objectUrl);
            safeResolve("");
          }
        };

        video.onerror = () => {
          clearTimeout(timeout);
          URL.revokeObjectURL(objectUrl);
          safeResolve("");
        };
      } else {
        clearTimeout(timeout);
        safeResolve("");
      }
    } catch (error) {
      clearTimeout(timeout);
      safeResolve("");
    }
  });
}
