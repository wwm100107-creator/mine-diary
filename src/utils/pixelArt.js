/**
 * src/utils/pixelArt.js
 * HTML5 Canvas Pixel Art conversion and 1:1 square cropping algorithm.
 * Ponytail principles: pure native Canvas API, 0 external deps, instant client-side execution.
 */

/**
 * 1. File Handling & 1:1 Square Cropping
 * Crops an image to a centered 1:1 square with target output resolution (default 256x256).
 * @param {string|File|Blob} imageSource - Image source URL, Data URL, File, or Blob
 * @param {number} outputSize - Target square width/height
 * @returns {Promise<string>} Data URL of cropped image
 */
export function cropToSquare(imageSource, outputSize = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = outputSize
        canvas.height = outputSize
        const ctx = canvas.getContext('2d')

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Center square crop coordinates
        const minDim = Math.min(img.width, img.height)
        const sx = (img.width - minDim) / 2
        const sy = (img.height - minDim) / 2

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, outputSize, outputSize)
        resolve(canvas.toDataURL('image/png', 0.92))
      } catch (err) {
        reject(err)
      }
    }

    img.onerror = (err) => reject(new Error('Failed to load image for cropping: ' + err))

    if (typeof imageSource === 'string') {
      img.src = imageSource
    } else if (imageSource instanceof Blob || imageSource instanceof File) {
      img.src = URL.createObjectURL(imageSource)
    }
  })
}

/**
 * 2. HTML5 Canvas Pixel Art Algorithm
 * Downsamples the image to a low-res pixel grid (e.g. 32x32, 48x48, 64x64),
 * disables browser smoothing, and scales up to target output size with crisp pixels.
 *
 * @param {string|File|Blob} imageSource - Image source
 * @param {number} pixelGridSize - Low-res pixel grid resolution (e.g. 32, 48, 64)
 * @param {number} outputSize - High-res scaled output size (default 256)
 * @returns {Promise<string>} Data URL of pixelated image
 */
export function generatePixelArt(imageSource, pixelGridSize = 48, outputSize = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        // Step A: Downsample to low-res pixel canvas
        const lowCanvas = document.createElement('canvas')
        lowCanvas.width = pixelGridSize
        lowCanvas.height = pixelGridSize
        const lowCtx = lowCanvas.getContext('2d')

        lowCtx.imageSmoothingEnabled = true
        lowCtx.imageSmoothingQuality = 'medium'

        const minDim = Math.min(img.width, img.height)
        const sx = (img.width - minDim) / 2
        const sy = (img.height - minDim) / 2

        lowCtx.drawImage(img, sx, sy, minDim, minDim, 0, 0, pixelGridSize, pixelGridSize)

        // Step B: Upscale to output canvas with imageSmoothingEnabled = false
        const outCanvas = document.createElement('canvas')
        outCanvas.width = outputSize
        outCanvas.height = outputSize
        const outCtx = outCanvas.getContext('2d')

        // Disable smoothing across standard and vendor prefixes
        outCtx.imageSmoothingEnabled = false
        outCtx.webkitImageSmoothingEnabled = false
        outCtx.mozImageSmoothingEnabled = false
        outCtx.msImageSmoothingEnabled = false

        outCtx.drawImage(lowCanvas, 0, 0, pixelGridSize, pixelGridSize, 0, 0, outputSize, outputSize)

        resolve(outCanvas.toDataURL('image/png', 0.95))
      } catch (err) {
        reject(err)
      }
    }

    img.onerror = (err) => reject(new Error('Failed to load image for pixelation: ' + err))

    if (typeof imageSource === 'string') {
      img.src = imageSource
    } else if (imageSource instanceof Blob || imageSource instanceof File) {
      img.src = URL.createObjectURL(imageSource)
    }
  })
}

/**
 * 3. Convert Data URL to Blob for Cloud Storage upload
 */
export function dataUrlToBlob(dataUrl) {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}
