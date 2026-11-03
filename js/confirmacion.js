import { obtenerEstado, reiniciarEstado, guardarEstado } from './estado.js';
import { generarPoliza } from './pago.js';

document.addEventListener('DOMContentLoaded', () => {
    const estado = obtenerEstado();
    const spanNombre = document.getElementById('nombre-usuario');
    const spanEmail = document.getElementById('email-usuario');
    const spanPoliza = document.getElementById('nro-poliza');
    const spanPlan = document.getElementById('plan-nombre');
    const spanEquipo = document.getElementById('equipo-nombre');
    const spanFecha = document.getElementById('fecha-vigencia');
    const spanPrecio = document.getElementById('plan-precio');
    const btnVolverInicio = document.getElementById('btn-volver-inicio');
    const btnDescargarPoliza = document.getElementById('btn-descargar-poliza');

    if (spanNombre) {
        spanNombre.textContent = estado.datosPersonales?.nombre || 'Usuario';
    }

    if (spanEmail) {
        spanEmail.textContent = estado.datosPersonales?.email || 'correo@ejemplo.com';
    }

    let polizaFinal = estado.poliza;
    if (!polizaFinal) {
        polizaFinal = generarPoliza();
        guardarEstado({ poliza: polizaFinal });
    }
    if (spanPoliza) {
        spanPoliza.textContent = polizaFinal;
    }

    if (spanPlan) {
        spanPlan.textContent = estado.nombrePlan || 'Plus';
    }

    if (spanEquipo) {
        const equipoStr = `${estado.marca || ''} ${estado.modelo || 'Celular'}`.trim();
        spanEquipo.textContent = equipoStr || 'Celular';
    }

    if (spanFecha) {
        const hoy = new Date().toLocaleDateString('es-AR');
        spanFecha.textContent = hoy;
    }

    if (spanPrecio) {
        spanPrecio.textContent = `$ ${Number(estado.precioPlan || 0).toLocaleString('es-AR')}`;
    }

    if (btnVolverInicio) {
        btnVolverInicio.addEventListener('click', (e) => {
            e.preventDefault();
            reiniciarEstado();
            window.location.href = '../html/01_inicio_catalago.html';
        });
    }

    if (btnDescargarPoliza) {
        btnDescargarPoliza.addEventListener('click', () => {
            alert(`Descargando comprobante de póliza ${polizaFinal}...`);
        });
    }
});
