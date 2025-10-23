window.onload = function(){
    fetch('/api_rec_pagos')
    .then(res=>res.json())
    .then(pagos => {
        pagos.forEach(pago => {
            let contenedor_pagos = document.getElementById("Panel_pagos");
            contenedor_pagos.style.display="flex";
            let parrafo_pagos = document.createElement("p");
            parrafo_pagos.textContent =
                "Numero de Pago: " + pago.Num_pago + "\n" +
                "Numero de Cliente: " + pago.Num_cliente + "\n"+
                "Fecha de Pago: " + pago.Fecha_pago + "\n"+
                "Hora de Pago: " + pago.Hora_pago + "\n" +
                "Monto de Pago: " + pago.Monto_pago;
            parrafo_pagos.style.whiteSpace = "pre-line";
            contenedor_pagos.appendChild(parrafo_pagos);        
        });
    })
    .catch(error=>{
        alert("error al recuperar pagos: " + error);
    })
}