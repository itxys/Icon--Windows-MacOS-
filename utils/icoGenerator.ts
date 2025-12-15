
import { IconLayer, IconFormat } from '../types';

// Comprehensive Windows sizes including standard and high-DPI variants
const ICO_SIZES = [256, 96, 80, 72, 64, 60, 48, 40, 36, 32, 30, 24, 20, 16];
const ICNS_SIZES = [1024, 512, 256, 128, 64, 32, 16];

const ICNS_TYPES: Record<number, string[]> = {
  1024: ['ic10'],
  512: ['ic09', 'ic14'], // 512x512, 256x256@2x
  256: ['ic08', 'ic13'], // 256x256, 128x128@2x
  128: ['ic07'],
  64: ['icp6', 'ic12'],  // 64x64, 32x32@2x
  32: ['icp5', 'ic11'],  // 32x32, 16x16@2x
  16: ['icp4']
};

// Helper to convert a Blob to an ArrayBuffer
const blobToArrayBuffer = async (blob: Blob): Promise<ArrayBuffer> => {
  return await blob.arrayBuffer();
};

// Helper to resize image to specific dimension and return blob
const resizeImage = async (img: HTMLImageElement, size: number): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');
  
  // High quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, size, size);
  
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas to Blob failed'));
    }, 'image/png');
  });
};

export const generateIconLayers = async (sourceUrl: string, format: IconFormat = 'ICO'): Promise<IconLayer[]> => {
  const sizes = format === 'ICO' ? ICO_SIZES : ICNS_SIZES;
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    // CRITICAL: Allow cross-origin images to be drawn to canvas without tainting it.
    // This allows us to process images from external URLs (like Alibaba OSS).
    img.crossOrigin = 'anonymous'; 
    
    img.onload = async () => {
      try {
        const layers: IconLayer[] = [];
        for (const size of sizes) {
          const blob = await resizeImage(img, size);
          layers.push({
            size,
            blob,
            url: URL.createObjectURL(blob),
          });
        }
        resolve(layers);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = (err) => reject(new Error("Failed to load source image. If using an external URL, ensure CORS headers are allowed."));
    img.src = sourceUrl;
  });
};

/**
 * Constructs a Windows ICO file from multiple PNG blobs.
 */
export const createIcoFile = async (layers: IconLayer[]): Promise<Blob> => {
  const headerSize = 6;
  const directorySize = 16 * layers.length;
  let offset = headerSize + directorySize;
  
  const headersAndDirs = new Uint8Array(offset);
  const view = new DataView(headersAndDirs.buffer);
  
  // Write Header
  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 1, true); // Type: 1 = ICO
  view.setUint16(4, layers.length, true); // Count
  
  const imageBuffers: ArrayBuffer[] = [];
  
  let dirOffset = 6;
  
  for (const layer of layers) {
    const buffer = await blobToArrayBuffer(layer.blob);
    imageBuffers.push(buffer);
    
    const width = layer.size >= 256 ? 0 : layer.size;
    const height = layer.size >= 256 ? 0 : layer.size;
    const sizeInBytes = buffer.byteLength;
    
    // Write Directory Entry
    view.setUint8(dirOffset, width);         // Width
    view.setUint8(dirOffset + 1, height);    // Height
    view.setUint8(dirOffset + 2, 0);         // Colors
    view.setUint8(dirOffset + 3, 0);         // Reserved
    view.setUint16(dirOffset + 4, 1, true);  // Planes
    view.setUint16(dirOffset + 6, 32, true); // BitCount
    view.setUint32(dirOffset + 8, sizeInBytes, true); // Size
    view.setUint32(dirOffset + 12, offset, true);     // Offset
    
    dirOffset += 16;
    offset += sizeInBytes;
  }
  
  // Combine all parts
  const finalBlob = new Blob([headersAndDirs, ...imageBuffers], { type: 'image/x-icon' });
  return finalBlob;
};

/**
 * Constructs a MacOS ICNS file from PNG blobs.
 * ICNS uses Big Endian format.
 */
export const createIcnsFile = async (layers: IconLayer[]): Promise<Blob> => {
  const chunks: { type: string; data: ArrayBuffer }[] = [];
  
  for (const layer of layers) {
    const types = ICNS_TYPES[layer.size];
    if (types) {
      const buffer = await blobToArrayBuffer(layer.blob);
      for (const type of types) {
        chunks.push({ type, data: buffer });
      }
    }
  }

  // Header is 8 bytes ('icns' + total size)
  // Each chunk has 8 bytes header (type + size)
  let totalSize = 8;
  for (const chunk of chunks) {
    totalSize += 8 + chunk.data.byteLength;
  }

  const fileBuffer = new Uint8Array(totalSize);
  const view = new DataView(fileBuffer.buffer);

  // Write Header
  // 'icns' in ASCII: 105, 99, 110, 115
  view.setUint8(0, 105); 
  view.setUint8(1, 99);  
  view.setUint8(2, 110); 
  view.setUint8(3, 115); 
  view.setUint32(4, totalSize, false); // File size (Big Endian)

  let offset = 8;
  for (const chunk of chunks) {
    // Write Type
    for (let i = 0; i < 4; i++) {
      view.setUint8(offset + i, chunk.type.charCodeAt(i));
    }
    
    // Write Chunk Size (data len + 8 header bytes)
    const chunkSize = chunk.data.byteLength + 8;
    view.setUint32(offset + 4, chunkSize, false); // Big Endian

    // Write Data
    fileBuffer.set(new Uint8Array(chunk.data), offset + 8);
    
    offset += chunkSize;
  }

  return new Blob([fileBuffer], { type: 'image/icns' });
};
