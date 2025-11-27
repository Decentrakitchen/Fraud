import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { AnalysisProvider } from './context/AnalysisContext';
import Sidebar from './components/Sidebar';
import LiveMonitor from './pages/LiveMonitor';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import AdminSettings from './pages/AdminSettings';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px;
  background: linear-gradient(135deg, #0a0a0f 0%, #12121e 50%, #0a0a14 100%);
  min-height: 100vh;
`;

const App = () => {
  return (
    <AnalysisProvider>
      <Router>
        <GlobalStyles />
        <AppContainer>
          <Sidebar />
          <MainContent>
            <Routes>
              <Route path="/" element={<LiveMonitor />} />
              <Route path="/dashboard" element={<ExecutiveDashboard />} />
              <Route path="/settings" element={<AdminSettings />} />
            </Routes>
          </MainContent>
        </AppContainer>
      </Router>
    </AnalysisProvider>
  );
};

export default App;
