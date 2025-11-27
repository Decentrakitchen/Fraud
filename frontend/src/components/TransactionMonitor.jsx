import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';

// --- Animations ---
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 230, 118, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0, 230, 118, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 230, 118, 0); }
`;

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// --- Styled Components ---

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #e0e0e0;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #333;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: transparent;
  background: linear-gradient(45deg, #6200ea, #b388ff);
  -webkit-background-clip: text;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const Button = styled.button`
  background: linear-gradient(45deg, #6200ea, #7c4dff);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(98, 0, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(98, 0, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.active ? '#00e676' : '#757575'};
  background: ${props => props.active ? 'rgba(0, 230, 118, 0.1)' : 'rgba(117, 117, 117, 0.1)'};
  padding: 8px 16px;
  border-radius: 20px;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.active ? '#00e676' : '#757575'};
    animation: ${props => props.active ? pulse : 'none'} 2s infinite;
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: #1e1e1e;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: #9e9e9e;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StatValue = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #fff;
`;

const FeedContainer = styled.div`
  background: #1e1e1e;
  border-radius: 16px;
  padding: 20px;
  height: 600px;
  overflow-y: auto;
  position: relative;
  border: 1px solid #333;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
`;

const TransactionCard = styled(motion.div)`
  background: ${props => props.verdict === 'BLOCK' ? 
    'linear-gradient(90deg, rgba(211, 47, 47, 0.15) 0%, rgba(30, 30, 30, 1) 100%)' : 
    'linear-gradient(90deg, rgba(56, 142, 60, 0.1) 0%, rgba(30, 30, 30, 1) 100%)'};
  border-left: 4px solid ${props => props.verdict === 'BLOCK' ? '#ef5350' : '#66bb6a'};
  padding: 20px;
  margin-bottom: 12px;
  border-radius: 8px;
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1.5fr;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    transform: translateX(5px);
    border-color: ${props => props.verdict === 'BLOCK' ? 'rgba(239, 83, 80, 0.3)' : 'rgba(102, 187, 106, 0.3)'};
    background: #252525;
  }
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  font-size: 10px;
  color: #757575;
  text-transform: uppercase;
`;

const Value = styled.span`
  font-size: 14px;
  color: #e0e0e0;
  font-weight: 500;
`;

const Amount = styled(Value)`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`;

const VerdictBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 20px;
  background: ${props => props.verdict === 'BLOCK' ? 'rgba(211, 47, 47, 0.2)' : 'rgba(56, 142, 60, 0.2)'};
  color: ${props => props.verdict === 'BLOCK' ? '#ef5350' : '#66bb6a'};
  border: 1px solid ${props => props.verdict === 'BLOCK' ? 'rgba(211, 47, 47, 0.3)' : 'rgba(56, 142, 60, 0.3)'};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
`;

const ScoreBar = styled.div`
  width: 100%;
  height: 6px;
  background: #333;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 6px;
`;

const ScoreFill = styled.div`
  height: 100%;
  width: ${props => props.percent}%;
  background: ${props => {
    if (props.percent > 85) return '#ef5350';
    if (props.percent > 50) return '#ffa726';
    return '#66bb6a';
  }};
  border-radius: 3px;
`;

// --- Modal Components ---

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
`;

const ModalContent = styled(motion.div)`
  background: #1e1e1e;
  padding: 40px;
  border-radius: 24px;
  width: 90%;
  max-width: 700px;
  border: 1px solid #333;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  border-bottom: 1px solid #333;
  padding-bottom: 20px;
`;

const RiskScoreLarge = styled.div`
  font-size: 48px;
  font-weight: 800;
  color: ${props => props.score > 0.85 ? '#ef5350' : props.score > 0.5 ? '#ffa726' : '#66bb6a'};
  line-height: 1;
  margin-bottom: 5px;
`;

const FeatureRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
  gap: 15px;
`;

const FeatureName = styled.span`
  color: #bdbdbd;
  width: 200px;
  font-weight: 500;
`;

const FeatureValue = styled.span`
  color: #fff;
  font-family: 'Roboto Mono', monospace;
  background: #2c2c2c;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
`;

const ShapBarContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  height: 24px;
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
`;

const CenterLine = styled.div`
  position: absolute;
  left: 50%;
  height: 100%;
  width: 1px;
  background: #555;
  z-index: 1;
`;

const ShapBar = styled(motion.div)`
  height: 12px;
  border-radius: 6px;
  background: ${props => props.value > 0 ? '#ef5350' : '#42a5f5'};
  width: ${props => Math.min(Math.abs(props.value) * 40, 50)}%;
  margin-left: ${props => props.value > 0 ? '50%' : 'auto'};
  margin-right: ${props => props.value > 0 ? 'auto' : '50%'};
  position: relative;
  z-index: 2;
`;

// --- Mock Data Generator ---
const generateMockTransaction = (id) => {
  const isFraud = Math.random() > 0.8;
  return {
    transaction_id: id,
    amount: Math.round(Math.random() * 50000) + 1000,
    direction: Math.random() > 0.5 ? "OUTBOUND" : "INBOUND",
    last_phone_model_categorical: "iPhone 13",
    os_ver_categorical: "iOS 16.0",
    os_versions_count_30d: Math.floor(Math.random() * 3) + 1,
    phone_models_count_30d: Math.floor(Math.random() * 2) + 1,
    avg_login_freq_7d: Math.random() * 5,
    avg_login_freq_30d: Math.random() * 4,
    std_login_interval_30d: Math.random() * 1000,
    login_freq_change_ratio: Math.random() * 2,
    login_share_7d_30d: Math.random(),
    // Additional fields required by backend schema
    unique_ips_count_7d: Math.floor(Math.random() * 5) + 1,
    unique_ips_count_30d: Math.floor(Math.random() * 10) + 1,
    device_change_count_30d: isFraud ? Math.floor(Math.random() * 5) : 0,
    location_change_count_30d: isFraud ? Math.floor(Math.random() * 3) : 0,
    night_activity_share_30d: isFraud ? Math.random() : 0.1,
    avg_transaction_speed_7d: Math.random() * 60,
    amount_ratio_avg_30d: isFraud ? (Math.random() * 5) + 2 : 1.0,
    failed_login_count_7d: isFraud ? Math.floor(Math.random() * 5) : 0,
    failed_login_count_30d: isFraud ? Math.floor(Math.random() * 10) : 0,
    days_since_password_change: Math.random() * 365,
    is_proxy_detected: isFraud && Math.random() > 0.5 ? 1 : 0
  };
};

const TransactionMonitor = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ checked: 0, blocked: 0, saved: 0 });
  const [selectedTx, setSelectedTx] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const intervalRef = useRef(null);
  const txIdCounter = useRef(10000);

  // Fetch stats periodically or update locally
  const updateStats = (newResults) => {
    setStats(prev => {
      const newBlocked = newResults.filter(r => r.verdict === 'BLOCK');
      const savedAmount = newBlocked.reduce((sum, r) => sum + r.amount, 0);
      return {
        checked: prev.checked + newResults.length,
        blocked: prev.blocked + newBlocked.length,
        saved: prev.saved + savedAmount
      };
    });
  };

  const fetchPrediction = async (batch) => {
    try {
      const response = await fetch('/api/v1/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }
      
      const results = await response.json();
      
      // Add timestamp for UI
      const resultsWithTime = results.map(r => ({
        ...r,
        timestamp: new Date().toLocaleTimeString()
      }));

      setTransactions(prev => [...resultsWithTime, ...prev].slice(0, 50)); // Keep last 50
      updateStats(resultsWithTime);
      
    } catch (error) {
      console.error("Prediction failed:", error);
      alert(`Connection failed: ${error.message}. Ensure backend is running on port 8000.`);
      setIsLive(false);
      clearInterval(intervalRef.current);
    }
  };

  const simulateTraffic = () => {
    const batchSize = Math.floor(Math.random() * 3) + 1; // 1-3 tx at a time
    const batch = [];
    for (let i = 0; i < batchSize; i++) {
      batch.push(generateMockTransaction(txIdCounter.current++));
    }
    fetchPrediction(batch);
  };

  const toggleLiveFeed = () => {
    if (isLive) {
      clearInterval(intervalRef.current);
      setIsLive(false);
    } else {
      setIsLive(true);
      simulateTraffic(); // Immediate first call
      intervalRef.current = setInterval(simulateTraffic, 2000); // Every 2s
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <Container>
      <Header>
        <Title>
          <i className="fa-solid fa-shield-halved" style={{color: '#b388ff'}}></i>
          ForteFraud <span style={{color: '#fff', fontWeight: 300}}>Monitor</span>
        </Title>
        <Controls>
          <StatusIndicator active={isLive}>
            {isLive ? 'LIVE MONITORING' : 'SYSTEM PAUSED'}
          </StatusIndicator>
          <Button onClick={toggleLiveFeed}>
            {isLive ? <><i className="fa-solid fa-pause"></i> Pause Feed</> : <><i className="fa-solid fa-play"></i> Start Simulation</>}
          </Button>
        </Controls>
      </Header>

      <StatsBar>
        <StatCard>
          <StatLabel>Transactions Scanned</StatLabel>
          <StatValue>{stats.checked.toLocaleString()}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Fraud Blocked</StatLabel>
          <StatValue style={{color: '#ef5350'}}>{stats.blocked.toLocaleString()}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Money Saved</StatLabel>
          <StatValue style={{color: '#66bb6a'}}>{stats.saved.toLocaleString()} ₸</StatValue>
        </StatCard>
      </StatsBar>

      <FeedContainer>
        <AnimatePresence>
          {transactions.map((tx) => (
            <TransactionCard
              key={tx.transaction_id}
              verdict={tx.verdict}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(tx)}
              whileHover={{ scale: 1.005 }}
              layout
            >
              <Col>
                <Label>Transaction ID</Label>
                <Value>#{tx.transaction_id}</Value>
              </Col>
              
              <Col>
                <Label>Amount</Label>
                <Amount>{tx.amount.toLocaleString()} ₸</Amount>
              </Col>

              <Col>
                <Label>Time</Label>
                <Value>{tx.timestamp}</Value>
              </Col>

              <Col>
                <Label>Verdict</Label>
                <VerdictBadge verdict={tx.verdict}>
                  {tx.verdict === 'BLOCK' ? <i className="fa-solid fa-ban"></i> : <i className="fa-solid fa-check"></i>}
                  {tx.verdict}
                </VerdictBadge>
              </Col>

              <Col>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <Label>Risk Score</Label>
                  <Label>{(tx.score * 100).toFixed(1)}%</Label>
                </div>
                <ScoreBar>
                  <ScoreFill percent={tx.score * 100} />
                </ScoreBar>
              </Col>
            </TransactionCard>
          ))}
        </AnimatePresence>
        {transactions.length === 0 && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            color: '#757575',
            gap: '20px'
          }}>
            <i className="fa-solid fa-radar" style={{fontSize: '48px', opacity: 0.2}}></i>
            <p>Waiting for incoming transactions...</p>
          </div>
        )}
      </FeedContainer>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTx && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTx(null)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <ModalHeader>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px' }}>Transaction Analysis</h2>
                  <span style={{ color: '#757575', fontSize: '14px' }}>ID: #{selectedTx.transaction_id}</span>
                </div>
                <button 
                  onClick={() => setSelectedTx(null)}
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', opacity: 0.7 }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </ModalHeader>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                <div>
                  <Label style={{fontSize: '12px'}}>Transaction Amount</Label>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: '#fff' }}>
                    {selectedTx.amount.toLocaleString()} ₸
                  </div>
                </div>
                <div>
                  <Label style={{fontSize: '12px'}}>Fraud Probability</Label>
                  <RiskScoreLarge score={selectedTx.score}>
                    {(selectedTx.score * 100).toFixed(2)}%
                  </RiskScoreLarge>
                  <div style={{ color: '#757575', fontSize: '12px', marginTop: '5px' }}>
                    Threshold: 85.00%
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-magnifying-glass-chart" style={{color: '#b388ff'}}></i>
                Explainable AI (SHAP Analysis)
              </h3>

              {selectedTx.explanation ? (
                <div style={{background: '#181818', padding: '20px', borderRadius: '12px', border: '1px solid #333'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '10px', color: '#757575', textTransform: 'uppercase'}}>
                    <span>Feature</span>
                    <span>Impact on Risk</span>
                  </div>
                  {selectedTx.explanation.map((item, idx) => (
                    <FeatureRow key={idx}>
                      <FeatureName>{item.feature_name}</FeatureName>
                      <FeatureValue>{item.feature_value}</FeatureValue>
                      <ShapBarContainer>
                        <CenterLine />
                        <ShapBar 
                          value={item.shap_value} 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(Math.abs(item.shap_value) * 40, 50)}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                        />
                      </ShapBarContainer>
                    </FeatureRow>
                  ))}
                  <div style={{ textAlign: 'center', fontSize: '11px', color: '#757575', marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '8px', height: '8px', background: '#42a5f5', borderRadius: '50%' }}></span> 
                      Reduces Risk
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '8px', height: '8px', background: '#ef5350', borderRadius: '50%' }}></span> 
                      Increases Risk
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  background: 'rgba(102, 187, 106, 0.1)', 
                  borderRadius: '12px',
                  border: '1px dashed #66bb6a',
                  color: '#66bb6a'
                }}>
                  <i className="fa-solid fa-shield-check" style={{fontSize: '32px', marginBottom: '10px'}}></i>
                  <p>This transaction is considered safe.</p>
                  <p style={{fontSize: '12px', opacity: 0.8}}>Risk score is below the explanation threshold (40%).</p>
                </div>
              )}

            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default TransactionMonitor;
