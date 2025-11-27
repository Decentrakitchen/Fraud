import pandas as pd
from fastapi import FastAPI, HTTPException
from typing import List
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.services import MLPredictorService, StatsService
from app.json_models import (
    TransactionInput, 
    BatchPredictionResult, 
    ConfigUpdate
)

app = FastAPI(
    title=settings.PROJECT_TITLE,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене лучше указать конкретные домены, например ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Глобальные экземпляры сервисов
# В реальном приложении можно использовать Dependency Injection
ml_service = None
stats_service = StatsService()

@app.on_event("startup")
def startup_event():
    global ml_service
    try:
        print(f"Loading model from {settings.MODEL_PATH}...")
        ml_service = MLPredictorService(
            model_path=settings.MODEL_PATH,
            initial_threshold=settings.DEFAULT_BLOCK_THRESHOLD,
            shap_threshold=settings.DEFAULT_SHAP_THRESHOLD
        )
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
        # В продакшене здесь стоит остановить запуск, если модель критична
        # raise e

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_TITLE}"}

@app.post(f"{settings.API_V1_STR}/predict", response_model=List[BatchPredictionResult])
def predict_transactions(transactions: List[TransactionInput]):
    if not ml_service:
        raise HTTPException(status_code=503, detail="ML Service not initialized")
    
    # Преобразование Pydantic моделей в DataFrame
    # model_dump() для Pydantic v2, dict() для v1. Используем dict() для совместимости или model_dump если v2.
    # Предполагаем v2, но dict() безопаснее если версия не зафиксирована жестко.
    try:
        data = [t.model_dump() for t in transactions]
    except AttributeError:
        data = [t.dict() for t in transactions]
        
    df = pd.DataFrame(data)
    
    # Скоринг
    try:
        results = ml_service.score_batch(df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
    
    # Обновление статистики
    stats_service.update_stats_from_batch(results)
    
    # Добавляем transaction_id и amount обратно в результаты для ответа, 
    # так как score_batch возвращает только score, verdict, explanation
    # Нам нужно объединить их с исходными данными
    
    final_results = []
    for i, res in enumerate(results):
        # Объединяем результат скоринга с идентификаторами транзакции
        combined = {
            "transaction_id": transactions[i].transaction_id,
            "amount": transactions[i].amount,
            **res
        }
        final_results.append(combined)
        
    return final_results

@app.get(f"{settings.API_V1_STR}/stats")
def get_stats():
    return stats_service.get_stats()

@app.post(f"{settings.API_V1_STR}/stats/reset")
def reset_stats():
    stats_service.reset_stats()
    return {"status": "stats reset"}

@app.post(f"{settings.API_V1_STR}/config")
def update_config(config: ConfigUpdate):
    if not ml_service:
        raise HTTPException(status_code=503, detail="ML Service not initialized")
    
    result = ml_service.set_threshold(config.threshold)
    return result
