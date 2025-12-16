'use client';

import { useSimulation } from '../context/SimulationContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/Button';

export default function TimeTravelControls() {
  const { simulationDate, isHistoricalMode, moveDate, jumpToDate, jumpToToday } = useSimulation();
  const { language } = useLanguage();

  const handleQuickJump = (years) => {
    const targetDate = new Date();
    targetDate.setFullYear(targetDate.getFullYear() - years);
    jumpToDate(targetDate.toISOString().split('T')[0]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Quick Jump Buttons */}
      <div className="flex gap-1">
        <Button
          onClick={() => handleQuickJump(1)}
          variant="secondary"
          size="sm"
        >
          {language === 'lt' ? '1 metai atgal' : '1Y ago'}
        </Button>
        <Button
          onClick={() => handleQuickJump(2)}
          variant="secondary"
          size="sm"
        >
          {language === 'lt' ? '2 metai atgal' : '2Y ago'}
        </Button>
        <Button
          onClick={() => handleQuickJump(5)}
          variant="secondary"
          size="sm"
        >
          {language === 'lt' ? '5 metai atgal' : '5Y ago'}
        </Button>
      </div>

      {/* Date Navigation */}
      {isHistoricalMode && (
        <div className="flex gap-1">
          <Button
            onClick={() => moveDate(-365)}
            variant="secondary"
            size="sm"
          >
            ← {language === 'lt' ? '1 metai' : '1 Year'}
          </Button>
          <Button
            onClick={() => moveDate(-30)}
            variant="secondary"
            size="sm"
          >
            ← {language === 'lt' ? '1 mėn' : '1 Month'}
          </Button>
          <Button
            onClick={() => moveDate(30)}
            variant="secondary"
            size="sm"
          >
            {language === 'lt' ? '1 mėn' : '1 Month'} →
          </Button>
          <Button
            onClick={() => moveDate(365)}
            variant="secondary"
            size="sm"
          >
            {language === 'lt' ? '1 metai' : '1 Year'} →
          </Button>
        </div>
      )}

      {/* Jump to Today */}
      {isHistoricalMode && (
        <Button
          onClick={jumpToToday}
          variant="success"
          size="sm"
        >
          🔴 {language === 'lt' ? 'Šiandien' : 'Today'}
        </Button>
      )}
    </div>
  );
}

