// lib/CMSBillingTemplate.ts

export interface BusinessCleaningRecord {
  business_id: number;
  business_name: string;
  address: string;
  cleaned_dates: number[]; // Array of day numbers (1-31) when cleaned
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
      console.log(`📅 Date range: ${startDateStr} to ${endDateStr}`);

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
          cleaned_dates: []
        });
      });

      // Process daily instances to mark cleaned dates
      monthlyData.instances?.forEach((instance: any) => {
        const instanceDate = new Date(instance.instance_date);
        const dayOfMonth = instanceDate.getDate();

        instance.daily_clean_items?.forEach((item: any) => {
          if (item.status === 'cleaned') {
            const record = businessRecords.get(item.business_id);
            if (record && !record.cleaned_dates.includes(dayOfMonth)) {
              record.cleaned_dates.push(dayOfMonth);
            }
          }
        });
      });

      // Convert map to array and sort by business name
      this.data.businesses = Array.from(businessRecords.values())
        .sort((a, b) => a.business_name.localeCompare(b.business_name));

      console.log(`✅ Processed ${this.data.businesses.length} businesses`);
      console.log(`📈 Total cleaning sessions: ${this.getTotalCleaningSessions()}`);

    } catch (error) {
      console.error('❌ Error fetching cleaning data:', error);
      throw error;
    }
  }

  // Generate HTML table for the billing template
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
            margin: 20px;
            font-size: 10px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 16px;
            font-weight: bold;
        }
        .header h2 {
            margin: 5px 0;
            font-size: 14px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 30px;
        }
        th, td {
            border: 1px solid #000;
            padding: 2px;
            text-align: center;
            font-size: 8px;
        }
        .business-name {
            text-align: left;
            width: 150px;
            font-size: 7px;
            padding: 1px 3px;
        }
        .day-header {
            width: 15px;
            font-weight: bold;
            background-color: #f0f0f0;
        }
        .cleaned {
            font-size: 12px;
            font-weight: bold;
        }
        .signature-section {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            border: 1px solid #000;
            width: 200px;
            height: 50px;
            display: inline-block;
            margin: 0 20px;
        }
        .month-year {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin-top: 20px;
        }
        @media print {
            body { margin: 10px; }
            .no-print { display: none; }
        }
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

    // Generate day headers (1-31)
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
      
      // Generate day columns with checkmarks
      for (let day = 1; day <= daysInMonth; day++) {
        const isCleaned = business.cleaned_dates.includes(day);
        html += `<td>${isCleaned ? '<span class="cleaned">✓</span>' : ''}</td>`;
      }
      
      html += `
            </tr>`;
    });

    html += `
        </tbody>
    </table>
    
    <div class="month-year">
        MONTH & YEAR: ${monthName.toUpperCase()} ${this.data.year}
    </div>
    
    <div class="signature-section">
        <div>
            JOB COACH SIGNATURE:
            <div class="signature-box"></div>
        </div>
        <div>
            DATE: _______________
        </div>
    </div>
    
    <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px;">
            Print Billing Report
        </button>
        <button onclick="downloadPDF()" style="padding: 10px 20px; font-size: 14px; margin-left: 10px;">
            Download PDF
        </button>
    </div>
    
    <script>
        function downloadPDF() {
            // This would integrate with a PDF library like jsPDF
            alert('PDF download functionality would be implemented here');
        }
    </script>
</body>
</html>`;

    return html;
  }

  // Generate CSV export
  generateCSV(): string {
    const daysInMonth = new Date(this.data.year, this.data.month, 0).getDate();
    const monthName = this.getMonthName();
    
    let csv = `CMS Billing Report - ${monthName} ${this.data.year}\n`;
    csv += `Generated: ${new Date(this.data.generated_at).toLocaleString()}\n\n`;
    
    // Header row
    csv += 'Business Name,Address';
    for (let day = 1; day <= daysInMonth; day++) {
      csv += `,${day}`;
    }
    csv += ',Total Days\n';
    
    // Business rows
    this.data.businesses.forEach(business => {
      csv += `"${business.business_name}","${business.address}"`;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const isCleaned = business.cleaned_dates.includes(day);
        csv += `,${isCleaned ? 'X' : ''}`;
      }
      
      csv += `,${business.cleaned_dates.length}\n`;
    });
    
    // Summary
    csv += `\nTotal Businesses: ${this.data.businesses.length}\n`;
    csv += `Total Cleaning Sessions: ${this.getTotalCleaningSessions()}\n`;
    
    return csv;
  }

  // Generate JSON export for API consumption
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