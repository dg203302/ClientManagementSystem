from flask import Flask,render_template,request,jsonify
from sqlalchemy import and_, desc, func
import datetime
import os
app=Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "kiosco.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
from Schemas_Kiosco import Cliente, Deuda, Pago, Datab
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
    # Hacer la búsqueda de cliente insensible a mayúsculas/minúsculas para Nombre y Apellido
    nombre_in = (Datos_ingreso.get("Nombre_cliente") or "").strip()
    apellido_in = (Datos_ingreso.get("Apellido_cliente") or "").strip()
    telefono_in = (Datos_ingreso.get("Telefono_cliente") or "").strip()
    Cliente_existente=Datab.session.query(Cliente).filter(
        and_(func.lower(Cliente.Nombre_cliente)==nombre_in.lower(),
             func.lower(Cliente.Apellido_cliente)==apellido_in.lower(),
             Cliente.Telefono_cliente==telefono_in)).first()
    if Cliente_existente:
        # Si es un pago, creamos un registro en Pago
        if Datos_ingreso.get("pago"):
            # Primero, verificar si existe alguna deuda no saldada para este cliente
            try:
                monto_pago = float(Datos_ingreso.get("Monto", 0))
            except (TypeError, ValueError):
                monto_pago = 0.0

            # Aplicar el monto del pago a las deudas pendientes en orden de registro.
            # Esto permite saldar múltiples deudas o realizar pagos parciales reduciendo Monto_deuda.
            monto_a_aplicar = float(monto_pago)

            if monto_a_aplicar > 0:
                deudas_pendientes = Datab.session.query(Deuda).filter(
                    Deuda.Num_cliente == Cliente_existente.Num_cliente,
                    Deuda.saldada == False
                ).order_by(Deuda.Fecha_reg).all()

                for deuda in deudas_pendientes:
                    if monto_a_aplicar <= 0:
                        break
                    deuda_monto = float(deuda.Monto_deuda or 0)
                    # Pago suficiente para saldar esta deuda completamente
                    if monto_a_aplicar >= deuda_monto:
                        monto_a_aplicar -= deuda_monto
                        deuda.saldada = True
                        # opcional: dejar Monto_deuda como el original o marcar 0
                        deuda.Monto_deuda = 0.0
                        Datab.session.add(deuda)
                    else:
                        # Pago parcial: reducir el monto de la deuda y no marcar como saldada
                        deuda.Monto_deuda = deuda_monto - monto_a_aplicar
                        monto_a_aplicar = 0.0
                        Datab.session.add(deuda)

            # Crear el registro de pago con el monto original recibido
            ultimo_pago = Datab.session.query(Pago.Num_pago).order_by(desc(Pago.Num_pago)).first()
            nuevo_pago = Pago(
                Num_pago= (ultimo_pago[0] + 1) if ultimo_pago else 1,
                Num_cliente= Cliente_existente.Num_cliente,
                Fecha_pago= datetime.date.today().isoformat(),
                Hora_pago= datetime.datetime.now().time().isoformat(timespec='seconds'),
                Monto_pago= monto_pago
            )
            Datab.session.add(nuevo_pago)
            Datab.session.commit()
            return jsonify({"status": "success"}), 200
        # Si es una deuda, creamos un registro en Deuda
        elif Datos_ingreso.get("deuda"):
            ultimo_deuda = Datab.session.query(Deuda.Num_deuda).order_by(desc(Deuda.Num_deuda)).first()
            nueva_deuda = Deuda(
                Num_deuda= (ultimo_deuda[0] + 1) if ultimo_deuda else 1,
                Num_cliente= Cliente_existente.Num_cliente,
                Monto_deuda= Datos_ingreso["Monto"],
                Fecha_reg= datetime.date.today().isoformat()
            )
            Datab.session.add(nueva_deuda)
            Datab.session.commit()
            return jsonify({"status": "success"}), 200
    else:
        ultimo_cliente = Datab.session.query(Cliente.Num_cliente).order_by(desc(Cliente.Num_cliente)).first()
        nuevo_cliente = Cliente(
            Num_cliente= (ultimo_cliente[0] + 1) if ultimo_cliente else 1,
            Nombre_cliente=Datos_ingreso["Nombre_cliente"],
            Apellido_cliente=Datos_ingreso["Apellido_cliente"],
            Telefono_cliente=Datos_ingreso["Telefono_cliente"]
        )
        if Datos_ingreso.get("pago"):
            # crear cliente y registro de pago
            ultimo_pago = Datab.session.query(Pago.Num_pago).order_by(desc(Pago.Num_pago)).first()
            nuevo_pago = Pago(
                Num_pago= (ultimo_pago[0] + 1) if ultimo_pago else 1,
                Num_cliente= (nuevo_cliente.Num_cliente),
                Fecha_pago= datetime.date.today().isoformat(),
                Hora_pago= datetime.datetime.now().time().isoformat(timespec='seconds'),
                Monto_pago= Datos_ingreso["Monto"]
            )
            Datab.session.add(nuevo_cliente)
            Datab.session.add(nuevo_pago)
            Datab.session.commit()
            return jsonify({"status": "success"}), 200
        elif Datos_ingreso.get("deuda"):
            # crear cliente y registro de deuda
            Datab.session.add(nuevo_cliente)
            Datab.session.commit()  # commit para asegurar Num_cliente si se genera automáticamente
            ultimo_deuda = Datab.session.query(Deuda.Num_deuda).order_by(desc(Deuda.Num_deuda)).first()
            nueva_deuda = Deuda(
                Num_deuda= (ultimo_deuda[0] + 1) if ultimo_deuda else 1,
                Num_cliente= nuevo_cliente.Num_cliente,
                Monto_deuda= Datos_ingreso["Monto"],
                Fecha_reg= datetime.date.today().isoformat()
            )
            Datab.session.add(nueva_deuda)
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
        "Telefono_cliente": str(cliente.Telefono_cliente)
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
@app.route('/api_rec_deudas', methods=['GET'])
def recuperar_deudas():
    lista_deudas = Datab.session.query(Deuda).all()
    return jsonify([{
        "Num_deuda": deuda.Num_deuda,
        "Num_cliente": deuda.Num_cliente,
        "Fecha_deuda": deuda.Fecha_reg,
        "Monto_deuda": deuda.Monto_deuda,
        "saldada": bool(deuda.saldada)
    } for deuda in lista_deudas])
@app.route('/api_kpi_usu', methods=['GET'])
def kpi_usuarios_totales():
    total_usuarios = Datab.session.query(func.count(Cliente.Num_cliente)).scalar()
    return jsonify({"total_usuarios": total_usuarios})
@app.route('/api_tot_adeu_clie/<int:cliente_id>', methods=['GET'])
def kpi_total_adeudado(cliente_id):
    cliente = Datab.session.query(Cliente).filter(Cliente.Num_cliente == cliente_id).first()
    if cliente:
        total_deuda = Datab.session.query(func.sum(Deuda.Monto_deuda)).filter(Deuda.Num_cliente == cliente_id, Deuda.saldada == False).scalar()
        return jsonify({"total_adeudado": total_deuda})
    else:
        return jsonify({"error": "Cliente no encontrado"}), 404
@app.route('/api_tot_pagado_clie/<int:cliente_id>', methods=['GET'])
def kpi_total_pagado(cliente_id):
    cliente = Datab.session.query(Cliente).filter(Cliente.Num_cliente == cliente_id).first()
    if cliente:
        total_pagado = Datab.session.query(func.sum(Pago.Monto_pago)).filter(Pago.Num_cliente == cliente_id).scalar()
        return jsonify({"total_pagado": total_pagado})
    else:
        return jsonify({"error": "Cliente no encontrado"}), 404
if __name__=='__main__':
    with app.app_context():
        Datab.create_all()
        app.run()