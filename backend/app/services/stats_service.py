from typing import List, Dict, Any
from datetime import datetime, timedelta
from collections import defaultdict
import threading

class StatsService:
    """
    Singleton-сервис для агрегации статистики антифрод системы.
    Хранит метрики в памяти и предоставляет данные для дашборда.
    """
    
    def __init__(self):
        self._lock = threading.Lock()
        self._reset_internal()
    
    def _reset_internal(self):
        """Внутренний метод сброса статистики."""
        # Основные счётчики
        self.stats = {
            "transactions_checked": 0,
            "fraud_blocked_count": 0,
            "money_saved_total": 0.0,
            "transactions_passed": 0,
            "false_positive_estimate": 0,
            "accuracy_rate": 99.2,  # Базовая точность модели
        }
        
        # Временные ряды для графиков (последние 24 часа, по часам)
        self.hourly_stats = defaultdict(lambda: {
            "transactions": 0,
            "blocked": 0,
            "attacks_detected": 0,
            "money_saved": 0.0
        })
        
        # Распределение по суммам заблокированных транзакций
        self.amount_distribution = {
            "0-10K": 0,
            "10-50K": 0,
            "50-100K": 0,
            "100-500K": 0,
            "500K+": 0
        }
        
        # Топ заблокированных инцидентов (последние 20)
        self.top_incidents = []
        
        # История изменения threshold
        self.threshold_history = []

    def update_stats_from_batch(self, batch_results: List[Dict[str, Any]]) -> None:
        """
        Обновляет статистику на основе пакета обработанных транзакций.
        
        :param batch_results: Список словарей с 'verdict', 'amount', 'score', 'transaction_id'.
        """
        with self._lock:
            current_hour = datetime.now().strftime("%H:00")
            count = len(batch_results)
            
            self.stats["transactions_checked"] += count
            self.hourly_stats[current_hour]["transactions"] += count
            
            for result in batch_results:
                verdict = result.get("verdict")
                amount = result.get("amount", 0.0)
                score = result.get("score", 0.0)
                transaction_id = result.get("transaction_id", 0)
                
                if verdict == "BLOCK":
                    self.stats["fraud_blocked_count"] += 1
                    self.stats["money_saved_total"] += float(amount)
                    
                    self.hourly_stats[current_hour]["blocked"] += 1
                    self.hourly_stats[current_hour]["attacks_detected"] += 1
                    self.hourly_stats[current_hour]["money_saved"] += float(amount)
                    
                    # Обновляем распределение по суммам
                    self._update_amount_distribution(amount)
                    
                    # Добавляем в топ инцидентов
                    self._add_top_incident(transaction_id, amount, score)
                else:
                    self.stats["transactions_passed"] += 1
            
            # Простая эмуляция ложных срабатываний
            self.stats["false_positive_estimate"] = int(self.stats["fraud_blocked_count"] * 0.008)
    
    def _update_amount_distribution(self, amount: float):
        """Обновляет распределение заблокированных сумм."""
        if amount < 10000:
            self.amount_distribution["0-10K"] += 1
        elif amount < 50000:
            self.amount_distribution["10-50K"] += 1
        elif amount < 100000:
            self.amount_distribution["50-100K"] += 1
        elif amount < 500000:
            self.amount_distribution["100-500K"] += 1
        else:
            self.amount_distribution["500K+"] += 1
    
    def _add_top_incident(self, transaction_id: int, amount: float, score: float):
        """Добавляет инцидент в топ заблокированных."""
        incident = {
            "id": transaction_id,
            "amount": amount,
            "risk": score,
            "type": "high" if score >= 0.85 else "medium" if score >= 0.7 else "low",
            "time": datetime.now().strftime("%H:%M:%S")
        }
        
        self.top_incidents.insert(0, incident)
        # Храним только последние 20 инцидентов
        self.top_incidents = self.top_incidents[:20]
    
    def get_stats(self) -> Dict[str, Any]:
        """Возвращает базовую статистику."""
        with self._lock:
            return self.stats.copy()
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """
        Возвращает полную статистику для дашборда.
        Включает KPI, временные ряды и распределения.
        """
        with self._lock:
            # Формируем временной ряд за последние 24 часа
            time_series = self._generate_time_series()
            
            # Рассчитываем accuracy
            total = self.stats["transactions_checked"]
            if total > 0:
                # Accuracy = (total - false_positives) / total * 100
                accuracy = ((total - self.stats["false_positive_estimate"]) / total) * 100
            else:
                accuracy = 99.2
            
            return {
                # KPI метрики
                "kpi": {
                    "money_saved": self.stats["money_saved_total"],
                    "attacks_blocked": self.stats["fraud_blocked_count"],
                    "accuracy": round(accuracy, 2),
                    "false_positive_rate": round(self.stats["false_positive_estimate"] / max(total, 1) * 100, 2),
                    "transactions_checked": self.stats["transactions_checked"],
                    "transactions_passed": self.stats["transactions_passed"]
                },
                # Временной ряд для графика атак
                "time_series": time_series,
                # Распределение по суммам для Pie Chart
                "amount_distribution": [
                    {"range": k, "count": v, "color": self._get_color_for_range(k)} 
                    for k, v in self.amount_distribution.items()
                ],
                # Топ инцидентов для таблицы
                "top_incidents": self.top_incidents[:10]
            }
    
    def _generate_time_series(self) -> List[Dict[str, Any]]:
        """Генерирует временной ряд за последние 24 часа."""
        now = datetime.now()
        series = []
        
        for i in range(24, 0, -1):
            hour_dt = now - timedelta(hours=i)
            hour_key = hour_dt.strftime("%H:00")
            
            stats = self.hourly_stats.get(hour_key, {
                "transactions": 0,
                "blocked": 0,
                "attacks_detected": 0,
                "money_saved": 0.0
            })
            
            series.append({
                "time": hour_key,
                "transactions": stats["transactions"],
                "blocked": stats["blocked"],
                "attacks": stats["attacks_detected"]
            })
        
        return series
    
    def _get_color_for_range(self, range_key: str) -> str:
        """Возвращает цвет для диапазона сумм."""
        colors = {
            "0-10K": "#00d26a",
            "10-50K": "#0984e3",
            "50-100K": "#ffa502",
            "100-500K": "#ff6b81",
            "500K+": "#ff4757"
        }
        return colors.get(range_key, "#6c5ce7")
    
    def reset_stats(self) -> None:
        """Сбрасывает все счётчики статистики."""
        with self._lock:
            self._reset_internal()
    
    def record_threshold_change(self, old_value: float, new_value: float):
        """Записывает изменение порога в историю."""
        with self._lock:
            self.threshold_history.append({
                "timestamp": datetime.now().isoformat(),
                "old_value": old_value,
                "new_value": new_value
            })
