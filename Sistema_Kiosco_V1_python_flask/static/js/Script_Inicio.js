function cargar_clientes_api(){
    fetch("/api_rec_clientes")
    .then(res=>res.json())
    .then(clientes => {
        clientes.forEach(cliente => {
            let contenedor_clien = document.getElementById("Datos_clientes");
            let parrafo_datos = document.createElement("p");
            parrafo_datos.textContent =
                "Nombre de Cliente: " + cliente.Nombre_cliente + "\n" +
                "Apellido de Cliente: " + cliente.Apellido_cliente + "\n"+
                "Telefono de Cliente: " + cliente.Telefono_cliente + "\n"+
                "Monto Total Pagado: " + cliente.Monto_total_pagado + "\n" +
                "Monto Total Adeudado: " + cliente.Monto_total_adeudado;
            parrafo_datos.style.whiteSpace = "pre-line";
            contenedor_clien.appendChild(parrafo_datos);
        });
    })
    .catch(error => {
        alert("Error al recuperar clientes: " + error)
    })
}
function Activarpanel_clientes(){
    let conte = document.getElementById("panel_clientes");
    if (conte.style.display === "none") {
        conte.style.display = "flex";
        cargar_clientes_api()
    }
}
function Cerrarpanel_clientes(){
    document.getElementById("Datos_clientes").textContent="";
    document.getElementById("panel_clientes").style.display="none";
}