// TimeSheetCalculator.tsx (Refactored)
import React from "react";
import "./../../style/TSC.css";

// Components
import { WeekTabs } from "./components/tools/_components/WeekTabs";
import { WeekHeader } from "./components/tools/_components/WeekHeader";
import { ActionButtons } from "./components/tools/_components/ActionButtons";
import { TimesheetTable } from "./components/tools/_components/TimesheetTable";
import { TotalsSection } from "./components/tools/_components/TotalsSection";

// Hooks and Utils
import { useTimesheetLogic } from "./hooks/useTimesheetLogic";
import { calculateAllWeeksTotal } from "./utils/timesheetUtils";

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
  } = useTimesheetLogic();

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
    </div>
  );
};

export default TimeSheetCalculator;