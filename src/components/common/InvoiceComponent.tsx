'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import { Printer, X, Download } from 'lucide-react';

export const InvoiceComponent: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  const { formatPrice } = useStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil((order.items?.length || 1) / ITEMS_PER_PAGE);
  const pages = Array.from({ length: totalPages });

  const generatePDF = (action: 'save' | 'print') => {
    const element = document.getElementById('invoice-pdf-wrapper');
    if (!element) { setIsDownloading(false); return; }

    const opt = {
      margin: 0,
      filename: `DOOZY_Invoice_${order.orderNumber}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc: any) => {
          const el = clonedDoc.getElementById('invoice-pdf-wrapper');
          if (!el) return;
          el.className = '';
          el.style.cssText = 'width:210mm;background:#fff;margin:0;padding:0;display:block;overflow:visible;height:auto;border:none;';
          Array.from(el.children).forEach((child: any) => {
            child.className = '';
            child.style.cssText = 'margin:0;padding:0;background:#fff;border:none;display:block;';
          });
          el.querySelectorAll('.pdf-page-chunk').forEach((p: any) => {
            p.style.boxShadow = 'none'; p.style.margin = '0'; p.style.width = '210mm'; p.style.border = 'none';
          });
          let parent = el.parentElement;
          while (parent && parent.tagName !== 'HTML') {
            parent.style.cssText = 'overflow:visible!important;max-height:none!important;height:auto!important;width:auto!important;position:static!important;transform:none!important;padding:0!important;margin:0!important;background:#fff!important;border:none!important;';
            parent = parent.parentElement;
          }
        },
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    };

    const execute = () => {
      const instance = (window as any).html2pdf().set(opt).from(element);
      if (action === 'save') {
        instance.save().then(() => setIsDownloading(false)).catch((e: any) => { console.error(e); setIsDownloading(false); });
      } else {
        instance.outputPdf('bloburl').then((url: string) => {
          const iframe = document.createElement('iframe');
          iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
          iframe.src = url;
          document.body.appendChild(iframe);
          iframe.onload = () => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 5000); };
          setIsDownloading(false);
        }).catch((e: any) => { console.error(e); setIsDownloading(false); });
      }
    };

    if (!(window as any).html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = execute;
      script.onerror = () => { setIsDownloading(false); alert('PDF library failed to load. Check your internet connection.'); };
      document.body.appendChild(script);
    } else {
      execute();
    }
  };

  const handleDownloadPDF = () => { setIsDownloading(true); generatePDF('save'); };
  const handlePrint = () => { setIsDownloading(true); generatePDF('print'); };

  const renderPage = (pageIndex: number) => {
    const pageItems = (order.items || []).slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE);
    const isLastPage = pageIndex === totalPages - 1;

    return (
      <div key={pageIndex} className="pdf-page-chunk"
        style={{ width: '210mm', height: '290mm', padding: '16mm 18mm', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, margin: '0 auto', pageBreakAfter: isLastPage ? 'auto' : 'always', overflow: 'hidden' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderBottom: '1px solid #e7e5e4', paddingBottom: 18, flexShrink: 0 }}>
          <img src="/logo.jpg" alt="DOOZY" style={{ width: 52, height: 52, objectFit: 'contain' }} />
          <h1 style={{ margin: '6px 0 2px', fontFamily: 'Georgia, serif', fontSize: 19, fontWeight: 700, letterSpacing: '0.2em', color: '#1c1917', textTransform: 'uppercase' }}>DOOZY</h1>
          <p style={{ margin: 0, fontSize: 8, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Official Invoice</p>
          <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: 9, color: '#57534e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span><b style={{ color: '#1c1917' }}>No:</b> #{order.orderNumber}</span>
            <span><b style={{ color: '#1c1917' }}>Date:</b> {new Date(order.date).toLocaleDateString()}</span>
            {totalPages > 1 && <span><b style={{ color: '#1c1917' }}>Page:</b> {pageIndex + 1}/{totalPages}</span>}
          </div>
        </div>

        {/* ITEMS — vertically centered */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #1c1917' }}>
                {(['Item Description', 'Qty', 'Price', 'Amount'] as const).map((h, i) => (
                  <th key={h} style={{ width: ['52%','12%','18%','18%'][i], padding: '7px 5px', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1c1917', textAlign: (['left','center','right','right'] as const)[i] }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item, idx) => {
                const price = item.price || (item as any).product?.price || 0;
                const title = item.title || (item as any).product?.title || 'Unknown Product';
                return (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#fafaf9' }}>
                    <td style={{ padding: '8px 5px', fontSize: 10, fontWeight: 700, color: '#292524' }}>
                      {title}
                      {(item.selectedSize || item.selectedColor) && (
                        <span style={{ display: 'block', fontSize: 8, fontWeight: 400, color: '#78716c', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {item.selectedSize}{item.selectedSize && item.selectedColor ? ' | ' : ''}{(item.selectedColor as any)?.name || item.selectedColor || ''}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px 5px', fontSize: 10, fontWeight: 700, color: '#44403c', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '8px 5px', fontSize: 10, color: '#44403c', textAlign: 'right' }}>{formatPrice(price)}</td>
                    <td style={{ padding: '8px 5px', fontSize: 10, fontWeight: 700, color: '#1c1917', textAlign: 'right' }}>{formatPrice(price * item.quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {isLastPage && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <div style={{ width: 210, borderTop: '1px solid #e7e5e4', paddingTop: 8 }}>
                {[
                  { label: 'Subtotal', value: formatPrice(order.subtotal || 0) },
                  { label: 'Shipping', value: order.shipping > 0 ? formatPrice(order.shipping) : 'Free' },
                  ...(order.tax > 0 ? [{ label: 'Tax', value: formatPrice(order.tax), g: false }] : []),
                  ...(order.discount > 0 ? [{ label: 'Discount', value: `-${formatPrice(order.discount)}`, g: true }] : []),
                ].map(({ label, value, g }: any) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: g ? '#059669' : '#57534e', marginBottom: 4, fontWeight: g ? 700 : 400 }}>
                    <span>{label}</span><span style={{ fontWeight: 700 }}>{value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #1c1917', paddingTop: 7, marginTop: 5, fontSize: 13, fontWeight: 700, color: '#800020', fontFamily: 'Georgia, serif' }}>
                  <span>Total</span><span>{formatPrice(order.total || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, borderTop: '1px solid #1c1917', paddingTop: 12, fontSize: 8.5, lineHeight: 1.55, flexShrink: 0 }}>
          <div>
            <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#1c1917', fontSize: 7.5, marginBottom: 3 }}>Billed To</p>
            <p style={{ fontWeight: 700, color: '#292524', textTransform: 'uppercase', margin: 0 }}>{order.customerName || 'Guest'}</p>
            <p style={{ color: '#57534e', margin: 0 }}>{order.customerEmail}</p>
          </div>
          <div>
            <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#1c1917', fontSize: 7.5, marginBottom: 3 }}>Shipped To</p>
            <p style={{ fontWeight: 700, color: '#292524', textTransform: 'uppercase', margin: 0 }}>{order.shippingAddress?.fullName || order.customerName}</p>
            <p style={{ color: '#57534e', margin: 0 }}>
              {order.shippingAddress?.street}{order.shippingAddress?.apartment ? `, ${order.shippingAddress.apartment}` : ''}<br />
              {order.shippingAddress?.city}{order.shippingAddress?.city && order.shippingAddress?.state ? ', ' : ''}{order.shippingAddress?.state} {order.shippingAddress?.postalCode}
            </p>
            {order.shippingAddress?.phone && <p style={{ color: '#57534e', margin: 0 }}>Ph: {order.shippingAddress.phone}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#1c1917', fontSize: 7.5, marginBottom: 3 }}>Company</p>
            <p style={{ fontWeight: 700, color: '#800020', textTransform: 'uppercase', fontFamily: 'Georgia, serif', fontSize: 11, margin: 0 }}>DOOZY</p>
            <p style={{ color: '#57534e', fontWeight: 600, margin: 0 }}>Women's Clothing</p>
            <p style={{ color: '#57534e', marginTop: 2 }}>www.doozyclothing.in</p>
            <p style={{ color: '#a8a29e', fontStyle: 'italic', marginTop: 1, fontSize: 7.5 }}>Thank you for your purchase.</p>
          </div>
        </div>
      </div>
    );
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <style>{`
        @media print {
          body > *:not(#doozy-invoice-portal) { display: none !important; }
          #doozy-invoice-portal { display: block !important; position: fixed; inset: 0; z-index: 99999; }
          .invoice-action-bar { display: none !important; }
          #invoice-pdf-wrapper { background: white !important; padding: 0 !important; gap: 0 !important; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      <div id="doozy-invoice-portal"
        style={{ position: 'fixed', inset: 0, zIndex: 9999, width: '100vw', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(28,25,23,0.85)', backdropFilter: 'blur(4px)' }}>

        {/* Modal card: fullscreen on mobile, 900px card on desktop */}
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f4', overflow: 'hidden' }}
          className="sm:max-w-[900px] sm:max-h-[94dvh] sm:rounded-[14px]">

          {/* ── Action Bar ── */}
          <div className="invoice-action-bar"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#fff', borderBottom: '1px solid #e7e5e4', flexShrink: 0, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#44403c', fontSize: 17 }}>Order #{order.orderNumber}</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleDownloadPDF} disabled={isDownloading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', backgroundColor: '#800020', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: isDownloading ? 'not-allowed' : 'pointer', opacity: isDownloading ? 0.6 : 1 }}>
                <Download size={13} />{isDownloading ? 'Generating…' : 'Download PDF'}
              </button>
              <button onClick={handlePrint} disabled={isDownloading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', backgroundColor: '#292524', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: isDownloading ? 'not-allowed' : 'pointer', opacity: isDownloading ? 0.6 : 1 }}>
                <Printer size={13} />Print
              </button>
              <button onClick={onClose}
                style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f4', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#57534e' }}>
                <X size={17} />
              </button>
            </div>
          </div>

          {/* ── Scrollable Invoice Area ── */}
          <div id="invoice-pdf-wrapper"
            style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', backgroundColor: '#e7e5e4', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            {pages.map((_, i) => renderPage(i))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
