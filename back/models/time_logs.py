from sqlalchemy.dialects.postgresql import ENUM
from ..extensions import db

class TimeLog(db.Model):

    __tablename__ = 'time_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    log_type = db.Column(ENUM('work_time', 'time_off', 'polyclinic', name='log_type_enum'), nullable=False)  # ENUM тип
    start_time = db.Column(db.DateTime, nullable=False)  # Время начала с датой
    end_time = db.Column(db.DateTime, nullable=False)    # Время окончания с датой
    log_date = db.Column(db.Date, nullable=False)         # Дата записи
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))  # Кто создал запись
    created_at = db.Column(db.DateTime, default=db.func.now())     # Когда запись была создана
    note = db.Column(db.String(255), nullable=True)       # Причина или комментарий

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'log_type': self.log_type,
            'start_time': self.start_time.strftime('%d.%m.%Y %H:%M'),
            'end_time': self.end_time.strftime('%d.%m.%Y %H:%M'),
            'log_date': self.log_date.strftime('%d.%m.%Y'),
            'created_by': self.created_by,
            'created_at': self.created_at.strftime('%d.%m.%Y %H:%M:%S'),
            'note': self.note
        }