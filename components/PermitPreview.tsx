
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

  const scale = permit.globalFontScale || 1.0;
  
  const getFontFamily = (style?: string) => {
    switch (style) {
      case 'serif': return "'Times New Roman', serif";
      case 'mono': return "'Courier New', Courier, monospace";
      case 'display': return "'Inter', sans-serif";
      default: return "'Inter', sans-serif";
    }
  };

  const getWeight = (style?: string) => {
    return style === 'display' ? '1000' : '900';
  };

  const containerStyle: React.CSSProperties = {
    fontFamily: getFontFamily(permit.permitFontStyle),
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
        borderRadius: 9999
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const discSize = 90; 
      const x = (210 - discSize) / 2;
      const y = (297 - discSize) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, discSize, discSize);
      
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.circle(x + discSize/2, y + discSize/2, discSize/2 + 0.5);

      pdf.save(`Umzimkhulu_Permit_${permit.regNo.replace(/\s/g, '_')}.pdf`);
    } catch (e) { 
      console.error(e);
      alert('Export failed'); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const barcodeValue = permit.regNo.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
      <div className="no-print w-full max-w-lg flex items-center justify-between mb-12">
        <button onClick={onBack} className="flex items-center gap-3 px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <button 
          onClick={handleSavePdf} 
          disabled={isGenerating} 
          className="px-8 py-4 bg-black text-white rounded-2xl font-[1000] text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center gap-3"
        >
          {isGenerating ? 'PROCESSING...' : 'DOWNLOAD 90MM DISC'}
        </button>
      </div>

      <div className="bg-white p-24 rounded-[5rem] shadow-2xl border border-slate-100 flex justify-center w-full max-w-4xl print:p-0 print:shadow-none print:border-none">
        <div 
          ref={permitRef} 
          style={containerStyle}
          className="relative w-[540px] h-[540px] rounded-full border-[12px] border-black flex flex-col items-center p-12 bg-white overflow-hidden"
        >
          {/* Municipal Watermark */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center p-16 rotate-12">
             <img src="https://raw.githubusercontent.com/google/genai-toolbox/main/assets/umzimkhulu_logo.png" className="w-full h-auto object-contain scale-125" />
          </div>

          {/* Header */}
          <div className="relative z-10 text-center mt-4">
            <p 
              style={{ fontSize: `${7 * scale}px` }}
              className="font-[1000] tracking-[0.4em] text-black uppercase leading-none"
            >
              {permit.authorityName || 'UMZIMKHULU MUNICIPALITY'}
            </p>
            <h1 
              style={{ fontSize: `${18 * scale}px`, fontWeight: getWeight(permit.permitFontStyle) }}
              className="text-black uppercase tracking-[0.25em] mt-2 border-b-2 border-black pb-1"
            >
              TRANSPORT PERMIT
            </h1>
          </div>

          {/* Association Badge */}
          <div className="relative z-10 mt-6 bg-white text-black px-8 py-2 rounded-full border-[3px] border-black">
            <p 
              style={{ fontSize: `${12 * scale}px` }}
              className="font-[1000] uppercase tracking-[0.15em]"
            >
              {permit.association}
            </p>
          </div>

          {/* Main Registration Area */}
          <div className="relative z-10 mt-8 text-center px-12 py-4 bg-white rounded-3xl border-[3px] border-black">
            <span 
              style={{ fontSize: `${9 * scale}px` }}
              className="font-[1000] text-black uppercase tracking-[0.8em] mb-1 block"
            >
              Registration
            </span>
            <h2 
              style={{ fontSize: `${64 * scale}px`, fontWeight: getWeight(permit.permitFontStyle) }}
              className="text-black leading-none tracking-tighter uppercase"
            >
              {permit.regNo}
            </h2>
          </div>

          {/* Vehicle & Expiry Details */}
          <div className="relative z-10 mt-8 w-full max-w-[340px] space-y-4">
            <div className="flex justify-between items-end border-b-[3px] border-black pb-2">
               <div className="space-y-0.5">
                  <p 
                    style={{ fontSize: `${9 * scale}px` }}
                    className="font-[1000] text-black uppercase tracking-widest"
                  >
                    Vehicle Model
                  </p>
                  <p 
                    style={{ fontSize: `${16 * scale}px`, fontWeight: getWeight(permit.permitFontStyle) }}
                    className="text-black uppercase italic leading-none"
                  >
                    {permit.make}
                  </p>
               </div>
               <div className="text-right space-y-0.5">
                  <p 
                    style={{ fontSize: `${9 * scale}px` }}
                    className="font-[1000] text-black uppercase tracking-widest"
                  >
                    Valid Until
                  </p>
                  <p 
                    style={{ fontSize: `${16 * scale}px`, fontWeight: getWeight(permit.permitFontStyle) }}
                    className="text-black uppercase leading-none"
                  >
                    {permit.expiryDate}
                  </p>
               </div>
            </div>
            
            <div 
              style={{ fontSize: `${11 * scale}px` }}
              className="flex justify-center font-[1000] text-black uppercase tracking-[0.3em]"
            >
               <span>Issued: {permit.dateIssued}</span>
            </div>
          </div>

          {/* Barcode Section - Bottom */}
          <div className="relative z-10 mt-auto mb-10 w-full flex flex-col items-center">
            <div className="p-4 bg-white border-[3px] border-black rounded-2xl w-full flex justify-center">
              <Barcode value={barcodeValue} width={2.4} height={55} />
            </div>
          </div>

          {/* Inner Dashed Security Ring */}
          <div className="absolute inset-[14px] rounded-full border-[2px] border-dashed border-black/20 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};
