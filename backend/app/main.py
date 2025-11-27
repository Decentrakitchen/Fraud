import pandas as pd
import asyncio
import io
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
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


# --- CSV Upload endpoint ---

# Список признаков модели (порядок важен!)
MODEL_FEATURES = [
    'amount', 'log_amount', 'hour_of_day', 'day_of_week', 'is_night', 'is_weekend',
    'is_month_end', 'is_month_start', 'monthly_os_changes', 'monthly_phone_model_changes',
    'logins_last_7_days', 'logins_last_30_days', 'login_frequency_7d', 'login_frequency_30d',
    'freq_change_7d_vs_mean', 'logins_7d_over_30d_ratio', 'avg_login_interval_30d',
    'std_login_interval_30d', 'ewm_login_interval_7d', 'burstiness_login_interval',
    'zscore_avg_login_interval_7d', 'is_cold_start', 'os_family', 'phone_brand', 'direction'
]

@app.post(f"{settings.API_V1_STR}/predict/csv")
async def predict_from_csv(file: UploadFile = File(...)):
    """
    Загружает CSV файл и делает предсказания для всех транзакций.
    
    CSV должен содержать колонки модели. Опционально может содержать:
    - transaction_id (или будет сгенерирован автоматически)
    - is_fraud (для сравнения с предсказаниями)
    
    Возвращает результаты предсказаний и статистику.
    """
    if not ml_service:
        raise HTTPException(status_code=503, detail="ML Service not initialized")
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        # Читаем CSV
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Проверяем наличие необходимых колонок
        missing_cols = [col for col in MODEL_FEATURES if col not in df.columns]
        if missing_cols:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {missing_cols}"
            )
        
        # Сохраняем дополнительные колонки если есть
        has_transaction_id = 'transaction_id' in df.columns
        has_is_fraud = 'is_fraud' in df.columns
        
        transaction_ids = df['transaction_id'].tolist() if has_transaction_id else list(range(1, len(df) + 1))
        actual_fraud = df['is_fraud'].tolist() if has_is_fraud else None
        amounts = df['amount'].tolist()
        
        # Подготавливаем признаки для модели
        features_df = df[MODEL_FEATURES].copy()
        
        # Делаем предсказания
        results = ml_service.score_batch(features_df)
        
        # Формируем результаты
        predictions = []
        blocked_count = 0
        money_saved = 0.0
        true_positives = 0
        false_positives = 0
        true_negatives = 0
        false_negatives = 0
        
        for i, res in enumerate(results):
            tx_id = transaction_ids[i]
            amount = amounts[i]
            is_blocked = res['verdict'] == 'BLOCK'
            
            prediction = {
                "transaction_id": tx_id,
                "amount": float(amount),
                "score": res['score'],
                "verdict": res['verdict'],
                "explanation": res['explanation']
            }
            
            # Если есть реальные метки, добавляем для сравнения
            if actual_fraud is not None:
                actual = int(actual_fraud[i])
                prediction["actual_fraud"] = actual
                prediction["correct"] = (is_blocked and actual == 1) or (not is_blocked and actual == 0)
                
                # Считаем метрики
                if is_blocked and actual == 1:
                    true_positives += 1
                elif is_blocked and actual == 0:
                    false_positives += 1
                elif not is_blocked and actual == 0:
                    true_negatives += 1
                else:  # not blocked and actual == 1
                    false_negatives += 1
            
            if is_blocked:
                blocked_count += 1
                money_saved += float(amount)
            
            predictions.append(prediction)
        
        # Формируем статистику
        total = len(predictions)
        stats_response = {
            "total_transactions": total,
            "blocked_count": blocked_count,
            "passed_count": total - blocked_count,
            "money_saved": money_saved,
            "block_rate": round(blocked_count / total * 100, 2) if total > 0 else 0
        }
        
        # Если есть реальные метки, добавляем метрики качества
        if actual_fraud is not None:
            precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
            recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
            f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
            accuracy = (true_positives + true_negatives) / total if total > 0 else 0
            
            stats_response["metrics"] = {
                "accuracy": round(accuracy * 100, 2),
                "precision": round(precision * 100, 2),
                "recall": round(recall * 100, 2),
                "f1_score": round(f1 * 100, 2),
                "true_positives": true_positives,
                "false_positives": false_positives,
                "true_negatives": true_negatives,
                "false_negatives": false_negatives
            }
        
        # Обновляем глобальную статистику
        stats_service.update_stats_from_batch(predictions)
        
        return {
            "filename": file.filename,
            "stats": stats_response,
            "predictions": predictions
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")
