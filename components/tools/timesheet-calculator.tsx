// TimeSheetCalculator.tsx (Simple with direct export)
import React, { useState } from "react";
import "./../../style/TSC.css";
import UniversalExportButton from "../Export";

// Components
import { WeekTabs } from "./_components/WeekTabs";
import { WeekHeader } from "./_components/WeekHeader";
import { ActionButtons } from "./_components/ActionButtons";
import { TimesheetTable } from "./_components/TimesheetTable";
import { TotalsSection } from "./_components/TotalsSection";
import { DataManagement } from "./_components/DataManagement";

// Hooks and Utils
import { usePersistentTimesheetLogic } from "../../hooks/usePersistentTimesheetLogic";
import { calculateAllWeeksTotal } from "../../utils/timesheetUtils";

// Register the template
import "../../lib/templates/desertTimesheetTemplate";

const TimeSheetCalculator: React.FC = () => {
  const [employeeName, setEmployeeName] = useState('');
  const [payrollPeriod, setPayrollPeriod] = useState<1 | 2>(1);

  const {
    weeks,
    activeWeekId,
    hourlyRate,
    showPayCalculation,
    customDayName,
    setActiveWeekId,
    setHourlyRate,
    setShowPayCalculation,
    setCustomDayName,
    handleRowChange,
    addDay,
    addWeek,
    addFullWeek,
    removeRow,
    removeWeek,
    renameWeek,
    clearAllData,
    exportData,
    importData,
  } = usePersistentTimesheetLogic();

  const activeWeek = weeks.find((week) => week.id === activeWeekId) || weeks[0];
  const totalHours = calculateAllWeeksTotal(weeks);

  return (
    <div className="timesheet-container">
      <h1>Multi-Week Timesheet Calculator</h1>
      
      <WeekTabs
        weeks={weeks}
        activeWeekId={activeWeekId}
        onWeekSelect={setActiveWeekId}
        onWeekRemove={removeWeek}
        onAddWeek={() => addWeek()}
      />
      
      {activeWeek && (
        <>
          <WeekHeader
            week={activeWeek}
            onWeekRename={renameWeek}
            onAddWeekWithSchedule={(weekId) => addWeek(weekId)}
          />
          
          <ActionButtons
            customDayName={customDayName}
            onCustomDayNameChange={setCustomDayName}
            onAddDay={() => addDay(activeWeek.id)}
            onAddFullWeek={() => addFullWeek(activeWeek.id)}
          />
          
          <TimesheetTable
            week={activeWeek}
            onRowChange={handleRowChange}
            onRemoveRow={removeRow}
          />
        </>
      )}

      <TotalsSection
        weeks={weeks}
        totalHours={totalHours}
        hourlyRate={hourlyRate}
        showPayCalculation={showPayCalculation}
        onHourlyRateChange={setHourlyRate}
        onTogglePayCalculation={() => setShowPayCalculation(!showPayCalculation)}
      />

      {/* Export Section */}
      <div className="export-section">
        <h3>📋 Export to Physical Form</h3>
        
        <div className="export-form">
          <div className="form-group">
            <label>Employee Name:</label>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Enter employee name"
            />
          </div>

          <div className="form-group">
            <label>Payroll Period:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value={1}
                  checked={payrollPeriod === 1}
                  onChange={() => setPayrollPeriod(1)}
                />
                1st Half
              </label>
              <label>
                <input
                  type="radio"
                  value={2}
                  checked={payrollPeriod === 2}
                  onChange={() => setPayrollPeriod(2)}
                />
                2nd Half
              </label>
            </div>
          </div>

          <UniversalExportButton
            templateId="desert-area-timesheet"
            templateData={{
              employeeName,
              payrollPeriod,
              weeks
            }}
            filename={`Desert_Timesheet_${employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`}
            size="lg"
            variant="primary"
          />
        </div>
      </div>

      <DataManagement
        onClearAll={clearAllData}
        onExport={exportData}
        onImport={importData}
      />
    </div>
  );
};

export default TimeSheetCalculator;