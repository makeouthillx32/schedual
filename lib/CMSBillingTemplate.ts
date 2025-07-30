import * as XLSX from 'sheetjs-style';

export interface BusinessCleaningRecord {
  business_id: number;
  business_name: string;
  address: string;
  cleaned_dates: number[];
  moved_dates: number[];
  added_dates: number[];
}

export interface BillingTemplateData {
  month: number;
  year: number;
  businesses: BusinessCleaningRecord[];
  generated_at: string;
  generated_by?: string;
}

export class CMSBillingTemplate {
  private data: BillingTemplateData;

  constructor(month: number, year: number) {
    this.data = {
      month,
      year,
      businesses: [],
      generated_at: new Date().toISOString()
    };
  }

  static async generateReport(businesses: BusinessCleaningRecord[], month: number, year: number, format: 'excel' | 'pdf'): Promise<Blob | string> {
    const template = new CMSBillingTemplate(month, year);
    template.data.businesses = businesses.sort((a, b) => a.business_name.localeCompare(b.business_name));
    if (format === 'excel') {
      const arrayBuffer = template.generateExcel();
      return new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    } else {
      return template.generateHTML();
    }
  }

  async fetchCleaningData(): Promise<void> {
    try {
      const startDate = new Date(this.data.year, this.data.month - 1, 1);
      const endDate = new Date(this.data.year, this.data.month, 0);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      const businessesRes = await fetch('/api/schedule/businesses');
      if (!businessesRes.ok) throw new Error('Failed to fetch businesses');
      const allBusinesses = await businessesRes.json();
      const instancesRes = await fetch(`/api/schedule/daily-instances/monthly?start_date=${startDateStr}&end_date=${endDateStr}`);
      if (!instancesRes.ok) throw new Error('Failed to fetch monthly instances');
      const monthlyData = await instancesRes.json();
      const businessRecords = new Map<number, BusinessCleaningRecord>();
      allBusinesses.forEach((business: any) => {
        businessRecords.set(business.id, {
          business_id: business.id,
          business_name: business.business_name,
          address: business.address,
          cleaned_dates: [],
          moved_dates: [],
          added_dates: []
        });
      });
      monthlyData.instances?.forEach((instance: any) => {
        const instanceDate = new Date(instance.instance_date + 'T00:00:00');
        const dayOfMonth = instanceDate.getDate();
        instance.daily_clean_items?.forEach((item: any) => {
          const record = businessRecords.get(item.business_id);
          if (record) {
            if (item.status === 'cleaned') {
              if (!record.cleaned_dates.includes(dayOfMonth)) {
                record.cleaned_dates.push(dayOfMonth);
              }
            } else if (item.status === 'moved') {
              if (!record.moved_dates.includes(dayOfMonth)) {
                record.moved_dates.push(dayOfMonth);
              }
            }
            if (item.is_added && item.status === 'cleaned') {
              if (!record.added_dates.includes(dayOfMonth)) {
                record.added_dates.push(dayOfMonth);
              }
            }
          }
        });
      });
      this.data.businesses = Array.from(businessRecords.values()).sort((a, b) => a.business_name.localeCompare(b.business_name));
    } catch (error) {
      console.error('❌ Error fetching cleaning data:', error);
      throw error;
    }
  }

  generateExcel(): ArrayBuffer {
    const wb = XLSX.utils.book_new();
    const monthName = this.getMonthName();
    const daysInMonth = new Date(this.data.year, this.data.month, 0).getDate();
    const wsData: any[][] = [];
    wsData.push([`MONTHLY CLEANING REPORT FOR BILLING`]);
    wsData.push([]);
    wsData.push([`MONTH & YEAR: ${monthName.toUpperCase()} ${this.data.year}`]);
    wsData.push([]);
    const headerRow1 = ['BUSINESS NAME'];
    const headerRow2 = [''];
    for (let day = 1; day <= 16; day++) {
      headerRow1.push(day.toString());
      headerRow2.push('');
    }
    wsData.push(headerRow1);
    headerRow2[0] = '';
    for (let day = 17; day <= 31; day++) {
      headerRow2.push(day.toString());
    }
    wsData.push(headerRow2);
    this.data.businesses.forEach(business => {
      const row1 = [business.business_name];
      for (let day = 1; day <= 16; day++) {
        let mark = '';
        if (business.added_dates.includes(day)) mark = '+';
        else if (business.cleaned_dates.includes(day)) mark = '✓';
        else if (business.moved_dates.includes(day)) mark = 'M';
        row1.push(mark);
      }
      const row2 = [''];
      for (let day = 17; day <= 31; day++) {
        let mark = '';
        if (business.added_dates.includes(day)) mark = '+';
        else if (business.cleaned_dates.includes(day)) mark = '✓';
        else if (business.moved_dates.includes(day)) mark = 'M';
        row2.push(mark);
      }
      wsData.push(row1);
      wsData.push(row2);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const colWidths = [{ wch: 28 }];
    for (let i = 0; i < 31; i++) {
      colWidths.push({ wch: 3.5 });
    }
    ws['!cols'] = colWidths;
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) {
          ws[cellAddress] = { v: '', t: 's' };
        }
        ws[cellAddress].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          },
          alignment: { horizontal: 'center', vertical: 'middle' }
        };
        if (R === 0) {
          ws[cellAddress].s.font = { bold: true, size: 12 };
          ws[cellAddress].s.fill = { fgColor: { rgb: 'FFFFFF' } };
          ws[cellAddress].s.alignment = { horizontal: 'center', vertical: 'middle' };
          ws[cellAddress].s.border = {
            top: { style: 'medium', color: { rgb: '000000' } },
            bottom: { style: 'medium', color: { rgb: '000000' } },
            left: { style: 'medium', color: { rgb: '000000' } },
            right: { style: 'medium', color: { rgb: '000000' } }
          };
        } else if (R === 2) {
          ws[cellAddress].s.font = { bold: true, size: 10 };
          ws[cellAddress].s.alignment = { horizontal: 'left', vertical: 'middle' };
          ws[cellAddress].s.border = {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          };
        } else if (R === 4 || R === 5) {
          ws[cellAddress].s.font = { bold: true, size: 9 };
          ws[cellAddress].s.fill = { fgColor: { rgb: 'F0F0F0' } };
          ws[cellAddress].s.alignment = { horizontal: 'center', vertical: 'middle' };
          ws[cellAddress].s.border = {
            top: { style: 'medium', color: { rgb: '000000' } },
            bottom: { style: 'medium', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          };
        } else if (R > 5) {
          if (C === 0) {
            ws[cellAddress].s.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
            ws[cellAddress].s.font = { bold: true, size: 8 };
            ws[cellAddress].s.border.left = { style: 'medium', color: { rgb: '000000' } };
          } else {
            const cellValue = ws[cellAddress].v;
            if (cellValue === '✓') {
              ws[cellAddress].s.font = { color: { rgb: '006400' }, bold: true, size: 11 };
            } else if (cellValue === 'M') {
              ws[cellAddress].s.font = { color: { rgb: 'FF6600' }, bold: true, size: 11 };
            } else if (cellValue === '+') {
              ws[cellAddress].s.font = { color: { rgb: '0066CC' }, bold: true, size: 11 };
            }
            ws[cellAddress].s.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          if (C === range.e.c) {
            ws[cellAddress].s.border.right = { style: 'medium', color: { rgb: '000000' } };
          }
        }
        if (R === 1 || R === 3) {
          ws[cellAddress].s.border = {
            top: { style: 'none' },
            bottom: { style: 'none' },
            left: { style: 'none' },
            right: { style: 'none' }
          };
        }
        if (R === 4) {
          ws[cellAddress].s.border.top = { style: 'medium', color: { rgb: '000000' } };
        }
        if (R === range.e.r) {
          ws[cellAddress].s.border.bottom = { style: 'medium', color: { rgb: '000000' } };
        }
      }
    }
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 31 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 31 } }
    ];
    const rowHeights = [];
    for (let i = 0; i <= range.e.r; i++) {
      if (i === 0) {
        rowHeights.push({ hpt: 22 });
      } else if (i === 1 || i === 3) {
        rowHeights.push({ hpt: 8 });
      } else if (i === 2) {
        rowHeights.push({ hpt: 18 });
      } else if (i === 4 || i === 5) {
        rowHeights.push({ hpt: 16 });
      } else {
        rowHeights.push({ hpt: 20 });
      }
    }
    ws['!rows'] = rowHeights;
    ws['!margins'] = { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0, footer: 0 };
    ws['!pageSetup'] = { paperSize: 1, orientation: 'landscape', horizontalDpi: 300, verticalDpi: 300, fitToWidth: 1, fitToHeight: 1 };
    XLSX.utils.book_append_sheet(wb, ws, 'CMS Billing');
    return XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true, cellNF: false, sheetStubs: false });
  }

  generateHTML(): string {
    const daysInMonth = new Date(this.data.year, this.data.month, 0).getDate();
    const monthName = this.getMonthName();
    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CMS Billing - ${monthName} ${this.data.year}</title><style>@page { size: letter; margin: 0.5in; }body{font-family: Arial, sans-serif;margin: 0;padding: 0;font-size: 10px;background: white;width: 7.5in;}.header{text-align: center;margin-bottom: 10px;border: 2px solid #000;padding: 6px;}.header h1{margin: 0 0 3px 0;font-size: 12px;font-weight: bold;text-decoration: underline;}.header h2{margin: 0;font-size: 11px;font-weight: bold;}.month-year-line{text-align: left;font-size: 10px;font-weight: bold;margin: 8px 0 5px 0;text-decoration: underline;}table{border-collapse: collapse;width: 100%;margin-bottom: 15px;border: 2px solid #000;font-size: 8px;}th, td{border: 1px solid #000;padding: 1px;text-align: center;vertical-align: middle;height: 18px;}.business-name{text-align: left;width: 140px;font-size: 7px;padding: 2px 3px;font-weight: bold;line-height: 1.1;}.day-header{width: 20px;font-weight: bold;background-color: #f0f0f0;font-size: 7px;}.day-cell{width: 20px;font-size: 10px;font-weight: bold;}.cleaned { color: #006400; }.moved { color: #FF6600; }.added { color: #0066CC; }.signature-section{margin-top: 15px;border: 2px solid #000;padding: 8px;font-size: 9px;}.signature-line{border-bottom: 1px solid #000;width: 180px;height: 15px;display: inline-block;margin-left: 8px;}@media print{body { font-size: 9px; }.no-print { display: none; }}</style></head><body><div class="header"><h1>MONTHLY CLEANING REPORT FOR BILLING</h1></div><div class="month-year-line">MONTH & YEAR: ${monthName.toUpperCase()} ${this.data.year}</div><table><thead><tr><th rowspan="2" class="business-name">BUSINESS NAME</th>`;
    for (let day = 1; day <= 16; day++) {
      html += `<th class="day-header">${day}</th>`;
    }
    html += `</tr><tr>`;
    for (let day = 17; day <= daysInMonth; day++) {
      html += `<th class="day-header">${day}</th>`;
    }
    for (let day = daysInMonth + 1; day <= 31; day++) {
      html += `<th class="day-header" style="background-color: #e0e0e0;"></th>`;
    }
    html += `</tr></thead><tbody>`;
    this.data.businesses.forEach(business => {
      html += `<tr><td rowspan="2" class="business-name">${business.business_name}</td>`;
      for (let day = 1; day <= 16; day++) {
        let mark = '';
        let markClass = '';
        if (business.added_dates.includes(day)) {
          mark = '+';
          markClass = 'added';
        } else if (business.cleaned_dates.includes(day)) {
          mark = '✓';
          markClass = 'cleaned';
        } else if (business.moved_dates.includes(day)) {
          mark = 'M';
          markClass = 'moved';
        }
        html += `<td class="day-cell"><span class="${markClass}">${mark}</span></td>`;
      }
      html += `</tr><tr>`;
      for (let day = 17; day <= 31; day++) {
        let mark = '';
        let markClass = '';
        if (day <= daysInMonth) {
          if (business.added_dates.includes(day)) {
            mark = '+';
            markClass = 'added';
          } else if (business.cleaned_dates.includes(day)) {
            mark = '✓';
            markClass = 'cleaned';
          } else if (business.moved_dates.includes(day)) {
            mark = 'M';
            markClass = 'moved';
          }
        }
        const cellStyle = day > daysInMonth ? ' style="background-color: #f5f5f5;"' : '';
        html += `<td class="day-cell"${cellStyle}><span class="${markClass}">${mark}</span></td>`;
      }
      html += `</tr>`;
    });
    html += `</tbody></table><div class="signature-section"><div style="margin-bottom: 12px;"><strong>JOB COACH SIGNATURE:</strong><span class="signature-line"></span></div></div></body></html>`;
    return html;
  }

  private getMonthName(): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[this.data.month - 1];
  }

  static async generateMonthlyReport(month: number, year: number, format: 'html' | 'excel' = 'html'): Promise<string | ArrayBuffer> {
    const template = new CMSBillingTemplate(month, year);
    await template.fetchCleaningData();
    if (format === 'excel') {
      return template.generateExcel();
    } else {
      return template.generateHTML();
    }
  }
}