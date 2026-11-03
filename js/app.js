import { solicitud, cargarEstadoStorage, irAPaso, reiniciarEstado } from './estado.js';
import { render } from './render.js';

document.addEventListener('DOMContentLoaded', () => {
    cargarEstadoStorage();

    const btnVolver = document.getElementById('btn-volver');
    if (btnVolver) {
        btnVolver.addEventListener('click', (e) => {
            e.preventDefault();
            if (solicitud.paso > 0) {
                irAPaso(solicitud.paso - 1);
            }
        });
    }

    const btnCotizarCelular = document.getElementById('btn-cotizar-celular');
    if (btnCotizarCelular) {
        btnCotizarCelular.addEventListener('click', (e) => {
            e.preventDefault();
            irAPaso(1);
        });
    }

    const logoHome = document.getElementById('logo-home');
    if (logoHome) {
        logoHome.addEventListener('click', (e) => {
            e.preventDefault();
            irAPaso(0);
        });
    }

    const btnVolverInicio = document.getElementById('btn-volver-inicio');
    if (btnVolverInicio) {
        btnVolverInicio.addEventListener('click', (e) => {
            e.preventDefault();
            reiniciarEstado();
            irAPaso(0);
        });
    }

    const btnReintentarPago = document.getElementById('btn-reintentar-pago');
    if (btnReintentarPago) {
        btnReintentarPago.addEventListener('click', (e) => {
            e.preventDefault();
            irAPaso(4); 
        });
    }

    const btnCambiarMedio = document.getElementById('btn-cambiar-medio');
    if (btnCambiarMedio) {
        btnCambiarMedio.addEventListener('click', (e) => {
            e.preventDefault();
            irAPaso(4);
        });
    }

    const btnDescargarPoliza = document.getElementById('btn-descargar-poliza');
    if (btnDescargarPoliza) {
        btnDescargarPoliza.addEventListener('click', () => {
            alert(`Descargando comprobante de póliza ${solicitud.poliza || 'POL-2026-000000'}...`);
        });
    }

    render();
});
