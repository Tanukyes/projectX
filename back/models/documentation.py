from ..extensions import db

class Documentation(db.Model):
    __tablename__ = 'documentation'
    id = db.Column(db.Integer, primary_key=True)
    esp_number = db.Column(db.String(50), nullable=True)
    easd_number = db.Column(db.String(50), nullable=True)
    document_title = db.Column(db.String(255), nullable=True)  # новое поле для названия документа
    last_date = db.Column(db.Date, nullable=True)
    check_date = db.Column(db.Date, nullable=True)
    comments = db.Column(db.Text, nullable=True)
    link_comments = db.Column(db.Text, nullable=True)
    elimination_date = db.Column(db.Date, nullable=True)
    note = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'esp_number': self.esp_number,
            'easd_number': self.easd_number,
            'document_title': self.document_title,
            'last_date': self.last_date.strftime('%Y-%m-%d') if self.last_date else None,
            'check_date': self.check_date.strftime('%Y-%m-%d') if self.check_date else None,
            'comments': self.comments,
            'link_comments': self.link_comments,
            'elimination_date': self.elimination_date.strftime('%Y-%m-%d') if self.elimination_date else None,
            'note': self.note
        }
    def __repr__(self):
        return f"<Documentation {self.id}: {self.document_title} (ESP: {self.esp_number}, EASD: {self.easd_number})>"