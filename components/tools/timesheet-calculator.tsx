// TimeSheetCalculator.tsx (Updated with Persistence)
import React from "react";
import "./../../style/TSC.css";

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

const TimeSheetCalculator: React.FC = () => {
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

      <DataManagement
        onClearAll={clearAllData}
        onExport={exportData}
        onImport={importData}
      />
    </div>
  );
};

export default TimeSheetCalculator;