from ..extensions import db

class WorkOrder(db.Model):
    __tablename__ = 'dobrodel'

    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text, nullable=True)
    field = db.Column(db.String(100), nullable=True)
    date_performed = db.Column(db.Date, nullable=True)
    executor = db.Column(db.String(100), nullable=True)
    note = db.Column(db.String(100), nullable=True)
    timestamp = db.Column(db.Float, nullable=True)

    def to_dict(self):
        """Метод для преобразования объекта в словарь"""
        return {
            'id': self.id,
            'order_number': self.order_number,
            'description': self.description,
            'field': self.field,
            'date_performed': self.date_performed.strftime('%Y-%m-%d') if self.date_performed else None,
            'executor': self.executor,
            'note': self.note,
            'timestamp': self.timestamp,
        }
