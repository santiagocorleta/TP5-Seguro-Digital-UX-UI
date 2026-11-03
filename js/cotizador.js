// js/cotizador.js
import { solicitud, guardarEnStorage, irAPaso } from './estado.js';
import {
    validarMarca,
    validarModelo,
    validarValor,
    validarAntiguedad
} from './validaciones.js';

// Factores de antigüedad según Sección 5.1 del PDF
export function obtenerFactorAntiguedad(antiguedad) {
    switch (antiguedad) {
        case '1-2':
        case '1 a 2 años':
            return 1.10;
        case 'mas-2':
        case 'más de 2 años':
            return 1.25;
        case 'menos-1':
        case 'menos de 1 año':
        default:
            return 1.00;
    }
}

// Fórmula oficial Sección 5.1: cuota = Math.round(valor * tasaAnual / 12 * factorAntiguedad)
export function calcularCuota(valor, tasaAnual, antiguedad) {
    const factor = obtenerFactorAntiguedad(antiguedad);
    const numValor = typeof valor === 'string'
        ? Number(valor.replace(/\D/g, ''))
        : Number(valor);
    return Math.round((numValor * Number(tasaAnual) / 12) * factor);
}

// Inicialización de la pantalla 02_cotizar (Paso 1)
export function iniciarCotizador() {
    const formCotizar = document.getElementById('form-cotizar');
    const inputMarca = document.getElementById('marca');
    const inputModelo = document.getElementById('modelo');
    const inputValor = document.getElementById('valor');
    const radiosAntiguedad = document.querySelectorAll('input[name="antiguedad"]');
    const btnVerPlanes = document.getElementById('btn-ver-planes');

    const errMarca = document.getElementById('error-marca');
    const errModelo = document.getElementById('error-modelo');
    const errValor = document.getElementById('error-valor');
    const errAntiguedad = document.getElementById('error-antiguedad');

    if (!formCotizar) return;

    // Precargar datos desde el estado si ya existían
    if (solicitud.equipo.marca && inputMarca) {
        inputMarca.value = solicitud.equipo.marca;
    }
    if (solicitud.equipo.modelo && inputModelo) {
        inputModelo.value = solicitud.equipo.modelo;
    }
    if (solicitud.equipo.valor && inputValor) {
        inputValor.value = solicitud.equipo.valor;
    }
    if (solicitud.equipo.antiguedad && radiosAntiguedad) {
        radiosAntiguedad.forEach(r => {
            if (r.value === solicitud.equipo.antiguedad) r.checked = true;
        });
    }

    function obtenerAntiguedad() {
        let seleccion = '';
        radiosAntiguedad.forEach(r => {
            if (r.checked) seleccion = r.value;
        });
        return seleccion;
    }

    // Función principal de validación en tiempo real
    function validarFormulario(mostrarErrores = false) {
        const marca = inputMarca ? inputMarca.value : '';
        const modelo = inputModelo ? inputModelo.value : '';
        const valorRaw = inputValor ? inputValor.value : '';
        const antiguedad = obtenerAntiguedad();

        const errM = validarMarca(marca);
        const errMod = validarModelo(modelo);
        const errV = validarValor(valorRaw);
        const errA = validarAntiguedad(antiguedad);

        const esValido = (errM === null) && (errMod === null) && (errV === null) && (errA === null);

        // Control del botón: se habilita inmediatamente si todo es válido
        if (btnVerPlanes) {
            btnVerPlanes.disabled = !esValido;
            if (esValido) {
                btnVerPlanes.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                btnVerPlanes.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }

        // Mostrar u ocultar mensajes de error según corresponda
        if (inputMarca && errMarca) {
            if (mostrarErrores && errM) {
                inputMarca.classList.add('border-red-500', 'bg-red-50/30');
                errMarca.textContent = errM;
                errMarca.classList.remove('hidden');
            } else if (!errM) {
                inputMarca.classList.remove('border-red-500', 'bg-red-50/30');
                errMarca.classList.add('hidden');
            }
        }

        if (inputModelo && errModelo) {
            if (mostrarErrores && errMod) {
                inputModelo.classList.add('border-red-500', 'bg-red-50/30');
                errModelo.textContent = errMod;
                errModelo.classList.remove('hidden');
            } else if (!errMod) {
                inputModelo.classList.remove('border-red-500', 'bg-red-50/30');
                errModelo.classList.add('hidden');
            }
        }

        if (inputValor && errValor) {
            if (mostrarErrores && errV) {
                inputValor.classList.add('border-red-500', 'bg-red-50/30');
                errValor.textContent = errV;
                errValor.classList.remove('hidden');
            } else if (!errV) {
                inputValor.classList.remove('border-red-500', 'bg-red-50/30');
                errValor.classList.add('hidden');
            }
        }

        if (errAntiguedad) {
            if (mostrarErrores && errA) {
                errAntiguedad.textContent = errA;
                errAntiguedad.classList.remove('hidden');
            } else if (!errA) {
                errAntiguedad.classList.add('hidden');
            }
        }

        return esValido;
    }

    // Escuchar eventos 'input' y 'change' en cada campo para habilitar inmediatamente el botón
    if (inputMarca) {
        inputMarca.addEventListener('change', () => validarFormulario(true));
        inputMarca.addEventListener('blur', () => validarFormulario(true));
    }

    if (inputModelo) {
        inputModelo.addEventListener('input', () => validarFormulario(inputModelo.value.length >= 2));
        inputModelo.addEventListener('blur', () => validarFormulario(true));
    }

    if (inputValor) {
        inputValor.addEventListener('input', () => validarFormulario(inputValor.value.length > 0));
        inputValor.addEventListener('blur', () => validarFormulario(true));
    }

    radiosAntiguedad.forEach(radio => {
        radio.addEventListener('change', () => validarFormulario(true));
    });

    formCotizar.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validar mostrando todos los errores
        const esValido = validarFormulario(true);
        if (!esValido) return;

        // Guardar valores en el estado
        const numValor = Number(inputValor.value.replace(/\D/g, ''));
        solicitud.equipo.marca = inputMarca.value.trim();
        solicitud.equipo.modelo = inputModelo.value.trim();
        solicitud.equipo.valor = numValor;
        solicitud.equipo.antiguedad = obtenerAntiguedad();

        guardarEnStorage();
        irAPaso(2);
    });
    validarFormulario(false);
}
