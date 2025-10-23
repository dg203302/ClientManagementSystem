from flask import Flask,render_template,request,jsonify
from sqlalchemy import and_, desc
import datetime
import os
app=Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "kiosco.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
from Schemas_Kiosco import Cliente, Pago, Datab
Datab.init_app(app)
@app.route('/')
def inicio():
    return render_template('INICIO.html')
#---------------------------------------INGRESO------------------------------------------#
@app.route('/renderizar_ing')
def rend_ing():
    return render_template('INGRESO_OPERACION.html')
@app.route('/api_ingreso', methods=['POST'])
def ingresar():
    Datos_ingreso = request.get_json()
    Cliente_existente=Datab.session.query(Cliente).filter(
        and_(Cliente.Nombre_cliente==Datos_ingreso["Nombre_cliente"],
             Cliente.Apellido_cliente==Datos_ingreso["Apellido_cliente"],
             Cliente.Telefono_cliente==Datos_ingreso["Telefono_cliente"])).first()
    if Cliente_existente:
        if Datos_ingreso.get("pago"):
            Cliente_existente.Monto_total_pagado += Datos_ingreso["Monto"]
            if Datos_ingreso["Monto"]>Cliente_existente.Monto_total_adeudado:
                Cliente_existente.Monto_total_adeudado = 0
            else:
                Cliente_existente.Monto_total_adeudado -= Datos_ingreso["Monto"]
            ultimo_pago = Datab.session.query(Pago.Num_pago).order_by(desc(Pago.Num_pago)).first()
            nuevo_pago = Pago(
                Num_pago= (ultimo_pago[0] + 1) if ultimo_pago else 1,
                Num_cliente= Cliente_existente.Num_cliente,
                Fecha_pago= datetime.date.today().isoformat(),
                Hora_pago= datetime.datetime.now().time().isoformat(timespec='seconds'),
                Monto_pago= Datos_ingreso["Monto"]
                )
            Datab.session.add(nuevo_pago)
            Datab.session.commit()
            return jsonify({"status": "success"}), 200
        elif Datos_ingreso.get("deuda"):
            Cliente_existente.Monto_total_adeudado += Datos_ingreso["Monto"]
            Datab.session.commit()
            return jsonify({"status": "success"}), 200
    else:
        ultimo_cliente = Datab.session.query(Cliente.Num_cliente).order_by(desc(Cliente.Num_cliente)).first()
        nuevo_cliente = Cliente(
            Num_cliente= (ultimo_cliente[0] + 1) if ultimo_cliente else 1,
            Nombre_cliente=Datos_ingreso["Nombre_cliente"],
            Apellido_cliente=Datos_ingreso["Apellido_cliente"],
            Telefono_cliente=Datos_ingreso["Telefono_cliente"],
            Monto_total_pagado=0.0,
            Monto_total_adeudado=0.0
        )
        if Datos_ingreso.get("pago"):
            nuevo_cliente.Monto_total_pagado = Datos_ingreso["Monto"]
            ultimo_pago = Datab.session.query(Pago.Num_pago).order_by(desc(Pago.Num_pago)).first()
            nuevo_pago = Pago(
                Num_pago= (ultimo_pago[0] + 1) if ultimo_pago else 1,
                Num_cliente= nuevo_cliente.Num_cliente,
                Fecha_pago= datetime.date.today().isoformat(),
                Hora_pago= datetime.datetime.now().time().isoformat(timespec='seconds'),
                Monto_pago= Datos_ingreso["Monto"]
            )
            Datab.session.add(nuevo_cliente)
            Datab.session.add(nuevo_pago)
            Datab.session.commit()
            return jsonify({"status": "success"}), 200
        elif Datos_ingreso.get("deuda"):
            nuevo_cliente.Monto_total_adeudado = Datos_ingreso["Monto"]
            Datab.session.add(nuevo_cliente)
            Datab.session.commit()
            return jsonify({"status": "success"}), 200
#---------------------------------------APIS RECUPERACION--------------------------------#
@app.route('/api_rec_clientes', methods=['GET'])
def recuperar_clientes():
    lista_clientes=Datab.session.query(Cliente).all()
    return jsonify([{
        "Num_cliente": int(cliente.Num_cliente),
        "Nombre_cliente": str(cliente.Nombre_cliente),
        "Apellido_cliente": str(cliente.Apellido_cliente),
        "Telefono_cliente": str(cliente.Telefono_cliente),
        "Monto_total_pagado": float(cliente.Monto_total_pagado),
        "Monto_total_adeudado": float(cliente.Monto_total_adeudado)
    } for cliente in lista_clientes])
@app.route('/rend_pagos')
def rend_pag():
    return render_template('PAGOS_TOTALES.html')
@app.route('/api_rec_pagos', methods=['GET'])
def recuperar_pagos():
    lista_pagos = Datab.session.query(Pago).all()
    return jsonify([{
        "Num_pago" : pago.Num_pago,
        "Num_cliente" : pago.Num_cliente,
        "Fecha_pago" : pago.Fecha_pago,
        "Hora_pago" : pago.Hora_pago,
        "Monto_pago" : pago.Monto_pago
    } for pago in lista_pagos])
if __name__=='__main__':
    with app.app_context():
        Datab.create_all()
        app.run()