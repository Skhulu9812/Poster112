
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
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: width,
          height: height,
          displayValue: displayValue,
          margin: 0,
          background: "transparent"
        });
      } catch (e) {
        console.error("Barcode generation failed", e);
      }
    }
  }, [value, width, height, displayValue]);

  return <svg ref={svgRef}></svg>;
};
