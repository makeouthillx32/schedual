// app/punchcards/_components/CardPreview.tsx
"use client";

import React from 'react';
import Image from 'next/image';

interface CardPreviewProps {
  templatePath: string;
  cardCount: number;
}

const CardPreview: React.FC<CardPreviewProps> = ({ templatePath, cardCount }) => {
  // Calculate layout based on card count
  const getLayout = (count: number) => {
    if (count <= 4) return { cols: 2, rows: 2, cardsPerSheet: 4 };
    if (count <= 6) return { cols: 2, rows: 3, cardsPerSheet: 6 };
    return { cols: 2, rows: 4, cardsPerSheet: 8 };
  };

  const layout = getLayout(cardCount);
  const sheetsNeeded = Math.ceil(cardCount / layout.cardsPerSheet);
  
  // Generate card numbers for preview
  const generateCardNumbers = (sheetIndex: number) => {
    const startCard = sheetIndex * layout.cardsPerSheet + 1;
    const endCard = Math.min(startCard + layout.cardsPerSheet - 1, cardCount);
    return Array.from({ length: layout.cardsPerSheet }, (_, i) => {
      const cardNumber = startCard + i;
      return cardNumber <= endCard ? cardNumber : null;
    });
  };

  return (
    <div className="space-y-6">
      {/* Preview Info */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-900">A4 Layout Preview</h3>
          <p className="text-sm text-gray-500">
            {layout.cols}×{layout.rows} layout • {cardCount} total cards • {sheetsNeeded} sheet{sheetsNeeded > 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>Card size: 92×54mm</div>
          <div>Paper: A4 (210×297mm)</div>
        </div>
      </div>

      {/* Sheet Previews */}
      <div className="space-y-8">
        {Array.from({ length: sheetsNeeded }, (_, sheetIndex) => {
          const cardNumbers = generateCardNumbers(sheetIndex);
          
          return (
            <div key={sheetIndex} className="space-y-4">
              <h4 className="font-medium text-gray-700">
                Sheet {sheetIndex + 1} {sheetsNeeded > 1 && `of ${sheetsNeeded}`}
              </h4>
              
              {/* A4 Sheet Container */}
              <div className="relative bg-white border-2 border-gray-300 rounded-lg shadow-sm mx-auto"
                   style={{ 
                     width: '300px', 
                     height: '424px', // A4 ratio scaled down
                     padding: '20px' 
                   }}>
                
                {/* Cut line guides */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Vertical center line */}
                  <div className="absolute left-1/2 top-5 bottom-5 w-px border-l border-dashed border-gray-300 transform -translate-x-px"></div>
                  
                  {/* Horizontal lines */}
                  {Array.from({ length: layout.rows - 1 }, (_, i) => (
                    <div 
                      key={i}
                      className="absolute left-5 right-5 border-t border-dashed border-gray-300"
                      style={{ top: `${((i + 1) / layout.rows) * 100}%` }}
                    ></div>
                  ))}
                </div>

                {/* Cards Grid */}
                <div 
                  className="grid gap-2 h-full"
                  style={{ 
                    gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${layout.rows}, 1fr)`
                  }}
                >
                  {cardNumbers.map((cardNumber, index) => (
                    <div
                      key={index}
                      className={`relative border rounded-sm overflow-hidden ${
                        cardNumber ? 'bg-gray-50' : 'bg-transparent border-dashed border-gray-200'
                      }`}
                    >
                      {cardNumber && (
                        <>
                          {/* Card preview */}
                          <div className="w-full h-full relative">
                            <Image
                              src={templatePath}
                              alt={`Card ${cardNumber}`}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                // Fallback for missing images
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTAwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjIiIGZpbGw9IiM5QjEwMUMiLz4KPGNpcmNsZSBjeD0iMzAiIGN5PSIxNSIgcj0iMiIgZmlsbD0iIzlCMTAxQyIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjE1IiByPSIyIiBmaWxsPSIjOUIxMDFDIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMTUiIHI9IjIiIGZpbGw9IiM5QjEwMUMiLz4KPHN2Zz4K';
                              }}
                            />
                          </div>
                          
                          {/* Card number overlay */}
                          <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                            #{cardNumber}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Sheet label */}
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  Sheet {sheetIndex + 1}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Layout Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Layout Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-700">Front Side</div>
            <ul className="text-gray-600 space-y-1">
              <li>• Card design</li>
              <li>• Card number (top-left)</li>
              <li>• Cut guides</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-gray-700">Back Side</div>
            <ul className="text-gray-600 space-y-1">
              <li>• Mirrored layout</li>
              <li>• Batch code</li>
              <li>• Print date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPreview;