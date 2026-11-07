import { useCallback, useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { X, ZoomIn, Check, RotateCcw, RotateCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete?: (croppedBlob: Blob) => void;
  onCropSave?: (croppedFile: File) => Promise<void> | void;
}

const OUTPUT_SIZE = 512;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      image.crossOrigin = 'anonymous';
    }
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not read that image'));
    image.src = src;
  });
}

function rotatedSize(width: number, height: number, rotation: number) {
  const rad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
}

async function cropToFile(imageSrc: string, pixelCrop: Area, rotation: number) {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');

  const radians = (rotation * Math.PI) / 180;
  const box = rotatedSize(image.width, image.height, rotation);
  canvas.width = Math.round(box.width);
  canvas.height = Math.round(box.height);

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const side = Math.max(1, Math.round(Math.min(pixelCrop.width, pixelCrop.height, OUTPUT_SIZE)));
  const output = document.createElement('canvas');
  output.width = side;
  output.height = side;
  const out = output.getContext('2d');
  if (!out) throw new Error('Canvas is not available');

  out.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    side,
    side
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    output.toBlob(resolve, 'image/jpeg', 0.92);
  });
  if (!blob) throw new Error('Could not create the cropped image');
  return new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
}

export function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  onCropSave,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropCompleteInternal = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
    setSaving(false);
  }, [imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const reset = () => {
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
  };

  const applyCrop = async () => {
    if (!croppedAreaPixels) {
      toast.error('Move the photo into the circle first');
      return;
    }
    setSaving(true);
    try {
      const file = await cropToFile(imageSrc, croppedAreaPixels, rotation);
      if (onCropSave) await onCropSave(file);
      else onCropComplete?.(file);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Could not crop that photo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden flex flex-col">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-white">Adjust and crop your photo</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1 rounded-lg hover:bg-white/15 text-blue-100 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative w-full h-80 bg-slate-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteInternal}
          />
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-4">
          <div className="flex items-center gap-3">
            <ZoomIn className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom"
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <button
              type="button"
              onClick={() => setRotation((value) => (value + 90) % 360)}
              className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-blue-600 shadow-sm"
              title="Rotate 90 degrees"
              aria-label="Rotate"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={reset}
              className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-blue-600 shadow-sm"
              title="Reset"
              aria-label="Reset crop"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyCrop}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 flex items-center gap-1.5 transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Apply and save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
