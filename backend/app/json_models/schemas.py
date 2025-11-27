from pydantic import BaseModel, Field
from typing import List, Optional

class ShapExplanationItem(BaseModel):
    feature_name: str
    feature_value: str
    shap_value: float

class TransactionInput(BaseModel):
    # Идентификатор транзакции (не используется моделью)
    transaction_id: int
    
    # Признаки модели (25 штук в порядке ожидаемом моделью)
    amount: float
    log_amount: float
    hour_of_day: int
    day_of_week: int
    is_night: int
    is_weekend: int
    is_month_end: int
    is_month_start: int
    monthly_os_changes: int
    monthly_phone_model_changes: int
    logins_last_7_days: int
    logins_last_30_days: int
    login_frequency_7d: float
    login_frequency_30d: float
    freq_change_7d_vs_mean: float
    logins_7d_over_30d_ratio: float
    avg_login_interval_30d: float
    std_login_interval_30d: float
    ewm_login_interval_7d: float
    burstiness_login_interval: float
    zscore_avg_login_interval_7d: float
    is_cold_start: int
    os_family: str
    phone_brand: str
    direction: str

class ConfigUpdate(BaseModel):
    threshold: float = Field(..., ge=0.0, le=1.0, description="Threshold for fraud detection (0.0 to 1.0)")

class BatchPredictionResult(BaseModel):
    transaction_id: int
    amount: float
    score: float
    verdict: str
    explanation: Optional[List[ShapExplanationItem]] = None
