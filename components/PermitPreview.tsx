
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
          className="relative w-[540px] h-[540px] rounded-full border-[12px] border-black flex flex-col items-center p-8 overflow-hidden"
        >
          {/* Subtle overlay for image readability */}
          {permit.discBackgroundImage && (
             <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] pointer-events-none"></div>
          )}

          {/* Header */}
          <div className="relative z-10 text-center mt-6">
            <p 
              style={{ fontSize: `${10 * scale}px` }}
              className="font-[1000] tracking-[0.4em] text-black uppercase leading-none"
            >
              {permit.authorityName || 'UMZIMKHULU MUNICIPALITY'}
            </p>
            <h1 
              style={{ fontSize: `${24 * scale}px`, fontWeight: getWeight(permit.permitFontStyle) }}
              className="text-black uppercase tracking-[0.3em] mt-3 border-b-[4px] border-black pb-1 inline-block"
            >
              TAXICAB PERMIT
            </h1>
          </div>

          {/* Association Name */}
          <div className="relative z-10 mt-6 text-center">
            <p 
              style={{ fontSize: `${18 * scale}px` }}
              className="font-[1000] uppercase tracking-[0.15em] text-black"
            >
              {permit.association}
            </p>
          </div>

          {/* Registration Number - Size Reduced */}
          <div className="relative z-10 mt-6 text-center w-full px-12">
            <span 
              style={{ fontSize: `${12 * scale}px` }}
              className="font-[1000] text-black uppercase tracking-[0.8em] mb-1 block"
            >
              Registration
            </span>
            <h2 
              style={{ fontSize: `${52 * scale}px`, fontWeight: getWeight(permit.permitFontStyle) }}
              className="text-black leading-none tracking-tight uppercase"
            >
              {permit.regNo}
            </h2>
          </div>

          {/* Details Row */}
          <div className="relative z-10 mt-10 w-full flex flex-col items-center">
            <div className="flex gap-16 text-center">
               <div className="flex flex-col">
                  <span style={{ fontSize: `${11 * scale}px` }} className="font-[1000] text-black uppercase tracking-widest">Model</span>
                  <span style={{ fontSize: `${22 * scale}px`, fontWeight: getWeight(permit.permitFontStyle) }} className="text-black uppercase italic leading-none">{permit.make}</span>
               </div>
               <div className="flex flex-col">
                  <span style={{ fontSize: `${11 * scale}px` }} className="font-[1000] text-black uppercase tracking-widest">Expiry</span>
                  <span style={{ fontSize: `${22 * scale}px`, fontWeight: getWeight(permit.permitFontStyle) }} className="text-black uppercase leading-none">{permit.expiryDate}</span>
               </div>
            </div>
            <p style={{ fontSize: `${12 * scale}px` }} className="font-black text-black uppercase tracking-tighter mt-6">
               Issued: {permit.dateIssued}
            </p>
          </div>

          {/* Barcode Section - Bottom */}
          <div className="relative z-10 mt-auto mb-10 w-full flex justify-center">
            <div className="px-8 py-3 bg-white/90 rounded-xl">
              <Barcode value={permit.regNo.replace(/\s/g, '')} width={2.4} height={55} />
            </div>
          </div>

          {/* Inner Security Ring */}
          <div className="absolute inset-[16px] rounded-full border-[2px] border-dashed border-black/15 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};
