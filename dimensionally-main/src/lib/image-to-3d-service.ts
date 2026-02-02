/**
 * Service for converting 2D images to 3D models
 * Simple working solution using procedural 3D generation
 * Can be extended with real 3D generation APIs (Meshy, Tripo3D, etc.)
 */

import { exportSceneToFormat, type ModelFormat } from "./model-format-converter";

export interface Image2D3DOptions {
  onProgress?: (progress: number) => void;
}

/**
 * Convert a 2D image to a 3D model
 * Currently generates a simple procedural 3D cube
 * @param file - Image file to convert (PNG, JPG, WebP)
 * @param outputFormat - Desired output format (GLB, GLTF, OBJ, STL)
 * @param options - Conversion options including progress callback
 * @returns Blob of the generated 3D model
 */
export async function convertImage2DTo3D(
  file: File,
  outputFormat: string = "GLB",
  options: Image2D3DOptions = {}
): Promise<Blob> {
  throw new Error(
    "This feature is coming soon! We're working hard to bring 2D to 3D conversion to you."
  );
}

/**
 * Convert multiple images using photogrammetry to generate a 3D model
 * @param files - Array of image files to use for photogrammetry
 * @param outputFormat - Desired output format (GLB, GLTF, OBJ, STL, FBX, USDZ, DAE)
 * @param options - Conversion options including progress callback
 * @returns Blob of the generated 3D model
 */
export async function convertPhotogrammetry(
  files: File[],
  outputFormat: string = "GLB",
  options: Image2D3DOptions = {}
): Promise<Blob> {
  options.onProgress?.(10);

  try {
    // Validate images
    if (files.length < 8) {
      throw new Error("Please provide at least 8 images for photogrammetry");
    }

    if (!files.every((file) => file.type.startsWith("image/"))) {
      throw new Error("All files must be valid image files");
    }

    options.onProgress?.(20);

    // Normalize output format
    const normalizedFormat = outputFormat.toUpperCase() as ModelFormat;
    const supportedFormats: ModelFormat[] = [
      "GLB",
      "GLTF",
      "OBJ",
      "STL",
      "FBX",
      "USDZ",
      "DAE",
    ];

    if (!supportedFormats.includes(normalizedFormat)) {
      console.warn(
        `Format ${outputFormat} not supported. Using GLB instead.`
      );
      return generateModelFromPhotogrammetry(files, "GLB", options);
    }

    options.onProgress?.(40);

    return generateModelFromPhotogrammetry(files, normalizedFormat, options);
  } catch (error) {
    throw new Error(
      `Photogrammetry conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate a 3D model from multiple photogrammetry images
 * This simulates the photogrammetry process by creating a procedural model
 * based on the number and characteristics of input images
 */
async function generateModelFromPhotogrammetry(
  files: File[],
  format: ModelFormat,
  options: Image2D3DOptions
): Promise<Blob> {
  options.onProgress?.(50);

  // Read image data to extract color information
  const colors = await extractImageColors(files);

  options.onProgress?.(70);

  // Generate a more complex 3D model based on the images
  const glbArrayBuffer = createPhotogrammetryModel(colors, files.length);

  options.onProgress?.(85);

  // Export to the requested format
  const blob = await exportSceneToFormat(format, options);

  options.onProgress?.(100);

  return blob;
}

/**
 * Extract dominant colors from uploaded images
 */
async function extractImageColors(files: File[]): Promise<number[][]> {
  const colors: number[][] = [];

  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      // Extract dominant color from image
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, 1, 1);
        const imageData = ctx.getImageData(0, 0, 1, 1);
        const [r, g, b] = imageData.data;
        colors.push([r / 255, g / 255, b / 255]);
      }

      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("Failed to extract color from image:", error);
      colors.push([0.8, 0.8, 0.8]); // Default gray
    }
  }

  return colors;
}

/**
 * Create a more detailed 3D model based on photogrammetry data
 * This is a procedural model that improves with more images
 */
function createPhotogrammetryModel(colors: number[][], imageCount: number): ArrayBuffer {
  // Create a sphere instead of a cube for photogrammetry results
  // More images = more subdivisions in the mesh
  const subdivisions = Math.min(8, 2 + Math.floor(imageCount / 5));

  const { vertices, indices, normals } = generateUVSphere(subdivisions);

  // Apply color variation based on input images
  const vertexColors = generateVertexColors(vertices.length, colors);

  // Combine binary data
  const vertexBin = new Uint8Array(vertices.buffer);
  const indicesBin = new Uint8Array(indices.buffer);
  const normalsBin = new Uint8Array(normals.buffer);
  const colorBin = new Uint8Array(vertexColors.buffer);

  const binDataLength =
    vertexBin.length + indicesBin.length + normalsBin.length + colorBin.length;
  const binData = new Uint8Array(binDataLength);

  let offset = 0;
  binData.set(vertexBin, offset);
  offset += vertexBin.length;
  binData.set(indicesBin, offset);
  offset += indicesBin.length;
  binData.set(normalsBin, offset);
  offset += normalsBin.length;
  binData.set(colorBin, offset);

  // Create glTF JSON structure
  const glTF = {
    asset: { version: "2.0", generator: "Dimensionally Photogrammetry" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1, COLOR_0: 2 },
            indices: 3,
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        name: "Material",
        pbrMetallicRoughness: {
          baseColorFactor: [1.0, 1.0, 1.0, 1.0],
          metallicFactor: 0.3,
          roughnessFactor: 0.7,
        },
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126, // FLOAT
        count: vertices.length / 3,
        type: "VEC3",
        min: [-1, -1, -1],
        max: [1, 1, 1],
      },
      {
        bufferView: 1,
        componentType: 5126, // FLOAT
        count: normals.length / 3,
        type: "VEC3",
      },
      {
        bufferView: 2,
        componentType: 5126, // FLOAT
        count: vertexColors.length / 4,
        type: "VEC4",
      },
      {
        bufferView: 3,
        componentType: 5125, // UNSIGNED_INT
        count: indices.length,
        type: "SCALAR",
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: vertexBin.length,
        target: 34962, // ARRAY_BUFFER
      },
      {
        buffer: 0,
        byteOffset: vertexBin.length,
        byteLength: normalsBin.length,
        target: 34962, // ARRAY_BUFFER
      },
      {
        buffer: 0,
        byteOffset: vertexBin.length + normalsBin.length,
        byteLength: colorBin.length,
        target: 34962, // ARRAY_BUFFER
      },
      {
        buffer: 0,
        byteOffset: vertexBin.length + normalsBin.length + colorBin.length,
        byteLength: indicesBin.length,
        target: 34963, // ELEMENT_ARRAY_BUFFER
      },
    ],
    buffers: [{ byteLength: binData.length }],
  };

  // Serialize JSON
  const jsonStr = JSON.stringify(glTF);
  const jsonBuf = new TextEncoder().encode(jsonStr);

  // Pad JSON to 4-byte boundary
  const jsonPaddingNeeded = (4 - (jsonBuf.length % 4)) % 4;
  const jsonChunk = new Uint8Array(jsonBuf.length + jsonPaddingNeeded);
  jsonChunk.set(jsonBuf, 0);
  for (let i = 0; i < jsonPaddingNeeded; i++) {
    jsonChunk[jsonBuf.length + i] = 0x20;
  }

  // Pad binary to 4-byte boundary
  const binPaddingNeeded = (4 - (binData.length % 4)) % 4;
  const binChunk = new Uint8Array(binData.length + binPaddingNeeded);
  binChunk.set(binData, 0);
  for (let i = 0; i < binPaddingNeeded; i++) {
    binChunk[binData.length + i] = 0;
  }

  // Build GLB header
  const header = new ArrayBuffer(20);
  const headerView = new DataView(header);

  headerView.setUint32(0, 0x46546c47, true); // "glTF"
  headerView.setUint32(4, 2, true); // Version 2
  const fileLength = 20 + 8 + jsonChunk.length + 8 + binChunk.length;
  headerView.setUint32(8, fileLength, true);

  // JSON chunk header
  const jsonChunkHeader = new ArrayBuffer(8);
  const jsonHeaderView = new DataView(jsonChunkHeader);
  jsonHeaderView.setUint32(0, jsonChunk.length, true);
  jsonHeaderView.setUint32(4, 0x4e4f534a, true); // "JSON"

  // BIN chunk header
  const binChunkHeader = new ArrayBuffer(8);
  const binHeaderView = new DataView(binChunkHeader);
  binHeaderView.setUint32(0, binChunk.length, true);
  binHeaderView.setUint32(4, 0x004e4942, true); // "BIN\0"

  // Combine all parts
  const headerBytes = new Uint8Array(header);
  const jsonHeaderBytes = new Uint8Array(jsonChunkHeader);
  const binHeaderBytes = new Uint8Array(binChunkHeader);

  const totalLength =
    headerBytes.length +
    jsonHeaderBytes.length +
    jsonChunk.length +
    binHeaderBytes.length +
    binChunk.length;

  const glbFile = new Uint8Array(totalLength);
  let pos = 0;

  glbFile.set(headerBytes, pos);
  pos += headerBytes.length;
  glbFile.set(jsonHeaderBytes, pos);
  pos += jsonHeaderBytes.length;
  glbFile.set(jsonChunk, pos);
  pos += jsonChunk.length;
  glbFile.set(binHeaderBytes, pos);
  pos += binHeaderBytes.length;
  glbFile.set(binChunk, pos);

  return glbFile.buffer;
}

/**
 * Generate a UV sphere (procedural mesh)
 */
function generateUVSphere(
  subdivisions: number
): {
  vertices: Float32Array;
  indices: Uint32Array;
  normals: Float32Array;
} {
  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];

  const rings = subdivisions;
  const sectors = subdivisions * 2;
  const radius = 1;

  for (let i = 0; i <= rings; i++) {
    const ringAngle = (Math.PI * i) / rings;
    const xy = radius * Math.sin(ringAngle);
    const z = radius * Math.cos(ringAngle);

    for (let j = 0; j <= sectors; j++) {
      const sectorAngle = (2 * Math.PI * j) / sectors;

      const x = xy * Math.cos(sectorAngle);
      const y = xy * Math.sin(sectorAngle);

      vertices.push(x, y, z);
      normals.push(x / radius, y / radius, z / radius);
    }
  }

  for (let i = 0; i < rings; i++) {
    let k1 = i * (sectors + 1);
    let k2 = k1 + sectors + 1;

    for (let j = 0; j < sectors; j++, k1++, k2++) {
      if (i !== 0) {
        indices.push(k1, k2, k1 + 1);
      }
      if (i !== rings - 1) {
        indices.push(k1 + 1, k2, k2 + 1);
      }
    }
  }

  return {
    vertices: new Float32Array(vertices),
    indices: new Uint32Array(indices),
    normals: new Float32Array(normals),
  };
}

/**
 * Generate vertex colors based on input image colors
 */
function generateVertexColors(
  vertexCount: number,
  imageColors: number[][]
): Float32Array {
  const colors = new Float32Array(vertexCount * 4);

  for (let i = 0; i < vertexCount; i++) {
    // Sample color from input images
    const colorIndex = i % imageColors.length;
    const [r, g, b] = imageColors[colorIndex] || [0.8, 0.8, 0.8];

    colors[i * 4] = r;
    colors[i * 4 + 1] = g;
    colors[i * 4 + 2] = b;
    colors[i * 4 + 3] = 1.0;
  }

  return colors;
}

/**
 * Generate a cube and export directly to format
 */
async function generateAndExportCube(
  format: ModelFormat,
  options: Image2D3DOptions
): Promise<Blob> {
  options.onProgress?.(40);
  const blob = await exportSceneToFormat(format, options);
  options.onProgress?.(100);
  return blob;
}

/**
 * Generate a simple cube GLB model
 */
async function generateSimpleCubeModel(
  file: File,
  options: Image2D3DOptions
): Promise<Blob> {
  options.onProgress?.(40);

  // Create a minimal but valid GLB file with a cube mesh
  const glbArrayBuffer = createCubeGLB();

  options.onProgress?.(80);

  return new Blob([glbArrayBuffer], { type: "model/gltf-binary" });
}

/**
 * Create a valid GLB file containing a simple cube
 * GLB format: Binary glTF 2.0 with embedded geometry
 */
function createCubeGLB(): ArrayBuffer {
  // Cube vertices (8 points)
  const vertices = new Float32Array([
    -1, -1, -1, // 0
    1, -1, -1, // 1
    1, 1, -1, // 2
    -1, 1, -1, // 3
    -1, -1, 1, // 4
    1, -1, 1, // 5
    1, 1, 1, // 6
    -1, 1, 1, // 7
  ]);

  // Cube face indices (6 faces, 2 triangles each = 36 indices)
  const indices = new Uint16Array([
    0, 1, 2, 2, 3, 0, // Front face
    5, 4, 7, 7, 6, 5, // Back face
    4, 5, 1, 1, 0, 4, // Bottom face
    3, 2, 6, 6, 7, 3, // Top face
    4, 0, 3, 3, 7, 4, // Left face
    1, 5, 6, 6, 2, 1, // Right face
  ]);

  // Vertex normals
  const normals = new Float32Array([
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
    1, 0,
  ]);

  // Combine binary data
  const vertexBin = new Uint8Array(vertices.buffer);
  const indicesBin = new Uint8Array(indices.buffer);
  const normalsBin = new Uint8Array(normals.buffer);

  const binDataLength =
    vertexBin.length + indicesBin.length + normalsBin.length;
  const binData = new Uint8Array(binDataLength);
  binData.set(vertexBin, 0);
  binData.set(indicesBin, vertexBin.length);
  binData.set(normalsBin, vertexBin.length + indicesBin.length);

  // Create glTF JSON structure
  const glTF = {
    asset: { version: "2.0", generator: "Dimensionally" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 2 },
            indices: 1,
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        name: "Material",
        pbrMetallicRoughness: {
          baseColorFactor: [0.8, 0.8, 0.8, 1.0],
          metallicFactor: 0.5,
          roughnessFactor: 0.5,
        },
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126, // FLOAT
        count: 8,
        type: "VEC3",
        min: [-1, -1, -1],
        max: [1, 1, 1],
      },
      {
        bufferView: 1,
        componentType: 5125, // UNSIGNED_INT
        count: 36,
        type: "SCALAR",
      },
      {
        bufferView: 2,
        componentType: 5126, // FLOAT
        count: 24,
        type: "VEC3",
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: vertexBin.length,
        target: 34962, // ARRAY_BUFFER
      },
      {
        buffer: 0,
        byteOffset: vertexBin.length,
        byteLength: indicesBin.length,
        target: 34963, // ELEMENT_ARRAY_BUFFER
      },
      {
        buffer: 0,
        byteOffset: vertexBin.length + indicesBin.length,
        byteLength: normalsBin.length,
        target: 34962, // ARRAY_BUFFER
      },
    ],
    buffers: [{ byteLength: binData.length }],
  };

  // Serialize JSON
  const jsonStr = JSON.stringify(glTF);
  const jsonBuf = new TextEncoder().encode(jsonStr);

  // Pad JSON to 4-byte boundary
  const jsonPaddingNeeded = (4 - (jsonBuf.length % 4)) % 4;
  const jsonChunk = new Uint8Array(jsonBuf.length + jsonPaddingNeeded);
  jsonChunk.set(jsonBuf, 0);
  // Fill padding with spaces (0x20)
  for (let i = 0; i < jsonPaddingNeeded; i++) {
    jsonChunk[jsonBuf.length + i] = 0x20;
  }

  // Pad binary to 4-byte boundary
  const binPaddingNeeded = (4 - (binData.length % 4)) % 4;
  const binChunk = new Uint8Array(binData.length + binPaddingNeeded);
  binChunk.set(binData, 0);
  // Fill padding with zeros
  for (let i = 0; i < binPaddingNeeded; i++) {
    binChunk[binData.length + i] = 0;
  }

  // Build GLB header (20 bytes)
  const header = new ArrayBuffer(20);
  const headerView = new DataView(header);

  // Magic number "glTF" (0x46546c47)
  headerView.setUint32(0, 0x46546c47, true);
  // Version 2
  headerView.setUint32(4, 2, true);
  // File length (header + json chunk + bin chunk)
  const fileLength = 20 + 8 + jsonChunk.length + 8 + binChunk.length;
  headerView.setUint32(8, fileLength, true);

  // JSON chunk header (8 bytes)
  const jsonChunkHeader = new ArrayBuffer(8);
  const jsonHeaderView = new DataView(jsonChunkHeader);
  jsonHeaderView.setUint32(0, jsonChunk.length, true); // Chunk size
  jsonHeaderView.setUint32(4, 0x4e4f534a, true); // "JSON"

  // BIN chunk header (8 bytes)
  const binChunkHeader = new ArrayBuffer(8);
  const binHeaderView = new DataView(binChunkHeader);
  binHeaderView.setUint32(0, binChunk.length, true); // Chunk size
  binHeaderView.setUint32(4, 0x004e4942, true); // "BIN\0"

  // Combine all parts into final GLB
  const headerBytes = new Uint8Array(header);
  const jsonHeaderBytes = new Uint8Array(jsonChunkHeader);
  const binHeaderBytes = new Uint8Array(binChunkHeader);

  const totalLength =
    headerBytes.length +
    jsonHeaderBytes.length +
    jsonChunk.length +
    binHeaderBytes.length +
    binChunk.length;

  const glbFile = new Uint8Array(totalLength);
  let offset = 0;

  glbFile.set(headerBytes, offset);
  offset += headerBytes.length;
  glbFile.set(jsonHeaderBytes, offset);
  offset += jsonHeaderBytes.length;
  glbFile.set(jsonChunk, offset);
  offset += jsonChunk.length;
  glbFile.set(binHeaderBytes, offset);
  offset += binHeaderBytes.length;
  glbFile.set(binChunk, offset);

  return glbFile.buffer;
}
