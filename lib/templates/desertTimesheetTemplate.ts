// lib/DesertTimesheetTemplate.ts - Following your CMSBillingTemplate pattern
import * as XLSX from 'sheetjs-style';

export interface TimesheetRowData {
  day: string;
  starthour: number;
  startminute: number;
  startampm: string;
  endhour: number;
  endminute: number;
  endampm: string;
  breaktime: number;
}

export interface TimesheetWeekData {
  id: number;
  name: string;
  rows: TimesheetRowData[];
}

export interface DesertTimesheetData {
  employeeName: string;
  payrollPeriod: 1 | 2;
  weeks: TimesheetWeekData[];
  generated_at: string;
  generated_by?: string;
}

export class DesertTimesheetTemplate {
  private data: DesertTimesheetData;

  constructor(employeeName: string, payrollPeriod: 1 | 2, weeks: TimesheetWeekData[]) {
    this.data = {
      employeeName,
      payrollPeriod,
      weeks,
      generated_at: new Date().toISOString()
    };
  }

  static async generateReport(
    employeeName: string,
    payrollPeriod: 1 | 2,
    weeks: TimesheetWeekData[],
    format: 'excel' | 'pdf'
  ): Promise<Blob | string> {
    console.log(`🔧 Generating Desert Timesheet ${format} for ${employeeName} - Period ${payrollPeriod}`);
    const template = new DesertTimesheetTemplate(employeeName, payrollPeriod, weeks);
    
    if (format === 'excel') {
      const arrayBuffer = template.generateExcel();
      return new Blob([arrayBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    } else {
      return template.generateHTML();
    }
  }

  private convertTimeToString(hour: number, minute: number, ampm: string): string {
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }

  private calculateHours(row: TimesheetRowData): number {
    const convertTo24Hour = (hour: number, ampm: string): number => {
      if (ampm === "PM" && hour !== 12) return hour + 12;
      if (ampm === "AM" && hour === 12) return 0;
      return hour;
    };

    const startHour = convertTo24Hour(row.starthour, row.startampm);
    const endHour = convertTo24Hour(row.endhour, row.endampm);
    const totalMinutes = endHour * 60 + row.endminute - (startHour * 60 + row.startminute) - row.breaktime;
    return totalMinutes > 0 ? totalMinutes / 60 : 0;
  }

  generateExcel(): ArrayBuffer {
    console.log('📊 Generating Desert Timesheet Excel with styled formatting');
    
    // Prepare timesheet rows data
    const timesheetRows: Array<{
      date: string;
      timeIn: string;
      timeOut: string;
      totalHours: number;
    }> = [];

    this.data.weeks.forEach(week => {
      week.rows.forEach(row => {
        timesheetRows.push({
          date: row.day,
          timeIn: this.convertTimeToString(row.starthour, row.startminute, row.startampm),
          timeOut: this.convertTimeToString(row.endhour, row.endminute, row.endampm),
          totalHours: this.calculateHours(row)
        });
      });
    });

    const wb = XLSX.utils.book_new();
    const wsData: any[][] = [];

    // Header rows
    wsData.push(['DESERT AREA RESOURCES & TRAINING']);
    wsData.push(['TIME SHEET']);
    wsData.push(['']); // Empty row
    wsData.push([`Employee's Name: ${this.data.employeeName}`, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', `Payroll Period: ${this.data.payrollPeriod === 1 ? '1st' : '2nd'} Half`]);
    wsData.push(['']); // Empty row

    // Column headers
    const headers = [
      'DATE',
      'Employee Signature & Date',
      'Base Hours',
      'Late Scheduled Tool Hr',
      'OVERTIME HOURS',
      'TOTAL BENEFIT HOURS',
      'Vacation Leave',
      'Sick Leave',
      'Holiday',
      'Other',
      'Job Coach JAY Team',
      'Thru Social Policy',
      'Time Out',
      'Time In',
      'Time Out',
      'Time In',
      'DATE'
    ];
    wsData.push(headers);

    // Data rows for dates 16-31 (matching your physical form)
    for (let date = 16; date <= 31; date++) {
      const rowData = timesheetRows.find(r => r.date.toLowerCase().includes(date.toString())) || 
                     timesheetRows[date - 16] || {};
      
      wsData.push([
        date,           // DATE
        '',             // Employee Signature & Date
        '',             // Base Hours  
        '',             // Late Scheduled Tool Hr
        '',             // OVERTIME HOURS
        '',             // TOTAL BENEFIT HOURS
        '',             // Vacation Leave
        '',             // Sick Leave
        '',             // Holiday
        '',             // Other
        '',             // Job Coach JAY Team
        '',             // Thru Social Policy
        rowData.timeOut || '',  // Time Out
        rowData.timeIn || '',   // Time In
        '',             // Time Out (2nd)
        '',             // Time In (2nd)
        date            // DATE (repeat)
      ]);
    }

    // Total row
    wsData.push(['TOTAL HRS', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '31']);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    const colWidths = [
      { wch: 6 },   // DATE
      { wch: 12 },  // Employee Signature
      { wch: 8 },   // Base Hours
      { wch: 10 },  // Tool Hr
      { wch: 10 },  // Overtime
      { wch: 12 },  // Benefits
      { wch: 10 },  // Vacation
      { wch: 8 },   // Sick
      { wch: 8 },   // Holiday
      { wch: 8 },   // Other
      { wch: 10 },  // Job Coach
      { wch: 10 },  // Social Policy
      { wch: 8 },   // Time Out
      { wch: 8 },   // Time In
      { wch: 8 },   // Time Out 2
      { wch: 8 },   // Time In 2
      { wch: 6 }    // DATE
    ];
    ws['!cols'] = colWidths;

    // Apply styling
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) {
          ws[cellAddress] = { v: '', t: 's' };
        }

        // Default cell styling
        ws[cellAddress].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          },
          alignment: { horizontal: 'center', vertical: 'middle' }
        };

        // Header styling
        if (R === 0) { // Main title
          ws[cellAddress].s.font = { bold: true, size: 16 };
          ws[cellAddress].s.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (R === 1) { // Subtitle
          ws[cellAddress].s.font = { bold: true, size: 14 };
          ws[cellAddress].s.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (R === 3) { // Employee info row
          ws[cellAddress].s.font = { bold: true, size: 10 };
          ws[cellAddress].s.alignment = { horizontal: 'left', vertical: 'middle' };
        } else if (R === 5) { // Column headers
          ws[cellAddress].s.font = { bold: true, size: 9 };
          ws[cellAddress].s.fill = { fgColor: { rgb: 'F0F0F0' } };
          ws[cellAddress].s.border = {
            top: { style: 'medium', color: { rgb: '000000' } },
            bottom: { style: 'medium', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          };
        } else if (R === wsData.length - 1) { // Total row
          ws[cellAddress].s.font = { bold: true, size: 10 };
          ws[cellAddress].s.fill = { fgColor: { rgb: 'E0E0E0' } };
        }
      }
    }

    // Merge cells for headers
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 16 } }, // Main title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 16 } }  // Subtitle
    ];

    // Row heights
    const rowHeights: any[] = [];
    for (let i = 0; i < wsData.length; i++) {
      if (i === 0 || i === 1) {
        rowHeights.push({ hpt: 24 }); // Header rows
      } else if (i === 2 || i === 4) {
        rowHeights.push({ hpt: 6 });  // Empty rows
      } else if (i === 5) {
        rowHeights.push({ hpt: 60 }); // Column header row (tall for rotated text effect)
      } else {
        rowHeights.push({ hpt: 18 }); // Data rows
      }
    }
    ws['!rows'] = rowHeights;

    // Page setup
    ws['!margins'] = { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0, footer: 0 };
    ws['!pageSetup'] = { 
      paperSize: 1, // Letter size
      orientation: 'landscape', 
      fitToWidth: 1, 
      fitToHeight: 0 
    };

    XLSX.utils.book_append_sheet(wb, ws, 'Desert Timesheet');
    console.log('✅ Desert Timesheet Excel generation complete');
    return XLSX.write(wb, { 
      bookType: 'xlsx', 
      type: 'array', 
      cellStyles: true, 
      cellNF: false, 
      sheetStubs: false 
    });
  }

  generateHTML(): string {
    console.log('🌐 Generating Desert Timesheet HTML');
    
    // Prepare timesheet rows
    const timesheetRows: Array<{
      date: string;
      timeIn: string;
      timeOut: string;
      totalHours: number;
    }> = [];

    this.data.weeks.forEach(week => {
      week.rows.forEach(row => {
        timesheetRows.push({
          date: row.day,
          timeIn: this.convertTimeToString(row.starthour, row.startminute, row.startampm),
          timeOut: this.convertTimeToString(row.endhour, row.endminute, row.endampm),
          totalHours: this.calculateHours(row)
        });
      });
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Desert Area Resources & Training - Time Sheet</title>
    <style>
        @page { size: 8.5in 11in; margin: 0.5in; }
        body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 0; }
        .container { width: 100%; border: 2px solid black; padding: 10px; }
        .header { text-align: center; margin-bottom: 15px; }
        .header h1 { font-size: 16px; font-weight: bold; margin: 0; text-transform: uppercase; }
        .header h2 { font-size: 14px; font-weight: bold; margin: 5px 0 0 0; text-transform: uppercase; }
        .form-row { display: flex; margin-bottom: 8px; }
        .form-field { margin-right: 20px; display: flex; align-items: center; }
        .form-field label { font-weight: bold; margin-right: 5px; text-transform: uppercase; font-size: 9px; }
        .form-field input { border: none; border-bottom: 1px solid black; background: transparent; padding: 2px; min-width: 120px; font-size: 10px; }
        .time-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .time-table th, .time-table td { border: 1px solid black; padding: 4px; text-align: center; font-size: 9px; }
        .time-table th { background-color: #f0f0f0; font-weight: bold; text-transform: uppercase; }
        .rotated-header { writing-mode: vertical-rl; text-orientation: mixed; white-space: nowrap; min-width: 25px; height: 120px; }
        .date-column { width: 30px; }
        .signature-section { display: flex; justify-content: space-between; margin-top: 20px; align-items: flex-end; }
        .signature-field { flex: 1; margin: 0 20px; }
        .signature-field label { display: block; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; font-size: 9px; }
        .signature-line { border-bottom: 1px solid black; height: 20px; width: 100%; }
        .total-row { background-color: #f5f5f5; font-weight: bold; }
        .checkbox { width: 12px; height: 12px; border: 1px solid black; display: inline-block; margin-right: 5px; ${this.data.payrollPeriod === 1 ? 'background: black;' : ''} }
        .checkbox2 { width: 12px; height: 12px; border: 1px solid black; display: inline-block; margin-right: 5px; ${this.data.payrollPeriod === 2 ? 'background: black;' : ''} }
        .notes { margin-top: 15px; font-size: 8px; line-height: 1.3; }
        @media print { body { print-color-adjust: exact; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Desert Area Resources & Training</h1>
            <h2>Time Sheet</h2>
        </div>
        
        <div class="form-row">
            <div class="form-field">
                <label>Employee's Name:</label>
                <input type="text" value="${this.data.employeeName}" readonly>
            </div>
            <div class="form-field">
                <label>Type/Erns:</label>
                <input type="text" value="" readonly>
            </div>
        </div>
        
        <table class="time-table">
            <thead>
                <tr>
                    <th class="date-column">DATE</th>
                    <th class="rotated-header">Employee's Signature & date</th>
                    <th class="rotated-header">Base Hours</th>
                    <th class="rotated-header">late scheduled in Tool Hr (Hours)</th>
                    <th class="rotated-header">OVERTIME HOURS</th>
                    <th class="rotated-header">TOTAL BENEFIT HOURS</th>
                    <th class="rotated-header">Vacation Leave</th>
                    <th class="rotated-header">Sick Leave</th>
                    <th class="rotated-header">Holiday</th>
                    <th class="rotated-header">Other</th>
                    <th class="rotated-header">Job Coach JAY Team</th>
                    <th class="rotated-header">Thru Social Policy</th>
                    <th class="rotated-header">Time Out</th>
                    <th class="rotated-header">Time In</th>
                    <th class="rotated-header">Time Out</th>
                    <th class="rotated-header">Time In</th>
                    <th class="date-column">DATE</th>
                </tr>
            </thead>
            <tbody>
                ${Array.from({ length: 15 }, (_, i) => {
                  const date = i + 16;
                  const rowData = timesheetRows.find(r => r.date.toLowerCase().includes(date.toString())) || 
                                 timesheetRows[i] || {};
                  return `
                    <tr>
                        <td>${date}</td>
                        <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                        <td>${rowData.timeOut || ''}</td>
                        <td>${rowData.timeIn || ''}</td>
                        <td></td><td></td>
                        <td>${date}</td>
                    </tr>`;
                }).join('')}
                <tr class="total-row">
                    <td><strong>TOTAL<br>HRS</strong></td>
                    <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    <td><strong>31</strong></td>
                </tr>
            </tbody>
        </table>
        
        <div class="signature-section">
            <div class="signature-field">
                <label>Supervisor's Signature & date</label>
                <div class="signature-line"></div>
                <small>I certify that the above information is true and correct to the best of my knowledge.</small>
            </div>
            <div class="signature-field">
                <label>Payroll Period:</label>
                <div style="margin-top: 10px;">
                    <span class="checkbox"></span>
                    <span style="margin-right: 15px;">1st</span>
                    <span class="checkbox2"></span>
                    <span>2nd</span>
                </div>
            </div>
        </div>
        
        <div class="notes">
            <p><strong>* Circle the above information on first and received as any break except.</strong></p>
            <p><strong>4) Over 0.5 hr per day break must be deducted if employees scheduled.</strong></p>
            <p><strong>5) Work hours that are:</strong><br>
            - Over 5 hrs schedule - deduct 30 minutes<br>
            - Over 6 hrs schedule - deduct 1 hour</p>
            <p><strong>6) Over 40 hrs in 1 week - overtime is at time and a half hours worked over 40 hours.</strong></p>
        </div>
    </div>
</body>
</html>`;

    console.log('✅ Desert Timesheet HTML generation complete');
    return html;
  }
}