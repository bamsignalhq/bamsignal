export type CoverCropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const COVER_ASPECT_RATIO = 2.5;

/** Centered crop for the cover aspect — used before the user drags the cropper. */
export function initialCoverCropPixels(
  mediaWidth: number,
  mediaHeight: number
): CoverCropArea {
  const mediaAspect = mediaWidth / mediaHeight;
  if (mediaAspect > COVER_ASPECT_RATIO) {
    const height = mediaHeight;
    const width = height * COVER_ASPECT_RATIO;
    return {
      x: (mediaWidth - width) / 2,
      y: 0,
      width,
      height
    };
  }
  const width = mediaWidth;
  const height = width / COVER_ASPECT_RATIO;
  return {
    x: 0,
    y: (mediaHeight - height) / 2,
    width,
    height
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("IMAGE_DECODE_FAILED")));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = src;
  });
}

export async function getCroppedCoverBlob(imageSrc: string, pixelCrop: CoverCropArea): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const width = Math.max(1, Math.round(pixelCrop.width));
  const height = Math.max(1, Math.round(pixelCrop.height));
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("COMPRESSION_FAILED");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("COMPRESSION_FAILED"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.92
    );
  });
}
