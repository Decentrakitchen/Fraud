import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { useAnalysis } from '../context/AnalysisContext';

// --- Styled Components ---
const PageContainer = styled.div`
  padding: 30px;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 5px;

  span {
    font-size: 32px;
  }
`;

const PageSubtitle = styled.p`
  color: #5a5a7a;
  font-size: 14px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 80px;
  margin-bottom: 25px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h2`
  font-size: 24px;
  color: #fff;
  margin-bottom: 15px;
`;

const EmptyText = styled.p`
  font-size: 15px;
  color: #5a5a7a;
  max-width: 400px;
  line-height: 1.6;
  margin-bottom: 30px;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
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
  gap: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(108, 92, 231, 0.4);
  }
`;

// --- KPI Section ---
const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const KPICard = styled(motion.div)`
  background: linear-gradient(135deg, ${props => props.gradient || '#12121e, #1a1a2e'});
  border-radius: 20px;
  padding: 25px;
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

const KPIIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
`;

const KPILabel = styled.div`
  font-size: 12px;
  color: #5a5a7a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const KPIValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #fff;
`;

const KPISubvalue = styled.div`
  font-size: 13px;
  color: ${props => props.color || '#5a5a7a'};
  margin-top: 8px;
`;

// --- Charts Section ---
const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  margin-bottom: 25px;

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

// --- Insights Section ---
const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 25px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const InsightCard = styled(motion.div)`
  background: linear-gradient(135deg, ${props => props.gradient || '#12121e, #1a1a2e'});
  border-radius: 16px;
  padding: 22px;
  border: 1px solid ${props => props.borderColor || '#2a2a4a'};
  display: flex;
  gap: 18px;
  align-items: flex-start;
`;

const InsightIcon = styled.div`
  font-size: 36px;
  flex-shrink: 0;
`;

const InsightContent = styled.div`
  flex: 1;
`;

const InsightTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
`;

const InsightText = styled.p`
  font-size: 13px;
  color: #8888aa;
  line-height: 1.6;
`;

const InsightValue = styled.span`
  color: ${props => props.color || '#6c5ce7'};
  font-weight: 600;
`;

// --- Metrics Section ---
const MetricsCard = styled(Card)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MetricItem = styled.div`
  text-align: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
`;

const MetricLabel = styled.div`
  font-size: 11px;
  color: #5a5a7a;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.color || '#fff'};
`;

// --- Top Blocked Table ---
const TableContainer = styled.div`
  max-height: 300px;
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
  background: rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
`;

const Td = styled.td`
  padding: 12px 15px;
  font-size: 13px;
  color: #e0e0e0;
  border-bottom: 1px solid #2a2a4a;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  background: ${props => props.type === 'danger' ? 'rgba(255, 71, 87, 0.2)' : 'rgba(255, 165, 2, 0.2)'};
  color: ${props => props.type === 'danger' ? '#ff4757' : '#ffa502'};
`;

// --- Custom Tooltip ---
const CustomTooltip = styled.div`
  background: rgba(20, 20, 40, 0.95);
  border: 1px solid #3a3a5a;
  border-radius: 10px;
  padding: 12px 16px;
`;

const TooltipLabel = styled.div`
  font-size: 12px;
  color: #8888aa;
  margin-bottom: 5px;
`;

const TooltipValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
`;

// --- File Info ---
const FileInfoBar = styled.div`
  background: rgba(108, 92, 231, 0.1);
  border: 1px solid rgba(108, 92, 231, 0.3);
  border-radius: 12px;
  padding: 15px 20px;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FileInfoText = styled.div`
  font-size: 14px;
  color: #a29bfe;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FileInfoDate = styled.span`
  font-size: 12px;
  color: #5a5a7a;
`;

// --- Colors ---
const COLORS = ['#ff4757', '#ffa502', '#00d26a', '#0984e3', '#6c5ce7'];
const PIE_COLORS = ['#ff4757', '#ffa502', '#00d26a', '#0984e3', '#6c5ce7', '#e84393'];

// ==================== HELPER FUNCTIONS ====================

const getDayName = (dayIndex) => {
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  return days[dayIndex] || 'Неизвестно';
};

const getHourPeriod = (hour) => {
  if (hour >= 0 && hour < 6) return 'ночью (00:00-06:00)';
  if (hour >= 6 && hour < 12) return 'утром (06:00-12:00)';
  if (hour >= 12 && hour < 18) return 'днём (12:00-18:00)';
  return 'вечером (18:00-00:00)';
};

// ==================== MAIN COMPONENT ====================

const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const { analysisData } = useAnalysis();

  // Вычисляем аналитику на основе загруженных данных
  const analytics = useMemo(() => {
    if (!analysisData || !analysisData.predictions) return null;

    const predictions = analysisData.predictions;
    const blocked = predictions.filter(p => p.verdict === 'BLOCK');
    const passed = predictions.filter(p => p.verdict === 'PASS');

    // Распределение по часам
    const hourlyDistribution = {};
    const hourlyFraud = {};
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i] = 0;
      hourlyFraud[i] = 0;
    }

    // Распределение по дням недели
    const dailyDistribution = {};
    const dailyFraud = {};
    for (let i = 0; i < 7; i++) {
      dailyDistribution[i] = 0;
      dailyFraud[i] = 0;
    }

    // Распределение по суммам
    const amountRanges = {
      '0-10K': { total: 0, fraud: 0 },
      '10-50K': { total: 0, fraud: 0 },
      '50-100K': { total: 0, fraud: 0 },
      '100-500K': { total: 0, fraud: 0 },
      '500K+': { total: 0, fraud: 0 }
    };

    // Распределение скоров
    const scoreRanges = {
      '0-20%': 0,
      '20-40%': 0,
      '40-60%': 0,
      '60-80%': 0,
      '80-100%': 0
    };

    // Средние значения для инсайтов
    let totalAmount = 0;
    let fraudAmount = 0;
    let avgFraudScore = 0;
    let nightFraud = 0;
    let weekendFraud = 0;
    let coldStartFraud = 0;
    let highOsChangeFraud = 0;

    // Обрабатываем каждую транзакцию
    // Примечание: у нас нет hour_of_day в результатах, но если бы был - использовали бы его
    predictions.forEach((tx, idx) => {
      const amount = tx.amount || 0;
      totalAmount += amount;
      
      // Скор
      const scorePercent = tx.score * 100;
      if (scorePercent < 20) scoreRanges['0-20%']++;
      else if (scorePercent < 40) scoreRanges['20-40%']++;
      else if (scorePercent < 60) scoreRanges['40-60%']++;
      else if (scorePercent < 80) scoreRanges['60-80%']++;
      else scoreRanges['80-100%']++;

      // Суммы
      if (amount < 10000) {
        amountRanges['0-10K'].total++;
        if (tx.verdict === 'BLOCK') amountRanges['0-10K'].fraud++;
      } else if (amount < 50000) {
        amountRanges['10-50K'].total++;
        if (tx.verdict === 'BLOCK') amountRanges['10-50K'].fraud++;
      } else if (amount < 100000) {
        amountRanges['50-100K'].total++;
        if (tx.verdict === 'BLOCK') amountRanges['50-100K'].fraud++;
      } else if (amount < 500000) {
        amountRanges['100-500K'].total++;
        if (tx.verdict === 'BLOCK') amountRanges['100-500K'].fraud++;
      } else {
        amountRanges['500K+'].total++;
        if (tx.verdict === 'BLOCK') amountRanges['500K+'].fraud++;
      }

      if (tx.verdict === 'BLOCK') {
        fraudAmount += amount;
        avgFraudScore += tx.score;
      }
    });

    // Рассчитываем средний скор фрода
    if (blocked.length > 0) {
      avgFraudScore = avgFraudScore / blocked.length;
    }

    // Данные для графика сумм
    const amountChartData = Object.entries(amountRanges).map(([range, data]) => ({
      range,
      total: data.total,
      fraud: data.fraud,
      fraudRate: data.total > 0 ? ((data.fraud / data.total) * 100).toFixed(1) : 0
    }));

    // Данные для графика скоров
    const scoreChartData = Object.entries(scoreRanges).map(([range, count]) => ({
      range,
      count
    }));

    // Топ заблокированных по сумме
    const topBlocked = [...blocked]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // Вычисляем инсайты
    const avgAmount = totalAmount / predictions.length;
    const avgFraudAmount = blocked.length > 0 ? fraudAmount / blocked.length : 0;
    const fraudRate = (blocked.length / predictions.length) * 100;

    // Находим диапазон с наибольшим % фрода
    let maxFraudRateRange = { range: '', rate: 0 };
    Object.entries(amountRanges).forEach(([range, data]) => {
      if (data.total > 0) {
        const rate = (data.fraud / data.total) * 100;
        if (rate > maxFraudRateRange.rate) {
          maxFraudRateRange = { range, rate };
        }
      }
    });

    return {
      total: predictions.length,
      blocked: blocked.length,
      passed: passed.length,
      fraudRate,
      totalAmount,
      fraudAmount,
      avgAmount,
      avgFraudAmount,
      avgFraudScore,
      amountChartData,
      scoreChartData,
      topBlocked,
      maxFraudRateRange,
      metrics: analysisData.stats?.metrics || null
    };
  }, [analysisData]);

  // Если нет данных
  if (!analysisData || !analytics) {
    return (
      <PageContainer>
        <Header>
          <PageTitle>
            <span>📊</span>
            Аналитика и статистика
          </PageTitle>
          <PageSubtitle>Детальный анализ загруженных данных</PageSubtitle>
        </Header>

        <EmptyState>
          <EmptyIcon>📂</EmptyIcon>
          <EmptyTitle>Нет данных для анализа</EmptyTitle>
          <EmptyText>
            Загрузите датасет с транзакциями на странице "Анализ транзакций", 
            чтобы увидеть подробную статистику и инсайты.
          </EmptyText>
          <Button onClick={() => navigate('/')}>
            📁 Загрузить датасет
          </Button>
        </EmptyState>
      </PageContainer>
    );
  }

  const renderTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <CustomTooltip>
          <TooltipLabel>{label}</TooltipLabel>
          {payload.map((entry, index) => (
            <TooltipValue key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </TooltipValue>
          ))}
        </CustomTooltip>
      );
    }
    return null;
  };

  return (
    <PageContainer>
      <Header>
        <PageTitle>
          <span>📊</span>
          Аналитика и статистика
        </PageTitle>
        <PageSubtitle>Детальный анализ загруженных данных • {analysisData.filename}</PageSubtitle>
      </Header>

      <FileInfoBar>
        <FileInfoText>
          📄 Файл: <strong>{analysisData.filename}</strong>
          <FileInfoDate>
            Проанализирован: {new Date(analysisData.analyzedAt).toLocaleString('ru-RU')}
          </FileInfoDate>
        </FileInfoText>
        <Button onClick={() => navigate('/')} style={{ padding: '10px 20px', fontSize: '13px' }}>
          📁 Загрузить другой файл
        </Button>
      </FileInfoBar>

      {/* KPI Cards */}
      <KPIGrid>
        <KPICard
          accentColor="#6c5ce7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <KPIIcon>🔍</KPIIcon>
          <KPILabel>Всего транзакций</KPILabel>
          <KPIValue>{analytics.total.toLocaleString()}</KPIValue>
          <KPISubvalue>в загруженном датасете</KPISubvalue>
        </KPICard>

        <KPICard
          accentColor="#ff4757"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <KPIIcon>🚫</KPIIcon>
          <KPILabel>Заблокировано</KPILabel>
          <KPIValue>{analytics.blocked.toLocaleString()}</KPIValue>
          <KPISubvalue color="#ff4757">{analytics.fraudRate.toFixed(1)}% от общего числа</KPISubvalue>
        </KPICard>

        <KPICard
          accentColor="#00d26a"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <KPIIcon>💰</KPIIcon>
          <KPILabel>Спасённые средства</KPILabel>
          <KPIValue>{(analytics.fraudAmount / 1000000).toFixed(2)}M ₸</KPIValue>
          <KPISubvalue color="#00d26a">сумма заблокированных переводов</KPISubvalue>
        </KPICard>

        <KPICard
          accentColor="#ffa502"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <KPIIcon>📈</KPIIcon>
          <KPILabel>Средний скор фрода</KPILabel>
          <KPIValue>{(analytics.avgFraudScore * 100).toFixed(1)}%</KPIValue>
          <KPISubvalue>у заблокированных транзакций</KPISubvalue>
        </KPICard>
      </KPIGrid>

      {/* Metrics Card (if available) */}
      {analytics.metrics && (
        <MetricsCard style={{ marginBottom: '25px' }}>
          <MetricItem>
            <MetricLabel>Accuracy</MetricLabel>
            <MetricValue color="#6c5ce7">{analytics.metrics.accuracy}%</MetricValue>
          </MetricItem>
          <MetricItem>
            <MetricLabel>Precision</MetricLabel>
            <MetricValue color="#00d26a">{analytics.metrics.precision}%</MetricValue>
          </MetricItem>
          <MetricItem>
            <MetricLabel>Recall</MetricLabel>
            <MetricValue color="#ffa502">{analytics.metrics.recall}%</MetricValue>
          </MetricItem>
          <MetricItem>
            <MetricLabel>F1-Score</MetricLabel>
            <MetricValue color="#ff4757">{analytics.metrics.f1_score}%</MetricValue>
          </MetricItem>
        </MetricsCard>
      )}

      {/* Insights */}
      <InsightsGrid>
        <InsightCard
          gradient="rgba(255, 71, 87, 0.05), rgba(20, 20, 40, 0.8)"
          borderColor="rgba(255, 71, 87, 0.2)"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <InsightIcon>💸</InsightIcon>
          <InsightContent>
            <InsightTitle>Опасный диапазон сумм</InsightTitle>
            <InsightText>
              Наибольшая доля мошенничества ({<InsightValue color="#ff4757">{analytics.maxFraudRateRange.rate.toFixed(1)}%</InsightValue>}) 
              наблюдается в транзакциях с суммой <InsightValue color="#ff4757">{analytics.maxFraudRateRange.range}</InsightValue> тенге.
              Рекомендуется усилить проверку переводов в этом диапазоне.
            </InsightText>
          </InsightContent>
        </InsightCard>

        <InsightCard
          gradient="rgba(0, 210, 106, 0.05), rgba(20, 20, 40, 0.8)"
          borderColor="rgba(0, 210, 106, 0.2)"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <InsightIcon>🎯</InsightIcon>
          <InsightContent>
            <InsightTitle>Средняя сумма мошенничества</InsightTitle>
            <InsightText>
              Средняя сумма заблокированной транзакции составляет{' '}
              <InsightValue color="#00d26a">{analytics.avgFraudAmount.toLocaleString()} ₸</InsightValue>,
              что в <InsightValue color="#00d26a">{(analytics.avgFraudAmount / analytics.avgAmount).toFixed(1)}x</InsightValue> раз больше 
              средней легитимной транзакции.
            </InsightText>
          </InsightContent>
        </InsightCard>

        <InsightCard
          gradient="rgba(108, 92, 231, 0.05), rgba(20, 20, 40, 0.8)"
          borderColor="rgba(108, 92, 231, 0.2)"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <InsightIcon>🛡️</InsightIcon>
          <InsightContent>
            <InsightTitle>Эффективность защиты</InsightTitle>
            <InsightText>
              Система успешно идентифицировала <InsightValue>{analytics.blocked}</InsightValue> подозрительных транзакций 
              и предотвратила потенциальный ущерб в размере{' '}
              <InsightValue>{(analytics.fraudAmount / 1000000).toFixed(2)} млн ₸</InsightValue>.
            </InsightText>
          </InsightContent>
        </InsightCard>

        <InsightCard
          gradient="rgba(255, 165, 2, 0.05), rgba(20, 20, 40, 0.8)"
          borderColor="rgba(255, 165, 2, 0.2)"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <InsightIcon>📊</InsightIcon>
          <InsightContent>
            <InsightTitle>Уровень риска датасета</InsightTitle>
            <InsightText>
              {analytics.fraudRate > 10 ? (
                <>Высокий уровень риска: <InsightValue color="#ff4757">{analytics.fraudRate.toFixed(1)}%</InsightValue> транзакций заблокировано. 
                Требуется пристальное внимание к данному сегменту клиентов.</>
              ) : analytics.fraudRate > 5 ? (
                <>Средний уровень риска: <InsightValue color="#ffa502">{analytics.fraudRate.toFixed(1)}%</InsightValue> транзакций заблокировано. 
                Стандартный уровень мошенничества для данного типа операций.</>
              ) : (
                <>Низкий уровень риска: всего <InsightValue color="#00d26a">{analytics.fraudRate.toFixed(1)}%</InsightValue> транзакций заблокировано. 
                Клиентская база демонстрирует высокое качество.</>
              )}
            </InsightText>
          </InsightContent>
        </InsightCard>
      </InsightsGrid>

      {/* Charts */}
      <ChartsGrid>
        <Card>
          <CardTitle>📊 Распределение по суммам транзакций</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.amountChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis dataKey="range" stroke="#5a5a7a" fontSize={11} />
              <YAxis stroke="#5a5a7a" fontSize={11} />
              <Tooltip content={renderTooltip} />
              <Legend 
                wrapperStyle={{ paddingTop: '15px' }}
                formatter={(value) => <span style={{ color: '#8888aa', fontSize: '12px' }}>{value}</span>}
              />
              <Bar dataKey="total" name="Всего" fill="#6c5ce7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fraud" name="Фрод" fill="#ff4757" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle>🎯 Распределение скоров риска</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.scoreChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="count"
                label={({ range, percent }) => `${range} (${(percent * 100).toFixed(0)}%)`}
                labelLine={{ stroke: '#5a5a7a', strokeWidth: 1 }}
              >
                {analytics.scoreChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={renderTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </ChartsGrid>

      {/* Top Blocked Table */}
      <Card>
        <CardTitle>🚨 Топ-10 заблокированных транзакций по сумме</CardTitle>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>ID транзакции</Th>
                <Th>Сумма</Th>
                <Th>Скор риска</Th>
                <Th>Уровень</Th>
              </tr>
            </thead>
            <tbody>
              {analytics.topBlocked.map((tx, idx) => (
                <tr key={tx.transaction_id || idx}>
                  <Td>{idx + 1}</Td>
                  <Td>#{tx.transaction_id}</Td>
                  <Td style={{ fontWeight: 600, color: '#ff4757' }}>
                    {tx.amount.toLocaleString()} ₸
                  </Td>
                  <Td>{(tx.score * 100).toFixed(1)}%</Td>
                  <Td>
                    <Badge type={tx.score >= 0.9 ? 'danger' : 'warning'}>
                      {tx.score >= 0.9 ? 'Критический' : 'Высокий'}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </Card>
    </PageContainer>
  );
};

export default ExecutiveDashboard;
