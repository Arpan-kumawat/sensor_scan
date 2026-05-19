export const preprocessImageForOcr = (sourceCanvas) => {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const cropRatio = 0.72;
  const cropW = Math.floor(width * cropRatio);
  const cropH = Math.floor(height * cropRatio);
  const cropX = Math.floor((width - cropW) / 2);
  const cropY = Math.floor((height - cropH) / 2);

  const processed = document.createElement('canvas');
  processed.width = cropW;
  processed.height = cropH;
  const ctx = processed.getContext('2d');

  ctx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  const imageData = ctx.getImageData(0, 0, cropW, cropH);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const contrast = 1.4;
    const factor = (259 * (contrast * 50 + 255)) / (255 * (259 - contrast * 50));
    let value = factor * (gray - 128) + 128;
    value = Math.max(0, Math.min(255, value));
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }

  ctx.putImageData(imageData, 0, 0);
  return processed;
};

export const captureFrameFromVideo = (video) => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  return canvas;
};
