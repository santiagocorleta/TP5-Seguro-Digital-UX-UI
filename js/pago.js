// js/pago.js
import { solicitud, guardarEnStorage, irAPaso } from './estado.js';
import {
    validarTarjeta,
    validarTitular,
    validarVencimiento,
    validarCvv
} from './validaciones.js';

// Simulación de pasarela de pago (Sección 5.3 del PDF)
export function simularPago(numero) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const limpio = (numero || '').toString().replace(/\s/g, '');
            resolve(limpio === '4000000000000002'
                ? { ok: false, motivo: 'Tarjeta rechazada' }
                : { ok: true });
        }, 1500);
    });
}

// Generador de número de póliza: POL-AAAA-NNNNNN
export function generarPoliza() {
    const anioActual = new Date().getFullYear();
    const contador = Math.floor(100000 + Math.random() * 900000);
    return `POL-${anioActual}-${String(contador).padStart(6, '0')}`;
}

export function iniciarPago() {
    const formPago = document.getElementById('form-pago');
    const inputTarjeta = document.getElementById('tarjeta');
    const inputTitular = document.getElementById('titular');
    const inputVencimiento = document.getElementById('vencimiento');
    const inputCvv = document.getElementById('cvv');
    const radiosMedio = document.querySelectorAll('input[name="medio_pago"]');
    const btnPagar = document.getElementById('btn-pagar');

    const errTarjeta = document.getElementById('error-tarjeta');
    const errTitular = document.getElementById('error-titular');
    const errVencimiento = document.getElementById('error-vencimiento');
    const errCvv = document.getElementById('error-cvv');

    if (!formPago) return;

    // Precargar datos si ya estaban en el estado
    if (solicitud.pago.tarjeta && inputTarjeta) {
        inputTarjeta.value = solicitud.pago.tarjeta;
    }
    if (inputTitular) {
        inputTitular.value = solicitud.pago.titular || `${solicitud.titular.nombre} ${solicitud.titular.apellido}`.trim();
    }
    if (solicitud.pago.vencimiento && inputVencimiento) {
        inputVencimiento.value = solicitud.pago.vencimiento;
    }
    if (solicitud.pago.cvv && inputCvv) {
        inputCvv.value = solicitud.pago.cvv;
    }
    if (radiosMedio && solicitud.pago.metodo) {
        radiosMedio.forEach(r => {
            if (r.value === solicitud.pago.metodo) r.checked = true;
        });
    }

    function validarFormularioPago(mostrarErrores = false) {
        const tarjeta = inputTarjeta ? inputTarjeta.value : '';
        const titular = inputTitular ? inputTitular.value : '';
        const vencimiento = inputVencimiento ? inputVencimiento.value : '';
        const cvv = inputCvv ? inputCvv.value : '';

        const errT = validarTarjeta(tarjeta);
        const errTit = validarTitular(titular);
        const errV = validarVencimiento(vencimiento);
        const errC = validarCvv(cvv);

        const esValido = (errT === null) && (errTit === null) && (errV === null) && (errC === null);

        if (btnPagar && !btnPagar.dataset.procesando) {
            btnPagar.disabled = !esValido;
            if (esValido) {
                btnPagar.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                btnPagar.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }

        if (inputTarjeta && errTarjeta) {
            if (mostrarErrores && errT) {
                inputTarjeta.classList.add('border-red-500', 'bg-red-50/30');
                errTarjeta.textContent = errT;
                errTarjeta.classList.remove('hidden');
            } else if (!errT) {
                inputTarjeta.classList.remove('border-red-500', 'bg-red-50/30');
                errTarjeta.classList.add('hidden');
            }
        }

        if (inputTitular && errTitular) {
            if (mostrarErrores && errTit) {
                inputTitular.classList.add('border-red-500', 'bg-red-50/30');
                errTitular.textContent = errTit;
                errTitular.classList.remove('hidden');
            } else if (!errTit) {
                inputTitular.classList.remove('border-red-500', 'bg-red-50/30');
                errTitular.classList.add('hidden');
            }
        }

        if (inputVencimiento && errVencimiento) {
            if (mostrarErrores && errV) {
                inputVencimiento.classList.add('border-red-500', 'bg-red-50/30');
                errVencimiento.textContent = errV;
                errVencimiento.classList.remove('hidden');
            } else if (!errV) {
                inputVencimiento.classList.remove('border-red-500', 'bg-red-50/30');
                errVencimiento.classList.add('hidden');
            }
        }

        if (inputCvv && errCvv) {
            if (mostrarErrores && errC) {
                inputCvv.classList.add('border-red-500', 'bg-red-50/30');
                errCvv.textContent = errC;
                errCvv.classList.remove('hidden');
            } else if (!errC) {
                inputCvv.classList.remove('border-red-500', 'bg-red-50/30');
                errCvv.classList.add('hidden');
            }
        }

        return esValido;
    }

    // Máscara y formato de tarjeta (bloques de 4 dígitos)
    if (inputTarjeta) {
        inputTarjeta.addEventListener('input', () => {
            let digits = inputTarjeta.value.replace(/\D/g, '').slice(0, 16);
            const bloques = digits.match(/.{1,4}/g);
            inputTarjeta.value = bloques ? bloques.join(' ') : digits;
            validarFormularioPago(false);
        });
        inputTarjeta.addEventListener('blur', () => validarFormularioPago(true));
    }

    if (inputTitular) {
        inputTitular.addEventListener('input', () => validarFormularioPago(false));
        inputTitular.addEventListener('blur', () => validarFormularioPago(true));
    }

    // Máscara de fecha de vencimiento (MM/AA)
    if (inputVencimiento) {
        inputVencimiento.addEventListener('input', () => {
            let digits = inputVencimiento.value.replace(/\D/g, '').slice(0, 4);
            if (digits.length >= 3) {
                inputVencimiento.value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
            } else {
                inputVencimiento.value = digits;
            }
            validarFormularioPago(false);
        });
        inputVencimiento.addEventListener('blur', () => validarFormularioPago(true));
    }

    if (inputCvv) {
        inputCvv.addEventListener('input', () => {
            inputCvv.value = inputCvv.value.replace(/\D/g, '').slice(0, 3);
            validarFormularioPago(false);
        });
        inputCvv.addEventListener('blur', () => validarFormularioPago(true));
    }

    // Procesamiento del pago
    formPago.addEventListener('submit', async (e) => {
        e.preventDefault();

        const esValido = validarFormularioPago(true);
        if (!esValido) return;

        // Deshabilitar botón durante 1,5 segundos y mostrar "Procesando…" (evita doble click)
        btnPagar.dataset.procesando = "true";
        btnPagar.disabled = true;
        btnPagar.textContent = 'Procesando…';
        btnPagar.classList.add('opacity-75', 'cursor-not-allowed');

        let metodo = 'credito';
        radiosMedio.forEach(r => {
            if (r.checked) metodo = r.value;
        });

        solicitud.pago.metodo = metodo;
        solicitud.pago.tarjeta = inputTarjeta.value.trim();
        solicitud.pago.titular = inputTitular.value.trim();
        solicitud.pago.vencimiento = inputVencimiento.value.trim();
        solicitud.pago.cvv = inputCvv.value.trim();
        guardarEnStorage();

        try {
            const respuesta = await simularPago(inputTarjeta.value);
            btnPagar.removeAttribute('data-procesando');
            btnPagar.textContent = 'Pagar y contratar';

            if (respuesta.ok) {
                solicitud.poliza = generarPoliza();
                guardarEnStorage();
                irAPaso(5); // Pantalla de éxito
            } else {
                irAPaso(6); // Pantalla de error
            }
        } catch (err) {
            console.error('Error al procesar pago:', err);
            btnPagar.removeAttribute('data-procesando');
            btnPagar.disabled = false;
            btnPagar.textContent = 'Pagar y contratar';
            btnPagar.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    });

    validarFormularioPago(false);
}
