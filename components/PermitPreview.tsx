
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

      const imgWidth = 100;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgWidth) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgWidth);
      pdf.save(`Permit_${permit.regNo.replace(/\s/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const barcodeValue = `${permit.regNo.replace(/\s/g, '')}${permit.id.slice(0, 4).toUpperCase()}`;

  return (
    <div className="flex flex-col items-center">
      <div className="no-print w-full max-w-lg flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-bold text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Registry
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleSavePdf}
            disabled={isGenerating}
            className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? 'Processing...' : 'Download PDF'}
          </button>
          <button 
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Print Disc
          </button>
        </div>
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 flex justify-center w-full max-w-2xl print:shadow-none print:border-none print:p-0">
        {/* The Circular Permit Disc */}
        <div 
          ref={permitRef}
          id="permit-container"
          className="relative w-[450px] h-[450px] rounded-full border-[6px] border-slate-900 flex flex-col items-center p-8 bg-white overflow-hidden print:m-0 select-none ring-[12px] ring-slate-100"
        >
          {/* Watermark/Security Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
            <img src="https://flagcdn.com/w640/za.png" alt="ZA" className="w-[120%] h-[120%] object-cover grayscale rotate-12" />
          </div>

          {/* Top Header */}
          <div className="relative z-10 text-center mt-6">
            <p className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">Department of Transport</p>
            <h1 className="text-[20px] font-black text-slate-900 uppercase tracking-tight mt-1">{permit.permitTitle}</h1>
          </div>

          {/* Association */}
          <div className="relative z-10 mt-6 bg-slate-900 text-white px-6 py-1 rounded-full">
            <p className="text-[14px] font-black uppercase tracking-widest">{permit.association}</p>
          </div>

          {/* Registration Number - Main Focus */}
          <div className="relative z-10 mt-8 text-center">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-1">Registration No.</span>
              <h2 className="text-[54px] font-[900] text-black leading-none tracking-tighter drop-shadow-sm">
                {permit.regNo}
              </h2>
            </div>
          </div>

          {/* Vehicle Make */}
          <div className="relative z-10 mt-4 px-10 py-2 border-y border-slate-100 w-full flex justify-center items-center gap-3">
             <span className="text-[10px] font-black text-slate-400 uppercase">Make:</span>
             <span className="text-[16px] font-black text-slate-800 uppercase italic">{permit.make}</span>
          </div>

          {/* Secondary Details */}
          <div className="relative z-10 mt-6 w-full flex flex-col items-center">
            <div className="w-full flex justify-between px-12 mb-4">
              <div className="flex flex-col items-start">
                <span className="text-[8px] font-bold text-slate-400 uppercase">Issued</span>
                <span className="text-[12px] font-black text-slate-800 uppercase">{permit.dateIssued}</span>
              </div>
              
              <div className="flex flex-col items-end text-right">
                <span className="text-[8px] font-bold text-slate-400 uppercase">Expires</span>
                <span className="text-[12px] font-black text-red-600 uppercase">{permit.expiryDate}</span>
              </div>
            </div>

            {/* Barcode Integration */}
            <div className="flex flex-col items-center">
              <Barcode value={barcodeValue} width={1.8} height={40} />
              <span className="text-[7px] font-black text-slate-400 mt-1 uppercase tracking-tighter">Security Scan Barcode</span>
            </div>
          </div>

          {/* Disc Perforation Indicator */}
          <div className="absolute inset-[4px] rounded-full border-[1.5px] border-dashed border-slate-300 pointer-events-none opacity-50"></div>
          
          {/* Security Serial */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-400">
            TX-P-ID: {permit.id.toUpperCase()}-{permit.year}-ZA
          </div>
        </div>
      </div>
      
      <div className="no-print mt-10 p-6 bg-blue-50 border border-blue-100 rounded-2xl max-w-lg text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
          <span className="text-sm font-bold text-blue-900">High-Security Barcode Enabled</span>
        </div>
        <p className="text-xs text-blue-800 leading-relaxed font-medium">
          The generated permit disc now features an official security barcode. Traffic authorities can use standard scanners to verify the permit's registration details.
        </p>
      </div>
    </div>
  );
};
