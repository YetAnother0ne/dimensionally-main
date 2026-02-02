import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

export type OutputFormat = "PNG" | "JPG" | "WEBP";

interface RenderOptions {
  width?: number;
  height?: number;
  format?: OutputFormat;
  quality?: number;
  backgroundColor?: string;
}

const defaultOptions: Required<RenderOptions> = {
  width: 1024,
  height: 1024,
  format: "PNG",
  quality: 0.92,
  backgroundColor: "#1a1a2e",
};

/**
 * Load a 3D model file and return the Three.js object
 */
async function loadModel(file: File): Promise<THREE.Object3D> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const url = URL.createObjectURL(file);

  try {
    switch (extension) {
      case "gltf":
      case "glb": {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(url);
        return gltf.scene;
      }
      case "fbx": {
        const loader = new FBXLoader();
        const fbx = await loader.loadAsync(url);
        return fbx;
      }
      case "obj": {
        const loader = new OBJLoader();
        const obj = await loader.loadAsync(url);
        return obj;
      }
      default:
        throw new Error(`Unsupported format: ${extension}`);
    }
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Center and scale a model to fit in the camera view
 */
function normalizeModel(model: THREE.Object3D): void {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  // Center the model
  model.position.sub(center);

  // Scale to fit in a 2x2x2 box
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) {
    const scale = 2 / maxDim;
    model.scale.multiplyScalar(scale);
  }
}

/**
 * Set up lighting for the scene
 */
function setupLighting(scene: THREE.Scene): void {
  // Ambient light for overall illumination
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  // Main directional light
  const mainLight = new THREE.DirectionalLight(0xffffff, 1);
  mainLight.position.set(5, 10, 7.5);
  mainLight.castShadow = true;
  scene.add(mainLight);

  // Fill light from the opposite side
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);

  // Rim light from behind
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
  rimLight.position.set(0, 5, -10);
  scene.add(rimLight);
}

/**
 * Render a 3D model file to a 2D image
 */
export async function render3DTo2D(
  file: File,
  options: RenderOptions = {}
): Promise<Blob> {
  const opts = { ...defaultOptions, ...options };

  // Create an offscreen renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(opts.width, opts.height);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Create scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opts.backgroundColor);

  // Create camera
  const camera = new THREE.PerspectiveCamera(45, opts.width / opts.height, 0.1, 1000);
  camera.position.set(3, 2, 3);
  camera.lookAt(0, 0, 0);

  // Setup lighting
  setupLighting(scene);

  // Load and add model
  const model = await loadModel(file);
  normalizeModel(model);
  scene.add(model);

  // Render
  renderer.render(scene, camera);

  // Get the canvas and convert to blob
  const canvas = renderer.domElement;
  const mimeType = getMimeType(opts.format);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        // Cleanup
        renderer.dispose();
        scene.clear();

        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create image blob"));
        }
      },
      mimeType,
      opts.format === "PNG" ? undefined : opts.quality
    );
  });
}

/**
 * Render multiple views of a 3D model (front, side, top, isometric)
 */
export async function renderMultipleViews(
  file: File,
  options: RenderOptions = {}
): Promise<Blob[]> {
  const cameraPositions = [
    { pos: new THREE.Vector3(0, 0, 4), name: "front" },
    { pos: new THREE.Vector3(4, 0, 0), name: "side" },
    { pos: new THREE.Vector3(0, 4, 0), name: "top" },
    { pos: new THREE.Vector3(3, 2, 3), name: "isometric" },
  ];

  const blobs: Blob[] = [];

  for (const { pos } of cameraPositions) {
    const blob = await render3DTo2DWithCamera(file, pos, options);
    blobs.push(blob);
  }

  return blobs;
}

/**
 * Render a model into a sprite sheet (grid of views)
 * - `angleCount` number of views around the model (e.g. 8,16,32)
 * - `resolution` size of each cell in pixels
 */
export async function render3DToSpriteSheet(
  file: File,
  options: {
    angleCount?: number;
    resolution?: number;
    backgroundColor?: string;
    onProgress?: (p: number) => void;
  } = {}
): Promise<Blob> {
  const angleCount = options.angleCount ?? 16;
  const cellSize = options.resolution ?? 256;
  const bg = options.backgroundColor ?? defaultOptions.backgroundColor;

  const gridCols = Math.ceil(Math.sqrt(angleCount));
  const gridRows = Math.ceil(angleCount / gridCols);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(cellSize, cellSize);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(bg);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(3, 2, 3);
  camera.lookAt(0, 0, 0);

  setupLighting(scene);

  const model = await loadModel(file);
  normalizeModel(model);
  scene.add(model);

  const totalWidth = gridCols * cellSize;
  const totalHeight = gridRows * cellSize;
  const sheet = document.createElement('canvas');
  sheet.width = totalWidth;
  sheet.height = totalHeight;
  const ctx = sheet.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context');

  for (let i = 0; i < angleCount; i++) {
    const angle = (i / angleCount) * Math.PI * 2;
    const radius = 3;
    camera.position.set(Math.cos(angle) * radius, 1.5, Math.sin(angle) * radius);
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);

    const col = i % gridCols;
    const row = Math.floor(i / gridCols);
    const dx = col * cellSize;
    const dy = row * cellSize;
    ctx.drawImage(renderer.domElement, dx, dy, cellSize, cellSize);

    options.onProgress?.(Math.round(((i + 1) / angleCount) * 100));
  }

  renderer.dispose();
  scene.clear();

  return new Promise<Blob>((resolve) => {
    sheet.toBlob((blob) => resolve(blob ?? new Blob()), 'image/png');
  });
}

async function render3DTo2DWithCamera(
  file: File,
  cameraPosition: THREE.Vector3,
  options: RenderOptions = {}
): Promise<Blob> {
  const opts = { ...defaultOptions, ...options };

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(opts.width, opts.height);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opts.backgroundColor);

  const camera = new THREE.PerspectiveCamera(45, opts.width / opts.height, 0.1, 1000);
  camera.position.copy(cameraPosition);
  camera.lookAt(0, 0, 0);

  setupLighting(scene);

  const model = await loadModel(file);
  normalizeModel(model);
  scene.add(model);

  renderer.render(scene, camera);

  const canvas = renderer.domElement;
  const mimeType = getMimeType(opts.format);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        renderer.dispose();
        scene.clear();
        if (blob) resolve(blob);
        else reject(new Error("Failed to create image blob"));
      },
      mimeType,
      opts.format === "PNG" ? undefined : opts.quality
    );
  });
}

function getMimeType(format: OutputFormat): string {
  switch (format) {
    case "PNG":
      return "image/png";
    case "JPG":
      return "image/jpeg";
    case "WEBP":
      return "image/webp";
    default:
      return "image/png";
  }
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get supported input formats for 3D→2D conversion
 */
export function getSupportedFormats(): string[] {
  return ["fbx", "obj", "gltf", "glb"];
}
