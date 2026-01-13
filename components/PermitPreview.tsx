
import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Permit } from '../types';
import { Barcode } from './Barcode';

interface PermitPreviewProps {
  permit: Permit;
  onBack: () => void;
}

export const PermitPreview: React.FC<PermitPreviewProps> = ({ permit, onBack }) => {
  const permitRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSavePdf = async () => {
    if (!permitRef.current) return;
    
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(permitRef.current, {
        scale: 4, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('permit-container');
          if (el) el.style.display = 'flex';
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 100;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgWidth) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgWidth);
      pdf.save(`Taxi_Permit_${permit.regNo.replace(/\s/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try printing to PDF instead.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="no-print w-full max-w-lg flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleSavePdf}
            disabled={isGenerating}
            className={`px-4 py-2 border border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isGenerating ? (
              <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            Save PDF
          </button>
          <button 
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-center w-full max-w-2xl print:shadow-none print:border-none print:p-0">
        <div 
          ref={permitRef}
          id="permit-container"
          className="relative w-[420px] h-[420px] rounded-full border-[2px] border-black flex flex-col items-center p-6 bg-white overflow-hidden print:m-0 select-none"
        >
          {/* Watermark */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center p-20">
            <img src="https://flagcdn.com/w320/za.png" alt="emblem" className="w-full h-full object-contain grayscale" />
          </div>

          {/* Top Section - Enlarged text */}
          <div className="relative mt-8 w-full px-6 flex flex-col items-center">
            <h2 className="text-[11px] font-black tracking-[0.2em] text-[#0f172a] uppercase mb-1">Safety and Security</h2>
            <h3 className="text-[15px] font-black text-[#0f172a] uppercase tracking-tight">Rank Permit {permit.year}</h3>
          </div>

          {/* Association */}
          <div className="relative mt-4 flex flex-col items-center">
            <h1 className="text-[18px] font-black text-[#0f172a] uppercase leading-none">{permit.association}</h1>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Association Permit</p>
          </div>

          {/* Reg No Section */}
          <div className="relative w-full px-4 mt-6 flex flex-col items-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tight mb-0.5">Reg. No:</span>
            <div className="flex justify-center items-center">
               <span className="text-[36px] font-black text-black leading-none tracking-tighter">{permit.regNo}</span>
            </div>
          </div>

          {/* Make Section */}
          <div className="relative w-full px-8 mt-4 flex justify-center items-baseline gap-2">
            <span className="text-[9px] font-black text-slate-700 uppercase">Make:</span>
            <span className="text-[14px] font-black text-[#0f172a] uppercase">{permit.make}</span>
          </div>

          {/* Date Section */}
          <div className="relative w-full px-10 mt-6 flex justify-between items-start">
            <div className="flex flex-col items-start">
              <span className="text-[8px] font-black text-slate-500 uppercase leading-none">Issued Date</span>
              <span className="text-[11px] font-black text-[#0f172a] mt-0.5 uppercase">{permit.dateIssued}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-slate-500 uppercase leading-none">Expiry Date</span>
              <span className="text-[11px] font-black text-red-600 mt-0.5 uppercase">{permit.expiryDate}</span>
            </div>
          </div>

          {/* Barcode Section */}
          <div className="relative mt-6 mb-8 w-full flex justify-center items-center">
            <div className="w-full max-w-[300px] flex items-center justify-center">
               <Barcode 
                 value={permit.regNo.replace(/\s/g, '')} 
                 width={2.0} 
                 height={55}
                 displayValue={false}
               />
            </div>
          </div>

          <div className="absolute inset-[3px] rounded-full border-[0.5px] border-dashed border-gray-300 pointer-events-none opacity-40"></div>
        </div>
      </div>
      
      <p className="no-print mt-8 text-xs text-gray-400 font-medium italic max-w-sm text-center">
        Compact official rank permit design. Dimensions calibrated for standard disc holders.
      </p>
    </div>
  );
};
