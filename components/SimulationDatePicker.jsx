'use client';

import { useSimulation } from '../context/SimulationContext';
import { useLanguage } from '../context/LanguageContext';
import { format } from 'date-fns';

export default function SimulationDatePicker() {
  const { simulationDate, isHistoricalMode, setSimulationDate, jumpToToday } = useSimulation();
  const { t, language } = useLanguage();

  const displayDate = simulationDate || format(new Date(), 'yyyy-MM-dd');
  const maxDate = format(new Date(), 'yyyy-MM-dd');

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSimulationDate(newDate);
  };

  const handleTodayClick = () => {
    jumpToToday();
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Mode Indicator */}
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${
        isHistoricalMode 
          ? 'bg-orange-100 text-orange-700' 
          : 'bg-green-100 text-green-700'
      }`}>
        <span>{isHistoricalMode ? '📅' : '🔴'}</span>
        <span>{isHistoricalMode ? (language === 'lt' ? 'Istorinis' : 'Historical') : (language === 'lt' ? 'TIESIOGINIS' : 'LIVE')}</span>
      </div>

      {/* Date Picker */}
      <input
        type="date"
        value={displayDate}
        max={maxDate}
        onChange={handleDateChange}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
        style={{ colorScheme: 'light' }}
      />

      {/* Jump to Today Button */}
      {isHistoricalMode && (
        <button
          onClick={handleTodayClick}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors"
        >
          {language === 'lt' ? 'Šiandien' : 'Today'}
        </button>
      )}
    </div>
  );
}

