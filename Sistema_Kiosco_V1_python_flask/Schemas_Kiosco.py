from flask_sqlalchemy import SQLAlchemy

# Crear la instancia de SQLAlchemy sin app (se inicializará después)
Datab = SQLAlchemy()
class Cliente(Datab.Model):
    __tablename__='Cliente'
    Num_cliente=Datab.Column(Datab.Integer, primary_key=True)
    Nombre_cliente=Datab.Column(Datab.String, nullable=False)
    Apellido_cliente=Datab.Column(Datab.String,nullable=False)
    Telefono_cliente=Datab.Column(Datab.String,nullable=False)
    Monto_total_pagado=Datab.Column(Datab.Float, default=0.0)
    Monto_total_adeudado=Datab.Column(Datab.Float, default=0.0)
    Pagos=Datab.relationship('Pago', backref='Cliente', cascade='all, delete-orphan', lazy=True)
class Pago(Datab.Model):
    __tablename__='Pago'
    Num_pago=Datab.Column(Datab.Integer, primary_key=True)
    Num_cliente=Datab.Column(Datab.Integer, Datab.ForeignKey('Cliente'))
    Fecha_pago=Datab.Column(Datab.String,nullable=False)
    Hora_pago=Datab.Column(Datab.String,nullable=False)
    Monto_pago=Datab.Column(Datab.Float, default=0.0)