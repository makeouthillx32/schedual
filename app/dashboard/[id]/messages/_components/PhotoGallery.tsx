'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';

interface PhotoGalleryProps {
  messages: {
    id: number;
    image: string | null;
  }[];
}

export default function PhotoGallery({ messages }: PhotoGalleryProps) {
  const [showPhotos, setShowPhotos] = useState(true);

  const imageMessages = messages.filter((msg) => msg.image);

  return (
    <div className="p-4">
      <div
        className="flex justify-between items-center mb-2 cursor-pointer"
        onClick={() => setShowPhotos(!showPhotos)}
      >
        <h3 className="font-medium">Photos</h3>
        <ChevronDown
          className={`transform ${showPhotos ? '' : '-rotate-90'} transition-transform`}
          size={18}
        />
      </div>

      {showPhotos && (
        <div className="grid grid-cols-3 gap-1">
          {imageMessages.map((msg) => (
            <div
              key={msg.id}
              className="aspect-square rounded overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <Image
                src={msg.image || ''}
                alt="Shared photo"
                width={80}
                height={80}
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
