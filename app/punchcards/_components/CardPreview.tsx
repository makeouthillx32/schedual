// app/punchcards/_components/PDFGenerator.tsx
"use client";

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFGeneratorProps {
  cards: string[];
  batchName: string;
}

interface GenerationProgress {
  stage: string;
  progress: number;
  total: number;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ cards, batchName }) => {
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

  const generateCardSheet = async (templatePath: string, cardNumbers: number[], isBackSide: boolean = false) => {
    return new Promise<string>((resolve, reject) => {
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

      let loadedImages = 0;
      const totalImages = cardNumbers.filter(n => n !== null).length;

      if (totalImages === 0) {
        resolve(canvas.toDataURL('image/png'));
        return;
      }

      // Load and draw each card
      cardNumbers.forEach((cardNumber, index) => {
        if (cardNumber === null) return;

        const row = Math.floor(index / COLS);
        const col = index % COLS;
        
        // Calculate position (mirror for back side)
        const x = isBackSide 
          ? A4_WIDTH - MARGIN_X - ((col + 1) * CARD_WIDTH) - (col * MARGIN_X)
          : MARGIN_X + (col * (CARD_WIDTH + MARGIN_X));
        const y = MARGIN_Y + (row * (CARD_HEIGHT + MARGIN_Y));

        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          // Draw card image
          ctx.drawImage(img, x, y, CARD_WIDTH, CARD_HEIGHT);
          
          // Add card number
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 24px Arial';
          ctx.fillText(`#${cardNumber}`, x + 20, y + 40);
          
          // Add batch info for back side
          if (isBackSide) {
            ctx.font = '18px Arial';
            ctx.fillText(batchName || 'Punch Cards', x + 20, y + CARD_HEIGHT - 40);
            ctx.fillText(new Date().toLocaleDateString(), x + 20, y + CARD_HEIGHT - 20);
          }
          
          // Draw cut lines
          ctx.strokeStyle = '#cccccc';
          ctx.setLineDash([5, 5]);
          ctx.lineWidth = 1;
          
          // Vertical cut lines
          if (col < COLS - 1) {
            const cutX = x + CARD_WIDTH + (MARGIN_X / 2);
            ctx.beginPath();
            ctx.moveTo(cutX, y - 10);
            ctx.lineTo(cutX, y + CARD_HEIGHT + 10);
            ctx.stroke();
          }
          
          // Horizontal cut lines
          if (row < ROWS - 1) {
            const cutY = y + CARD_HEIGHT + (MARGIN_Y / 2);
            ctx.beginPath();
            ctx.moveTo(x - 10, cutY);
            ctx.lineTo(x + CARD_WIDTH + 10, cutY);
            ctx.stroke();
          }
          
          loadedImages++;
          if (loadedImages === totalImages) {
            resolve(canvas.toDataURL('image/png'));
          }
        };

        img.onerror = () => {
          // Fallback for missing images
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(x, y, CARD_WIDTH, CARD_HEIGHT);
          ctx.fillStyle = '#666666';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Template', x + CARD_WIDTH/2, y + CARD_HEIGHT/2);
          ctx.textAlign = 'left';
          
          loadedImages++;
          if (loadedImages === totalImages) {
            resolve(canvas.toDataURL('image/png'));
          }
        };

        img.src = templatePath; // Now using full URL instead of /images/ path
      });
    });
  };

  const generatePDF = async (templatePath: string, totalCards: number) => {
    try {
      setIsGenerating(true);
      setProgress({ stage: 'Preparing...', progress: 0, total: totalCards });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [A4_WIDTH, A4_HEIGHT]
      });

      const sheetsNeeded = Math.ceil(totalCards / CARDS_PER_SHEET);
      
      for (let sheetIndex = 0; sheetIndex < sheetsNeeded; sheetIndex++) {
        const startCard = sheetIndex * CARDS_PER_SHEET + 1;
        const endCard = Math.min(startCard + CARDS_PER_SHEET - 1, totalCards);
        
        // Generate card numbers for this sheet
        const cardNumbers = Array.from({ length: CARDS_PER_SHEET }, (_, i) => {
          const cardNumber = startCard + i;
          return cardNumber <= endCard ? cardNumber : null;
        });

        setProgress({
          stage: `Generating sheet ${sheetIndex + 1} front side...`,
          progress: sheetIndex * 2,
          total: sheetsNeeded * 2
        });

        // Generate front side
        const frontSide = await generateCardSheet(templatePath, cardNumbers, false);
        
        if (sheetIndex > 0) pdf.addPage();
        pdf.addImage(frontSide, 'PNG', 0, 0, A4_WIDTH, A4_HEIGHT);

        setProgress({
          stage: `Generating sheet ${sheetIndex + 1} back side...`,
          progress: sheetIndex * 2 + 1,
          total: sheetsNeeded * 2
        });

        // Generate back side (mirrored)
        const backSide = await generateCardSheet(templatePath, cardNumbers, true);
        
        pdf.addPage();
        pdf.addImage(backSide, 'PNG', 0, 0, A4_WIDTH, A4_HEIGHT);
      }

      setProgress({
        stage: 'Saving PDF...',
        progress: sheetsNeeded * 2,
        total: sheetsNeeded * 2
      });

      // Save the PDF
      const fileName = `${batchName || 'PunchCards'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  // Mock data for testing with actual Supabase URLs
  const mockGenerate = () => {
    generatePDF('https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/punchcards/Pc1.png', 10);
  };

  return (
    <div className="space-y-4">
      {/* Generation Controls */}
      <div className="flex space-x-4">
        <button
          onClick={mockGenerate}
          disabled={isGenerating}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            !isGenerating
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isGenerating ? 'Generating PDF...' : 'Download PDF'}
        </button>
        
        <button
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={() => alert('Excel tracking sheet feature coming soon!')}
        >
          📊 Excel Sheet
        </button>
      </div>

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
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.progress / progress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* PDF Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">PDF Output Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-700">Format</div>
            <ul className="text-gray-600 space-y-1">
              <li>• A4 paper size</li>
              <li>• 300 DPI quality</li>
              <li>• Front and back pages</li>
              <li>• Cut guides included</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-gray-700">Features</div>
            <ul className="text-gray-600 space-y-1">
              <li>• Card numbering</li>
              <li>• Batch information</li>
              <li>• Print date stamp</li>
              <li>• Proper alignment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Print Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">📋 Print Instructions</h4>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
          <li>Load A4 paper in your printer</li>
          <li>Print at 100% scale (no scaling)</li>
          <li>Use duplex printing for front/back alignment</li>
          <li>Let sheets dry before cutting</li>
          <li>Cut along dotted lines with sharp blade</li>
        </ol>
      </div>

      {/* Test Controls (remove in production) */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-600 mb-2">Test Controls</h4>
        <div className="flex space-x-2">
          <button
            onClick={() => generatePDF('https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/punchcards/Pc1.png', 4)}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Test 4 Cards
          </button>
          <button
            onClick={() => generatePDF('https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/punchcards/Pc2.png', 8)}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Test 8 Cards
          </button>
          <button
            onClick={() => generatePDF('https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/punchcards/Pc3.png', 20)}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Test 20 Cards
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;