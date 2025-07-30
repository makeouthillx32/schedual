// components/UniversalExportButton.tsx
import { useState } from "react";
import { useTheme } from "@/app/provider";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";

// Universal template interface - NAMED EXPORT
export interface ExportTemplate {
  id: string;
  name: string;
  data: any;
  generator: (data: any, format: 'excel' | 'pdf') => Promise<string | Blob>;
}

// Props interface
interface UniversalExportButtonProps {
  template: ExportTemplate;
  filename?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

// DEFAULT EXPORT FUNCTION
export default function UniversalExportButton({
  template,
  filename,
  disabled = false,
  className = "",
  size = 'md',
  variant = 'primary'
}: UniversalExportButtonProps) {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>('excel');

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

  const handleExport = async (format: 'excel' | 'pdf') => {
    setIsExporting(true);
    setShowDropdown(false);

    try {
      console.log(`🔄 Exporting ${template.name} as ${format.toUpperCase()}`);
      
      const result = await template.generator(template.data, format);
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const baseFilename = filename || `${template.name}_${timestamp}`;
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
      } else if (typeof result === 'string') {
        // String content (HTML, CSV, etc.)
        const mimeType = format === 'excel' ? 'text/csv' : 'application/pdf';
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
      
    } catch (error) {
      console.error(`❌ Error exporting ${template.name}:`, error);
      alert(`Failed to export ${template.name}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative inline-block">
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
      >
        <Download size={16} className="mr-2" />
        {isExporting ? `Exporting...` : `Export ${template.name}`}
        <ChevronDown size={14} className="ml-2" />
      </button>

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
            <button
              onClick={() => handleExport('excel')}
              className={`w-full px-4 py-2 text-left text-sm flex items-center hover:bg-[hsl(var(--accent))] transition-colors ${
                isDark ? "text-[hsl(var(--foreground))]" : "text-gray-700"
              }`}
            >
              <FileSpreadsheet size={16} className="mr-2 text-green-600" />
              Export as Excel (.xlsx)
            </button>
            
            <button
              onClick={() => handleExport('pdf')}
              className={`w-full px-4 py-2 text-left text-sm flex items-center hover:bg-[hsl(var(--accent))] transition-colors ${
                isDark ? "text-[hsl(var(--foreground))]" : "text-gray-700"
              }`}
            >
              <FileText size={16} className="mr-2 text-red-600" />
              Export as PDF (.pdf)
            </button>
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