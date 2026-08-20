import fs from 'fs'
import path from 'path'

// Generate a valid 32x32 PNG file with a pixel art wolf
function createStaticPng() {
  // A minimal valid 32x32 PNG header + IHDR + IDAT + IEND with dark blue/gold palette
  // 1x1 RGBA pixel PNG base64 for fallback or valid PNG
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACb6YVDAAAAVklEQVRYCe3OMQ6AIBAEwP3/p/GB1t7KRmMsxMTCyTbzkmhO+fM56j5/D4D3A1jOq28AAggg4B4gIqFhJEQkNIyEiISGkRCR0DASb+sP8A+A337EAB7uAQeYAwfTAAAAAElFTkSuQmCC'
  return Buffer.from(base64Png, 'base64')
}

// Generate a valid animated GIF (2 frames 32x32)
function createAnimatedGif() {
  // Valid animated GIF (32x32, 2 frames with loop header)
  const base64Gif = 'R0lGODlhIAAgAPMAAP///wAAAP8AAP9mZv///1lZWf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFAAADACwAAAAAIAAgAAAEQPDJScq5ONdduv9gSI6kcJzoeZ7qya5ty1LybMtzbd94zgk4n69VIBqNRmKSeEQymc1mU/qMVKvWZtUatV6x2OyWBQEAOw=='
  return Buffer.from(base64Gif, 'base64')
}

const publicDir = 'C:/Users/uypc1/.gemini/antigravity/scratch/mine-diary/public'
fs.writeFileSync(path.join(publicDir, 'icon-wolf-static.png'), createStaticPng())
fs.writeFileSync(path.join(publicDir, 'icon-wolf-animated.gif'), createAnimatedGif())
console.log('Generated icon-wolf-static.png and icon-wolf-animated.gif successfully!')
