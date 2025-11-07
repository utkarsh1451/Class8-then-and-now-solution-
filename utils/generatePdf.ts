import type { Chapter, ContentSection, Unit } from '../types';

// Declare jspdf and html2canvas from global scope (CDN)
declare const jspdf: any;
declare const html2canvas: any;

export const generateChapterPdf = async (chapter: Chapter, unit: Unit, content: ContentSection[]) => {
  // Create a temporary element to render the PDF content
  const pdfContentEl = document.createElement('div');
  pdfContentEl.style.position = 'absolute';
  pdfContentEl.style.left = '-9999px';
  pdfContentEl.style.width = '800px';
  pdfContentEl.style.padding = '40px';
  pdfContentEl.style.fontFamily = 'sans-serif';
  pdfContentEl.style.color = '#111827';
  pdfContentEl.style.backgroundColor = '#ffffff'; // Added background for canvas
  
  const contentHtml = content.map(section => `
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 22px; font-weight: bold; border-bottom: 1px solid #d1d5db; padding-bottom: 8px; margin-bottom: 16px;">${section.title}</h3>
      ${section.questions.map(qa => {
        let answerHtml = '';
        if (qa.isTable && qa.table) {
            answerHtml += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;"><thead><tr>${qa.table.headers.map(h => `<th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">${h}</th>`).join('')}</tr></thead><tbody>`;
            answerHtml += qa.table.rows.map(row => `<tr>${row.map(cell => `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`).join('')}</tr>`).join('');
            answerHtml += `</tbody></table>`;
        }
        if (qa.a) {
            const formattedAnswer = qa.a.replace(/\n/g, '<br/>');
            answerHtml += `<div style="font-size: 16px; white-space: pre-wrap; color: #374151;">${formattedAnswer}</div>`;
        }
        return `
            <div style="margin-bottom: 16px; page-break-inside: avoid;">
              <p style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">${qa.q}</p>
              ${answerHtml}
            </div>
        `;
      }).join('')}
    </div>
  `).join('');
  
  pdfContentEl.innerHTML = `
    <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">Chapter ${chapter.id}: ${chapter.title}</h1>
    <h2 style="font-size: 20px; color: #4b5563; margin-bottom: 24px;">${unit.title}</h2>
    ${contentHtml}
  `;

  document.body.appendChild(pdfContentEl);

  try {
    const canvas = await html2canvas(pdfContentEl, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps= pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft > 0) {
      position = -heightLeft;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }
    
    pdf.save(`Chapter ${chapter.id} - ${chapter.title}.pdf`);

  } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Sorry, there was an error creating the PDF.");
  } finally {
      document.body.removeChild(pdfContentEl);
  }
};
