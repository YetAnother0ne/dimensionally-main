import { Suspense, useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, useFBX } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { Loader2, RotateCcw, ZoomIn, ZoomOut, Move } from "lucide-react";

interface ModelPreviewProps {
  file: File | null;
  className?: string;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#8b5cf6" wireframe />
    </mesh>
  );
}

interface ModelLoaderProps {
  url: string;
  fileType: string;
}

function GltfModel({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const cloned = gltf.scene.clone();
  // Center and scale the model
  const box = new THREE.Box3().setFromObject(cloned);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  cloned.position.sub(center);
  if (maxDim > 0) {
    cloned.scale.multiplyScalar(2 / maxDim);
  }

  return <primitive object={cloned} />;
}

function FbxModel({ url }: { url: string }) {
  const fbx = useFBX(url);
  const cloned = fbx.clone();

  // Center and scale
  const box = new THREE.Box3().setFromObject(cloned);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  cloned.position.sub(center);
  if (maxDim > 0) {
    cloned.scale.multiplyScalar(2 / maxDim);
  }

  return <primitive object={cloned} />;
}

function ObjModel({ objModel }: { objModel: THREE.Group | null }) {
  if (!objModel) return null;
  return <primitive object={objModel} />;
}

function ModelLoader({ url, fileType }: ModelLoaderProps) {
  const [objModel, setObjModel] = useState<THREE.Group | null>(null);

  useEffect(() => {
    if (fileType === "obj") {
      const loader = new OBJLoader();
      loader.load(url, (obj) => {
        // Center and scale the model
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        obj.position.sub(center);
        if (maxDim > 0) {
          obj.scale.multiplyScalar(2 / maxDim);
        }

        // Add default material if none exists
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh && !child.material) {
            child.material = new THREE.MeshStandardMaterial({ color: "#8b5cf6" });
          }
        });

        setObjModel(obj);
      });
    } else {
      setObjModel(null);
    }
  }, [url, fileType]);

  if (fileType === "gltf" || fileType === "glb") {
    return <GltfModel url={url} />;
  }

  if (fileType === "fbx") {
    return <FbxModel url={url} />;
  }

  if (fileType === "obj") {
    return <ObjModel objModel={objModel} />;
  }

  return <LoadingFallback />;
} 

export function ModelPreview({ file, className = "" }: ModelPreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      setFileType("");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const supportedFormats = ["gltf", "glb", "fbx", "obj"];
    
    if (!supportedFormats.includes(extension)) {
      setError(`Format .${extension} preview not supported`);
      return;
    }

    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setFileType(extension);
    setError(null);
    setIsLoading(true);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!file) {
    return (
      <div className={`flex items-center justify-center bg-secondary/30 rounded-xl ${className}`}>
        <p className="text-muted-foreground text-sm">No model loaded</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-secondary/30 rounded-xl ${className}`}>
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative bg-secondary/30 rounded-xl overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Controls hint */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 text-xs text-muted-foreground bg-background/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
        <Move className="w-3 h-3" />
        <span>Drag to rotate</span>
        <span className="mx-1">•</span>
        <ZoomIn className="w-3 h-3" />
        <span>Scroll to zoom</span>
      </div>
      
      <Canvas
        camera={{ position: [3, 2, 3], fov: 45 }}
        onCreated={() => setIsLoading(false)}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Stage environment="city" intensity={0.5}>
            {objectUrl && <ModelLoader url={objectUrl} fileType={fileType} />}
          </Stage>
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
