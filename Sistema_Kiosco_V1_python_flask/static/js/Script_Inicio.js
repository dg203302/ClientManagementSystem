// Cargar y mostrar los clientes en el panel de clientes
function cargar_clientes_api(){
    fetch("/api_rec_clientes")
    .then(res => res.json())
    .then(clientes => {
        const contenedor_clien = document.getElementById("Datos_clientes");
        if (!contenedor_clien) return;
        contenedor_clien.innerHTML = ""; // limpiar
        clientes.forEach(cliente => {
            const parrafo_datos = document.createElement("p");
            parrafo_datos.innerText =
                t('lbl_name') + ' ' + (cliente.Nombre_cliente || '') + "\n" +
                t('lbl_surname') + ' ' + (cliente.Apellido_cliente || '') + "\n" +
                t('lbl_phone') + ' ' + (cliente.Telefono_cliente || '') ;
            const total_adeudado = fetch(`/api_tot_adeu_clie/${cliente.Num_cliente}`)
                .then(res => res.json())
                .then(data => data.total_adeudado || 0)
                    .then(adeudado => {
                    parrafo_datos.innerText += "\n" + t('lbl_total_debt') + ' ' + adeudado;
                });
            const total_pagado = fetch(`/api_tot_pagado_clie/${cliente.Num_cliente}`)
                .then(res => res.json())
                .then(data => data.total_pagado || 0)
                .then(pagado => {
                    parrafo_datos.innerText += "\n" + t('lbl_total_paid') + ' ' + pagado;
                });
            Promise.all([total_adeudado, total_pagado]).then(() => {
                parrafo_datos.innerText += "";
            });
            contenedor_clien.appendChild(parrafo_datos);
        });
    })
    .catch(err => {
        console.error('Error cargando clientes:', err);
    });
}
function cargar_Kpis(){
    const kpi_usuarios = document.getElementById("kpi_usuarios");
    const kpi_total_adeudado = document.getElementById("kpi_total_adeudado");
    const kpi_total_recaudado = document.getElementById("kpi_total_recaudado");
    const kpi_ingresos_mensuales = document.getElementById("kpi_ingresos_mensuales");

    // KPI: usuarios registrados
    fetch("/api_rec_clientes")
    .then(res => res.json())
    .then(clientes => {
        if (kpi_usuarios) kpi_usuarios.innerText = (Array.isArray(clientes) ? clientes.length : 0);
        // Calcular totales a partir de pagos y deudas
        return Promise.all([fetch('/api_rec_pagos'), fetch('/api_rec_deudas')]);
    })
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(([pagos, deudas]) => {
        if (kpi_total_recaudado){
            const total_recaudado = (Array.isArray(pagos) ? pagos.reduce((s,p) => s + (p.Monto_pago || 0), 0) : 0);
            kpi_total_recaudado.innerText = total_recaudado;
        }
        if (kpi_total_adeudado){
            const total_adeudado = (Array.isArray(deudas) ? deudas.reduce((s,d) => s + (d.saldada === false ? (d.Monto_deuda || 0) : 0), 0) : 0);
            kpi_total_adeudado.innerText = total_adeudado;
        }
        // Actualizar ingreso mensual (usa pagos)
        if (kpi_ingresos_mensuales){
            const ahora = new Date();
            const mesActual = ahora.getMonth() + 1;
            const anioActual = ahora.getFullYear();
            const ingresosMensuales = (Array.isArray(pagos) ? pagos.reduce((s,p) => {
                const fechaPago = new Date(p.Fecha_pago);
                if (fechaPago.getMonth() + 1 === mesActual && fechaPago.getFullYear() === anioActual){
                    return s + (p.Monto_pago || 0);
                }
                return s;
            }, 0) : 0);
            kpi_ingresos_mensuales.innerText = ingresosMensuales;
        }

    })
    .catch(err => {
        console.error('Error cargando KPIs:', err);
    });
}

function Activarpanel_clientes(){
    const conte = document.getElementById("panel_clientes");
    if (!conte) return;
    const current = getComputedStyle(conte).display;
    if (current === "none"){
        conte.style.display = "flex";
        cargar_clientes_api();
    }
    const botonver = document.getElementById("boton_ver_clientes");
    if (botonver) botonver.style.display = "none";
}

function Cerrarpanel_clientes(){
    const conte = document.getElementById("panel_clientes");
    if (!conte) return;
    conte.style.display = "none";
    const botonver = document.getElementById("boton_ver_clientes");
    if (botonver) botonver.style.display = "inline-block";
}

// ---------------- Internationalization / Language switching ----------------
const i18n = {
    en: {
        title: 'Management System',
        btn_view_clients: 'View Clients',
        btn_register_operation: 'Register an Operation',
        btn_view_payments: 'View Payments History',
        btn_view_debts: 'View Debts History',
        btn_close_clients: 'Close Clients',
        hist_payments_title: 'Payments History',
        hist_debts_title: 'Debts History',
        label_filter: 'Filter:',
        btn_search: 'Search',
        btn_show_paid_debts: 'Show Paid Debts',
        btn_show_active_debts: 'Show Active Debts',
        filter_placeholder: 'Name / Phone number',
        swal_title: 'Data Entry',
        swal_name: 'First name',
        swal_surname: 'Last name',
        swal_phone: 'Phone',
        swal_amount: 'Amount',
        swal_pay_label: 'Pay',
        swal_debt_label: 'Debt',
        swal_confirm: 'Confirm',
        swal_cancel: 'Cancel'
        ,
        // additional messages
        lbl_name: 'Name:',
        lbl_surname: 'Surname:',
        lbl_phone: 'Phone:',
        lbl_total_debt: 'Total Owed:',
        lbl_total_paid: 'Total Paid:',
        client_label: 'Client ',
        msg_no_payments: 'No payments registered.',
        msg_error_retrieve_payments: 'Error retrieving payments.',
        msg_no_debts: 'No debts registered.',
        msg_error_retrieve_debts: 'Error retrieving debts.',
        msg_no_results_payments: 'No payments found matching the filter.',
        msg_no_results_debts: 'No debts found matching the filter.',
        msg_error_filter_payments: 'Error filtering payments.',
        msg_error_filter_debts: 'Error filtering debts.',
        hdr_payment: '#Payment',
        hdr_client: 'Client',
        hdr_date: 'Date',
        hdr_time: 'Time',
        hdr_amount: 'Amount',
        hdr_debt: '#Debt',
    hdr_status: 'Status',
        debt_status_paid: 'Paid',
        debt_status_active: 'Active',
        swal_success_title: 'Success',
        swal_success_msg: 'Operation registered successfully',
        swal_error_title: 'Error',
        swal_error_server: 'Server error',
        swal_error_send: 'Could not send the request',
        // KPI titles and misc
        kpi_users_title: 'Registered Users',
        kpi_total_debt_title: 'Total Owed',
        kpi_total_collected_title: 'Total Collected',
        kpi_monthly_income_title: 'Monthly Income',
        btn_close: 'Close',
        footer_text: 'Management System - V1.0',
        swal_validation_msg: 'Complete all fields correctly'
    },
    es: {
        title: 'Managment System',
        btn_view_clients: 'Ver Estado de Clientes',
        btn_register_operation: 'Registrar una Operacion',
        btn_view_payments: 'Ver Historial de Pagos',
        btn_view_debts: 'Ver Historial de Deudas',
        btn_close_clients: 'Cerrar Clientes',
        hist_payments_title: 'Historial de Pagos',
        hist_debts_title: 'Historial de Deudas',
        label_filter: 'Filtrar:',
        btn_search: 'Buscar',
        btn_show_paid_debts: 'Mostrar Deudas Saldadas',
        btn_show_active_debts: 'Mostrar Deudas Activas',
        filter_placeholder: 'Nombre/Nro de telefono',
        swal_title: 'Ingreso de Datos',
        swal_name: 'Nombre',
        swal_surname: 'Apellido',
        swal_phone: 'Telefono',
        swal_amount: 'Monto',
        swal_pay_label: 'Pago',
        swal_debt_label: 'Deuda',
        swal_confirm: 'Confirmar',
        swal_cancel: 'Cancelar'
        ,
        // additional messages
        lbl_name: 'Nombre:',
        lbl_surname: 'Apellido:',
        lbl_phone: 'Telefono:',
        lbl_total_debt: 'Total Adeudado:',
        lbl_total_paid: 'Total Pagado:',
        client_label: 'Cliente ',
        msg_no_payments: 'No hay pagos registrados.',
        msg_error_retrieve_payments: 'Error al recuperar pagos.',
        msg_no_debts: 'No hay deudas registradas.',
        msg_error_retrieve_debts: 'Error al recuperar deudas.',
        msg_no_results_payments: 'No se encontraron pagos que coincidan.',
        msg_no_results_debts: 'No se encontraron deudas que coincidan.',
        msg_error_filter_payments: 'Error al filtrar pagos.',
        msg_error_filter_debts: 'Error al filtrar deudas.',
        hdr_payment: '#Pago',
        hdr_client: 'Cliente',
        hdr_date: 'Fecha',
        hdr_time: 'Hora',
        hdr_amount: 'Monto',
        hdr_debt: '#Deuda',
    hdr_status: 'Estado',
        debt_status_paid: 'Saldada',
        debt_status_active: 'Activa',
        swal_success_title: 'Éxito',
        swal_success_msg: 'Operación registrada correctamente',
        swal_error_title: 'Error',
        swal_error_server: 'Error en el servidor',
        swal_error_send: 'No se pudo enviar la solicitud',
        // KPI titles and misc
        kpi_users_title: 'Usuarios Registrados',
        kpi_total_debt_title: 'Total Adeudado',
        kpi_total_collected_title: 'Total Recaudado',
        kpi_monthly_income_title: 'Ingresos Mensuales',
        btn_close: 'Cerrar',
        footer_text: 'Managment System - V1.0',
        swal_validation_msg: 'Completa todos los campos correctamente'
    }
};

function t(key){
    return (i18n[currentLang] && i18n[currentLang][key]) || (i18n['en'] && i18n['en'][key]) || key;
}

let currentLang = localStorage.getItem('lang') || 'en';

function setLanguage(lang){
    if(!i18n[lang]) return;
    currentLang = lang;
    localStorage.setItem('lang', lang);
    // translate elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if(key && i18n[lang][key] !== undefined){
            el.innerText = i18n[lang][key];
        }
    });
    // placeholders
    const fil = document.getElementById('Filtrar');
    if(fil) fil.placeholder = i18n[lang].filter_placeholder || '';
    const fil2 = document.getElementById('Filtrar_deudas');
    if(fil2) fil2.placeholder = i18n[lang].filter_placeholder || '';
}

function Cambiar_ingles(){ setLanguage('en'); }
function Cambiar_espanol(){ setLanguage('es'); }

// Mostrar formulario de ingreso mediante SweetAlert2 desde la página INICIO
function mostrarFormularioIngreso(){
    const txt = i18n[currentLang] || i18n['en'];
    Swal.fire({
        title: txt.swal_title,
        html:
            `<input id="swal_nombre" class="swal2-input" placeholder="${txt.swal_name}">` +
            `<input id="swal_apellido" class="swal2-input" placeholder="${txt.swal_surname}">` +
            `<input id="swal_telefono" class="swal2-input" placeholder="${txt.swal_phone}">` +
            `<input id="swal_monto" type="number" step="0.01" class="swal2-input" placeholder="${txt.swal_amount}">` +
            `<div style="display:flex;justify-content:space-around;margin-top:10px;">` +
            `<label><input type="checkbox" id="swal_pago"> ${txt.swal_pay_label}</label>` +
            `<label><input type="checkbox" id="swal_deuda"> ${txt.swal_debt_label}</label>` +
            `</div>`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: txt.swal_confirm,
        cancelButtonText: txt.swal_cancel,
        preConfirm: () => {
            const nombre = document.getElementById('swal_nombre').value.trim();
            const apellido = document.getElementById('swal_apellido').value.trim();
            const telefono = document.getElementById('swal_telefono').value.trim();
            const montoVal = document.getElementById('swal_monto').value;
            const monto = montoVal === '' ? NaN : parseFloat(montoVal);
            const pago = document.getElementById('swal_pago').checked;
            const deuda = document.getElementById('swal_deuda').checked;
            if (!nombre || !apellido || !telefono || isNaN(monto)){
                Swal.showValidationMessage(t('swal_validation_msg'));
                return false;
            }
            return { nombre, apellido, telefono, monto, pago, deuda };
        }
    }).then((result) => {
        if (result.isConfirmed && result.value){
            const payload = {
                Nombre_cliente: result.value.nombre,
                Apellido_cliente: result.value.apellido,
                Telefono_cliente: result.value.telefono,
                Monto: result.value.monto,
                pago: result.value.pago,
                deuda: result.value.deuda
            };
            fetch('/api_ingreso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(response => {
                        if (response.ok){
                            Swal.fire(t('swal_success_title'), t('swal_success_msg'), 'success');
                            window.location.reload();
                        } else {
                            response.text().then(text => {
                                Swal.fire(t('swal_error_title'), (text || t('swal_error_server')), 'error');
                            });
                        }
            })
            .catch(() => {
                Swal.fire(t('swal_error_title'), t('swal_error_send'), 'error');
            });
        }
    });
}

// Export la función al scope global (se llama desde el onclick en la plantilla)
window.mostrarFormularioIngreso = mostrarFormularioIngreso;

// Cargar y mostrar el historial de pagos en el contenedor #contenido_historial_pagos
function Cargar_historial_pagos(){
    const cont = document.getElementById('contenido_historial_pagos');
    if (!cont) return;
    cont.innerHTML = '';
    // Obtener pagos y clientes para mostrar el nombre y telefono en lugar del id
    Promise.all([fetch('/api_rec_pagos'), fetch('/api_rec_clientes')])
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(([pagos, clientes]) => {
        if (!Array.isArray(pagos) || pagos.length === 0){
            cont.textContent = t('msg_no_payments');
            return;
        }
        const clientMap = {};
        if (Array.isArray(clientes)){
            clientes.forEach(c => { clientMap[c.Num_cliente] = c; });
        }
        // Crear una tabla simple (no mostramos el id del cliente)
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
    const headerLabels = [t('hdr_payment'), t('hdr_client'), t('hdr_date'), t('hdr_time'), t('hdr_amount')];
    headerLabels.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            th.style.border = '1px solid #ccc';
            th.style.padding = '6px';
            th.style.textAlign = 'left';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        pagos.forEach(pago => {
            const tr = document.createElement('tr');
            const cliente = clientMap[pago.Num_cliente];
            const clienteNombre = cliente ? (cliente.Nombre_cliente + (cliente.Apellido_cliente ? (' ' + cliente.Apellido_cliente) : '')) : (t('client_label') + pago.Num_cliente);
            [pago.Num_pago, clienteNombre, pago.Fecha_pago, pago.Hora_pago, pago.Monto_pago].forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;
                td.style.border = '1px solid #eee';
                td.style.padding = '6px';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        cont.appendChild(table);
    })
    .catch(err => {
        console.error('Error cargando pagos o clientes:', err);
        cont.textContent = t('msg_error_retrieve_payments');
    });
}
// Abrir el panel de historial y recargar pagos
function mostrarHistorialPagos(){
    const seccion = document.getElementById('Historial_de_pagos');
    if (!seccion) return;
    seccion.style.display = 'block';
    Cargar_historial_pagos();
    const botonver = document.getElementById('boton_ver_historial');
    botonver.style.display = 'none';
}

// Cerrar funciones para compatibilidad con los onclick de la plantilla
function cerrarHistorialPagos(){
    const seccion = document.getElementById('Historial_de_pagos');
    if (!seccion) return;
    seccion.style.display = 'none';
    const botonver = document.getElementById('boton_ver_historial');
    botonver.style.display = 'inline-block';
}
function Cerrar_historial_pagos(){
    cerrarHistorialPagos();
}

// Filtrar el historial localmente por coincidencia en campos (Num_pago, Num_cliente, Fecha, Hora, Monto)
function Filtrar_historial_pagos(){
    const filtro = document.getElementById('Filtrar')?.value.trim().toLowerCase() || '';
    if (!filtro){
        Cargar_historial_pagos();
        return;
    }
    const cont = document.getElementById('contenido_historial_pagos');
    if (!cont) return;
    // Recuperar pagos y clientes y filtrar por nombre o telefono
    Promise.all([fetch('/api_rec_pagos'), fetch('/api_rec_clientes')])
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(([pagos, clientes]) => {
        const clientMap = {};
        if (Array.isArray(clientes)) clientes.forEach(c => { clientMap[c.Num_cliente] = c; });
        const filtrados = (Array.isArray(pagos) ? pagos : []).filter(p => {
            const cliente = clientMap[p.Num_cliente];
            const nombre = cliente ? ((cliente.Nombre_cliente || '') + ' ' + (cliente.Apellido_cliente || '')).toLowerCase() : '';
            const telefono = cliente ? (cliente.Telefono_cliente || '').toLowerCase() : '';
            return nombre.includes(filtro) || telefono.includes(filtro) || String(p.Num_pago).includes(filtro) || String(p.Monto_pago).toLowerCase().includes(filtro) || (p.Fecha_pago || '').toLowerCase().includes(filtro);
        });
        cont.innerHTML = '';
        if (filtrados.length === 0){
            cont.textContent = t('msg_no_results_payments');
            return;
        }
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headerLabels = [t('hdr_payment'), t('hdr_client'), t('hdr_date'), t('hdr_time'), t('hdr_amount')];
        headerLabels.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            th.style.border = '1px solid #ccc';
            th.style.padding = '6px';
            th.style.textAlign = 'left';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        filtrados.forEach(pago => {
            const tr = document.createElement('tr');
            const cliente = clientMap[pago.Num_cliente];
            const clienteNombre = cliente ? (cliente.Nombre_cliente + (cliente.Apellido_cliente ? (' ' + cliente.Apellido_cliente) : '')) : (t('client_label') + pago.Num_cliente);
            [pago.Num_pago, clienteNombre, pago.Fecha_pago, pago.Hora_pago, pago.Monto_pago].forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;
                td.style.border = '1px solid #eee';
                td.style.padding = '6px';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        cont.appendChild(table);
    })
    .catch(err => {
        console.error('Error filtrando pagos o clientes:', err);
        cont.textContent = t('msg_error_filter_payments');
    });
}

// Exportar funciones al scope global para los onclick en la plantilla
window.Cargar_historial_pagos = Cargar_historial_pagos;
window.mostrarHistorialPagos = mostrarHistorialPagos;
window.cerrarHistorialPagos = cerrarHistorialPagos;
window.Cerrar_historial_pagos = Cerrar_historial_pagos;
window.Filtrar_historial_pagos = Filtrar_historial_pagos;

// ----------------- Historial de Deudas (mismo comportamiento que pagos) -----------------
function mostrarHistorialDeudas(){
    const seccion = document.getElementById('Historial_de_Deudas');
    if (!seccion) return;
    seccion.style.display = 'block';
    Cargar_historial_deudas();
    const botonver = document.getElementById('boton_ver_deudas');
    botonver.style.display = 'none';
}
function Cargar_historial_deudas(){
    const cont = document.getElementById('contenido_historial_deudas');
    if (!cont) return;
    cont.innerHTML = '';
    Promise.all([fetch('/api_rec_deudas'), fetch('/api_rec_clientes')])
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(([deudas, clientes]) => {
        if (!Array.isArray(deudas) || deudas.length === 0){
            cont.textContent = t('msg_no_debts');
            return;
        }
        const clientMap = {};
        if (Array.isArray(clientes)) clientes.forEach(c => { clientMap[c.Num_cliente] = c; });

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
            const headerLabels = [t('hdr_debt'), t('hdr_client'), t('hdr_date'), t('hdr_amount'), t('hdr_status')];
            headerLabels.forEach(h => {
                const th = document.createElement('th');
                th.textContent = h;
                th.style.border = '1px solid #ccc';
                th.style.padding = '6px';
                th.style.textAlign = 'left';
                headerRow.appendChild(th);
            });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        deudas.forEach(d => {
            const tr = document.createElement('tr');
            const cliente = clientMap[d.Num_cliente];
            const clienteNombre = cliente ? (cliente.Nombre_cliente + (cliente.Apellido_cliente ? (' ' + cliente.Apellido_cliente) : '')) : (t('client_label') + d.Num_cliente);
                const estadoDeuda = d.saldada ? t('debt_status_paid') : t('debt_status_active');
                [d.Num_deuda, clienteNombre, d.Fecha_deuda, d.Monto_deuda, estadoDeuda].forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;
                td.style.border = '1px solid #eee';
                td.style.padding = '6px';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        cont.appendChild(table);
    })
    .catch(err => {
        console.error('Error cargando deudas o clientes:', err);
        cont.textContent = t('msg_error_retrieve_debts');
    });
}

function mostrarHistorialDeudas(){
    const seccion = document.getElementById('Historial_de_Deudas');
    if (!seccion) return;
    seccion.style.display = 'block';
    Cargar_historial_deudas();
}

function cerrarHistorialDeudas(){
    const seccion = document.getElementById('Historial_de_Deudas');
    if (!seccion) return;
    seccion.style.display = 'none';
}

function Cerrar_historial_deudas(){
    cerrarHistorialDeudas();
}

function Filtrar_historial_deudas(){
    const filtro = document.getElementById('Filtrar_deudas')?.value.trim().toLowerCase() || '';
    if (!filtro){
        Cargar_historial_deudas();
        return;
    }
    const cont = document.getElementById('contenido_historial_deudas');
    if (!cont) return;
    Promise.all([fetch('/api_rec_deudas'), fetch('/api_rec_clientes')])
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(([deudas, clientes]) => {
        const clientMap = {};
        if (Array.isArray(clientes)) clientes.forEach(c => { clientMap[c.Num_cliente] = c; });
        const filtrados = (Array.isArray(deudas) ? deudas : []).filter(d => {
            const cliente = clientMap[d.Num_cliente];
            const nombre = cliente ? ((cliente.Nombre_cliente || '') + ' ' + (cliente.Apellido_cliente || '')).toLowerCase() : '';
            const telefono = cliente ? (cliente.Telefono_cliente || '').toLowerCase() : '';
            return nombre.includes(filtro) || telefono.includes(filtro) || String(d.Num_deuda).includes(filtro) || String(d.Monto_deuda).toLowerCase().includes(filtro) || (d.Fecha_deuda || '').toLowerCase().includes(filtro);
        });
        cont.innerHTML = '';
        if (filtrados.length === 0){
            cont.textContent = t('msg_no_results_debts');
            return;
        }
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headerLabels = [t('hdr_debt'), t('hdr_client'), t('hdr_date'), t('hdr_amount')];
        headerLabels.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            th.style.border = '1px solid #ccc';
            th.style.padding = '6px';
            th.style.textAlign = 'left';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        filtrados.forEach(d => {
            const tr = document.createElement('tr');
            const cliente = clientMap[d.Num_cliente];
            const clienteNombre = cliente ? (cliente.Nombre_cliente + (cliente.Apellido_cliente ? (' ' + cliente.Apellido_cliente) : '')) : (t('client_label') + d.Num_cliente);
            [d.Num_deuda, clienteNombre, d.Fecha_deuda, d.Monto_deuda].forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;
                td.style.border = '1px solid #eee';
                td.style.padding = '6px';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        cont.appendChild(table);
    })
    .catch(err => {
        console.error('Error filtrando deudas o clientes:', err);
        cont.textContent = t('msg_error_filter_debts');
    });
}

// Export deuda functions
window.Cargar_historial_deudas = Cargar_historial_deudas;
window.mostrarHistorialDeudas = mostrarHistorialDeudas;
window.cerrarHistorialDeudas = cerrarHistorialDeudas;
window.Cerrar_historial_deudas = Cerrar_historial_deudas;
window.Filtrar_historial_deudas = Filtrar_historial_deudas;

// Cargar historial al inicio para tener los datos listos (sección puede estar oculta)
document.addEventListener('DOMContentLoaded', function(){
    // set initial language (default from localStorage or 'en')
    try{ setLanguage(currentLang); }catch(e){/* ignore */}
    // intenta cargar, no falla si el contenedor no existe
    try{ Cargar_historial_pagos(); }catch(e){ /* ignore */ }
    try{ Cargar_historial_deudas(); }catch(e){ /* ignore */ }
    try{ cargar_Kpis(); }catch(e){ /* ignore */ }
});