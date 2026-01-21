
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
    backgroundColor: permit.discBackgroundColor || '#ffffff',
    backgroundImage: permit.discBackgroundImage ? `url(${permit.discBackgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  const handleSavePdf = async () => {
    if (!permitRef.current) return;
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(permitRef.current, { 
        scale: 4, 
        useCORS: true, 
        backgroundColor: permit.discBackgroundColor || '#ffffff',
        logging: false,
        allowTaint: true
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({ 
        orientation: 'portrait', 
        unit: 'mm', 
        format: 'a4' 
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const discSize = 90; 
      const x = (pageWidth - discSize) / 2;
      const y = (pageHeight - discSize) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, discSize, discSize);
      
      pdf.setDrawColor(200, 200, 200); 
      pdf.setLineWidth(0.05);
      pdf.circle(pageWidth / 2, pageHeight / 2, (discSize / 2) + 0.05);
      
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('UMZIMKHULU MUNICIPALITY - OFFICIAL PERMIT DISC (90MM)', pageWidth / 2, y - 10, { align: 'center' });
      pdf.text('PRINT AT 100% SCALE ON A4 PAPER', pageWidth / 2, y + discSize + 15, { align: 'center' });

      pdf.save(`PERMIT_A4_${permit.regNo.replace(/\s/g, '_')}.pdf`);
    } catch (e) { 
      console.error(e);
      alert('Export failed'); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-700 pb-20 print:p-0 print:pb-0">
      <div className="no-print w-full max-w-2xl flex items-center justify-between mb-12">
        <button onClick={onBack} className="flex items-center gap-3 px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint} 
            className="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center gap-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeWidth="2.5"/></svg>
            PRINT DISC
          </button>
          <button 
            onClick={handleSavePdf} 
            disabled={isGenerating} 
            className="px-6 py-4 bg-black text-white rounded-2xl font-[1000] text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center gap-3"
          >
            {isGenerating ? 'PROCESSING...' : 'DOWNLOAD A4 PDF'}
          </button>
        </div>
      </div>

      <div className="bg-white p-16 rounded-[6rem] shadow-2xl border border-slate-100 flex justify-center w-full max-w-2xl print:p-0 print:shadow-none print:border-none print:bg-transparent print:m-0">
        <div 
          ref={permitRef} 
          style={containerStyle}
          className="relative w-[500px] h-[500px] rounded-full border-[14px] border-[#047857] flex flex-col items-center p-10 overflow-hidden aspect-square print:w-[90mm] print:h-[90mm] print:border-[3mm] print:fixed print:top-1/2 print:left-1/2 print:-translate-x-1/2 print:-translate-y-1/2"
        >
          {permit.discBackgroundImage && (
             <div className="absolute inset-0 bg-white/40 backdrop-blur-[0.5px] pointer-events-none"></div>
          )}

          {/* Header Group */}
          <div className="relative z-10 text-center mt-16 flex flex-col items-center w-full print:mt-10">
            <p 
              style={{ fontSize: `${20 * scale}px` }}
              className="font-[1000] tracking-[0.4em] text-black uppercase leading-none print:text-[10pt]"
            >
              SAFE AND SECURITY
            </p>
            <p 
              style={{ fontSize: `${22 * scale}px`, fontWeight: getWeight(permit.permitFontStyle) }}
              className="text-black uppercase tracking-[0.25em] font-black leading-none mt-4 print:mt-2 print:text-[11pt]"
            >
              RANK PERMIT 2025/26
            </p>
          </div>

          {/* Association Group */}
          <div className="relative z-10 mt-10 text-center flex flex-col items-center w-full border-t border-black/10 pt-4 print:mt-6 print:pt-2">
            <p 
              style={{ fontSize: `${24 * scale}px` }}
              className="font-[1000] uppercase tracking-[0.1em] text-black leading-tight print:text-[12pt]"
            >
              UMZIMKHULU TAXI
            </p>
            <p 
              style={{ fontSize: `${12 * scale}px` }}
              className="font-black uppercase tracking-[0.4em] text-black/60 mt-1 print:text-[6pt]"
            >
              ASSOCIATION PERMIT
            </p>
          </div>

          {/* Registration Number */}
          <div className="relative z-10 mt-4 text-center w-full print:mt-2">
            <h2 
              style={{ fontSize: `${48 * scale}px`, fontWeight: getWeight(permit.permitFontStyle) }}
              className="text-black leading-none tracking-tighter uppercase font-black print:text-[24pt]"
            >
              {permit.regNo}
            </h2>
          </div>

          {/* Details Row */}
          <div className="relative z-10 mt-6 w-full px-10 print:mt-4 print:px-4">
            <div className="flex justify-between items-center text-center py-4 border-y border-black/10 print:py-2">
               <div className="flex flex-col items-center flex-1">
                  <span style={{ fontSize: `${8 * scale}px` }} className="font-black text-black/40 uppercase tracking-widest leading-none mb-1 print:text-[4pt]">Vehicle</span>
                  <span style={{ fontSize: `${14 * scale}px` }} className="text-black font-black uppercase italic leading-none print:text-[7pt]">{permit.make}</span>
               </div>
               <div className="w-[1px] h-8 bg-black/10 mx-2 print:h-4"></div>
               <div className="flex flex-col items-center flex-1">
                  <span style={{ fontSize: `${8 * scale}px` }} className="font-black text-black/40 uppercase tracking-widest leading-none mb-1 print:text-[4pt]">Issued</span>
                  <span style={{ fontSize: `${14 * scale}px` }} className="text-black font-black uppercase leading-none print:text-[7pt]">{permit.dateIssued}</span>
               </div>
               <div className="w-[1px] h-8 bg-black/10 mx-2 print:h-4"></div>
               <div className="flex flex-col items-center flex-1">
                  <span style={{ fontSize: `${8 * scale}px` }} className="font-black text-black/40 uppercase tracking-widest leading-none mb-1 print:text-[4pt]">Expiry</span>
                  <span style={{ fontSize: `${14 * scale}px` }} className="text-black font-black uppercase leading-none print:text-[7pt]">{permit.expiryDate}</span>
               </div>
            </div>
          </div>

          {/* Barcode Footer */}
          <div className="relative z-10 mt-auto mb-10 w-full flex flex-col items-center print:mb-4">
             <div className="bg-white p-1 rounded-md shadow-sm print:scale-50">
                <Barcode value={permit.id.toUpperCase()} width={1.4} height={45} />
             </div>
             <p className="text-[7px] font-black text-black/40 uppercase tracking-[0.6em] mt-1 print:text-[4pt]">{permit.id.toUpperCase()}</p>
          </div>

          <div className="absolute inset-[15px] rounded-full border border-dashed border-[#047857]/20 pointer-events-none print:inset-[3mm]"></div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-2 no-print">
        <p className="text-slate-400 font-black text-[9px] uppercase tracking-[0.3em] flex items-center gap-3">
          <span className="w-8 h-[1px] bg-slate-200"></span>
          OFFICIAL ROUND 90MM DISC
          <span className="w-8 h-[1px] bg-slate-200"></span>
        </p>
        <p className="text-slate-300 font-bold text-[8px] uppercase tracking-widest">
          A4 PRINT READY • CENTERED ALIGNMENT
        </p>
      </div>
    </div>
  );
};
