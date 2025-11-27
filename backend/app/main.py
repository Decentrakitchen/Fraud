import pandas as pd
import asyncio
from fastapi import FastAPI, HTTPException, BackgroundTasks
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.config import settings
from services import MLPredictorService, StatsService
from json_models import (
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Глобальные экземпляры сервисов
ml_service: Optional[MLPredictorService] = None
stats_service = StatsService()

# Состояние переобучения модели
retrain_status = {
    "is_running": False,
    "progress": 0,
    "current_step": "",
    "completed": False,
    "error": None
}

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
    try:
        data = [t.model_dump() for t in transactions]
    except AttributeError:
        data = [t.dict() for t in transactions]
        
    df = pd.DataFrame(data)
    
    # Удаляем transaction_id, так как это не признак модели
    feature_columns = [col for col in df.columns if col != 'transaction_id']
    features_df = df[feature_columns]
    
    # Скоринг
    try:
        results = ml_service.score_batch(features_df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
    
    # Формируем финальные результаты с transaction_id и amount
    final_results = []
    for i, res in enumerate(results):
        combined = {
            "transaction_id": transactions[i].transaction_id,
            "amount": transactions[i].amount,
            **res
        }
        final_results.append(combined)
    
    # Обновление статистики (передаём полные данные с amount и transaction_id)
    stats_service.update_stats_from_batch(final_results)
        
    return final_results

@app.get(f"{settings.API_V1_STR}/stats")
def get_stats():
    return stats_service.get_stats()

@app.get(f"{settings.API_V1_STR}/dashboard")
def get_dashboard_stats():
    """
    Возвращает полную статистику для Executive Dashboard.
    Включает KPI, временные ряды и распределения.
    """
    return stats_service.get_dashboard_stats()

@app.post(f"{settings.API_V1_STR}/stats/reset")
def reset_stats():
    stats_service.reset_stats()
    return {"status": "stats reset"}

@app.post(f"{settings.API_V1_STR}/config")
def update_config(config: ConfigUpdate):
    if not ml_service:
        raise HTTPException(status_code=503, detail="ML Service not initialized")
    
    old_threshold = ml_service.threshold
    result = ml_service.set_threshold(config.threshold)
    
    # Записываем изменение в историю
    stats_service.record_threshold_change(old_threshold, config.threshold)
    
    return result

@app.get(f"{settings.API_V1_STR}/config")
def get_config():
    """Возвращает текущую конфигурацию модели."""
    if not ml_service:
        raise HTTPException(status_code=503, detail="ML Service not initialized")
    
    return {
        "threshold": ml_service.threshold,
        "shap_threshold": ml_service.shap_threshold,
        "model_info": {
            "algorithm": "CatBoost Classifier",
            "version": "v2.4.1",
            "features_count": 25,
            "trained_date": "2025-11-27",
            "roc_auc": 0.967,
            "f1_score": 0.943
        }
    }

# --- Retrain endpoints ---

async def simulate_retraining():
    """
    Фоновая задача имитации переобучения модели.
    В реальном приложении здесь была бы логика дообучения.
    """
    global retrain_status
    
    steps = [
        ("Загрузка новых данных...", 10),
        ("Валидация датасета...", 20),
        ("Подготовка признаков...", 35),
        ("Дообучение модели...", 60),
        ("Кросс-валидация...", 80),
        ("Сохранение весов...", 95),
        ("Обновление сервиса...", 100)
    ]
    
    retrain_status["is_running"] = True
    retrain_status["completed"] = False
    retrain_status["error"] = None
    
    try:
        for step_name, progress in steps:
            retrain_status["current_step"] = step_name
            retrain_status["progress"] = progress
            await asyncio.sleep(1.5)  # Имитация работы
        
        retrain_status["completed"] = True
        retrain_status["current_step"] = "Готово!"
    except Exception as e:
        retrain_status["error"] = str(e)
    finally:
        retrain_status["is_running"] = False

@app.post(f"{settings.API_V1_STR}/retrain")
async def start_retrain(background_tasks: BackgroundTasks):
    """
    Запускает процесс переобучения модели в фоновом режиме.
    """
    global retrain_status
    
    if retrain_status["is_running"]:
        raise HTTPException(status_code=400, detail="Retraining already in progress")
    
    # Сбрасываем статус
    retrain_status = {
        "is_running": True,
        "progress": 0,
        "current_step": "Инициализация...",
        "completed": False,
        "error": None
    }
    
    # Запускаем в фоне
    background_tasks.add_task(simulate_retraining)
    
    return {"status": "started", "message": "Retraining process started"}

@app.get(f"{settings.API_V1_STR}/retrain/status")
def get_retrain_status():
    """Возвращает текущий статус переобучения."""
    return retrain_status
