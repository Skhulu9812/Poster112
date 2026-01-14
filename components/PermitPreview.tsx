
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
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Standard South African Windscreen Disc diameter is 90mm
      const imgWidth = 90; 
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgWidth) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgWidth);
      pdf.save(`Permit_Disc_${permit.regNo.replace(/\s/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Barcode data (Simplified for standard scanners)
  const barcodeValue = permit.regNo.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
      <div className="no-print w-full max-w-lg flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition-all shadow-sm font-bold text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Registry
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleSavePdf}
            disabled={isGenerating}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2.5"/></svg>
            {isGenerating ? 'Scaling...' : 'Export 90mm PDF'}
          </button>
          <button 
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            PRINT PERMIT
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 flex justify-center w-full max-w-2xl print:shadow-none print:border-none print:p-0">
        <div 
          ref={permitRef}
          id="permit-container"
          className="relative w-[480px] h-[480px] rounded-full border-[8px] border-slate-900 flex flex-col items-center p-10 bg-white overflow-hidden print:m-0 select-none ring-[16px] ring-slate-100 shadow-inner"
        >
          {/* Security Background - Watermark (Umzimkhulu Municipality Logo) */}
          <div className="absolute inset-0 opacity-[0.12] pointer-events-none flex items-center justify-center p-12">
             <img 
               src="https://raw.githubusercontent.com/google/genai-toolbox/main/assets/umzimkhulu_logo.png" 
               alt="Umzimkhulu Watermark" 
               className="w-full h-auto object-contain scale-125"
               onError={(e) => {
                 // Fallback if image fails to load
                 e.currentTarget.style.display = 'none';
               }}
             />
          </div>

          {/* Header Section */}
          <div className="relative z-10 text-center mt-4">
            <p className="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">Department of Transport</p>
            <h1 className="text-[22px] font-black text-slate-900 uppercase tracking-tighter mt-1">{permit.permitTitle}</h1>
          </div>

          {/* Association Badge */}
          <div className="relative z-10 mt-5 bg-slate-900 text-white px-8 py-1.5 rounded-full shadow-lg">
            <p className="text-[15px] font-black uppercase tracking-[0.15em]">{permit.association}</p>
          </div>

          {/* Main Registration Area */}
          <div className="relative z-10 mt-8 text-center">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-1 block">Registration No.</span>
            <h2 className="text-[64px] font-[900] text-black leading-none tracking-tighter drop-shadow-sm">
              {permit.regNo}
            </h2>
          </div>

          {/* Barcode and Meta Details */}
          <div className="relative z-10 mt-6 w-full flex flex-col items-center px-10 gap-6">
             <div className="flex w-full justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vehicle Make</span>
                  <span className="text-[18px] font-black text-slate-800 uppercase italic leading-tight">{permit.make}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Validity Period</span>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{permit.dateIssued}</span>
                    <span className="text-[9px] font-black text-slate-300">UNTIL</span>
                    <span className="text-[11px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">{permit.expiryDate}</span>
                  </div>
                </div>
             </div>

             <div className="flex flex-col items-center w-full">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm w-full flex justify-center">
                   <Barcode value={barcodeValue} width={1.8} height={50} displayValue={false} />
                </div>
             </div>
          </div>

          {/* Perforation Line */}
          <div className="absolute inset-[6px] rounded-full border-[2px] border-dashed border-slate-200 pointer-events-none"></div>
        </div>
      </div>
      
      <div className="no-print mt-12 p-8 bg-slate-900 rounded-[2.5rem] max-w-lg text-center shadow-2xl border border-slate-800">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="text-base font-black text-white tracking-tight">Official Municipal Watermark</span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed font-medium">
          This permit features a high-resolution Umzimkhulu Municipality watermark. PDF export is pre-scaled to 90mm for standard windscreen fitment.
        </p>
        <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center px-4">
           <div className="text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Authority</p>
              <p className="text-xs font-bold text-white">Umzimkhulu Municipality</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Print Standard</p>
              <p className="text-xs font-bold text-blue-500">90mm Circular</p>
           </div>
        </div>
      </div>
    </div>
  );
};
