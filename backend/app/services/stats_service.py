from typing import List, Dict, Any

class StatsService:
    def __init__(self):
        """
        Инициализация сервиса статистики.
        Хранит агрегированные метрики работы системы.
        """
        self.stats = {
            "transactions_checked": 0,
            "fraud_blocked_count": 0,
            "money_saved_total": 0.0,
            "false_positive_estimate": 0
        }

    def update_stats_from_batch(self, batch_results: List[Dict[str, Any]]) -> None:
        """
        Обновляет статистику на основе пакета обработанных транзакций.
        
        :param batch_results: Список словарей, каждый должен содержать 'verdict' и 'amount'.
        """
        count = len(batch_results)
        self.stats["transactions_checked"] += count
        
        # Простая эмуляция ложных срабатываний: 1 на каждые 1000 транзакций
        # Можно усложнить логику при необходимости
        self.stats["false_positive_estimate"] += count // 1000

        for result in batch_results:
            verdict = result.get("verdict")
            amount = result.get("amount", 0.0)
            
            if verdict == "BLOCK":
                self.stats["fraud_blocked_count"] += 1
                self.stats["money_saved_total"] += float(amount)

    def get_stats(self, as_dict: bool = True) -> Dict[str, Any]:
        """
        Возвращает текущую статистику.
        
        :param as_dict: Флаг формата возврата (пока поддерживается только dict).
        :return: Словарь с метриками.
        """
        return self.stats

    def reset_stats(self) -> None:
        """
        Сбрасывает все счетчики статистики на ноль.
        """
        self.stats = {
            "transactions_checked": 0,
            "fraud_blocked_count": 0,
            "money_saved_total": 0.0,
            "false_positive_estimate": 0
        }
