// components/tools/_components/TimesheetRow.tsx
import React from 'react';
import { RowData } from '../../../types/timesheet';
import { calculateTotal } from '../../../utils/timesheetUtils';
import { TimeInput } from './TimeInput';

interface TimesheetRowProps {
  row: RowData;
  index: number;
  onRowChange: <T extends keyof RowData>(field: T, value: RowData[T]) => void;
  onRemoveRow: () => void;
}

export const TimesheetRow: React.FC<TimesheetRowProps> = ({
  row,
  index,
  onRowChange,
  onRemoveRow,
}) => {
  return (
    <div 
      className={`timesheet-row ${index % 2 === 1 ? 'row-alternate' : ''}`}
    >
      <div className="day-label">{row.day}</div>
      
      <div className="time-section">
        <TimeInput
          hour={row.starthour}
          minute={row.startminute}
          ampm={row.startampm}
          onHourChange={(hour) => onRowChange("starthour", hour)}
          onMinuteChange={(minute) => onRowChange("startminute", minute)}
          onAmPmChange={(ampm) => onRowChange("startampm", ampm)}
          label="Start"
          dayName={row.day}
        />
        
        <TimeInput
          hour={row.endhour}
          minute={row.endminute}
          ampm={row.endampm}
          onHourChange={(hour) => onRowChange("endhour", hour)}
          onMinuteChange={(minute) => onRowChange("endminute", minute)}
          onAmPmChange={(ampm) => onRowChange("endampm", ampm)}
          label="End"
          dayName={row.day}
        />
        
        <div className="break-input">
          <select
            className="break-select"
            aria-label={`Break Time for ${row.day}`}
            value={row.breaktime}
            onChange={(e) => onRowChange("breaktime", parseInt(e.target.value))}
          >
            <option value={0}>0 min</option>
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
          </select>
        </div>
        
        <div className="hours-total">
          {calculateTotal(row).toFixed(2)}
        </div>
        
        <button 
          className="remove-row-button" 
          onClick={onRemoveRow}
          aria-label={`Remove ${row.day}`}
        >
          ×
        </button>
      </div>
    </div>
  );
};