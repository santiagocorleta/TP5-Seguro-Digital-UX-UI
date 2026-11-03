// js/datos.js
// Lógica para Paso 3: Datos personales
import { solicitud, guardarEnStorage, irAPaso } from './estado.js';
import {
    validarNombre,
    validarApellido,
    validarDni,
    validarEdad,
    validarEmail,
    validarCelular,
    validarTerminos
} from './validaciones.js';

export function iniciarDatos() {
    const formDatos = document.getElementById('form-datos');
    const inputNombre = document.getElementById('nombre');
    const inputApellido = document.getElementById('apellido');
    const inputDni = document.getElementById('dni');
    const inputNacimiento = document.getElementById('nacimiento');
    const inputEmail = document.getElementById('email');
    const inputCelular = document.getElementById('celular');
    const checkTerminos = document.getElementById('terminos');
    const btnContinuarPago = document.getElementById('btn-continuar-pago');

    const errNombre = document.getElementById('error-nombre');
    const errApellido = document.getElementById('error-apellido');
    const errDni = document.getElementById('error-dni');
    const errNacimiento = document.getElementById('error-nacimiento');
    const errEmail = document.getElementById('error-email');
    const errCelular = document.getElementById('error-celular');
    const errTerminos = document.getElementById('error-terminos');

    if (!formDatos) return;

    // Precargar datos desde el estado
    if (solicitud.titular.nombre && inputNombre) inputNombre.value = solicitud.titular.nombre;
    if (solicitud.titular.apellido && inputApellido) inputApellido.value = solicitud.titular.apellido;
    if (solicitud.titular.dni && inputDni) inputDni.value = solicitud.titular.dni;
    if (solicitud.titular.nacimiento && inputNacimiento) inputNacimiento.value = solicitud.titular.nacimiento;
    if (solicitud.titular.email && inputEmail) inputEmail.value = solicitud.titular.email;
    if (solicitud.titular.celular && inputCelular) inputCelular.value = solicitud.titular.celular;
    if (checkTerminos) checkTerminos.checked = !!solicitud.titular.terminos;

    function validarFormularioDatos(mostrarErrores = false) {
        const nom = inputNombre ? inputNombre.value : '';
        const ape = inputApellido ? inputApellido.value : '';
        const dni = inputDni ? inputDni.value : '';
        const nac = inputNacimiento ? inputNacimiento.value : '';
        const mail = inputEmail ? inputEmail.value : '';
        const cel = inputCelular ? inputCelular.value : '';
        const terms = checkTerminos ? checkTerminos.checked : false;

        const errNom = validarNombre(nom);
        const errApe = validarApellido(ape);
        const errD = validarDni(dni);
        const errNac = validarEdad(nac);
        const errMail = validarEmail(mail);
        const errCel = validarCelular(cel);
        const errT = validarTerminos(terms);

        const esValido = (errNom === null) && (errApe === null) && (errD === null) &&
                         (errNac === null) && (errMail === null) && (errCel === null) && (errT === null);

        // Control del botón
        if (btnContinuarPago) {
            btnContinuarPago.disabled = !esValido;
            if (esValido) {
                btnContinuarPago.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                btnContinuarPago.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }

        // Manejo de mensajes de error visuales
        function actualizarCampo(input, errElem, mensaje) {
            if (!input || !errElem) return;
            if (mostrarErrores && mensaje) {
                input.classList.add('border-red-500', 'bg-red-50/30');
                errElem.textContent = mensaje;
                errElem.classList.remove('hidden');
            } else if (!mensaje) {
                input.classList.remove('border-red-500', 'bg-red-50/30');
                errElem.classList.add('hidden');
            }
        }

        actualizarCampo(inputNombre, errNombre, errNom);
        actualizarCampo(inputApellido, errApellido, errApe);
        actualizarCampo(inputDni, errDni, errD);
        actualizarCampo(inputNacimiento, errNacimiento, errNac);
        actualizarCampo(inputEmail, errEmail, errMail);
        actualizarCampo(inputCelular, errCelular, errCel);

        if (errTerminos) {
            if (mostrarErrores && errT) {
                errTerminos.textContent = errT;
                errTerminos.classList.remove('hidden');
            } else if (!errT) {
                errTerminos.classList.add('hidden');
            }
        }

        return esValido;
    }

    const campos = [
        { el: inputNombre, min: 2 },
        { el: inputApellido, min: 2 },
        { el: inputDni, min: 7 },
        { el: inputNacimiento, min: 8 },
        { el: inputEmail, min: 5 },
        { el: inputCelular, min: 8 }
    ];

    campos.forEach(({ el, min }) => {
        if (!el) return;
        el.addEventListener('input', () => validarFormularioDatos(el.value.length >= min));
        el.addEventListener('blur', () => validarFormularioDatos(true));
    });

    if (checkTerminos) {
        checkTerminos.addEventListener('change', () => validarFormularioDatos(true));
    }

    formDatos.addEventListener('submit', (e) => {
        e.preventDefault();

        const esValido = validarFormularioDatos(true);
        if (!esValido) return;

        solicitud.titular.nombre = inputNombre.value.trim();
        solicitud.titular.apellido = inputApellido.value.trim();
        solicitud.titular.dni = inputDni.value.trim();
        solicitud.titular.nacimiento = inputNacimiento.value.trim();
        solicitud.titular.email = inputEmail.value.trim();
        solicitud.titular.celular = inputCelular.value.trim();
        solicitud.titular.terminos = checkTerminos.checked;

        guardarEnStorage();
        irAPaso(4); // Ir a Pago
    });

    validarFormularioDatos(false);
}
