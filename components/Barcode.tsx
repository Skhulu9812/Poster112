
import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
}

export const Barcode: React.FC<BarcodeProps> = ({ 
  value, 
  width = 2, 
  height = 40, 
  displayValue = false 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        // Using canvas instead of SVG significantly improves capture reliability with html2canvas
        JsBarcode(canvasRef.current, value, {
          format: "CODE128",
          width: width,
          height: height,
          displayValue: displayValue,
          margin: 10, // Added small margin for better scanning
          background: "#ffffff", // Solid white background ensures visibility on any disc tint
          lineColor: "#000000"
        });
      } catch (e) {
        console.error("Barcode generation failed:", e);
      }
    }
  }, [value, width, height, displayValue]);

  return (
    <canvas 
      ref={canvasRef} 
      className="max-w-full h-auto block rounded-sm shadow-sm"
      style={{ display: 'block' }}
    />
  );
};
