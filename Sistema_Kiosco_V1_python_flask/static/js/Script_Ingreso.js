document.getElementById("Formulario_ingreso").addEventListener("submit", function(event){
    event.preventDefault();
    fetch('/api_ingreso', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "Nombre_cliente" : document.getElementById("Nombre_c").value,
            "Apellido_cliente" : document.getElementById("Ape_c").value,
            "Telefono_cliente" : document.getElementById("Tel_c").value,
            "Monto" : parseFloat(document.getElementById("Monto_c").value),
            "pago" : document.getElementById("Pago").checked,
            "deuda" : document.getElementById("Deuda").checked
        })
    })
    .then(response => {
        if (response.ok){
            let conten = document.getElementById("exito_fracaso");
            let img = document.createElement("img");
            img.src="/static/images/pngwing.com (1).png";
            img.alt="Exito";
            img.id="Icono_Exito";
            let texto = document.createElement("p");
            texto.textContent="Exito en la Carga!"
            conten.appendChild(img);
            conten.appendChild(texto);
        }
    })
    .catch(error => {
        let conten = document.getElementById("exito_fracaso");
        let img = document.createElement("img");
        img.src="/static/images/pngwing.com.png";
        img.alt="Fracaso";
        img.id="Icono_Fracaso";
        let texto = document.createElement("p");
        texto.textContent="Freacaso en la Carga!"
        conten.appendChild(img);
        conten.appendChild(texto);
    });
})