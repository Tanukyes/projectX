from ..extensions import db
from datetime import datetime

class ChangeLog(db.Model):
    __tablename__ = 'change_log'

    id = db.Column(db.Integer, primary_key=True)
    esp_number = db.Column(db.String(50), nullable=False)
    received_date = db.Column(db.Date, nullable=False)
    ec = db.Column(db.String(100), nullable=True)
    task = db.Column(db.Text, nullable=True)
    responsible = db.Column(db.String(100), nullable=True)
    added_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    completion_date = db.Column(db.Date, nullable=True)
    planned_date = db.Column(db.Date, nullable=True)
    note = db.Column(db.Text, nullable=True)
    description = db.Column(db.Text, nullable=True)
    last_modified_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    last_modified_at = db.Column(db.DateTime, nullable=True, default=datetime.utcnow)

    added_by_user = db.relationship('User', foreign_keys=[added_by], backref='added_changes')
    modified_by_user = db.relationship('User', foreign_keys=[last_modified_by], backref='modified_changes')

    def to_dict(self):
        return {
            'id': self.id,
            'esp_number': self.esp_number,
            'received_date': self.received_date.strftime('%Y-%m-%d') if self.received_date else None,
            'ec': self.ec,
            'task': self.task,
            'responsible': self.responsible,
            'added_by': self.added_by_user.fio if self.added_by_user else "Неизвестно",
            'completion_date': self.completion_date.strftime('%Y-%m-%d') if self.completion_date else None,
            'planned_date': self.planned_date.strftime('%Y-%m-%d') if self.planned_date else None,
            'note': self.note,
            'description': self.description,
            'last_modified_by': f"{self.modified_by_user.fio} ({self.last_modified_at.strftime('%d.%m.%y в %H:%M')})" if self.modified_by_user else ""
        }