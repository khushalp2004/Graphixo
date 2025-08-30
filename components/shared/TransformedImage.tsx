"use client"

import { dataUrl, debounce, download, getImageSize } from '@/lib/utils'
import { CldImage, getCldImageUrl } from 'next-cloudinary'
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import React from 'react'

interface ImageData {
  publicId: string;
  width: number;
  height: number;
  title?: string;
  secureURL?: string;
  [key: string]: any;
}

interface TransformedImageProps {
  image: ImageData | null;
  type: string;
  title: string;
  transformationConfig?: Record<string, any>;
  isTransforming?: boolean;
  setIsTransforming?: (isTransforming: boolean) => void;
  hasDownload?: boolean;
}

const TransformedImage = ({ 
  image, 
  type, 
  title, 
  transformationConfig = {}, 
  isTransforming = false, 
  setIsTransforming, 
  hasDownload = true 
}: TransformedImageProps) => {
  const downloadHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (!image?.publicId) return;

    download(
      getCldImageUrl({
        width: image.width,
        height: image.height,
        src: image.publicId,
        ...transformationConfig
      }), 
      title
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-[30px] leading-[140%] text-gray-600">
          Transformed
        </h3>

        {hasDownload && (
          <button 
            className="download-btn" 
            onClick={downloadHandler}
            aria-label="Download transformed image"
          >
            <Image 
              src="/assets/icons/download.svg"
              alt="Download"
              width={24}
              height={24}
              className="pb-[6px] cursor-pointer"
            />
          </button>
        )}
      </div>

      {image?.publicId ? (
        <div className="relative">
          <CldImage 
            width={getImageSize(type, image, "width")}
            height={getImageSize(type, image, "height")}
            src={image.publicId}
            alt={title || image.title || "Transformed image"}
            sizes="(max-width: 767px) 100vw, 50vw"
            placeholder={dataUrl as PlaceholderValue}
            className="transformed-image"
            onLoad={() => setIsTransforming?.(false)}
            onError={() => {
              debounce(() => setIsTransforming?.(false), 8000)();
            console.error("Failed to load transformed image");
            }}
            {...transformationConfig}
          />

          {isTransforming && (
            <div className="transforming-loader">
              <Image 
                src="/assets/icons/spinner.svg"
                width={50}
                height={50}
                alt="Transformation in progress"
                priority
              />
              <p className="text-white/80">Please wait...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="transformed-placeholder">
          <p className="text-gray-500">Transformed image will appear here</p>
        </div>
      )}
    </div>
  );
};

export default TransformedImage;