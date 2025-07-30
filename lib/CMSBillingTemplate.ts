// lib/CMSBillingTemplate.ts - Enhanced to match physical template

export interface BusinessCleaningRecord {
  business_id: number;
  business_name: string;
  address: string;
  cleaned_dates: number[]; // Array of day numbers when cleaned
  moved_dates: number[]; // Array of day numbers when moved
  added_dates: number[]; // Array of day numbers when added on-the-fly
}

export interface BillingTemplateData {
  month: number; // 1-12
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

  // Fetch cleaning data for the specified month/year
  async fetchCleaningData(): Promise<void> {
    try {
      const startDate = new Date(this.data.year, this.data.month - 1, 1);
      const endDate = new Date(this.data.year, this.data.month, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      console.log(`📊 Fetching billing data for ${this.getMonthName()} ${this.data.year}`);

      // Fetch all businesses first
      const businessesRes = await fetch('/api/schedule/businesses');
      if (!businessesRes.ok) throw new Error('Failed to fetch businesses');
      const allBusinesses = await businessesRes.json();

      // Fetch all daily instances for the month
      const instancesRes = await fetch(
        `/api/schedule/daily-instances/monthly?start_date=${startDateStr}&end_date=${endDateStr}`
      );
      
      if (!instancesRes.ok) throw new Error('Failed to fetch monthly instances');
      const monthlyData = await instancesRes.json();

      // Process the data to create business cleaning records
      const businessRecords = new Map<number, BusinessCleaningRecord>();

      // Initialize all businesses with empty cleaning records
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

      // Process daily instances to mark cleaned/moved/added dates
      monthlyData.instances?.forEach((instance: any) => {
        const instanceDate = new Date(instance.instance_date);
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
            
            // Check if this was added on-the-fly
            if (item.is_added && item.status === 'cleaned') {
              if (!record.added_dates.includes(dayOfMonth)) {
                record.added_dates.push(dayOfMonth);
              }
            }
          }
        });
      });

      // Convert map to array and sort by business name
      this.data.businesses = Array.from(businessRecords.values())
        .sort((a, b) => a.business_name.localeCompare(b.business_name));

      console.log(`✅ Processed ${this.data.businesses.length} businesses`);

    } catch (error) {
      console.error('❌ Error fetching cleaning data:', error);
      throw error;
    }
  }

  // Generate HTML table that matches the physical template exactly
  generateHTML(): string {
    const daysInMonth = new Date(this.data.year, this.data.month, 0).getDate();
    const monthName = this.getMonthName();
    
    let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CMS Billing - ${monthName} ${this.data.year}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 15px;
            font-size: 11px;
            background: white;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
            border: 2px solid #000;
            padding: 8px;
        }
        .header h1 {
            margin: 0;
            font-size: 14px;
            font-weight: bold;
            text-decoration: underline;
        }
        .month-year-header {
            text-align: left;
            font-size: 12px;
            font-weight: bold;
            margin: 10px 0;
            text-decoration: underline;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
            border: 2px solid #000;
        }
        th, td {
            border: 1px solid #000;
            padding: 1px;
            text-align: center;
            font-size: 9px;
            height: 18px;
            vertical-align: middle;
        }
        .business-name {
            text-align: left;
            width: 120px;
            font-size: 8px;
            padding: 2px 4px;
            font-weight: bold;
            writing-mode: vertical-lr;
            text-orientation: mixed;
        }
        .day-header {
            width: 18px;
            font-weight: bold;
            background-color: #f5f5f5;
            font-size: 10px;
        }
        .cleaned {
            color: #006400;
            font-size: 14px;
            font-weight: bold;
        }
        .moved {
            color: #FF6600;
            font-size: 14px;
            font-weight: bold;
        }
        .added {
            color: #0066CC;
            font-size: 14px;
            font-weight: bold;
        }
        .signature-section {
            margin-top: 20px;
            text-align: left;
            border: 2px solid #000;
            padding: 10px;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            width: 200px;
            height: 20px;
            display: inline-block;
            margin-left: 10px;
        }
        .legend {
            margin: 15px 0;
            border: 1px solid #000;
            padding: 8px;
            background-color: #f9f9f9;
        }
        .legend h3 {
            margin: 0 0 5px 0;
            font-size: 11px;
            text-decoration: underline;
        }
        .legend-item {
            margin: 3px 0;
            font-size: 10px;
        }
        @media print {
            body { margin: 8px; font-size: 10px; }
            .no-print { display: none; }
            table { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>MONTHLY CLEANING REPORT FOR BILLING</h1>
    </div>
    
    <div class="month-year-header">
        MONTH & YEAR: ${monthName.toUpperCase()} ${this.data.year}
    </div>
    
    <div class="legend">
        <h3>LEGEND:</h3>
        <div class="legend-item"><span class="cleaned">✓</span> = Cleaned</div>
        <div class="legend-item"><span class="moved">M</span> = Moved to another day</div>
        <div class="legend-item"><span class="added">+</span> = Added on-the-fly</div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th class="business-name">BUSINESS NAME</th>`;

    // Generate day headers (1-31) - vertical like the image
    for (let day = 1; day <= daysInMonth; day++) {
      html += `<th class="day-header">${day}</th>`;
    }
    
    html += `
            </tr>
        </thead>
        <tbody>`;

    // Generate business rows
    this.data.businesses.forEach(business => {
      html += `
            <tr>
                <td class="business-name">${business.business_name}</td>`;
      
      // Generate day columns with different colored marks
      for (let day = 1; day <= daysInMonth; day++) {
        const isCleaned = business.cleaned_dates.includes(day);
        const isMoved = business.moved_dates.includes(day);
        const isAdded = business.added_dates.includes(day);
        
        let mark = '';
        if (isAdded) {
          mark = '<span class="added">+</span>'; // Blue + for added
        } else if (isCleaned) {
          mark = '<span class="cleaned">✓</span>'; // Green checkmark for cleaned
        } else if (isMoved) {
          mark = '<span class="moved">M</span>'; // Orange M for moved
        }
        
        html += `<td>${mark}</td>`;
      }
      
      html += `
            </tr>`;
    });

    html += `
        </tbody>
    </table>
    
    <div class="signature-section">
        <div style="margin-bottom: 15px;">
            <strong>JOB COACH SIGNATURE:</strong>
            <span class="signature-line"></span>
        </div>
        <div>
            <strong>DATE:</strong>
            <span class="signature-line"></span>
        </div>
    </div>
    
    <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
            📄 Print Report
        </button>
        <button onclick="downloadCSV()" style="padding: 10px 20px; font-size: 14px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
            📊 Download CSV
        </button>
    </div>
    
    <script>
        function downloadCSV() {
            const csvContent = generateCSVContent();
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'cms_billing_${monthName}_${this.data.year}.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }
        
        function generateCSVContent() {
            return \`${this.generateCSV().replace(/`/g, '\\`')}\`;
        }
    </script>
</body>
</html>`;

    return html;
  }

  // Generate CSV export with colored status indicators
  generateCSV(): string {
    const daysInMonth = new Date(this.data.year, this.data.month, 0).getDate();
    const monthName = this.getMonthName();
    
    let csv = `CMS Billing Report - ${monthName} ${this.data.year}\n`;
    csv += `Generated: ${new Date(this.data.generated_at).toLocaleString()}\n`;
    csv += `Legend: C=Cleaned M=Moved A=Added\n\n`;
    
    // Header row
    csv += 'Business Name,Address';
    for (let day = 1; day <= daysInMonth; day++) {
      csv += `,${day}`;
    }
    csv += ',Total Cleaned,Total Moved,Total Added\n';
    
    // Business rows
    this.data.businesses.forEach(business => {
      csv += `"${business.business_name}","${business.address}"`;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const isCleaned = business.cleaned_dates.includes(day);
        const isMoved = business.moved_dates.includes(day);
        const isAdded = business.added_dates.includes(day);
        
        let mark = '';
        if (isAdded) mark = 'A';
        else if (isCleaned) mark = 'C';
        else if (isMoved) mark = 'M';
        
        csv += `,${mark}`;
      }
      
      csv += `,${business.cleaned_dates.length}`;
      csv += `,${business.moved_dates.length}`;
      csv += `,${business.added_dates.length}\n`;
    });
    
    // Summary
    const totalCleaned = this.data.businesses.reduce((sum, b) => sum + b.cleaned_dates.length, 0);
    const totalMoved = this.data.businesses.reduce((sum, b) => sum + b.moved_dates.length, 0);
    const totalAdded = this.data.businesses.reduce((sum, b) => sum + b.added_dates.length, 0);
    
    csv += `\nSUMMARY\n`;
    csv += `Total Businesses: ${this.data.businesses.length}\n`;
    csv += `Total Cleaning Sessions: ${totalCleaned}\n`;
    csv += `Total Moved Sessions: ${totalMoved}\n`;
    csv += `Total Added Sessions: ${totalAdded}\n`;
    
    return csv;
  }

  // Generate JSON export
  generateJSON(): string {
    return JSON.stringify(this.data, null, 2);
  }

  // Helper methods
  private getMonthName(): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[this.data.month - 1];
  }

  private getTotalCleaningSessions(): number {
    return this.data.businesses.reduce((total, business) => {
      return total + business.cleaned_dates.length;
    }, 0);
  }

  // Static method to create and generate template
  static async generateMonthlyReport(month: number, year: number, format: 'html' | 'csv' | 'json' = 'html'): Promise<string> {
    const template = new CMSBillingTemplate(month, year);
    await template.fetchCleaningData();
    
    switch (format) {
      case 'csv':
        return template.generateCSV();
      case 'json':
        return template.generateJSON();
      default:
        return template.generateHTML();
    }
  }
}