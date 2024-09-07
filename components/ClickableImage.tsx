'use client';

import React, { useState, MouseEvent, useRef, useEffect } from 'react';

// Define types for Thumbnail and Point
interface Thumbnail {
  id: number;
  src: string;
  label: string;
}

interface Point {
  x: number;
  y: number;
  selectedThumbnail: Thumbnail | null;
}

interface ClickableImageProps {
  mainImage: string;
}

const thumbnails: Thumbnail[] = [
  { id: 1, src: '/1.png', label: 'Garnet Piercing' },
  { id: 2, src: '/2.png', label: 'Feather Eyelet' },
  { id: 3, src: '/3.png', label: 'STD 01' },
  { id: 4, src: '/4.png', label: 'Lizard Hook' },
  { id: 5, src: '/5.png', label: 'Piercing Set' },
];

const ClickableImage = ({ mainImage }: ClickableImageProps) => {
  const [points, setPoints] = useState<Point[]>([]);
  const selectedPointRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Cleanup for mouse events
  useEffect(() => {
    const handleMouseUp = () => {
      selectedPointRef.current = null;
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Handle click to add a new point
 // Handle click on the image to add a new point
const handleClick = (e: MouseEvent) => {
    const rect = imgRef.current?.getBoundingClientRect(); // Get the image bounding box
    if (rect) {
      // Calculate scale based on image display size vs original size
      const scaleX = imgRef.current!.naturalWidth / rect.width;
      const scaleY = imgRef.current!.naturalHeight / rect.height;
  
      // Calculate the relative click position inside the image
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
  
      // Add the point
      setPoints([...points, { x, y, selectedThumbnail: null }]);
    }
  };
  

  // Handle thumbnail selection
  const handleThumbnailSelect = (index: number, thumbnail: Thumbnail) => {
    const updatedPoints = [...points];
    updatedPoints[index].selectedThumbnail = thumbnail;
    setPoints(updatedPoints);
  };

  // Dragging the point
  const handleMouseMove = (e: MouseEvent) => {
    if (selectedPointRef.current !== null) {
      const rect = imgRef.current?.getBoundingClientRect();
      if (rect) {
        const scaleX = imgRef.current!.naturalWidth / imgRef.current!.width;
        const scaleY = imgRef.current!.naturalHeight / imgRef.current!.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const updatedPoints = [...points];
        updatedPoints[selectedPointRef.current] = { ...updatedPoints[selectedPointRef.current], x, y };
        setPoints(updatedPoints);
      }
    }
  };

  // Preload image as a promise (helper function)
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };

  // Generate downloadable image with points and thumbnails
  const handleDownload = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imgRef.current;

    if (canvas && ctx && img) {
      try {
        const mainImg = await loadImage(mainImage);
        canvas.width = mainImg.width;
        canvas.height = mainImg.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(mainImg, 0, 0);

        for (const point of points) {
          const scaledX = point.x;
          const scaledY = point.y;

          const lineLength = 100;
          ctx.fillStyle = 'red';
          ctx.fillRect(scaledX, scaledY, lineLength, 2);

          if (point.selectedThumbnail) {
            const thumbImg = await loadImage(point.selectedThumbnail.src);
            const thumbnailX = scaledX + lineLength;
            const thumbnailY = scaledY - 25;
            ctx.drawImage(thumbImg, thumbnailX, thumbnailY, 50, 50);
          }
        }

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'image-with-thumbnails.png';
        link.click();
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }
  };

  return (
    <div className="flex flex-col">
      <div onMouseMove={handleMouseMove}>
        {/* Main Image */}
        <img
          ref={imgRef}
          src={mainImage}
          alt="Main"
          onClick={handleClick}
          style={{ width: '500px', height: 'auto', cursor: 'crosshair' }}
        />

        {/* Points and thumbnails */}
        {points.map((point, index) => (
          <div key={index}>
            {/* Red line */}
            <div
              style={{
                position: 'absolute',
                left: `${point.x / (imgRef.current!.naturalWidth / 500)}px`,
                top: `${point.y / (imgRef.current!.naturalHeight / imgRef.current!.clientHeight)}px`,
                width: '100px',
                height: '2px',
                backgroundColor: 'red',
                cursor: 'move',
              }}
              onMouseDown={(e) => selectedPointRef.current = index}
            />

            {/* Thumbnails */}
            {!point.selectedThumbnail && (
              <div
                className="absolute"
                style={{
                  left: `${(point.x / (imgRef.current!.naturalWidth / 500)) + 120}px`,
                  top: `${(point.y / (imgRef.current!.naturalHeight / imgRef.current!.clientHeight)) - 50}px`,
                }}
              >
                {thumbnails.map((thumbnail) => (
                  <img
                    key={thumbnail.id}
                    src={thumbnail.src}
                    alt={thumbnail.label}
                    className="w-12 h-12 cursor-pointer"
                    onClick={() => handleThumbnailSelect(index, thumbnail)}
                  />
                ))}
              </div>
            )}

            {/* Selected Thumbnail */}
            {point.selectedThumbnail && (
              <div
                className="absolute"
                style={{
                  left: `${(point.x / (imgRef.current!.naturalWidth / 500)) + 120}px`,
                  top: `${(point.y / (imgRef.current!.naturalHeight / imgRef.current!.clientHeight)) - 20}px`,
                }}
              >
                <img
                  src={point.selectedThumbnail.src}
                  alt={point.selectedThumbnail.label}
                  className="w-12 h-12"
                />
                <div className="text-sky-400">{point.selectedThumbnail.label}</div>
              </div>
            )}
          </div>
        ))}

        {/* Hidden canvas for download */}
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

        {/* Download button */}
        <button
          className="text-white p-2 bg-gray-500 my-3"
          onClick={handleDownload}
        >
          Download Image
        </button>
      </div>
    </div>
  );
};

export default ClickableImage;
