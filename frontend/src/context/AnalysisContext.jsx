import React, { createContext, useContext, useState } from 'react';

const AnalysisContext = createContext(null);

export const AnalysisProvider = ({ children }) => {
  const [analysisData, setAnalysisData] = useState(null);

  const saveAnalysis = (data) => {
    // Добавляем timestamp когда данные были загружены
    setAnalysisData({
      ...data,
      analyzedAt: new Date().toISOString()
    });
  };

  const clearAnalysis = () => {
    setAnalysisData(null);
  };

  return (
    <AnalysisContext.Provider value={{ analysisData, saveAnalysis, clearAnalysis }}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
};

export default AnalysisContext;
