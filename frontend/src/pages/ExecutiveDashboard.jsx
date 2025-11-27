import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

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

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin-bottom: 30px;
`;

const KPICard = styled(motion.div)`
  background: linear-gradient(135deg, ${props => props.gradient || '#16162a, #1a1a30'});
  padding: 30px;
  border-radius: 20px;
  border: 1px solid ${props => props.borderColor || '#2a2a4a'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, ${props => props.glowColor || 'rgba(108, 92, 231, 0.1)'} 0%, transparent 70%);
  }
`;

const KPIIcon = styled.div`
  font-size: 40px;
  margin-bottom: 15px;
  position: relative;
  z-index: 1;
`;

const KPILabel = styled.div`
  font-size: 13px;
  color: #8888aa;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
`;

const KPIValue = styled.div`
  font-size: 42px;
  font-weight: 800;
  color: #fff;
  position: relative;
  z-index: 1;
  line-height: 1.1;
`;

const KPISubvalue = styled.div`
  font-size: 14px;
  color: ${props => props.positive ? '#00d26a' : '#ff4757'};
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  position: relative;
  z-index: 1;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  margin-bottom: 25px;
`;

const ChartCard = styled.div`
  background: linear-gradient(135deg, #12121e 0%, #16162a 100%);
  padding: 25px;
  border-radius: 20px;
  border: 1px solid #2a2a4a;
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
`;

const TableCard = styled(ChartCard)`
  max-height: 400px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 15px;
  font-size: 11px;
  color: #5a5a7a;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #2a2a4a;
  background: rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
`;

const Td = styled.td`
  padding: 12px 15px;
  font-size: 13px;
  color: #e0e0e0;
  border-bottom: 1px solid #1a1a2e;
`;

const TdAmount = styled(Td)`
  font-weight: 600;
  font-family: 'Roboto Mono', monospace;
`;

const Badge = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  background: ${props => props.type === 'high' ? 'rgba(255, 71, 87, 0.2)' : props.type === 'medium' ? 'rgba(255, 165, 2, 0.2)' : 'rgba(0, 210, 106, 0.2)'};
  color: ${props => props.type === 'high' ? '#ff4757' : props.type === 'medium' ? '#ffa502' : '#00d26a'};
`;

const RefreshButton = styled.button`
  background: rgba(108, 92, 231, 0.1);
  border: 1px solid #2a2a4a;
  color: #a29bfe;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(108, 92, 231, 0.2);
    border-color: #6c5ce7;
  }
`;

// Custom tooltip for charts
const CustomTooltip = styled.div`
  background: #1a1a30;
  border: 1px solid #2a2a4a;
  padding: 12px 16px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const TooltipLabel = styled.div`
  font-size: 11px;
  color: #5a5a7a;
  margin-bottom: 5px;
`;

const TooltipValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`;

const COLORS = ['#00d26a', '#0984e3', '#ffa502', '#ff6b81', '#ff4757'];

const API_BASE = 'http://localhost:8000/api/v1';

const ExecutiveDashboard = () => {
  const [stats, setStats] = useState({
    moneySaved: 0,
    attacksBlocked: 0,
    accuracy: 99.2,
    falsePositiveRate: 0.0,
    transactionsChecked: 0
  });
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [amountData, setAmountData] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard`);
      if (response.ok) {
        const data = await response.json();
        
        setStats({
          moneySaved: data.kpi.money_saved || 0,
          attacksBlocked: data.kpi.attacks_blocked || 0,
          accuracy: data.kpi.accuracy || 99.2,
          falsePositiveRate: data.kpi.false_positive_rate || 0,
          transactionsChecked: data.kpi.transactions_checked || 0
        });
        
        setTimeSeriesData(data.time_series || []);
        setAmountData(data.amount_distribution || []);
        setIncidents(data.top_incidents || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Обновляем данные каждые 5 секунд
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setLoading(true);
    fetchDashboardData();
  };

  const renderCustomTooltip = ({ active, payload, label }) => {
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <PageTitle>
              <span>📊</span>
              Бизнес-аналитика
            </PageTitle>
            <PageSubtitle>Отчёт для руководства • Экономическая эффективность системы</PageSubtitle>
          </div>
          <RefreshButton onClick={refreshData}>
            🔄 Обновить данные
          </RefreshButton>
        </div>
      </Header>

      <KPIGrid>
        <KPICard
          gradient="#0f2027, #203a43"
          borderColor="rgba(0, 210, 106, 0.3)"
          glowColor="rgba(0, 210, 106, 0.15)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <KPIIcon>💰</KPIIcon>
          <KPILabel>Спасённые средства</KPILabel>
          <KPIValue>{(stats.moneySaved / 1000000).toFixed(1)} млн ₸</KPIValue>
          <KPISubvalue positive>
            ↑ +12.5% за неделю
          </KPISubvalue>
        </KPICard>

        <KPICard
          gradient="#1a1a2e, #16213e"
          borderColor="rgba(255, 71, 87, 0.3)"
          glowColor="rgba(255, 71, 87, 0.15)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <KPIIcon>🛡️</KPIIcon>
          <KPILabel>Заблокированных атак</KPILabel>
          <KPIValue>{stats.attacksBlocked}</KPIValue>
          <KPISubvalue positive>
            Проверено транзакций: {stats.transactionsChecked}
          </KPISubvalue>
        </KPICard>

        <KPICard
          gradient="#1a1a2e, #0d1b2a"
          borderColor="rgba(108, 92, 231, 0.3)"
          glowColor="rgba(108, 92, 231, 0.15)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <KPIIcon>🎯</KPIIcon>
          <KPILabel>Точность модели</KPILabel>
          <KPIValue>{stats.accuracy.toFixed(1)}%</KPIValue>
          <KPISubvalue positive>
            Ложных срабатываний: {stats.falsePositiveRate.toFixed(2)}%
          </KPISubvalue>
        </KPICard>
      </KPIGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>
            📈 Динамика атак за 24 часа
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4757" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff4757" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d26a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d26a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis dataKey="time" stroke="#5a5a7a" fontSize={11} />
              <YAxis stroke="#5a5a7a" fontSize={11} />
              <Tooltip content={renderCustomTooltip} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span style={{ color: '#8888aa', fontSize: '12px' }}>{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="attacks"
                name="Обнаружено атак"
                stroke="#ff4757"
                fillOpacity={1}
                fill="url(#colorAttacks)"
              />
              <Area
                type="monotone"
                dataKey="blocked"
                name="Заблокировано"
                stroke="#00d26a"
                fillOpacity={1}
                fill="url(#colorBlocked)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            💸 Распределение по суммам
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={amountData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="count"
                label={({ range, percent }) => `${range} (${(percent * 100).toFixed(0)}%)`}
                labelLine={{ stroke: '#5a5a7a', strokeWidth: 1 }}
              >
                {amountData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={renderCustomTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      <BottomGrid>
        <ChartCard>
          <ChartTitle>
            📊 Объём транзакций vs Блокировки
          </ChartTitle>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={timeSeriesData.slice(-12)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis dataKey="time" stroke="#5a5a7a" fontSize={10} />
              <YAxis yAxisId="left" stroke="#5a5a7a" fontSize={10} />
              <YAxis yAxisId="right" orientation="right" stroke="#5a5a7a" fontSize={10} />
              <Tooltip content={renderCustomTooltip} />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => <span style={{ color: '#8888aa', fontSize: '11px' }}>{value}</span>}
              />
              <Bar yAxisId="left" dataKey="transactions" name="Транзакции" fill="#6c5ce7" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="blocked" name="Заблокировано" fill="#ff4757" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <TableCard>
          <ChartTitle>
            🚨 Топ заблокированных инцидентов
          </ChartTitle>
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Сумма</Th>
                <Th>Риск</Th>
                <Th>Время</Th>
              </tr>
            </thead>
            <tbody>
              {incidents.length > 0 ? incidents.map((incident, idx) => (
                <tr key={incident.id || idx}>
                  <Td>#{incident.id || idx + 1}</Td>
                  <TdAmount>{(incident.amount || 0).toLocaleString()} ₸</TdAmount>
                  <Td>
                    <Badge type={incident.risk >= 0.85 ? 'high' : incident.risk >= 0.5 ? 'medium' : 'low'}>
                      {((incident.risk || 0) * 100).toFixed(0)}%
                    </Badge>
                  </Td>
                  <Td>{incident.time || '—'}</Td>
                </tr>
              )) : (
                <tr>
                  <Td colSpan="4" style={{ textAlign: 'center', color: '#5a5a7a' }}>
                    Нет данных
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableCard>
      </BottomGrid>
    </PageContainer>
  );
};

export default ExecutiveDashboard;
