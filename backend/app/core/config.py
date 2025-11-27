import os

class Settings:
    # API Config
    PROJECT_TITLE: str = "ForteBank Fraud Scoring API"
    API_V1_STR: str = "/api/v1"
    
    # Paths
    # Определяем базовую директорию (backend) относительно текущего файла
    # config.py находится в backend/app/core/, поэтому поднимаемся на 3 уровня вверх
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    MODEL_FILE_NAME: str = "fraud_detection_catboost.cbm"
    # Предполагаем, что артефакты лежат в backend/ai_model (или data_artifacts, как в запросе)
    # В структуре проекта была папка backend/ai_model, используем её как более логичную
    MODEL_ARTIFACTS_DIR: str = os.path.join(BASE_DIR, "ai_model")
    
    @property
    def MODEL_PATH(self) -> str:
        return os.path.join(self.MODEL_ARTIFACTS_DIR, self.MODEL_FILE_NAME)

    # ML Logic Defaults
    DEFAULT_BLOCK_THRESHOLD: float = 0.85
    DEFAULT_SHAP_THRESHOLD: float = 0.5  # Порог для расчёта SHAP-объяснений

settings = Settings()
