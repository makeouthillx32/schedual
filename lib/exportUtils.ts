// lib/exportUtils.ts

// Note: You'll need to install these dependencies:
// npm install xlsx jspdf html2canvas

import * as XLSX from 'xlsx';

// Excel Export Utility
export class ExcelExporter {
  static async exportData(data: any[], sheetName: string = 'Sheet1', filename?: string): Promise<Blob> {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create worksheet from data
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      // Generate Excel file as array buffer
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Create blob
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      return blob;
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Failed to generate Excel file');
    }
  }

  static async exportBillingTemplate(businesses: any[], month: number, year: number): Promise<Blob> {
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Create header data
    const headerData = [
      [`CMS Billing Report - ${monthNames[month - 1]} ${year}`],
      [`Generated: ${new Date().toLocaleDateString()}`],
      []
    ];

    // Create column headers
    const columnHeaders = ['Business Name', 'Address'];
    for (let day = 1; day <= daysInMonth; day++) {
      columnHeaders.push(day.toString());
    }
    columnHeaders.push('Total Days');

    // Create business rows
    const businessRows = businesses.map(business => {
      const row = [business.business_name, business.address];
      
      // Add day columns
      for (let day = 1; day <= daysInMonth; day++) {
        const isCleaned = business.cleaned_dates?.includes(day);
        row.push(isCleaned ? 'X' : '');
      }
      
      // Add total
      row.push(business.cleaned_dates?.length || 0);
      
      return row;
    });

    // Combine all data
    const allData = [
      ...headerData,
      columnHeaders,
      ...businessRows
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(allData);

    // Style the worksheet
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    
    // Set column widths
    const colWidths = [
      { wch: 25 }, // Business Name
      { wch: 30 }, // Address
    ];
    
    // Add day columns
    for (let day = 1; day <= daysInMonth; day++) {
      colWidths.push({ wch: 3 });
    }
    colWidths.push({ wch: 8 }); // Total Days
    
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, `${monthNames[month - 1]} ${year}`);

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }
}

// PDF Export Utility (simplified version - you might want to use a proper PDF library)
export class PDFExporter {
  static async exportHTML(htmlContent: string, filename?: string): Promise<Blob> {
    try {
      // This is a simplified implementation
      // For production, consider using jsPDF with html2canvas or puppeteer
      
      // Create a temporary iframe to render the HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '210mm'; // A4 width
      iframe.style.height = '297mm'; // A4 height
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Cannot access iframe document');

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // For now, we'll return the HTML as a text file
      // In production, you'd use a proper PDF library here
      const blob = new Blob([htmlContent], { type: 'text/html' });
      
      // Clean up
      document.body.removeChild(iframe);
      
      return blob;
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('Failed to generate PDF file');
    }
  }

  static async exportBillingTemplate(businesses: any[], month: number, year: number): Promise<Blob> {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = monthNames[month - 1];
    
    let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CMS Billing - ${monthName} ${year}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; font-size: 10px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 16px; font-weight: bold; }
        .header h2 { margin: 5px 0; font-size: 14px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
        th, td { border: 1px solid #000; padding: 2px; text-align: center; font-size: 8px; }
        .business-name { text-align: left; width: 150px; font-size: 7px; padding: 1px 3px; }
        .day-header { width: 15px; font-weight: bold; background-color: #f0f0f0; }
        .cleaned { font-size: 12px; font-weight: bold; }
        .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
        .signature-box { border: 1px solid #000; width: 200px; height: 50px; display: inline-block; margin: 0 20px; }
        .month-year { text-align: center; font-size: 14px; font-weight: bold; margin-top: 20px; }
        @media print { body { margin: 10px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>DART COMMERCIAL SERVICES</h1>
        <h2>MONTHLY BILLING REPORT</h2>
    </div>
    
    <table>
        <thead>
            <tr>
                <th class="business-name">Business Name</th>`;

    // Generate day headers
    for (let day = 1; day <= daysInMonth; day++) {
      html += `<th class="day-header">${day}</th>`;
    }
    
    html += `</tr></thead><tbody>`;

    // Generate business rows
    businesses.forEach(business => {
      html += `<tr><td class="business-name">${business.business_name}</td>`;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const isCleaned = business.cleaned_dates?.includes(day);
        html += `<td>${isCleaned ? '<span class="cleaned">✓</span>' : ''}</td>`;
      }
      
      html += `</tr>`;
    });

    html += `
        </tbody>
    </table>
    
    <div class="month-year">
        MONTH & YEAR: ${monthName.toUpperCase()} ${year}
    </div>
    
    <div class="signature-section">
        <div>JOB COACH SIGNATURE: <div class="signature-box"></div></div>
        <div>DATE: _______________</div>
    </div>
</body>
</html>`;

    return this.exportHTML(html);
  }
}

// Template generators for different report types
export const exportTemplates = {
  billing: {
    excel: ExcelExporter.exportBillingTemplate,
    pdf: PDFExporter.exportBillingTemplate
  },
  
  // Add more template types as needed
  timesheet: {
    excel: async (data: any[]) => ExcelExporter.exportData(data, 'Timesheet'),
    pdf: async (data: any[]) => PDFExporter.exportHTML(`<h1>Timesheet Report</h1><pre>${JSON.stringify(data, null, 2)}</pre>`)
  },
  
  schedule: {
    excel: async (data: any[]) => ExcelExporter.exportData(data, 'Schedule'),
    pdf: async (data: any[]) => PDFExporter.exportHTML(`<h1>Schedule Report</h1><pre>${JSON.stringify(data, null, 2)}</pre>`)
  }
};