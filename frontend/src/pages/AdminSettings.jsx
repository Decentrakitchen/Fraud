import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// --- Animations ---
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const progress = keyframes`
  0% { width: 0%; }
  100% { width: 100%; }
`;

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
`;

const Card = styled.div`
  background: linear-gradient(135deg, #12121e 0%, #16162a 100%);
  padding: 30px;
  border-radius: 20px;
  border: 1px solid #2a2a4a;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CardDescription = styled.p`
  font-size: 13px;
  color: #5a5a7a;
  margin-bottom: 25px;
  line-height: 1.6;
`;

const SliderSection = styled.div`
  margin-bottom: 30px;
`;

const SliderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const SliderLabel = styled.span`
  font-size: 14px;
  color: #8888aa;
`;

const SliderValue = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: ${props => {
    if (props.value > 75) return '#00d26a';
    if (props.value >= 60) return '#ffa502';
    return '#ff4757';
  }};
`;

const SliderContainer = styled.div`
  position: relative;
  padding: 10px 0;
`;

const SliderTrack = styled.div`
  width: 100%;
  height: 8px;
  background: linear-gradient(90deg, 
    #ff4757 0%, 
    #ff6b7a 25%, 
    #ffa502 50%, 
    #7bed9f 75%, 
    #00d26a 100%
  );
  border-radius: 4px;
  position: relative;
`;

const SliderInput = styled.input`
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  position: absolute;
  top: 10px;
  left: 0;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    border: 3px solid #6c5ce7;
    transition: all 0.2s;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(108, 92, 231, 0.4);
    }
  }

  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    border: 3px solid #6c5ce7;
  }
`;

const SliderMarks = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 11px;
  color: #5a5a7a;
`;

const HintBox = styled.div`
  background: ${props => props.type === 'warning' 
    ? 'rgba(255, 165, 2, 0.1)' 
    : props.type === 'success' 
    ? 'rgba(0, 210, 106, 0.1)' 
    : 'rgba(108, 92, 231, 0.1)'};
  border: 1px solid ${props => props.type === 'warning' 
    ? 'rgba(255, 165, 2, 0.3)' 
    : props.type === 'success' 
    ? 'rgba(0, 210, 106, 0.3)' 
    : 'rgba(108, 92, 231, 0.3)'};
  padding: 15px 20px;
  border-radius: 12px;
  font-size: 13px;
  color: #8888aa;
  line-height: 1.6;
  margin-top: 20px;
`;

const Button = styled.button`
  background: ${props => props.variant === 'primary' 
    ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' 
    : props.variant === 'danger'
    ? 'linear-gradient(135deg, #ff4757, #ff6b81)'
    : 'rgba(255, 255, 255, 0.05)'};
  color: white;
  border: ${props => props.variant ? 'none' : '1px solid #2a2a4a'};
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.variant === 'primary' 
      ? '0 6px 20px rgba(108, 92, 231, 0.4)'
      : props.variant === 'danger'
      ? '0 6px 20px rgba(255, 71, 87, 0.4)'
      : '0 4px 15px rgba(0, 0, 0, 0.2)'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const ProgressSection = styled(motion.div)`
  margin-top: 25px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid #2a2a4a;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ProgressTitle = styled.div`
  font-size: 14px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ProgressPercent = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #6c5ce7;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #2a2a4a;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #6c5ce7, #a29bfe);
  border-radius: 3px;
  width: ${props => props.percent}%;
  transition: width 0.3s ease;
`;

const ProgressSteps = styled.div`
  margin-top: 15px;
`;

const ProgressStep = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: ${props => props.active ? '#00d26a' : props.completed ? '#5a5a7a' : '#3a3a5a'};
  margin-bottom: 8px;
  
  &::before {
    content: '${props => props.completed ? '✓' : props.active ? '⟳' : '○'}';
    width: 18px;
    text-align: center;
    ${props => props.active && `animation: ${spin} 1s linear infinite;`}
  }
`;

const SpinnerIcon = styled.span`
  animation: ${spin} 1s linear infinite;
  display: inline-block;
`;

const FileUploadZone = styled.div`
  border: 2px dashed #2a2a4a;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(0, 0, 0, 0.2);

  &:hover {
    border-color: #6c5ce7;
    background: rgba(108, 92, 231, 0.05);
  }
`;

const UploadIcon = styled.div`
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.5;
`;

const UploadText = styled.div`
  font-size: 14px;
  color: #8888aa;
  margin-bottom: 10px;
`;

const UploadHint = styled.div`
  font-size: 12px;
  color: #5a5a7a;
`;

const SettingsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #2a2a4a;

  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  font-size: 14px;
  color: #e0e0e0;
`;

const SettingDescription = styled.div`
  font-size: 12px;
  color: #5a5a7a;
  margin-top: 4px;
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  }

  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #2a2a4a;
  border-radius: 26px;
  transition: 0.3s;

  &:before {
    position: absolute;
    content: '';
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background: white;
    border-radius: 50%;
    transition: 0.3s;
  }
`;

const StatusBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 15px;
  background: ${props => props.online ? 'rgba(0, 210, 106, 0.15)' : 'rgba(255, 71, 87, 0.15)'};
  color: ${props => props.online ? '#00d26a' : '#ff4757'};
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => props.online ? '#00d26a' : '#ff4757'};
    animation: ${props => props.online ? pulse : 'none'} 2s infinite;
  }
`;

const ModelInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 20px;
`;

const ModelInfoItem = styled.div`
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
`;

const ModelInfoLabel = styled.div`
  font-size: 11px;
  color: #5a5a7a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
`;

const ModelInfoValue = styled.div`
  font-size: 14px;
  color: #fff;
  font-weight: 500;
`;

const AdminSettings = () => {
  const [threshold, setThreshold] = useState(60);
  const [settings, setSettings] = useState({
    autoBlock: true,
    notifications: true,
    logging: true,
    apiAccess: false
  });
  const [modelInfo, setModelInfo] = useState({
    algorithm: 'CatBoost Classifier',
    version: 'v2.4.1',
    trainDate: '27 ноября 2025',
    features: 25,
    rocAuc: 0.967,
    f1Score: 0.943
  });

  // Auto-update states
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [updateSchedule, setUpdateSchedule] = useState('weekly');
  const [lastCheck, setLastCheck] = useState(new Date());
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);

  // Загрузка конфигурации при монтировании
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_BASE}/config`);
        if (response.ok) {
          const data = await response.json();
          setThreshold(Math.round((data.threshold || 0.60) * 100));
        }
      } catch (error) {
        console.error('Failed to fetch config:', error);
      }
    };
    fetchConfig();
  }, []);

  // Симуляция проверки обновлений модели
  useEffect(() => {
    if (autoUpdateEnabled) {
      const checkForUpdates = () => {
        // Имитация проверки обновлений из Model Registry
        const hasUpdate = Math.random() > 0.7;
        if (hasUpdate) {
          setPendingUpdate({
            version: 'v2.5.0',
            improvements: ['Улучшена точность на 2.3%', 'Добавлены новые паттерны фрода', 'Оптимизация скорости'],
            size: '45 MB',
            releaseDate: new Date().toLocaleDateString('ru-RU')
          });
        }
        setLastCheck(new Date());
      };
      
      const interval = setInterval(checkForUpdates, 60000); // Проверка каждую минуту
      return () => clearInterval(interval);
    }
  }, [autoUpdateEnabled]);

  const handleThresholdChange = async (e) => {
    const newValue = parseInt(e.target.value);
    setThreshold(newValue);
    
    // Отправляем на бэкенд
    try {
      await fetch(`${API_BASE}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: newValue / 100 })
      });
    } catch (error) {
      console.error('Failed to update threshold:', error);
    }
  };

  const resetThreshold = async () => {
    const defaultValue = 60;
    setThreshold(defaultValue);
    
    try {
      await fetch(`${API_BASE}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: defaultValue / 100 })
      });
    } catch (error) {
      console.error('Failed to reset threshold:', error);
    }
  };

  const getThresholdHint = () => {
    if (threshold >= 80) {
      return {
        type: 'success',
        text: `При пороге ${threshold}% система будет блокировать только явное мошенничество. Минимум ложных срабатываний, но могут пройти хитрые атаки.`
      };
    } else if (threshold >= 60) {
      return {
        type: 'info',
        text: `При пороге ${threshold}% — оптимальный баланс. Большинство мошенников будут пойманы, около 2-3% честных транзакций уйдут на ручную проверку.`
      };
    } else {
      return {
        type: 'warning',
        text: `При пороге ${threshold}% система будет агрессивной. Поймаем почти всех мошенников, но до 10% клиентов могут столкнуться с ложной блокировкой.`
      };
    }
  };

  const startAutoUpdate = async () => {
    if (!pendingUpdate) return;
    
    setIsUpdating(true);
    setUpdateProgress(0);
    
    // Симуляция процесса обновления модели
    const steps = [10, 25, 45, 60, 75, 90, 100];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUpdateProgress(steps[i]);
    }
    
    // Обновляем информацию о модели
    setModelInfo(prev => ({
      ...prev,
      version: pendingUpdate.version,
      trainDate: pendingUpdate.releaseDate
    }));
    
    setPendingUpdate(null);
    setIsUpdating(false);
    setUpdateProgress(0);
  };

  const dismissUpdate = () => {
    setPendingUpdate(null);
  };

  const hint = getThresholdHint();

  return (
    <PageContainer>
      <Header>
        <PageTitle>
          <span>⚙️</span>
          Панель управления
        </PageTitle>
        <PageSubtitle>Настройка модели и параметров системы • MLOps</PageSubtitle>
      </Header>

      <Grid>
        {/* Threshold Tuning Card */}
        <Card>
          <CardTitle>
            🎚️ Настройка чувствительности
          </CardTitle>
          <CardDescription>
            Управляйте порогом блокировки транзакций. Более низкий порог означает более строгую проверку,
            но увеличивает количество ложных срабатываний.
          </CardDescription>

          <SliderSection>
            <SliderHeader>
              <SliderLabel>Порог блокировки</SliderLabel>
              <SliderValue value={threshold}>{threshold}%</SliderValue>
            </SliderHeader>
            
            <SliderContainer>
              <SliderTrack />
              <SliderInput
                type="range"
                min="30"
                max="90"
                value={threshold}
                onChange={handleThresholdChange}
              />
            </SliderContainer>
            
            <SliderMarks>
              <span>30% (Строго)</span>
              <span>60%</span>
              <span>90% (Мягко)</span>
              <span>99% (Мягко)</span>
            </SliderMarks>
          </SliderSection>

          <HintBox type={hint.type}>
            💡 {hint.text}
          </HintBox>

          <ButtonGroup>
            <Button onClick={resetThreshold}>
              Сбросить по умолчанию (60%)
            </Button>
          </ButtonGroup>
        </Card>

        {/* Auto Model Update Card */}
        <Card>
          <CardTitle>
            🔄 Автоматическое обновление модели
          </CardTitle>
          <CardDescription>
            Система автоматически проверяет и загружает новые версии модели из Model Registry.
            Обновления применяются без остановки сервиса (hot-swap).
          </CardDescription>

          <SettingsRow>
            <div>
              <SettingLabel>Автообновление модели</SettingLabel>
              <SettingDescription>Автоматически загружать и применять новые версии</SettingDescription>
            </div>
            <Toggle>
              <ToggleInput 
                type="checkbox" 
                checked={autoUpdateEnabled}
                onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
              />
              <ToggleSlider />
            </Toggle>
          </SettingsRow>

          <SettingsRow>
            <div>
              <SettingLabel>Расписание проверки</SettingLabel>
              <SettingDescription>Как часто проверять наличие обновлений</SettingDescription>
            </div>
            <select
              value={updateSchedule}
              onChange={(e) => setUpdateSchedule(e.target.value)}
              style={{
                background: '#1a1a2e',
                border: '1px solid #2a2a4a',
                borderRadius: '8px',
                padding: '8px 15px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <option value="hourly">Каждый час</option>
              <option value="daily">Ежедневно</option>
              <option value="weekly">Еженедельно</option>
            </select>
          </SettingsRow>

          <HintBox type="info">
            📡 Последняя проверка: {lastCheck.toLocaleString('ru-RU')}
          </HintBox>

          <AnimatePresence>
            {pendingUpdate && (
              <ProgressSection
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ background: 'rgba(108, 92, 231, 0.1)', borderColor: 'rgba(108, 92, 231, 0.3)' }}
              >
                <ProgressHeader>
                  <ProgressTitle>
                    🆕 Доступно обновление: <strong style={{ color: '#a29bfe', marginLeft: '8px' }}>{pendingUpdate.version}</strong>
                  </ProgressTitle>
                  <span style={{ fontSize: '12px', color: '#5a5a7a' }}>{pendingUpdate.size}</span>
                </ProgressHeader>
                
                <div style={{ marginTop: '15px' }}>
                  <div style={{ fontSize: '12px', color: '#5a5a7a', marginBottom: '8px' }}>Улучшения:</div>
                  {pendingUpdate.improvements.map((item, idx) => (
                    <div key={idx} style={{ fontSize: '13px', color: '#8888aa', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#00d26a' }}>✓</span> {item}
                    </div>
                  ))}
                </div>

                {isUpdating ? (
                  <div style={{ marginTop: '20px' }}>
                    <ProgressHeader>
                      <ProgressTitle>
                        <SpinnerIcon>⚡</SpinnerIcon>
                        Применение обновления...
                      </ProgressTitle>
                      <ProgressPercent>{updateProgress}%</ProgressPercent>
                    </ProgressHeader>
                    <ProgressBar>
                      <ProgressFill percent={updateProgress} />
                    </ProgressBar>
                  </div>
                ) : (
                  <ButtonGroup>
                    <Button variant="primary" onClick={startAutoUpdate}>
                      ⬇️ Установить сейчас
                    </Button>
                    <Button onClick={dismissUpdate}>
                      Отложить
                    </Button>
                  </ButtonGroup>
                )}
              </ProgressSection>
            )}
          </AnimatePresence>

          {!pendingUpdate && !isUpdating && (
            <HintBox type="success">
              ✅ Установлена актуальная версия модели. Система автоматически проверяет обновления по расписанию.
            </HintBox>
          )}
        </Card>

        {/* System Settings Card */}
        <Card>
          <CardTitle>
            🔧 Системные настройки
          </CardTitle>
          <CardDescription>
            Управление поведением системы и уведомлениями.
          </CardDescription>

          <SettingsRow>
            <div>
              <SettingLabel>Автоматическая блокировка</SettingLabel>
              <SettingDescription>Блокировать подозрительные транзакции без подтверждения</SettingDescription>
            </div>
            <Toggle>
              <ToggleInput 
                type="checkbox" 
                checked={settings.autoBlock}
                onChange={(e) => setSettings({...settings, autoBlock: e.target.checked})}
              />
              <ToggleSlider />
            </Toggle>
          </SettingsRow>

          <SettingsRow>
            <div>
              <SettingLabel>Push-уведомления</SettingLabel>
              <SettingDescription>Уведомлять о критических инцидентах</SettingDescription>
            </div>
            <Toggle>
              <ToggleInput 
                type="checkbox" 
                checked={settings.notifications}
                onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
              />
              <ToggleSlider />
            </Toggle>
          </SettingsRow>

          <SettingsRow>
            <div>
              <SettingLabel>Детальное логирование</SettingLabel>
              <SettingDescription>Сохранять все события для аудита</SettingDescription>
            </div>
            <Toggle>
              <ToggleInput 
                type="checkbox" 
                checked={settings.logging}
                onChange={(e) => setSettings({...settings, logging: e.target.checked})}
              />
              <ToggleSlider />
            </Toggle>
          </SettingsRow>

          <SettingsRow>
            <div>
              <SettingLabel>Внешний API доступ</SettingLabel>
              <SettingDescription>Разрешить запросы от внешних систем</SettingDescription>
            </div>
            <Toggle>
              <ToggleInput 
                type="checkbox" 
                checked={settings.apiAccess}
                onChange={(e) => setSettings({...settings, apiAccess: e.target.checked})}
              />
              <ToggleSlider />
            </Toggle>
          </SettingsRow>
        </Card>

        {/* Model Info Card */}
        <Card>
          <CardTitle>
            📋 Информация о модели
            <StatusBadge online>Online</StatusBadge>
          </CardTitle>
          <CardDescription>
            Текущее состояние ML-модели антифрод системы.
          </CardDescription>

          <ModelInfoGrid>
            <ModelInfoItem>
              <ModelInfoLabel>Алгоритм</ModelInfoLabel>
              <ModelInfoValue>CatBoost Classifier</ModelInfoValue>
            </ModelInfoItem>
            <ModelInfoItem>
              <ModelInfoLabel>Версия модели</ModelInfoLabel>
              <ModelInfoValue>v2.4.1</ModelInfoValue>
            </ModelInfoItem>
            <ModelInfoItem>
              <ModelInfoLabel>Дата обучения</ModelInfoLabel>
              <ModelInfoValue>27 ноября 2025</ModelInfoValue>
            </ModelInfoItem>
            <ModelInfoItem>
              <ModelInfoLabel>Количество признаков</ModelInfoLabel>
              <ModelInfoValue>25</ModelInfoValue>
            </ModelInfoItem>
            <ModelInfoItem>
              <ModelInfoLabel>ROC-AUC</ModelInfoLabel>
              <ModelInfoValue>0.967</ModelInfoValue>
            </ModelInfoItem>
            <ModelInfoItem>
              <ModelInfoLabel>F1-Score</ModelInfoLabel>
              <ModelInfoValue>0.943</ModelInfoValue>
            </ModelInfoItem>
          </ModelInfoGrid>

          <ButtonGroup>
            <Button>
              📥 Экспорт модели
            </Button>
            <Button variant="danger">
              🔄 Откатить версию
            </Button>
          </ButtonGroup>
        </Card>
      </Grid>
    </PageContainer>
  );
};

export default AdminSettings;
