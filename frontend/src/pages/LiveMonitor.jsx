import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';

// --- Animations ---
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 210, 106, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0, 210, 106, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 210, 106, 0); }
`;

const dangerPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.6); }
  70% { box-shadow: 0 0 0 15px rgba(255, 71, 87, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0); }
`;

const scanline = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

// --- Styled Components ---
const PageContainer = styled.div`
  padding: 30px;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 15px;

  span {
    font-size: 32px;
  }
`;

const PageSubtitle = styled.p`
  color: #5a5a7a;
  font-size: 14px;
  margin-top: 5px;
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const Button = styled.button`
  background: ${props => props.variant === 'danger' 
    ? 'linear-gradient(135deg, #ff4757, #ff6b81)' 
    : 'linear-gradient(135deg, #6c5ce7, #a29bfe)'};
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: ${props => props.variant === 'danger'
    ? '0 4px 15px rgba(255, 71, 87, 0.3)'
    : '0 4px 15px rgba(108, 92, 231, 0.3)'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.variant === 'danger'
      ? '0 6px 20px rgba(255, 71, 87, 0.4)'
      : '0 6px 20px rgba(108, 92, 231, 0.4)'};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.active ? '#00d26a' : '#ff4757'};
  background: ${props => props.active ? 'rgba(0, 210, 106, 0.1)' : 'rgba(255, 71, 87, 0.1)'};
  padding: 10px 20px;
  border-radius: 25px;
  border: 1px solid ${props => props.active ? 'rgba(0, 210, 106, 0.3)' : 'rgba(255, 71, 87, 0.3)'};
  
  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${props => props.active ? '#00d26a' : '#ff4757'};
    animation: ${props => props.active ? pulse : 'none'} 2s infinite;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #16162a 0%, #1a1a30 100%);
  padding: 25px;
  border-radius: 16px;
  border: 1px solid #2a2a4a;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.color || '#6c5ce7'};
  }
`;

const StatIcon = styled.div`
  font-size: 24px;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #5a5a7a;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.color || '#fff'};
`;

const FeedSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

const FeedContainer = styled.div`
  background: linear-gradient(135deg, #12121e 0%, #16162a 100%);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid #2a2a4a;
  position: relative;
  overflow: hidden;
`;

const FeedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #2a2a4a;
`;

const FeedTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TransactionList = styled.div`
  height: 500px;
  overflow-y: auto;
  padding-right: 10px;
`;

const TransactionCard = styled(motion.div)`
  background: ${props => props.verdict === 'BLOCK' 
    ? 'linear-gradient(90deg, rgba(255, 71, 87, 0.15) 0%, rgba(22, 22, 42, 1) 100%)' 
    : 'linear-gradient(90deg, rgba(0, 210, 106, 0.08) 0%, rgba(22, 22, 42, 1) 100%)'};
  border-left: 4px solid ${props => props.verdict === 'BLOCK' ? '#ff4757' : '#00d26a'};
  padding: 18px 20px;
  margin-bottom: 12px;
  border-radius: 12px;
  display: grid;
  grid-template-columns: 0.8fr 1fr 0.6fr 0.8fr 1.2fr;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.verdict === 'BLOCK' ? 'rgba(255, 71, 87, 0.2)' : 'transparent'};
  position: relative;

  ${props => props.verdict === 'BLOCK' && `
    animation: ${dangerPulse} 2s ease-out;
  `}

  &:hover {
    transform: translateX(5px);
    background: #1e1e3a;
    border-color: ${props => props.verdict === 'BLOCK' ? 'rgba(255, 71, 87, 0.4)' : 'rgba(0, 210, 106, 0.3)'};
  }
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  font-size: 10px;
  color: #5a5a7a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Value = styled.span`
  font-size: 14px;
  color: #e0e0e0;
  font-weight: 500;
`;

const Amount = styled(Value)`
  font-size: 16px;
  font-weight: 700;
  color: #fff;
`;

const VerdictBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 20px;
  background: ${props => props.verdict === 'BLOCK' ? 'rgba(255, 71, 87, 0.2)' : 'rgba(0, 210, 106, 0.15)'};
  color: ${props => props.verdict === 'BLOCK' ? '#ff4757' : '#00d26a'};
  border: 1px solid ${props => props.verdict === 'BLOCK' ? 'rgba(255, 71, 87, 0.3)' : 'rgba(0, 210, 106, 0.3)'};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
`;

const AlertIcon = styled.span`
  animation: ${props => props.alert ? dangerPulse : 'none'} 1s infinite;
`;

const ScoreBar = styled.div`
  width: 100%;
  height: 8px;
  background: #2a2a4a;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 6px;
`;

const ScoreFill = styled(motion.div)`
  height: 100%;
  border-radius: 4px;
  background: ${props => {
    if (props.percent > 85) return 'linear-gradient(90deg, #ff4757, #ff6b81)';
    if (props.percent > 50) return 'linear-gradient(90deg, #ffa502, #ffbe00)';
    return 'linear-gradient(90deg, #00d26a, #7bed9f)';
  }};
`;

// --- Modal Components ---
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
`;

const ModalContent = styled(motion.div)`
  background: linear-gradient(135deg, #16162a 0%, #1a1a30 100%);
  padding: 40px;
  border-radius: 24px;
  width: 90%;
  max-width: 800px;
  border: 1px solid #2a2a4a;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #2a2a4a;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0;
`;

const ModalSubtitle = styled.span`
  color: #5a5a7a;
  font-size: 14px;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #2a2a4a;
  color: #8888aa;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 71, 87, 0.1);
    border-color: #ff4757;
    color: #ff4757;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
`;

const MetricBox = styled.div`
  background: rgba(255, 255, 255, 0.02);
  padding: 25px;
  border-radius: 16px;
  border: 1px solid #2a2a4a;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #5a5a7a;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
`;

const MetricValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: ${props => props.color || '#fff'};
`;

const RiskScore = styled(MetricValue)`
  color: ${props => {
    if (props.score > 0.85) return '#ff4757';
    if (props.score > 0.5) return '#ffa502';
    return '#00d26a';
  }};
`;

const ShapSection = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 25px;
  border-radius: 16px;
  border: 1px solid #2a2a4a;
`;

const ShapTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FeatureRow = styled.div`
  display: grid;
  grid-template-columns: 180px 100px 1fr;
  align-items: center;
  margin-bottom: 14px;
  gap: 15px;
`;

const FeatureName = styled.span`
  color: #8888aa;
  font-size: 13px;
  font-weight: 500;
`;

const FeatureValue = styled.span`
  color: #fff;
  font-family: 'Roboto Mono', monospace;
  background: rgba(108, 92, 231, 0.15);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  text-align: center;
`;

const ShapBarContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  height: 28px;
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  overflow: hidden;
`;

const CenterLine = styled.div`
  position: absolute;
  left: 50%;
  height: 100%;
  width: 2px;
  background: #3a3a5a;
  z-index: 1;
`;

const ShapBar = styled(motion.div)`
  height: 16px;
  border-radius: 8px;
  background: ${props => props.value > 0 
    ? 'linear-gradient(90deg, #ff4757, #ff6b81)' 
    : 'linear-gradient(90deg, #0984e3, #74b9ff)'};
  position: absolute;
  ${props => props.value > 0 
    ? `left: 50%; width: ${Math.min(Math.abs(props.value) * 50, 48)}%;`
    : `right: 50%; width: ${Math.min(Math.abs(props.value) * 50, 48)}%;`
  }
`;

const ShapLegend = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #2a2a4a;
`;

const LegendItem = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #8888aa;
`;

const LegendDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const SafeMessage = styled.div`
  padding: 40px;
  text-align: center;
  background: rgba(0, 210, 106, 0.08);
  border-radius: 16px;
  border: 1px dashed rgba(0, 210, 106, 0.3);
  color: #00d26a;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #5a5a7a;
  gap: 20px;
  padding: 60px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  opacity: 0.3;
`;

// --- Mock Data Generator ---
const generateMockTransaction = (id) => {
  const isFraud = Math.random() > 0.75;
  const amount = isFraud 
    ? Math.round(Math.random() * 500000) + 50000 
    : Math.round(Math.random() * 30000) + 1000;
  const hourOfDay = isFraud 
    ? (Math.random() > 0.5 ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 24))
    : Math.floor(Math.random() * 14) + 8;
  const dayOfWeek = Math.floor(Math.random() * 7);
  const isNight = (hourOfDay >= 22 || hourOfDay < 6) ? 1 : 0;
  const isWeekend = (dayOfWeek >= 5) ? 1 : 0;
  const loginsLast7Days = isFraud ? Math.floor(Math.random() * 50) + 20 : Math.floor(Math.random() * 15) + 1;
  const loginsLast30Days = loginsLast7Days + Math.floor(Math.random() * 50);
  const avgLoginInterval30d = Math.random() * 100000 + 10000;
  const stdLoginInterval30d = Math.random() * 150000;
  
  return {
    transaction_id: id,
    amount: amount,
    log_amount: Math.log(amount + 1),
    hour_of_day: hourOfDay,
    day_of_week: dayOfWeek,
    is_night: isNight,
    is_weekend: isWeekend,
    is_month_end: Math.random() > 0.85 ? 1 : 0,
    is_month_start: Math.random() > 0.9 ? 1 : 0,
    monthly_os_changes: isFraud ? Math.floor(Math.random() * 6) + 2 : Math.floor(Math.random() * 2),
    monthly_phone_model_changes: isFraud ? Math.floor(Math.random() * 4) + 1 : 0,
    logins_last_7_days: loginsLast7Days,
    logins_last_30_days: loginsLast30Days,
    login_frequency_7d: loginsLast7Days / 7,
    login_frequency_30d: loginsLast30Days / 30,
    freq_change_7d_vs_mean: isFraud ? Math.random() * 3 + 1 : Math.random() * 0.5,
    logins_7d_over_30d_ratio: loginsLast30Days > 0 ? loginsLast7Days / loginsLast30Days : 0,
    avg_login_interval_30d: avgLoginInterval30d,
    std_login_interval_30d: stdLoginInterval30d,
    ewm_login_interval_7d: avgLoginInterval30d * (0.5 + Math.random() * 0.5),
    burstiness_login_interval: isFraud ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3,
    zscore_avg_login_interval_7d: isFraud ? Math.random() * 4 + 1 : Math.random() - 0.5,
    is_cold_start: Math.random() > 0.92 ? 1 : 0,
    os_family: ["iOS", "Android", "Windows", "macOS"][Math.floor(Math.random() * 4)],
    phone_brand: ["Apple", "Samsung", "Xiaomi", "Huawei", "Google", "Unknown"][Math.floor(Math.random() * 6)],
    direction: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
  };
};

const LiveMonitor = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ checked: 0, blocked: 0, saved: 0, passRate: 100 });
  const [selectedTx, setSelectedTx] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const intervalRef = useRef(null);
  const txIdCounter = useRef(10000);

  const updateStats = (newResults) => {
    setStats(prev => {
      const newBlocked = newResults.filter(r => r.verdict === 'BLOCK');
      const savedAmount = newBlocked.reduce((sum, r) => sum + r.amount, 0);
      const newChecked = prev.checked + newResults.length;
      const newBlockedCount = prev.blocked + newBlocked.length;
      return {
        checked: newChecked,
        blocked: newBlockedCount,
        saved: prev.saved + savedAmount,
        passRate: newChecked > 0 ? ((newChecked - newBlockedCount) / newChecked * 100).toFixed(1) : 100
      };
    });
  };

  const fetchPrediction = async (batch) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch)
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const results = await response.json();
      
      const resultsWithTime = results.map(r => ({
        ...r,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }));

      setTransactions(prev => [...resultsWithTime, ...prev].slice(0, 100));
      updateStats(resultsWithTime);
      
    } catch (error) {
      console.error("Prediction failed:", error);
      setIsLive(false);
      clearInterval(intervalRef.current);
    }
  };

  const simulateTraffic = () => {
    const batchSize = Math.floor(Math.random() * 3) + 1;
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
      simulateTraffic();
      intervalRef.current = setInterval(simulateTraffic, 1500);
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const formatFeatureName = (name) => {
    const nameMap = {
      'amount': 'Сумма перевода',
      'log_amount': 'Логарифм суммы',
      'hour_of_day': 'Час операции',
      'is_night': 'Ночное время',
      'is_weekend': 'Выходной день',
      'monthly_os_changes': 'Смены ОС за месяц',
      'monthly_phone_model_changes': 'Смены телефона',
      'logins_last_7_days': 'Входов за 7 дней',
      'login_frequency_7d': 'Частота входов (7д)',
      'freq_change_7d_vs_mean': 'Изменение частоты',
      'burstiness_login_interval': 'Взрывной паттерн',
      'zscore_avg_login_interval_7d': 'Z-score интервала',
      'is_cold_start': 'Новый клиент',
      'direction': 'Направление'
    };
    return nameMap[name] || name;
  };

  return (
    <PageContainer>
      <Header>
        <div>
          <PageTitle>
            <span>📡</span>
            Оперативный мониторинг
          </PageTitle>
          <PageSubtitle>Рабочее место антифрод-аналитика • Анализ транзакций в реальном времени</PageSubtitle>
        </div>
        <Controls>
          <StatusBadge active={isLive}>
            {isLive ? 'LIVE MONITORING' : 'СИСТЕМА НА ПАУЗЕ'}
          </StatusBadge>
          <Button onClick={toggleLiveFeed} variant={isLive ? 'danger' : 'default'}>
            {isLive ? '⏸ Остановить' : '▶ Запустить поток'}
          </Button>
        </Controls>
      </Header>

      <StatsGrid>
        <StatCard color="#6c5ce7">
          <StatIcon>🔍</StatIcon>
          <StatLabel>Проверено транзакций</StatLabel>
          <StatValue>{stats.checked.toLocaleString()}</StatValue>
        </StatCard>
        <StatCard color="#ff4757">
          <StatIcon>🚫</StatIcon>
          <StatLabel>Заблокировано атак</StatLabel>
          <StatValue color="#ff4757">{stats.blocked.toLocaleString()}</StatValue>
        </StatCard>
        <StatCard color="#00d26a">
          <StatIcon>💰</StatIcon>
          <StatLabel>Сохранено средств</StatLabel>
          <StatValue color="#00d26a">{stats.saved.toLocaleString()} ₸</StatValue>
        </StatCard>
        <StatCard color="#ffa502">
          <StatIcon>✅</StatIcon>
          <StatLabel>Пропускная способность</StatLabel>
          <StatValue>{stats.passRate}%</StatValue>
        </StatCard>
      </StatsGrid>

      <FeedSection>
        <FeedContainer>
          <FeedHeader>
            <FeedTitle>
              🔴 Живая лента транзакций
            </FeedTitle>
            <span style={{ color: '#5a5a7a', fontSize: '12px' }}>
              Кликните на транзакцию для детального анализа
            </span>
          </FeedHeader>

          <TransactionList>
            <AnimatePresence>
              {transactions.map((tx) => (
                <TransactionCard
                  key={tx.transaction_id}
                  verdict={tx.verdict}
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setSelectedTx(tx)}
                  whileHover={{ scale: 1.01 }}
                  layout
                >
                  <Col>
                    <Label>ID транзакции</Label>
                    <Value>#{tx.transaction_id}</Value>
                  </Col>
                  
                  <Col>
                    <Label>Сумма</Label>
                    <Amount>{tx.amount.toLocaleString()} ₸</Amount>
                  </Col>

                  <Col>
                    <Label>Время</Label>
                    <Value>{tx.timestamp}</Value>
                  </Col>

                  <Col>
                    <Label>Вердикт</Label>
                    <VerdictBadge verdict={tx.verdict}>
                      {tx.verdict === 'BLOCK' ? (
                        <><AlertIcon alert>🚨</AlertIcon> БЛОК</>
                      ) : (
                        <>✓ OK</>
                      )}
                    </VerdictBadge>
                  </Col>

                  <Col>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <Label>Риск-скор</Label>
                      <Label style={{color: tx.score > 0.85 ? '#ff4757' : tx.score > 0.5 ? '#ffa502' : '#00d26a'}}>
                        {(tx.score * 100).toFixed(1)}%
                      </Label>
                    </div>
                    <ScoreBar>
                      <ScoreFill 
                        percent={tx.score * 100}
                        initial={{ width: 0 }}
                        animate={{ width: `${tx.score * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </ScoreBar>
                  </Col>
                </TransactionCard>
              ))}
            </AnimatePresence>
            
            {transactions.length === 0 && (
              <EmptyState>
                <EmptyIcon>📡</EmptyIcon>
                <p>Ожидание входящих транзакций...</p>
                <p style={{fontSize: '13px'}}>Нажмите "Запустить поток" для начала мониторинга</p>
              </EmptyState>
            )}
          </TransactionList>
        </FeedContainer>
      </FeedSection>

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
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <ModalHeader>
                <div>
                  <ModalTitle>🔎 Анализ транзакции</ModalTitle>
                  <ModalSubtitle>ID: #{selectedTx.transaction_id} • {selectedTx.timestamp}</ModalSubtitle>
                </div>
                <CloseButton onClick={() => setSelectedTx(null)}>×</CloseButton>
              </ModalHeader>

              <MetricsGrid>
                <MetricBox>
                  <MetricLabel>Сумма операции</MetricLabel>
                  <MetricValue>{selectedTx.amount.toLocaleString()} ₸</MetricValue>
                </MetricBox>
                <MetricBox>
                  <MetricLabel>Вероятность мошенничества</MetricLabel>
                  <RiskScore score={selectedTx.score}>
                    {(selectedTx.score * 100).toFixed(2)}%
                  </RiskScore>
                  <div style={{ color: '#5a5a7a', fontSize: '12px', marginTop: '5px' }}>
                    Порог блокировки: 85.00%
                  </div>
                </MetricBox>
              </MetricsGrid>

              <ShapSection>
                <ShapTitle>
                  🧠 Explainable AI — Почему модель приняла такое решение
                </ShapTitle>

                {selectedTx.explanation && selectedTx.explanation.length > 0 ? (
                  <>
                    <div style={{marginBottom: '15px', fontSize: '12px', color: '#5a5a7a'}}>
                      Топ-5 факторов, повлиявших на оценку риска:
                    </div>
                    {selectedTx.explanation.map((item, idx) => (
                      <FeatureRow key={idx}>
                        <FeatureName>{formatFeatureName(item.feature_name)}</FeatureName>
                        <FeatureValue>{item.feature_value}</FeatureValue>
                        <ShapBarContainer>
                          <CenterLine />
                          <ShapBar 
                            value={item.shap_value} 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(Math.abs(item.shap_value) * 50, 48)}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                          />
                        </ShapBarContainer>
                      </FeatureRow>
                    ))}
                    <ShapLegend>
                      <LegendItem>
                        <LegendDot color="#0984e3" />
                        Снижает риск
                      </LegendItem>
                      <LegendItem>
                        <LegendDot color="#ff4757" />
                        Повышает риск
                      </LegendItem>
                    </ShapLegend>
                  </>
                ) : (
                  <SafeMessage>
                    <div style={{fontSize: '48px', marginBottom: '15px'}}>✅</div>
                    <p style={{fontSize: '16px', fontWeight: '600'}}>Транзакция признана безопасной</p>
                    <p style={{fontSize: '13px', opacity: 0.8, marginTop: '10px'}}>
                      Риск-скор ниже порога объяснения (40%). Детальный анализ не требуется.
                    </p>
                  </SafeMessage>
                )}
              </ShapSection>

            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default LiveMonitor;
