// js/estado.js
// Único estado centralizado del flujo de contratación (Sección 6.2 del PDF)
import { render } from './render.js';

const STORAGE_KEY = 'cubri_solicitud';

export const solicitud = {
    paso: 0, // 0 = inicio/catálogo, 1 = cotizar, 2 = plan, 3 = datos, 4 = pago, 5 = éxito, 6 = error
    equipo: {
        marca: '',
        modelo: '',
        valor: 0,
        antiguedad: ''
    },
    plan: 'plus',
    nombrePlan: 'Plus',
    precioPlan: 0,
    coberturasPlan: ['Robo con violencia', 'Rotura de pantalla'],
    titular: {
        nombre: '',
        apellido: '',
        dni: '',
        nacimiento: '',
        email: '',
        celular: '',
        terminos: false
    },
    pago: {
        metodo: 'credito',
        tarjeta: '',
        titular: '',
        vencimiento: '',
        cvv: ''
    },
    poliza: null
};

// Cargar estado persistido desde localStorage
export function cargarEstadoStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
        const guardado = localStorage.getItem(STORAGE_KEY);
        if (guardado) {
            const data = JSON.parse(guardado);
            if (data.equipo) Object.assign(solicitud.equipo, data.equipo);
            if (data.titular) Object.assign(solicitud.titular, data.titular);
            if (data.pago) Object.assign(solicitud.pago, data.pago);
            if (data.plan) solicitud.plan = data.plan;
            if (data.nombrePlan) solicitud.nombrePlan = data.nombrePlan;
            if (data.precioPlan) solicitud.precioPlan = data.precioPlan;
            if (data.coberturasPlan) solicitud.coberturasPlan = data.coberturasPlan;
            if (data.poliza) solicitud.poliza = data.poliza;
            if (typeof data.paso === 'number') solicitud.paso = data.paso;
        }
    } catch (e) {
        console.error('Error al cargar estado:', e);
    }
}

// Guardar en localStorage
export function guardarEnStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitud));
    } catch (e) {
        console.error('Error al guardar estado:', e);
    }
}

// Navegación entre pasos: cambia el estado y llama siempre a render()
export function irAPaso(n) {
    solicitud.paso = n;
    guardarEnStorage();
    render();
    if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Reiniciar estado para volver al inicio
export function reiniciarEstado() {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
    solicitud.paso = 0;
    solicitud.equipo = { marca: '', modelo: '', valor: 0, antiguedad: '' };
    solicitud.plan = 'plus';
    solicitud.nombrePlan = 'Plus';
    solicitud.precioPlan = 0;
    solicitud.coberturasPlan = ['Robo con violencia', 'Rotura de pantalla'];
    solicitud.titular = { nombre: '', apellido: '', dni: '', nacimiento: '', email: '', celular: '', terminos: false };
    solicitud.pago = { metodo: 'credito', tarjeta: '', titular: '', vencimiento: '', cvv: '' };
    solicitud.poliza = null;
    guardarEnStorage();
    render();
}

// Funciones de compatibilidad
export function obtenerEstado() {
    return solicitud;
}

export function guardarEstado(parcial) {
    if (parcial.equipo) Object.assign(solicitud.equipo, parcial.equipo);
    if (parcial.titular) Object.assign(solicitud.titular, parcial.titular);
    if (parcial.pago) Object.assign(solicitud.pago, parcial.pago);
    if (parcial.plan) solicitud.plan = parcial.plan;
    guardarEnStorage();
    return solicitud;
}
