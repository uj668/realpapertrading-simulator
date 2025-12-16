import './globals.css';
import { LanguageProvider } from '../context/LanguageContext';
import { SimulationProvider } from '../context/SimulationContext';

export const metadata = {
  title: 'RealPaperTrading Simulator',
  description: 'Paper trading simulator with real stock prices',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <SimulationProvider>
            {children}
          </SimulationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

