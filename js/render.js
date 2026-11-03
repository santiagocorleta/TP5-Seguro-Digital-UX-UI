// js/render.js
// Renderizado dinámico de secciones, stepper, planes y resúmenes según Sección 6.3 del PDF
import { solicitud, guardarEnStorage, irAPaso, reiniciarEstado } from './estado.js';
import { calcularCuota, iniciarCotizador } from './cotizador.js';
import { iniciarDatos } from './datos.js';
import { iniciarPago } from './pago.js';

const PLANES_FALLBACK = [
    { id: "basico", nombre: "Básico", tasaAnual: 0.04, coberturas: ["Robo con violencia"] },
    { id: "plus", nombre: "Plus", tasaAnual: 0.06, recomendado: true, coberturas: ["Robo con violencia", "Rotura de pantalla"] },
    { id: "premium", nombre: "Premium", tasaAnual: 0.09, coberturas: ["Robo con violencia", "Rotura total", "Hurto / pérdida"] }
];

export function render() {
    if (typeof document === 'undefined') return;

    // Mostrar u ocultar cada sección según el paso actual
    const secciones = document.querySelectorAll('[data-paso]');
    secciones.forEach((s) => {
        s.hidden = Number(s.dataset.paso) !== solicitud.paso;
    });

    renderStepper();
    renderResumen();

    // Inicializar la lógica específica del paso activo
    if (solicitud.paso === 1) {
        iniciarCotizador();
    } else if (solicitud.paso === 2) {
        renderPlanes();
    } else if (solicitud.paso === 3) {
        iniciarDatos();
    } else if (solicitud.paso === 4) {
        iniciarPago();
    } else if (solicitud.paso === 5) {
        renderExito();
    } else if (solicitud.paso === 6) {
        renderError();
    }
}

// Stepper visual optimizado para 390px (mobile) y desktop
export function renderStepper() {
    const contenedorStepper = document.getElementById('contenedor-stepper');
    const btnVolver = document.getElementById('btn-volver');

    const enFlujoCheckout = solicitud.paso >= 1 && solicitud.paso <= 4;

    if (contenedorStepper) {
        contenedorStepper.hidden = !enFlujoCheckout;
    }

    if (btnVolver) {
        btnVolver.hidden = !enFlujoCheckout;
    }

    if (!enFlujoCheckout) return;

    const pasoActual = solicitud.paso;

    const items = [
        { id: 'step-1', n: 1, label: 'Cotizar' },
        { id: 'step-2', n: 2, label: 'Plan' },
        { id: 'step-3', n: 3, label: 'Datos' },
        { id: 'step-4', n: 4, label: 'Pago' }
    ];

    items.forEach(item => {
        const el = document.getElementById(item.id);
        if (!el) return;

        const badge = el.querySelector('.step-badge');
        const text = el.querySelector('.step-text');

        if (pasoActual > item.n) {
            // Paso anterior completado
            el.className = 'flex items-center gap-1 sm:gap-1.5 text-[var(--success)] font-bold shrink-0';
            if (badge) {
                badge.className = 'step-badge w-6 h-6 rounded-full bg-[var(--success)] text-white flex items-center justify-center text-xs font-bold';
                badge.textContent = '✓';
            }
            if (text) {
                text.className = 'step-text hidden sm:inline';
            }
        } else if (pasoActual === item.n) {
            // Paso actual activo: en mobile mostramos el nombre del paso activo
            el.className = 'flex items-center gap-1 sm:gap-1.5 text-[var(--primary)] font-bold shrink-0';
            if (badge) {
                badge.className = 'step-badge w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold';
                badge.textContent = String(item.n);
            }
            if (text) {
                text.className = 'step-text inline';
            }
        } else {
            // Paso pendiente
            el.className = 'flex items-center gap-1 sm:gap-1.5 text-[var(--muted)] opacity-70 shrink-0';
            if (badge) {
                badge.className = 'step-badge w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold';
                badge.textContent = String(item.n);
            }
            if (text) {
                text.className = 'step-text hidden sm:inline';
            }
        }
    });

    const lineas = [
        { id: 'line-1-2', despuesDe: 1 },
        { id: 'line-2-3', despuesDe: 2 },
        { id: 'line-3-4', despuesDe: 3 }
    ];

    lineas.forEach(l => {
        const linea = document.getElementById(l.id);
        if (!linea) return;
        if (pasoActual > l.despuesDe) {
            linea.className = 'flex-1 h-[2px] bg-[var(--success)] mx-1 sm:mx-2 min-w-[8px] max-w-[48px]';
        } else if (pasoActual === l.despuesDe) {
            linea.className = 'flex-1 h-[2px] bg-[var(--primary)] mx-1 sm:mx-2 min-w-[8px] max-w-[48px]';
        } else {
            linea.className = 'flex-1 h-[2px] bg-gray-200 mx-1 sm:mx-2 min-w-[8px] max-w-[48px]';
        }
    });
}

// Carga y renderizado de planes en Paso 2
async function renderPlanes() {
    const contenedor = document.getElementById('contenedor-planes');
    const resumenModelo = document.getElementById('resumen-modelo');
    const resumenPrecio = document.getElementById('resumen-precio');
    const btnContinuarPlan = document.getElementById('btn-continuar-plan');

    if (!contenedor) return;

    // Si no hay valor cotizado, regresar al paso 1
    if (!solicitud.equipo.valor || solicitud.equipo.valor <= 0) {
        irAPaso(1);
        return;
    }

    if (resumenModelo) {
        const equipoStr = `${solicitud.equipo.marca || ''} ${solicitud.equipo.modelo || 'Tu equipo'}`.trim();
        resumenModelo.textContent = equipoStr || 'Tu equipo';
    }

    let planes = PLANES_FALLBACK;
    try {
        const resp = await fetch('data/planes.json');
        if (resp.ok) {
            planes = await resp.json();
        }
    } catch (e) {
        planes = PLANES_FALLBACK;
    }

    contenedor.innerHTML = '';

    // Plus viene preseleccionado según la Sección 4 del PDF
    let planIdActivo = solicitud.plan || 'plus';
    let planObj = planes.find(p => p.id === planIdActivo) || planes[1] || planes[0];
    solicitud.plan = planObj.id;
    solicitud.nombrePlan = planObj.nombre;
    solicitud.coberturasPlan = planObj.coberturas;
    solicitud.precioPlan = calcularCuota(solicitud.equipo.valor, planObj.tasaAnual, solicitud.equipo.antiguedad);
    guardarEnStorage();

    if (resumenPrecio) {
        resumenPrecio.textContent = `$ ${solicitud.precioPlan.toLocaleString('es-AR')} /mes`;
    }

    if (btnContinuarPlan) {
        btnContinuarPlan.disabled = false;
        btnContinuarPlan.classList.remove('opacity-50', 'cursor-not-allowed');
        btnContinuarPlan.onclick = () => irAPaso(3);
    }

    planes.forEach(plan => {
        const cuota = calcularCuota(solicitud.equipo.valor, plan.tasaAnual, solicitud.equipo.antiguedad);
        const seleccionado = (plan.id === solicitud.plan);

        // Tarjeta del plan: toda la información en un solo recuadro fijo que no cambia de tamaño al seleccionarse
        const card = document.createElement('div');
        card.className = `card-plan border-2 rounded-3xl p-4 sm:p-5 cursor-pointer relative block transition-all ${
            seleccionado
                ? 'border-[var(--primary)] bg-[var(--primary-50)] shadow-xs'
                : 'border-[var(--border)] bg-white hover:border-indigo-300'
        }`;

        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                    <h3 class="font-bold text-base sm:text-lg text-[var(--text)]">${plan.nombre}</h3>
                    ${plan.recomendado ? '<span class="bg-[var(--primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Recomendado</span>' : ''}
                </div>
                <input type="radio" name="plan" value="${plan.id}" ${seleccionado ? 'checked' : ''} class="w-5 h-5 accent-[var(--primary)] cursor-pointer">
            </div>
            
            <div class="mb-3 flex items-baseline gap-1">
                <span class="text-xl sm:text-2xl font-black text-[var(--text)]">$ ${cuota.toLocaleString('es-AR')}</span>
                <span class="text-xs text-[var(--muted)] font-medium">/ mes</span>
            </div>

            <ul class="flex flex-col gap-1.5 text-xs font-medium">
                ${plan.coberturas.map(c => `<li class="flex items-center gap-2 text-[var(--text)]"><span class="text-[var(--success)] font-bold">✓</span> ${c}</li>`).join('')}
            </ul>
        `;

        card.addEventListener('click', () => {
            solicitud.plan = plan.id;
            solicitud.nombrePlan = plan.nombre;
            solicitud.coberturasPlan = plan.coberturas;
            solicitud.precioPlan = cuota;
            guardarEnStorage();

            if (resumenPrecio) {
                resumenPrecio.textContent = `$ ${cuota.toLocaleString('es-AR')} /mes`;
            }

            // Desmarcar las demás tarjetas sin alterar su contenido interno ni tamaño
            contenedor.querySelectorAll('.card-plan').forEach(c => {
                c.className = 'card-plan border-2 border-[var(--border)] bg-white hover:border-indigo-300 rounded-3xl p-4 sm:p-5 cursor-pointer relative block transition-all';
                const r = c.querySelector('input[type="radio"]');
                if (r) r.checked = false;
            });

            // Marcar la tarjeta seleccionada
            card.className = 'card-plan border-2 border-[var(--primary)] bg-[var(--primary-50)] shadow-xs rounded-3xl p-4 sm:p-5 cursor-pointer relative block transition-all';
            const radio = card.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });

        contenedor.appendChild(card);
    });
}

// Resumen del Paso 4 (Pago)
export function renderResumen() {
    const resumenPlan = document.getElementById('resumen-plan-nombre');
    const resumenEquipo = document.getElementById('resumen-equipo');
    const resumenTitular = document.getElementById('resumen-titular');
    const resumenPagoMonto = document.getElementById('resumen-pago-monto');

    const equipoStr = `${solicitud.equipo.marca || ''} ${solicitud.equipo.modelo || ''}`.trim();
    const titularStr = `${solicitud.titular.nombre || ''} ${solicitud.titular.apellido || ''}`.trim();

    if (resumenPlan) {
        resumenPlan.textContent = `Seguro Celular · ${solicitud.nombrePlan || 'Plus'}`;
    }
    if (resumenEquipo && equipoStr) {
        resumenEquipo.textContent = equipoStr;
    }
    if (resumenTitular && titularStr) {
        resumenTitular.textContent = titularStr;
    }
    if (resumenPagoMonto && solicitud.precioPlan) {
        resumenPagoMonto.textContent = `$ ${Number(solicitud.precioPlan).toLocaleString('es-AR')} /mes`;
    }
}

// Pantalla de Confirmación / Éxito (Paso 5)
function renderExito() {
    const spanNombre = document.getElementById('exito-nombre-usuario');
    const spanEmail = document.getElementById('exito-email-usuario');
    const spanPoliza = document.getElementById('exito-nro-poliza');
    const spanPlan = document.getElementById('exito-plan-nombre');
    const spanEquipo = document.getElementById('exito-equipo-nombre');
    const spanFecha = document.getElementById('exito-fecha-vigencia');
    const spanPrecio = document.getElementById('exito-plan-precio');

    if (spanNombre) spanNombre.textContent = solicitud.titular.nombre || 'Usuario';
    if (spanEmail) spanEmail.textContent = solicitud.titular.email || 'correo@ejemplo.com';
    if (spanPoliza) spanPoliza.textContent = solicitud.poliza || 'POL-2026-000000';
    if (spanPlan) spanPlan.textContent = solicitud.nombrePlan || 'Plus';

    const equipoStr = `${solicitud.equipo.marca || ''} ${solicitud.equipo.modelo || 'Celular'}`.trim();
    if (spanEquipo) spanEquipo.textContent = equipoStr;

    if (spanFecha) spanFecha.textContent = new Date().toLocaleDateString('es-AR');
    if (spanPrecio) spanPrecio.textContent = `$ ${Number(solicitud.precioPlan || 0).toLocaleString('es-AR')}`;
}

// Pantalla de Error (Paso 6)
function renderError() {
    // Listo para reintentar conservando datos
}
