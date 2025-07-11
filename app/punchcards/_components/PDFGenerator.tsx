// app/punchcards/_components/PDFGenerator.tsx
"use client";

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

interface PunchCard {
  front: string;
  back: string;
  cardNumber: number;
  batchNumber: string;
}

interface PDFGeneratorProps {
  cards: PunchCard[];
  batchName: string;
  batchId: string;
}

interface GenerationProgress {
  stage: string;
  progress: number;
  total: number;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ cards, batchName, batchId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);

  // A4 dimensions at 300 DPI
  const A4_WIDTH = 2480;
  const A4_HEIGHT = 3508;
  
  // Card dimensions (scaled for A4)
  const CARD_WIDTH = 1088;
  const CARD_HEIGHT = 638;
  
  // Layout settings
  const CARDS_PER_SHEET = 8;
  const COLS = 2;
  const ROWS = 4;
  
  // Calculate spacing for A4 layout
  const MARGIN_X = (A4_WIDTH - (COLS * CARD_WIDTH)) / (COLS + 1);
  const MARGIN_Y = (A4_HEIGHT - (ROWS * CARD_HEIGHT)) / (ROWS + 1);

  // Auto-generate PDF when cards are ready
  useEffect(() => {
    if (cards.length > 0 && !isGenerating) {
      generateOptimizedPDF();
    }
  }, [cards]);

  const generateIndividualCard = async (card: PunchCard, isBackSide: boolean = false): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = CARD_WIDTH;
      canvas.height = CARD_HEIGHT;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

      if (isBackSide) {
        // Generate back side with dartboard logo watermark
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        
        logoImg.onload = () => {
          // Draw dartboard logo as watermark (centered, low opacity)
          ctx.globalAlpha = 0.15;
          const logoSize = Math.min(CARD_WIDTH, CARD_HEIGHT) * 0.6;
          const logoX = (CARD_WIDTH - logoSize) / 2;
          const logoY = (CARD_HEIGHT - logoSize) / 2;
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          
          // Reset opacity for text
          ctx.globalAlpha = 1.0;
          
          // Add batch number (bottom-right)
          ctx.fillStyle = '#333333';
          ctx.font = 'bold 36px Arial';
          ctx.textAlign = 'right';
          ctx.fillText(card.batchNumber, CARD_WIDTH - 40, CARD_HEIGHT - 40);
          
          // Add date (bottom-left)
          ctx.textAlign = 'left';
          ctx.font = '24px Arial';
          ctx.fillText(new Date().toLocaleDateString(), 40, CARD_HEIGHT - 40);
          
          resolve(canvas.toDataURL('image/png'));
        };

        logoImg.onerror = () => {
          // Fallback without logo
          ctx.fillStyle = '#333333';
          ctx.font = 'bold 36px Arial';
          ctx.textAlign = 'right';
          ctx.fillText(card.batchNumber, CARD_WIDTH - 40, CARD_HEIGHT - 40);
          
          ctx.textAlign = 'left';
          ctx.font = '24px Arial';
          ctx.fillText(new Date().toLocaleDateString(), 40, CARD_HEIGHT - 40);
          
          resolve(canvas.toDataURL('image/png'));
        };

        logoImg.src = '/images/home/dartboard.png';
      } else {
        // Generate front side with template + card number
        const templateImg = new Image();
        templateImg.crossOrigin = 'anonymous';
        
        templateImg.onload = () => {
          // Draw template image
          ctx.drawImage(templateImg, 0, 0, CARD_WIDTH, CARD_HEIGHT);
          
          // Add card number (top-left)
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(`#${card.cardNumber.toString().padStart(3, '0')}`, 40, 80);
          
          resolve(canvas.toDataURL('image/png'));
        };

        templateImg.onerror = () => {
          // Fallback template
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
          ctx.fillStyle = '#666666';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Template', CARD_WIDTH/2, CARD_HEIGHT/2);
          
          // Add card number
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(`#${card.cardNumber.toString().padStart(3, '0')}`, 40, 80);
          
          resolve(canvas.toDataURL('image/png'));
        };

        templateImg.src = card.front;
      }
    });
  };

  const generateCardSheet = async (cardBatch: PunchCard[], isBackSide: boolean = false): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = A4_WIDTH;
      canvas.height = A4_HEIGHT;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);

      try {
        // Generate individual cards first
        const cardImages: string[] = [];
        for (const card of cardBatch) {
          if (card) {
            const cardImage = await generateIndividualCard(card, isBackSide);
            cardImages.push(cardImage);
          } else {
            cardImages.push('');
          }
        }

        // Draw cards on sheet
        let loadedCards = 0;
        const totalCards = cardImages.filter(img => img !== '').length;

        if (totalCards === 0) {
          resolve(canvas.toDataURL('image/png'));
          return;
        }

        cardImages.forEach((cardImage, index) => {
          if (!cardImage) {
            loadedCards++;
            if (loadedCards === totalCards) {
              resolve(canvas.toDataURL('image/png'));
            }
            return;
          }

          const row = Math.floor(index / COLS);
          const col = index % COLS;
          
          // Calculate position (mirror for back side)
          const x = isBackSide 
            ? A4_WIDTH - MARGIN_X - ((col + 1) * CARD_WIDTH) - (col * MARGIN_X)
            : MARGIN_X + (col * (CARD_WIDTH + MARGIN_X));
          const y = MARGIN_Y + (row * (CARD_HEIGHT + MARGIN_Y));

          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, x, y, CARD_WIDTH, CARD_HEIGHT);
            
            // Draw cut lines
            ctx.strokeStyle = '#cccccc';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;
            
            // Vertical cut lines
            if (col < COLS - 1) {
              const cutX = x + CARD_WIDTH + (MARGIN_X / 2);
              ctx.beginPath();
              ctx.moveTo(cutX, y - 20);
              ctx.lineTo(cutX, y + CARD_HEIGHT + 20);
              ctx.stroke();
            }
            
            // Horizontal cut lines
            if (row < ROWS - 1) {
              const cutY = y + CARD_HEIGHT + (MARGIN_Y / 2);
              ctx.beginPath();
              ctx.moveTo(x - 20, cutY);
              ctx.lineTo(x + CARD_WIDTH + 20, cutY);
              ctx.stroke();
            }
            
            loadedCards++;
            if (loadedCards === totalCards) {
              // Add sheet info
              ctx.setLineDash([]);
              ctx.fillStyle = '#666666';
              ctx.font = '24px Arial';
              ctx.textAlign = 'right';
              ctx.fillText(
                `${isBackSide ? 'Back' : 'Front'} - ${batchName || 'Punch Cards'}`,
                A4_WIDTH - 40,
                A4_HEIGHT - 40
              );
              
              resolve(canvas.toDataURL('image/png'));
            }
          };

          img.src = cardImage;
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  const generateOptimizedPDF = async () => {
    try {
      setIsGenerating(true);
      setProgress({ stage: 'Initializing...', progress: 0, total: cards.length * 2 });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [A4_WIDTH, A4_HEIGHT]
      });

      const sheetsNeeded = Math.ceil(cards.length / CARDS_PER_SHEET);
      let pageAdded = false;

      for (let sheetIndex = 0; sheetIndex < sheetsNeeded; sheetIndex++) {
        const startCard = sheetIndex * CARDS_PER_SHEET;
        const endCard = Math.min(startCard + CARDS_PER_SHEET, cards.length);
        
        // Get cards for this sheet (pad with null if needed)
        const sheetCards = Array.from({ length: CARDS_PER_SHEET }, (_, i) => {
          const cardIndex = startCard + i;
          return cardIndex < cards.length ? cards[cardIndex] : null;
        });

        setProgress({
          stage: `Generating sheet ${sheetIndex + 1} front side...`,
          progress: sheetIndex * 2,
          total: sheetsNeeded * 2
        });

        // Generate front side
        const frontSide = await generateCardSheet(sheetCards, false);
        
        if (pageAdded) pdf.addPage();
        pdf.addImage(frontSide, 'PNG', 0, 0, A4_WIDTH, A4_HEIGHT);
        pageAdded = true;

        setProgress({
          stage: `Generating sheet ${sheetIndex + 1} back side...`,
          progress: sheetIndex * 2 + 1,
          total: sheetsNeeded * 2
        });

        // Generate back side (mirrored)
        const backSide = await generateCardSheet(sheetCards, true);
        
        pdf.addPage();
        pdf.addImage(backSide, 'PNG', 0, 0, A4_WIDTH, A4_HEIGHT);
      }

      setProgress({
        stage: 'Downloading PDF...',
        progress: sheetsNeeded * 2,
        total: sheetsNeeded * 2
      });

      // Auto-download the PDF
      const fileName = `${batchName || 'PunchCards'}_${batchId}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      {progress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              {progress.stage}
            </span>
            <span className="text-sm text-blue-700">
              {progress.progress}/{progress.total}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(progress.progress / progress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Generation Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-3">✅ Production Pipeline Active</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-green-800">Cards Generated</div>
            <ul className="text-green-700 space-y-1">
              <li>• {cards.length} individual cards</li>
              <li>• Batch ID: {batchId}</li>
              <li>• Dartboard watermark applied</li>
              <li>• Sequential numbering</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-green-800">PDF Layout</div>
            <ul className="text-green-700 space-y-1">
              <li>• A4 optimized sheets</li>
              <li>• Duplex print ready</li>
              <li>• Cut guides included</li>
              <li>• Auto-download enabled</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Manual Controls */}
      <div className="flex space-x-4">
        <button
          onClick={generateOptimizedPDF}
          disabled={isGenerating || cards.length === 0}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            !isGenerating && cards.length > 0
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isGenerating ? 'Generating PDF...' : 'Regenerate PDF'}
        </button>
      </div>

      {/* Print Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">📋 Print Instructions</h4>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
          <li>Load A4 paper in your printer</li>
          <li>Print at 100% scale (no scaling)</li>
          <li>Use duplex printing for front/back alignment</li>
          <li>Pages alternate: Front1, Back1, Front2, Back2...</li>
          <li>Cut along dotted lines with sharp blade</li>
        </ol>
      </div>
    </div>
  );
};

export default PDFGenerator;