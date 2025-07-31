// lib/templates/desertTimesheetTemplate.ts - Template for Universal Export Button
import { TemplateRegistry } from '../TemplateRegistry';

export interface DesertTimesheetData {
  employeeName: string;
  payrollPeriod: 1 | 2;
  weeks: Array<{
    id: number;
    name: string;
    rows: Array<{
      day: string;
      starthour: number;
      startminute: number;
      startampm: string;
      endhour: number;
      endminute: number;
      endampm: string;
      breaktime: number;
    }>;
  }>;
}

// HTML Generator for PDF
const generateDesertTimesheetHTML = (data: DesertTimesheetData): string => {
  // Convert timesheet data to form rows
  const formRows = [];
  data.weeks.forEach(week => {
    week.rows.forEach(row => {
      const timeIn = `${row.starthour}:${row.startminute.toString().padStart(2, '0')} ${row.startampm}`;
      const timeOut = `${row.endhour}:${row.endminute.toString().padStart(2, '0')} ${row.endampm}`;
      formRows.push({ day: row.day, timeIn, timeOut });
    });
  });

  return `
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
        .checkbox { width: 12px; height: 12px; border: 1px solid black; display: inline-block; margin-right: 5px; }
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
                <input type="text" value="${data.employeeName}" readonly>
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
                  const rowData = formRows[i] || {};
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
                    <span class="checkbox" ${data.payrollPeriod === 1 ? 'style="background: black;"' : ''}></span>
                    <span style="margin-right: 15px;">1st</span>
                    <span class="checkbox" ${data.payrollPeriod === 2 ? 'style="background: black;"' : ''}></span>
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
};

// CSV Generator for Excel
const generateDesertTimesheetCSV = (data: DesertTimesheetData): string => {
  let csv = `Desert Area Resources & Training - Time Sheet\n`;
  csv += `Employee: ${data.employeeName}\n`;
  csv += `Payroll Period: ${data.payrollPeriod === 1 ? '1st Half' : '2nd Half'}\n\n`;
  
  const headers = [
    'DATE', 'Employee Signature', 'Base Hours', 'Tool Hr', 'Overtime', 'Benefits', 
    'Vacation', 'Sick', 'Holiday', 'Other', 'Job Coach', 'Social Policy', 
    'Time Out', 'Time In', 'Time Out 2', 'Time In 2', 'DATE'
  ];
  
  csv += headers.join(',') + '\n';
  
  // Convert weeks data to rows
  const formRows = [];
  data.weeks.forEach(week => {
    week.rows.forEach(row => {
      const timeIn = `${row.starthour}:${row.startminute.toString().padStart(2, '0')} ${row.startampm}`;
      const timeOut = `${row.endhour}:${row.endminute.toString().padStart(2, '0')} ${row.endampm}`;
      formRows.push({ timeIn, timeOut });
    });
  });
  
  for (let i = 16; i <= 31; i++) {
    const rowData = formRows[i - 16] || {};
    csv += `${i},,,,,,,,,,,,"${rowData.timeOut || ''}","${rowData.timeIn || ''}",,,"${i}"\n`;
  }
  
  csv += '"TOTAL HRS",,,,,,,,,,,,,,,,"31"\n';
  return csv;
};

// Register the template with your Universal Export system
TemplateRegistry.register({
  id: 'desert-area-timesheet',
  name: 'Desert Area Timesheet',
  description: 'Official Desert Area Resources & Training timesheet form',
  formats: ['pdf', 'excel'],
  category: 'timesheet',
  generator: async (data: DesertTimesheetData, format: 'pdf' | 'excel') => {
    if (format === 'pdf') {
      return generateDesertTimesheetHTML(data);
    } else {
      return new Blob([generateDesertTimesheetCSV(data)], { type: 'text/csv' });
    }
  }
});

export { DesertTimesheetData };