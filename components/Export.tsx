// components/Export.tsx
import { useState } from "react";
import { useTheme } from "@/app/provider";
import { Download, FileSpreadsheet, FileText, ChevronDown, Calendar, Clock, DollarSign, Building2, FileBarChart, Printer } from "lucide-react";

// Universal Export Template Interface
export interface ExportTemplate {
  id: string;
  name: string;
  description?: string;
  data: any;
  generator: (data: any, format: 'excel' | 'pdf') => Promise<string | Blob>;
  supportedFormats?: ('excel' | 'pdf')[];
  category?: 'billing' | 'timesheet' | 'calendar' | 'punchcard' | 'report' | 'other';
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

// Template Registry - Central hub for all templates
export class TemplateRegistry {
  private static templates: Map<string, ExportTemplate> = new Map();

  // Register a template
  static register(template: ExportTemplate) {
    this.templates.set(template.id, template);
    console.log(`📝 Registered template: ${template.name} (${template.id})`);
  }

  // Get template by ID
  static get(id: string): ExportTemplate | undefined {
    return this.templates.get(id);
  }

  // Get all templates
  static getAll(): ExportTemplate[] {
    return Array.from(this.templates.values());
  }

  // Get templates by category
  static getByCategory(category: string): ExportTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  // Check if template exists
  static has(id: string): boolean {
    return this.templates.has(id);
  }
}

// Pre-register existing templates
export const registerExistingTemplates = () => {
  // CMS Billing Template
  TemplateRegistry.register({
    id: 'cms-billing',
    name: 'CMS Billing Report',
    description: 'Monthly cleaning billing report with all business data',
    data: null, // Will be set dynamically
    category: 'billing',
    icon: Building2,
    supportedFormats: ['excel', 'pdf'],
    generator: async (data: any, format: 'excel' | 'pdf') => {
      const { CMSBillingTemplate } = await import('@/lib/CMSBillingTemplate');
      const { businesses, month, year } = data;
      return await CMSBillingTemplate.generateReport(businesses, month, year, format);
    }
  });

  // Coach Client Timesheet
  TemplateRegistry.register({
    id: 'coach-client-timesheet',
    name: 'Coach Client Timesheet',
    description: 'Timesheet template for coaches with client specializations',
    data: null,
    category: 'timesheet',
    icon: Clock,
    supportedFormats: ['excel'],
    generator: async (data: any, format: 'excel' | 'pdf') => {
      const { CoachClientTimesheetTemplate } = await import('@/lib/timesheet-templates/CoachClientTimesheetTemplate');
      const { currentDate, coachInfo, clients } = data;
      const workbook = await CoachClientTimesheetTemplate.createTimesheetTemplate(currentDate, coachInfo, clients);
      return await workbook.xlsx.writeBuffer();
    }
  });

  // Coach Personal Timesheet
  TemplateRegistry.register({
    id: 'coach-personal-timesheet',
    name: 'Coach Personal Timesheet',
    description: 'Personal timesheet template for job coaches',
    data: null,
    category: 'timesheet',
    icon: Clock,
    supportedFormats: ['excel'],
    generator: async (data: any, format: 'excel' | 'pdf') => {
      const { JobCoachPersonalTimesheetTemplate } = await import('@/lib/timesheet-templates/JobCoachPersonalTimesheetTemplate');
      const { currentDate, personalCoachInfo } = data;
      const workbook = await JobCoachPersonalTimesheetTemplate.createPersonalTimesheet(currentDate, personalCoachInfo);
      return await workbook.xlsx.writeBuffer();
    }
  });

  // Client Personal Timesheet
  TemplateRegistry.register({
    id: 'client-personal-timesheet',
    name: 'Client Personal Timesheet',
    description: 'Specialized timesheet template for clients',
    data: null,
    category: 'timesheet',
    icon: Clock,
    supportedFormats: ['excel'],
    generator: async (data: any, format: 'excel' | 'pdf') => {
      const { ClientPersonalTimesheetTemplate } = await import('@/lib/timesheet-templates/ClientPersonalTimesheetTemplate');
      const { currentDate, clientInfo } = data;
      const workbook = await ClientPersonalTimesheetTemplate.createSpecializedClientTimesheet(currentDate, clientInfo);
      return await workbook.xlsx.writeBuffer();
    }
  });

  // Calendar Export Template
  TemplateRegistry.register({
    id: 'calendar-export',
    name: 'Calendar Export',
    description: 'Export calendar events with role-based filtering',
    data: null,
    category: 'calendar',
    icon: Calendar,
    supportedFormats: ['excel'],
    generator: async (data: any, format: 'excel' | 'pdf') => {
      const { CalendarTemplateUtils } = await import('@/lib/calendar-templates/CalendarTemplateUtils');
      const { currentDate, filteredEvents, userRole, userInfo } = data;
      const workbook = await CalendarTemplateUtils.createStyledCalendar(currentDate, filteredEvents, userRole, userInfo);
      return await workbook.xlsx.writeBuffer();
    }
  });

  // Punch Card Template
  TemplateRegistry.register({
    id: 'punchcard-pdf',
    name: 'Punch Card PDF',
    description: 'Generate printable punch card templates',
    data: null,
    category: 'punchcard',
    icon: Printer,
    supportedFormats: ['pdf'],
    generator: async (data: any, format: 'excel' | 'pdf') => {
      // This would integrate with your existing PDFGenerator component
      const { templateType, quantity } = data;
      // Return HTML string for PDF generation
      return `<html><body>Punch Card PDF for ${templateType} - Quantity: ${quantity}</body></html>`;
    }
  });

  console.log(`✅ Registered ${TemplateRegistry.getAll().length} export templates`);
};

// Props interface
interface UniversalExportButtonProps {
  templateId: string;
  templateData?: any;
  filename?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  onExportStart?: () => void;
  onExportComplete?: (success: boolean) => void;
  showTemplateInfo?: boolean;
}

// Main Export Component
export default function UniversalExportButton({
  templateId,
  templateData,
  filename,
  disabled = false,
  className = "",
  size = 'md',
  variant = 'primary',
  onExportStart,
  onExportComplete,
  showTemplateInfo = false
}: UniversalExportButtonProps) {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get template from registry
  const template = TemplateRegistry.get(templateId);

  if (!template) {
    console.error(`❌ Template not found: ${templateId}`);
    return (
      <div className="text-red-500 text-sm p-2 border border-red-300 rounded">
        Template "{templateId}" not found. Please check the template ID.
      </div>
    );
  }

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  // Variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/80";
      case 'outline':
        return "border border-[hsl(var(--border))] bg-transparent text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]";
      default:
        return "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] hover:bg-[hsl(var(--sidebar-primary))]/90";
    }
  };

  // Get supported formats for this template
  const supportedFormats = template.supportedFormats || ['excel', 'pdf'];

  // Handle export
  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!supportedFormats.includes(format)) {
      setError(`${format.toUpperCase()} format not supported for this template`);
      return;
    }

    setIsExporting(true);
    setShowDropdown(false);
    setError(null);
    onExportStart?.();

    try {
      console.log(`🔄 Exporting ${template.name} as ${format.toUpperCase()}`);
      
      // Merge provided data with template data
      const exportData = { ...template.data, ...templateData };
      
      if (!exportData || Object.keys(exportData).length === 0) {
        throw new Error('No data provided for export');
      }

      const result = await template.generator(exportData, format);
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const baseFilename = filename || `${template.name.replace(/\s+/g, '_')}_${timestamp}`;
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const fullFilename = `${baseFilename}.${extension}`;

      // Handle download based on result type
      if (result instanceof Blob) {
        // Direct blob download (for Excel/PDF libraries)
        const url = URL.createObjectURL(result);
        const a = document.createElement('a');
        a.href = url;
        a.download = fullFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (result instanceof ArrayBuffer) {
        // ArrayBuffer (Excel workbooks)
        const blob = new Blob([result], { 
          type: format === 'excel' 
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fullFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (typeof result === 'string') {
        // String content (HTML for PDF, CSV, etc.)
        const mimeType = format === 'excel' ? 'text/csv' : 'text/html';
        const blob = new Blob([result], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fullFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      console.log(`✅ ${template.name} exported successfully as ${format.toUpperCase()}`);
      onExportComplete?.(true);
      
    } catch (error) {
      console.error(`❌ Error exporting ${template.name}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setError(errorMessage);
      onExportComplete?.(false);
    } finally {
      setIsExporting(false);
    }
  };

  // Get template icon
  const TemplateIcon = template.icon || FileBarChart;

  return (
    <div className="relative inline-block">
      {/* Template Info (Optional) */}
      {showTemplateInfo && (
        <div className="mb-2 p-2 bg-[hsl(var(--muted))] rounded text-xs">
          <div className="flex items-center gap-1 font-medium">
            <TemplateIcon size={12} />
            {template.name}
          </div>
          {template.description && (
            <div className="text-[hsl(var(--muted-foreground))] mt-1">
              {template.description}
            </div>
          )}
        </div>
      )}

      {/* Main Export Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={disabled || isExporting}
        className={`
          ${sizeClasses[size]}
          ${getVariantClasses()}
          rounded transition-colors font-medium flex items-center
          ${disabled || isExporting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `}
        title={template.description}
      >
        <TemplateIcon size={16} className="mr-2" />
        {isExporting ? `Exporting...` : `Export ${template.name}`}
        <ChevronDown size={14} className="ml-2" />
      </button>

      {/* Error Display */}
      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600 z-50 max-w-xs">
          {error}
        </div>
      )}

      {/* Dropdown Menu */}
      {showDropdown && !disabled && !isExporting && (
        <div
          className={`absolute top-full left-0 mt-1 w-48 rounded-md shadow-lg z-50 ${
            isDark
              ? "bg-[hsl(var(--card))] border border-[hsl(var(--border))]"
              : "bg-white border border-[hsl(var(--border))]"
          }`}
        >
          <div className="py-1">
            {supportedFormats.includes('excel') && (
              <button
                onClick={() => handleExport('excel')}
                className={`w-full px-4 py-2 text-left text-sm flex items-center hover:bg-[hsl(var(--accent))] transition-colors ${
                  isDark ? "text-[hsl(var(--foreground))]" : "text-gray-700"
                }`}
              >
                <FileSpreadsheet size={16} className="mr-2 text-green-600" />
                Export as Excel (.xlsx)
              </button>
            )}
            
            {supportedFormats.includes('pdf') && (
              <button
                onClick={() => handleExport('pdf')}
                className={`w-full px-4 py-2 text-left text-sm flex items-center hover:bg-[hsl(var(--accent))] transition-colors ${
                  isDark ? "text-[hsl(var(--foreground))]" : "text-gray-700"
                }`}
              >
                <FileText size={16} className="mr-2 text-red-600" />
                Export as PDF (.pdf)
              </button>
            )}

            {/* Template Info in Dropdown */}
            {supportedFormats.length > 1 && (
              <div className="px-4 py-2 text-xs text-[hsl(var(--muted-foreground))] border-t border-[hsl(var(--border))]">
                Category: {template.category || 'Other'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

// Template Builder Helper Functions
export const TemplateBuilder = {
  // Create a billing template
  billing: (businesses: any[], month: number, year: number) => ({
    templateId: 'cms-billing',
    templateData: { businesses, month, year }
  }),

  // Create a timesheet template
  timesheet: (type: 'coach-client' | 'coach-personal' | 'client-personal', data: any) => ({
    templateId: `${type}-timesheet`,
    templateData: data
  }),

  // Create a calendar template
  calendar: (currentDate: Date, events: any[], userRole: string, userInfo: any) => ({
    templateId: 'calendar-export',
    templateData: { currentDate, filteredEvents: events, userRole, userInfo }
  }),

  // Create a punchcard template
  punchcard: (templateType: string, quantity: number) => ({
    templateId: 'punchcard-pdf',
    templateData: { templateType, quantity }
  })
};

// Auto-register templates when module loads
if (typeof window !== 'undefined') {
  registerExistingTemplates();
}