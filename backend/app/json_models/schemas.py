from pydantic import BaseModel, Field
from typing import List, Optional

class ShapExplanationItem(BaseModel):
    feature_name: str
    feature_value: str
    shap_value: float

class TransactionInput(BaseModel):
    # Идентификаторы и основные параметры транзакции
    transaction_id: int
    amount: float
    direction: str
    
    # Категориальные признаки (сырые)
    last_phone_model_categorical: str
    os_ver_categorical: str
    
    # Поведенческие агрегированные признаки (счетчики и статистики)
    os_versions_count_30d: int
    phone_models_count_30d: int
    
    # Частота входов и интервалы
    avg_login_freq_7d: float
    avg_login_freq_30d: float
    std_login_interval_30d: float
    
    # Динамика поведения
    login_freq_change_ratio: float
    login_share_7d_30d: float
    
    # Дополнительные поведенческие паттерны (типовые для фрода)
    # Количество уникальных IP за период
    unique_ips_count_7d: int = 1
    unique_ips_count_30d: int = 1
    
    # Смена устройств и локаций
    device_change_count_30d: int = 0
    location_change_count_30d: int = 0
    
    # Активность в ночное время
    night_activity_share_30d: float = 0.0
    
    # Скорость операций
    avg_transaction_speed_7d: float = 0.0
    
    # Отношение сумм транзакций
    amount_ratio_avg_30d: float = 1.0
    
    # Количество неудачных попыток входа
    failed_login_count_7d: int = 0
    failed_login_count_30d: int = 0
    
    # Время с последней смены пароля (в днях)
    days_since_password_change: float = 100.0
    
    # Признак использования VPN/Proxy (вероятность или флаг)
    is_proxy_detected: int = 0

class ConfigUpdate(BaseModel):
    threshold: float = Field(..., ge=0.0, le=1.0, description="Threshold for fraud detection (0.0 to 1.0)")

class BatchPredictionResult(BaseModel):
    transaction_id: int
    amount: float
    score: float
    verdict: str
    explanation: Optional[List[ShapExplanationItem]] = None
