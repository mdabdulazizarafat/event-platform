import React, { useState, useRef, useEffect } from 'react';
import { Modal, Slider } from 'antd';
import { ZoomIn, ZoomOut, RefreshCcw, Save } from 'lucide-react';
import Button from '@/components/ui/Button';

interface AvatarCropperProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onSave: (base64WebP: string) => void;
}

export default function AvatarCropper({ open, imageSrc, onClose, onSave }: AvatarCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [baseDim, setBaseDim] = useState({ width: 250, height: 250 });

  // Reset when a new image is loaded
  useEffect(() => {
    if (open) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [open, imageSrc]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const aspect = img.naturalWidth / img.naturalHeight;
    // Set base dimensions to perfectly cover the 250px crop mask
    let w = 250;
    let h = 250;
    if (aspect > 1) {
      w = 250 * aspect;
    } else {
      h = 250 / aspect;
    }
    setBaseDim({ width: w, height: h });
  };

  const handleZoom = (newZoom: number) => {
    setZoom(newZoom);
    const currentDisplayWidth = baseDim.width * newZoom;
    const currentDisplayHeight = baseDim.height * newZoom;
    const maxOffsetX = Math.max(0, (currentDisplayWidth - 250) / 2);
    const maxOffsetY = Math.max(0, (currentDisplayHeight - 250) / 2);
    setPosition(prev => ({
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, prev.x)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, prev.y))
    }));
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    let newX = clientX - dragStart.x;
    let newY = clientY - dragStart.y;
    
    const currentDisplayWidth = baseDim.width * zoom;
    const currentDisplayHeight = baseDim.height * zoom;
    const maxOffsetX = Math.max(0, (currentDisplayWidth - 250) / 2);
    const maxOffsetY = Math.max(0, (currentDisplayHeight - 250) / 2);
    
    newX = Math.max(-maxOffsetX, Math.min(maxOffsetX, newX));
    newY = Math.max(-maxOffsetY, Math.min(maxOffsetY, newY));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    handleZoom(Math.min(Math.max(1, zoom - e.deltaY * 0.001), 3));
  };

  const handleSave = () => {
    if (!imgRef.current || !containerRef.current) return;
    const canvas = document.createElement('canvas');
    // We want a 500x500 output
    const outputSize = 500;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // The mask is a circle in the center of the container. 
    // Container is 300x300, mask is 250x250
    const maskSize = 250;
    
    // Calculate the scale between actual image size and displayed image size
    // img.width and img.height are the intrinsic sizes
    // The image in CSS is styled such that min-width/min-height covers the container
    
    // 1. Find the base display size of the image before zoom
    const aspect = img.naturalWidth / img.naturalHeight;
    let baseDisplayWidth = containerRect.width;
    let baseDisplayHeight = containerRect.height;
    
    if (aspect > 1) {
      baseDisplayWidth = containerRect.height * aspect;
    } else {
      baseDisplayHeight = containerRect.width / aspect;
    }
    
    // 2. Find the current display size with zoom
    const currentDisplayWidth = baseDim.width * zoom;
    const currentDisplayHeight = baseDim.height * zoom;
    
    // 3. Find the offset of the image relative to the center of the container
    // When position x,y is 0,0, the image is centered.
    const imgLeftDisplay = (250 / 2) - (currentDisplayWidth / 2) + position.x;
    const imgTopDisplay = (250 / 2) - (currentDisplayHeight / 2) + position.y;
    
    // 4. We want to extract the region of the image that falls inside the 250x250 mask
    // Since the container is exactly 250x250, mask is at 0,0
    const maskLeftDisplay = 0;
    const maskTopDisplay = 0;
    
    // 5. Map these coordinates back to the original image dimensions
    const scaleX = img.naturalWidth / currentDisplayWidth;
    const scaleY = img.naturalHeight / currentDisplayHeight;
    
    const cropX = (maskLeftDisplay - imgLeftDisplay) * scaleX;
    const cropY = (maskTopDisplay - imgTopDisplay) * scaleY;
    const cropWidth = 250 * scaleX;
    const cropHeight = 250 * scaleY;

    // Draw the cropped region to our 500x500 canvas
    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight, // Source rectangle
      0, 0, outputSize, outputSize // Destination rectangle
    );
    
    // Convert to webp
    const webpBase64 = canvas.toDataURL('image/webp', 0.85);
    onSave(webpBase64);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      destroyOnHidden
      centered
      title={
        <div>
          <h3 className="font-heading font-extrabold text-lg m-0">Crop & Resize Photo</h3>
          <p className="text-xs text-on-surface-variant font-normal m-0 mt-1">Drag to reposition, scroll or use slider to zoom</p>
        </div>
      }
    >
      <div className="flex flex-col items-center mt-4">
        {/* Cropper Area */}
        <div 
          ref={containerRef}
          className="relative w-[250px] h-[250px] bg-surface-container-low rounded-full overflow-hidden cursor-move border-2 border-green-500 shadow-[0_0_15px_rgba(0,0,0,0.1)]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Image */}
          <img 
            ref={imgRef}
            src={imageSrc} 
            alt="crop source"
            draggable={false}
            onLoad={handleImageLoad}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
              width: `${baseDim.width}px`,
              height: `${baseDim.height}px`,
              maxWidth: 'none',
              transformOrigin: 'center'
            }}
          />
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-4 w-full max-w-[340px] mt-8">
          <Button variant="outline" size="sm" onClick={() => handleZoom(Math.max(1, zoom - 0.1))} className="px-2 border-outline-variant/50 text-on-surface-variant">
            <ZoomOut size={16} />
          </Button>
          <Slider 
            min={1} 
            max={3} 
            step={0.01} 
            value={zoom} 
            onChange={handleZoom} 
            className="flex-1 m-0"
            tooltip={{ formatter: val => `${val?.toFixed(1)}x` }}
          />
          <Button variant="outline" size="sm" onClick={() => handleZoom(Math.min(3, zoom + 0.1))} className="px-2 border-outline-variant/50 text-on-surface-variant">
            <ZoomIn size={16} />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between w-full mt-8 pt-4 border-t border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-low border border-outline-variant flex items-center justify-center overflow-hidden">
              <img 
                src={imageSrc} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `scale(${zoom})`,
                }}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground m-0 leading-tight">Preview</p>
              <p className="text-[10px] text-on-surface-variant m-0">Auto-converted to WebP</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => { setZoom(1); setPosition({x:0,y:0}) }} icon={<RefreshCcw size={14} />} className="text-on-surface">
              Reset
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} icon={<Save size={14} />} className="shadow-md bg-green-500 hover:bg-green-600 border-none">
              Save Photo
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
