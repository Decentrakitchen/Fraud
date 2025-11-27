import pandas as pd
import numpy as np
import shap
from catboost import CatBoostClassifier
import os

class MLPredictorService:
    def __init__(self, model_path: str, initial_threshold: float = 0.85, shap_threshold: float = 0.4):
        """
        Инициализация сервиса предсказаний.
        
        :param model_path: Путь к файлу обученной модели CatBoost.
        :param initial_threshold: Порог вероятности для блокировки транзакции.
        :param shap_threshold: Порог вероятности для расчета SHAP-объяснений.
        """
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}")

        self.model = CatBoostClassifier()
        self.model.load_model(model_path)
        
        # Инициализация SHAP explainer
        self.explainer = shap.TreeExplainer(self.model)
        
        self.threshold = initial_threshold
        self.shap_threshold = shap_threshold

    def score_batch(self, input_df: pd.DataFrame) -> list:
        """
        Основной метод скоринга пакета транзакций.
        
        :param input_df: DataFrame с признаками транзакций.
        :return: Список словарей с результатами скоринга.
        """
        if input_df.empty:
            return []

        # Получение вероятностей (класс 1 - мошенничество)
        probabilities = self.model.predict_proba(input_df)[:, 1]
        
        results = []
        
        # Итерация по транзакциям и вероятностям
        # Используем itertuples для скорости или iloc, но нам нужен доступ к строке как Series для SHAP
        for idx, proba in enumerate(probabilities):
            verdict = "BLOCK" if proba >= self.threshold else "PASS"
            
            explanation = None
            if proba >= self.shap_threshold:
                # Получаем строку как Series
                transaction_row = input_df.iloc[idx]
                explanation = self._calculate_shap(transaction_row)
            
            results.append({
                "score": float(proba),
                "verdict": verdict,
                "explanation": explanation
            })
            
        return results

    def _calculate_shap(self, transaction_row: pd.Series) -> list:
        """
        Приватный метод для расчета SHAP-объяснений (XAI).
        
        :param transaction_row: Строка транзакции с признаками.
        :return: Список топ-5 влиятельных признаков.
        """
        # Преобразуем Series в DataFrame (одна строка) для корректной работы SHAP
        # shap_values ожидает 2D массив или DataFrame
        row_df = pd.DataFrame([transaction_row])
        
        # Расчет SHAP-значений
        shap_values = self.explainer.shap_values(row_df)
        
        # shap_values для бинарной классификации может быть списком или массивом.
        # Для CatBoost обычно возвращается массив (N_samples, N_features) для log-odds
        if isinstance(shap_values, list):
            # Если вернулся список (для каждого класса), берем для класса 1
            # Но TreeExplainer для CatBoost часто возвращает просто массив
            shap_values = shap_values[1] if len(shap_values) > 1 else shap_values[0]
            
        # Если shap_values имеет размерность (1, features), сплющиваем до (features,)
        if len(shap_values.shape) == 2:
            shap_values = shap_values[0]

        feature_names = transaction_row.index.tolist()
        feature_values = transaction_row.values
        
        # Собираем информацию о признаках
        features_info = []
        for name, value, shap_val in zip(feature_names, feature_values, shap_values):
            features_info.append({
                "feature_name": str(name),
                "feature_value": str(value),  # Всегда преобразуем в строку
                "shap_value": float(shap_val)
            })
            
        # Сортируем по абсолютному значению SHAP (по убыванию) и берем топ-5
        features_info.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
        
        return features_info[:5]

    def set_threshold(self, new_threshold: float) -> dict:
        """
        Управление порогом блокировки.
        
        :param new_threshold: Новое значение порога (0.0 - 1.0).
        :return: Статус обновления.
        """
        if not (0.0 <= new_threshold <= 1.0):
            raise ValueError("Threshold must be between 0.0 and 1.0")
            
        old_threshold = self.threshold
        self.threshold = new_threshold
        
        return {
            "status": "updated",
            "old_threshold": old_threshold,
            "new_threshold": self.threshold
        }
