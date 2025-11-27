import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { useAnalysis } from '../context/AnalysisContext';

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

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  margin-bottom: 25px;
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

// --- Tabs ---
const TabsContainer = styled.div`
  display: flex;
  gap: 5px;
  background: rgba(20, 20, 40, 0.6);
  padding: 6px;
  border-radius: 16px;
  margin-bottom: 25px;
  width: fit-content;
`;

const Tab = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#8888aa'};
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

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : 'rgba(108, 92, 231, 0.15)'};
    color: #fff;
  }
`;

// --- Upload Section ---
const UploadSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 25px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const UploadCard = styled.div`
  background: linear-gradient(135deg, #12121e 0%, #1a1a2e 100%);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid #2a2a4a;
`;

const UploadZone = styled.div`
  border: 2px dashed ${props => props.isDragging ? '#6c5ce7' : props.hasFile ? '#00d26a' : '#2a2a4a'};
  border-radius: 16px;
  padding: 50px 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragging ? 'rgba(108, 92, 231, 0.1)' : props.hasFile ? 'rgba(0, 210, 106, 0.05)' : 'rgba(0, 0, 0, 0.2)'};

  &:hover {
    border-color: #6c5ce7;
    background: rgba(108, 92, 231, 0.1);
  }
`;

const UploadIcon = styled.div`
  font-size: 56px;
  margin-bottom: 20px;
`;

const UploadTitle = styled.h3`
  font-size: 18px;
  color: #fff;
  margin-bottom: 10px;
`;

const UploadText = styled.p`
  font-size: 14px;
  color: #5a5a7a;
  margin-bottom: 5px;
`;

const UploadHint = styled.p`
  font-size: 12px;
  color: #3a3a5a;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: rgba(0, 210, 106, 0.1);
  border: 1px solid rgba(0, 210, 106, 0.3);
  border-radius: 12px;
  margin-top: 20px;
`;

const FileName = styled.span`
  font-size: 14px;
  color: #00d26a;
  flex: 1;
`;

const FileSize = styled.span`
  font-size: 12px;
  color: #5a5a7a;
`;

const RemoveFileBtn = styled.button`
  background: transparent;
  border: none;
  color: #ff4757;
  cursor: pointer;
  font-size: 18px;
  padding: 5px;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Button = styled.button`
  background: ${props => props.variant === 'danger' 
    ? 'linear-gradient(135deg, #ff4757, #ff6b81)' 
    : props.variant === 'success'
    ? 'linear-gradient(135deg, #00d26a, #00b894)'
    : 'linear-gradient(135deg, #6c5ce7, #a29bfe)'};
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin-top: 20px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(108, 92, 231, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Spinner = styled.span`
  animation: ${spin} 1s linear infinite;
  display: inline-block;
`;

// --- Stats Grid ---
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled(motion.div)`
  background: linear-gradient(135deg, #12121e 0%, #1a1a2e 100%);
  border-radius: 16px;
  padding: 20px 25px;
  border: 1px solid ${props => props.borderColor || '#2a2a4a'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.accentColor || '#6c5ce7'};
  }
`;

const StatIcon = styled.div`
  font-size: 28px;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #5a5a7a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #fff;
`;

const StatSubvalue = styled.div`
  font-size: 12px;
  color: ${props => props.positive ? '#00d26a' : props.negative ? '#ff4757' : '#5a5a7a'};
  margin-top: 5px;
`;

// --- Results Section ---
const ResultsSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;

  @media (max-width: 1400px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: linear-gradient(135deg, #12121e 0%, #1a1a2e 100%);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid #2a2a4a;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

// --- Transactions Table ---
const TableContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1a1a2e;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #3a3a5a;
    border-radius: 3px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 15px;
  font-size: 11px;
  font-weight: 600;
  color: #5a5a7a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 1;
`;

const Td = styled.td`
  padding: 12px 15px;
  font-size: 13px;
  color: #e0e0e0;
  border-bottom: 1px solid #2a2a4a;
`;

const VerdictBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => props.blocked 
    ? 'rgba(255, 71, 87, 0.15)' 
    : 'rgba(0, 210, 106, 0.15)'};
  color: ${props => props.blocked ? '#ff4757' : '#00d26a'};
  animation: ${props => props.blocked ? dangerPulse : 'none'} 2s infinite;
`;

const ScoreBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    if (props.score >= 0.85) return 'rgba(255, 71, 87, 0.2)';
    if (props.score >= 0.5) return 'rgba(255, 165, 2, 0.2)';
    return 'rgba(0, 210, 106, 0.2)';
  }};
  color: ${props => {
    if (props.score >= 0.85) return '#ff4757';
    if (props.score >= 0.5) return '#ffa502';
    return '#00d26a';
  }};
`;

const CorrectBadge = styled.span`
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 50%;
  font-size: 12px;
  background: ${props => props.correct ? 'rgba(0, 210, 106, 0.2)' : 'rgba(255, 71, 87, 0.2)'};
  color: ${props => props.correct ? '#00d26a' : '#ff4757'};
`;

const ViewBtn = styled.button`
  background: rgba(108, 92, 231, 0.15);
  border: 1px solid rgba(108, 92, 231, 0.3);
  color: #a29bfe;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(108, 92, 231, 0.25);
  }
`;

// --- Metrics Card ---
const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

const MetricItem = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 12px;
  text-align: center;
`;

const MetricLabel = styled.div`
  font-size: 11px;
  color: #5a5a7a;
  margin-bottom: 5px;
`;

const MetricValue = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${props => props.color || '#fff'};
`;

// --- SHAP Modal ---
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: linear-gradient(135deg, #12121e 0%, #1a1a2e 100%);
  border-radius: 24px;
  padding: 30px;
  max-width: 700px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid #2a2a4a;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseBtn = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 71, 87, 0.3);
  }
`;

const ShapBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 15px;
`;

const ShapFeature = styled.div`
  width: 180px;
  font-size: 12px;
  color: #8888aa;
  text-align: right;
  flex-shrink: 0;
`;

const ShapBarContainer = styled.div`
  flex: 1;
  height: 24px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
`;

const ShapBarFill = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  background: ${props => props.positive ? 'linear-gradient(90deg, #ff4757, #ff6b81)' : 'linear-gradient(90deg, #00d26a, #00b894)'};
  border-radius: 4px;
  ${props => props.positive 
    ? `left: 50%; width: ${props.width}%;` 
    : `right: 50%; width: ${props.width}%;`}
`;

const ShapValue = styled.div`
  width: 80px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.positive ? '#ff4757' : '#00d26a'};
  text-align: right;
`;

// --- Live Feed Components ---
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
`;

const LiveDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.active ? '#00d26a' : '#ff4757'};
  animation: ${props => props.active ? pulse : 'none'} 2s infinite;
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const TransactionCard = styled(motion.div)`
  background: ${props => props.blocked 
    ? 'linear-gradient(135deg, rgba(255, 71, 87, 0.1) 0%, rgba(20, 20, 40, 0.8) 100%)'
    : 'linear-gradient(135deg, rgba(0, 210, 106, 0.05) 0%, rgba(20, 20, 40, 0.8) 100%)'};
  border: 1px solid ${props => props.blocked ? 'rgba(255, 71, 87, 0.3)' : 'rgba(0, 210, 106, 0.2)'};
  border-radius: 16px;
  padding: 18px 22px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateX(5px);
    border-color: ${props => props.blocked ? '#ff4757' : '#00d26a'};
  }
`;

const TxInfo = styled.div`
  flex: 1;
`;

const TxId = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
`;

const TxMeta = styled.div`
  font-size: 12px;
  color: #5a5a7a;
`;

const TxAmount = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.blocked ? '#ff4757' : '#00d26a'};
`;

const FeedContainer = styled.div`
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1a1a2e;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #3a3a5a;
    border-radius: 3px;
  }
`;

// --- Info Box ---
const InfoBox = styled.div`
  background: rgba(108, 92, 231, 0.1);
  border: 1px solid rgba(108, 92, 231, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
`;

const InfoTitle = styled.h4`
  font-size: 14px;
  color: #a29bfe;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoText = styled.p`
  font-size: 13px;
  color: #8888aa;
  line-height: 1.6;
`;

// --- API ---
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// --- Mock Transaction Generator (for Live Feed) ---
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

// ==================== MAIN COMPONENT ====================
const LiveMonitor = () => {
  const { saveAnalysis } = useAnalysis();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'live'
  
  // === Upload Tab State ===
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const fileInputRef = useRef(null);
  
  // === Live Tab State ===
  const [transactions, setTransactions] = useState([]);
  const [liveStats, setLiveStats] = useState({ checked: 0, blocked: 0, saved: 0, passRate: 100 });
  const [isLive, setIsLive] = useState(false);
  const intervalRef = useRef(null);
  const txIdCounter = useRef(10000);

  // ========== Upload Tab Logic ==========
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setUploadResults(null);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResults(null);
    }
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setUploadResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/predict/csv`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to process file');
      }

      const data = await response.json();
      setUploadResults(data);
      
      // Сохраняем данные анализа в глобальный контекст для страницы статистики
      saveAnalysis(data);
    } catch (error) {
      console.error('Error processing file:', error);
      alert(`Ошибка: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ========== Live Tab Logic ==========
  const updateLiveStats = (newResults) => {
    setLiveStats(prev => {
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
      const response = await fetch(`${API_BASE}/predict`, {
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
      updateLiveStats(resultsWithTime);
      
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

  // ========== Render ==========
  return (
    <PageContainer>
      <Header>
        <div>
          <PageTitle>
            <span>📡</span>
            Анализ транзакций
          </PageTitle>
          <PageSubtitle>Загрузите датасет для проверки или смотрите демонстрацию в реальном времени</PageSubtitle>
        </div>
      </Header>

      <TabsContainer>
        <Tab active={activeTab === 'upload'} onClick={() => setActiveTab('upload')}>
          📁 Загрузка датасета
        </Tab>
        <Tab active={activeTab === 'live'} onClick={() => setActiveTab('live')}>
          📡 Live-демонстрация
        </Tab>
      </TabsContainer>

      {/* ==================== UPLOAD TAB ==================== */}
      {activeTab === 'upload' && (
        <>
          <InfoBox>
            <InfoTitle>💡 Как это работает</InfoTitle>
            <InfoText>
              Загрузите CSV-файл с транзакциями, и наша ML-модель проанализирует каждую из них.
              Если в файле есть колонка <code style={{background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px'}}>is_fraud</code>, система покажет метрики качества (Accuracy, Precision, Recall).
              Это позволит убедиться в корректности работы антифрод-системы на ваших данных.
            </InfoText>
          </InfoBox>

          <UploadSection>
            <UploadCard>
              <CardTitle>📤 Загрузка файла</CardTitle>
              <UploadZone
                isDragging={isDragging}
                hasFile={!!file}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <UploadIcon>{file ? '✅' : '📁'}</UploadIcon>
                <UploadTitle>
                  {file ? 'Файл загружен!' : 'Перетащите CSV файл сюда'}
                </UploadTitle>
                <UploadText>
                  {file ? file.name : 'или нажмите для выбора файла'}
                </UploadText>
                <UploadHint>Поддерживаются файлы до 50MB</UploadHint>
              </UploadZone>

              {file && (
                <FileInfo>
                  <span>📄</span>
                  <FileName>{file.name}</FileName>
                  <FileSize>{(file.size / 1024).toFixed(1)} KB</FileSize>
                  <RemoveFileBtn onClick={(e) => { e.stopPropagation(); removeFile(); }}>✕</RemoveFileBtn>
                </FileInfo>
              )}

              <Button 
                variant="success" 
                onClick={processFile} 
                disabled={!file || isProcessing}
              >
                {isProcessing ? (
                  <><Spinner>⟳</Spinner> Обработка...</>
                ) : (
                  <>🚀 Запустить анализ</>
                )}
              </Button>
            </UploadCard>

            <UploadCard>
              <CardTitle>📋 Требования к файлу</CardTitle>
              <div style={{ fontSize: '13px', color: '#8888aa', lineHeight: 1.8 }}>
                <p style={{ marginBottom: '15px' }}>Файл должен содержать следующие колонки:</p>
                <code style={{ 
                  display: 'block', 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '15px', 
                  borderRadius: '8px',
                  fontSize: '11px',
                  lineHeight: 1.6,
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  amount, log_amount, hour_of_day, day_of_week, is_night, is_weekend,
                  is_month_end, is_month_start, monthly_os_changes, monthly_phone_model_changes,
                  logins_last_7_days, logins_last_30_days, login_frequency_7d, login_frequency_30d,
                  freq_change_7d_vs_mean, logins_7d_over_30d_ratio, avg_login_interval_30d,
                  std_login_interval_30d, ewm_login_interval_7d, burstiness_login_interval,
                  zscore_avg_login_interval_7d, is_cold_start, os_family, phone_brand, direction
                </code>
                <p style={{ marginTop: '15px', color: '#5a5a7a' }}>
                  <strong>Опционально:</strong> transaction_id, is_fraud (для оценки качества)
                </p>
              </div>
            </UploadCard>
          </UploadSection>

          {/* Results */}
          {uploadResults && (
            <>
              <StatsGrid>
                <StatCard accentColor="#6c5ce7" borderColor="rgba(108, 92, 231, 0.3)">
                  <StatIcon>🔍</StatIcon>
                  <StatLabel>Проверено транзакций</StatLabel>
                  <StatValue>{uploadResults.stats.total_transactions.toLocaleString()}</StatValue>
                </StatCard>

                <StatCard accentColor="#ff4757" borderColor="rgba(255, 71, 87, 0.3)">
                  <StatIcon>🚫</StatIcon>
                  <StatLabel>Заблокировано</StatLabel>
                  <StatValue>{uploadResults.stats.blocked_count}</StatValue>
                  <StatSubvalue>{uploadResults.stats.block_rate}% от общего</StatSubvalue>
                </StatCard>

                <StatCard accentColor="#00d26a" borderColor="rgba(0, 210, 106, 0.3)">
                  <StatIcon>✅</StatIcon>
                  <StatLabel>Пропущено</StatLabel>
                  <StatValue>{uploadResults.stats.passed_count}</StatValue>
                </StatCard>

                <StatCard accentColor="#ffa502" borderColor="rgba(255, 165, 2, 0.3)">
                  <StatIcon>💰</StatIcon>
                  <StatLabel>Потенциально спасено</StatLabel>
                  <StatValue>{(uploadResults.stats.money_saved / 1000000).toFixed(2)}M ₸</StatValue>
                </StatCard>
              </StatsGrid>

              <ResultsSection>
                <Card>
                  <CardTitle>📊 Результаты анализа</CardTitle>
                  <TableContainer>
                    <Table>
                      <thead>
                        <tr>
                          <Th>ID</Th>
                          <Th>Сумма</Th>
                          <Th>Скор риска</Th>
                          <Th>Вердикт</Th>
                          {uploadResults.stats.metrics && <Th>Факт</Th>}
                          {uploadResults.stats.metrics && <Th>✓</Th>}
                          <Th>Детали</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadResults.predictions.slice(0, 100).map((tx, idx) => (
                          <tr key={tx.transaction_id || idx}>
                            <Td>#{tx.transaction_id}</Td>
                            <Td>{tx.amount.toLocaleString()} ₸</Td>
                            <Td>
                              <ScoreBadge score={tx.score}>
                                {(tx.score * 100).toFixed(1)}%
                              </ScoreBadge>
                            </Td>
                            <Td>
                              <VerdictBadge blocked={tx.verdict === 'BLOCK'}>
                                {tx.verdict === 'BLOCK' ? '🚫 BLOCK' : '✅ PASS'}
                              </VerdictBadge>
                            </Td>
                            {uploadResults.stats.metrics && (
                              <>
                                <Td>{tx.actual_fraud === 1 ? '🔴 Фрод' : '🟢 Норма'}</Td>
                                <Td>
                                  <CorrectBadge correct={tx.correct}>
                                    {tx.correct ? '✓' : '✗'}
                                  </CorrectBadge>
                                </Td>
                              </>
                            )}
                            <Td>
                              {tx.explanation && (
                                <ViewBtn onClick={() => setSelectedTx(tx)}>
                                  SHAP
                                </ViewBtn>
                              )}
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableContainer>
                  {uploadResults.predictions.length > 100 && (
                    <div style={{ textAlign: 'center', padding: '15px', color: '#5a5a7a', fontSize: '13px' }}>
                      Показаны первые 100 из {uploadResults.predictions.length} транзакций
                    </div>
                  )}
                </Card>

                {uploadResults.stats.metrics && (
                  <Card>
                    <CardTitle>🎯 Метрики качества</CardTitle>
                    <MetricsGrid>
                      <MetricItem>
                        <MetricLabel>Accuracy</MetricLabel>
                        <MetricValue color="#6c5ce7">{uploadResults.stats.metrics.accuracy}%</MetricValue>
                      </MetricItem>
                      <MetricItem>
                        <MetricLabel>Precision</MetricLabel>
                        <MetricValue color="#00d26a">{uploadResults.stats.metrics.precision}%</MetricValue>
                      </MetricItem>
                      <MetricItem>
                        <MetricLabel>Recall</MetricLabel>
                        <MetricValue color="#ffa502">{uploadResults.stats.metrics.recall}%</MetricValue>
                      </MetricItem>
                      <MetricItem>
                        <MetricLabel>F1-Score</MetricLabel>
                        <MetricValue color="#ff4757">{uploadResults.stats.metrics.f1_score}%</MetricValue>
                      </MetricItem>
                    </MetricsGrid>

                    <div style={{ marginTop: '25px' }}>
                      <CardTitle style={{ fontSize: '14px' }}>Матрица ошибок</CardTitle>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '10px',
                        marginTop: '15px'
                      }}>
                        <MetricItem style={{ background: 'rgba(0, 210, 106, 0.1)' }}>
                          <MetricLabel>True Positives</MetricLabel>
                          <MetricValue color="#00d26a">{uploadResults.stats.metrics.true_positives}</MetricValue>
                        </MetricItem>
                        <MetricItem style={{ background: 'rgba(255, 71, 87, 0.1)' }}>
                          <MetricLabel>False Positives</MetricLabel>
                          <MetricValue color="#ff4757">{uploadResults.stats.metrics.false_positives}</MetricValue>
                        </MetricItem>
                        <MetricItem style={{ background: 'rgba(255, 71, 87, 0.1)' }}>
                          <MetricLabel>False Negatives</MetricLabel>
                          <MetricValue color="#ff4757">{uploadResults.stats.metrics.false_negatives}</MetricValue>
                        </MetricItem>
                        <MetricItem style={{ background: 'rgba(0, 210, 106, 0.1)' }}>
                          <MetricLabel>True Negatives</MetricLabel>
                          <MetricValue color="#00d26a">{uploadResults.stats.metrics.true_negatives}</MetricValue>
                        </MetricItem>
                      </div>
                    </div>
                  </Card>
                )}
              </ResultsSection>
            </>
          )}
        </>
      )}

      {/* ==================== LIVE TAB ==================== */}
      {activeTab === 'live' && (
        <>
          <InfoBox>
            <InfoTitle>🎬 Демонстрационный режим</InfoTitle>
            <InfoText>
              Это симуляция работы системы в реальном времени. Транзакции генерируются автоматически 
              для демонстрации того, как антифрод-система будет работать в продакшене. 
              Нажмите "Запустить поток" чтобы начать симуляцию.
            </InfoText>
          </InfoBox>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <StatsGrid style={{ flex: 1, marginBottom: 0, marginRight: '20px' }}>
              <StatCard accentColor="#6c5ce7">
                <StatIcon>🔍</StatIcon>
                <StatLabel>Проверено</StatLabel>
                <StatValue>{liveStats.checked}</StatValue>
              </StatCard>
              <StatCard accentColor="#ff4757">
                <StatIcon>🚫</StatIcon>
                <StatLabel>Заблокировано</StatLabel>
                <StatValue>{liveStats.blocked}</StatValue>
              </StatCard>
              <StatCard accentColor="#00d26a">
                <StatIcon>💰</StatIcon>
                <StatLabel>Спасено</StatLabel>
                <StatValue>{(liveStats.saved / 1000).toFixed(0)}K ₸</StatValue>
              </StatCard>
              <StatCard accentColor="#ffa502">
                <StatIcon>📈</StatIcon>
                <StatLabel>Pass Rate</StatLabel>
                <StatValue>{liveStats.passRate}%</StatValue>
              </StatCard>
            </StatsGrid>
            
            <Controls>
              <StatusBadge active={isLive}>
                <LiveDot active={isLive} />
                {isLive ? 'LIVE' : 'PAUSED'}
              </StatusBadge>
              <Button 
                onClick={toggleLiveFeed} 
                variant={isLive ? 'danger' : 'default'}
                style={{ width: 'auto', marginTop: 0 }}
              >
                {isLive ? '⏸ Остановить' : '▶ Запустить поток'}
              </Button>
            </Controls>
          </div>

          <Card>
            <CardTitle>📡 Лента транзакций</CardTitle>
            <FeedContainer>
              <AnimatePresence>
                {transactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#5a5a7a' }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
                    <div>Нажмите "Запустить поток" для начала симуляции</div>
                  </div>
                ) : (
                  transactions.map((tx, idx) => (
                    <TransactionCard
                      key={`${tx.transaction_id}-${idx}`}
                      blocked={tx.verdict === 'BLOCK'}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      onClick={() => tx.explanation && setSelectedTx(tx)}
                    >
                      <VerdictBadge blocked={tx.verdict === 'BLOCK'}>
                        {tx.verdict === 'BLOCK' ? '🚫' : '✅'}
                      </VerdictBadge>
                      <TxInfo>
                        <TxId>TX #{tx.transaction_id}</TxId>
                        <TxMeta>{tx.timestamp} • Риск: {(tx.score * 100).toFixed(1)}%</TxMeta>
                      </TxInfo>
                      <TxAmount blocked={tx.verdict === 'BLOCK'}>
                        {tx.amount.toLocaleString()} ₸
                      </TxAmount>
                      {tx.explanation && (
                        <ViewBtn onClick={(e) => { e.stopPropagation(); setSelectedTx(tx); }}>
                          SHAP
                        </ViewBtn>
                      )}
                    </TransactionCard>
                  ))
                )}
              </AnimatePresence>
            </FeedContainer>
          </Card>
        </>
      )}

      {/* ==================== SHAP MODAL ==================== */}
      <AnimatePresence>
        {selectedTx && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTx(null)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>
                  🔬 Объяснение решения — TX #{selectedTx.transaction_id}
                </ModalTitle>
                <CloseBtn onClick={() => setSelectedTx(null)}>✕</CloseBtn>
              </ModalHeader>

              <div style={{ marginBottom: '25px' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <StatLabel>Сумма</StatLabel>
                    <StatValue style={{ fontSize: '20px' }}>{selectedTx.amount.toLocaleString()} ₸</StatValue>
                  </div>
                  <div>
                    <StatLabel>Скор риска</StatLabel>
                    <StatValue style={{ fontSize: '20px', color: selectedTx.score >= 0.85 ? '#ff4757' : '#ffa502' }}>
                      {(selectedTx.score * 100).toFixed(1)}%
                    </StatValue>
                  </div>
                  <div>
                    <StatLabel>Вердикт</StatLabel>
                    <VerdictBadge blocked={selectedTx.verdict === 'BLOCK'}>
                      {selectedTx.verdict === 'BLOCK' ? '🚫 BLOCK' : '✅ PASS'}
                    </VerdictBadge>
                  </div>
                </div>
              </div>

              <CardTitle style={{ marginBottom: '20px' }}>📊 SHAP-значения признаков</CardTitle>
              <div style={{ fontSize: '12px', color: '#5a5a7a', marginBottom: '15px' }}>
                Красные полосы увеличивают риск фрода, зелёные — уменьшают
              </div>

              {selectedTx.explanation && selectedTx.explanation.length > 0 ? (
                selectedTx.explanation.map((item, idx) => {
                  const maxVal = Math.max(...selectedTx.explanation.map(e => Math.abs(e.shap_value)));
                  const width = (Math.abs(item.shap_value) / maxVal) * 45;
                  const isPositive = item.shap_value > 0;

                  return (
                    <ShapBar key={idx}>
                      <ShapFeature>{formatFeatureName(item.feature_name)}</ShapFeature>
                      <ShapBarContainer>
                        <div style={{ 
                          position: 'absolute', 
                          left: '50%', 
                          top: 0, 
                          bottom: 0, 
                          width: '1px', 
                          background: '#3a3a5a' 
                        }} />
                        <ShapBarFill positive={isPositive} width={width} />
                      </ShapBarContainer>
                      <ShapValue positive={isPositive}>
                        {isPositive ? '+' : ''}{item.shap_value.toFixed(3)}
                      </ShapValue>
                    </ShapBar>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#5a5a7a' }}>
                  Нет данных SHAP для этой транзакции
                </div>
              )}
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default LiveMonitor;
