// lib/pdfGenerator.ts
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  // Store original styles
  const originalStyle = element.style.cssText;
  const isDarkMode = document.documentElement.classList.contains('dark');

  try {
    // Temporarily apply light mode styles for PDF
    if (isDarkMode) {
      element.style.backgroundColor = '#ffffff';
      element.style.color = '#1e293b';
    }
    element.style.padding = '24px';

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(79, 70, 229); // Indigo color
    pdf.text('Gemini Foundry Report', 10, 15);

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 10, 22);

    // Divider line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(10, 26, pdfWidth - 10, 26);

    // Check if content fits in one page
    const contentStartY = 32;
    const maxContentHeight = pdf.internal.pageSize.getHeight() - contentStartY - 10;

    if (pdfHeight > maxContentHeight) {
      // Scale down to fit
      const scaledWidth = pdfWidth - 20;
      const scaledHeight = (canvas.height * scaledWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, contentStartY, scaledWidth, Math.min(scaledHeight, maxContentHeight));
    } else {
      pdf.addImage(imgData, 'PNG', 10, contentStartY, pdfWidth - 20, pdfHeight);
    }

    // Footer
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Powered by Gemini Foundry - AI Co-Founder Platform', 10, pageHeight - 5);

    pdf.save(`${filename}_Report.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  } finally {
    // Restore original styles
    element.style.cssText = originalStyle;
  }
};
