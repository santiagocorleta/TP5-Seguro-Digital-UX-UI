// js/planes.js
import { obtenerEstado, guardarEstado } from './estado.js';
import { calcularCuota } from './cotizador.js';

document.addEventListener('DOMContentLoaded', async () => {
    const contenedorPlanes = document.getElementById('contenedor-planes');
    const resumenModelo = document.getElementById('resumen-modelo');
    const resumenPrecio = document.getElementById('resumen-precio');
    const btnContinuar = document.getElementById('btn-continuar');
    
    const estado = obtenerEstado();

    // Si no hay valor cotizado, volver al paso 1
    if (!estado.valor || Number(estado.valor) <= 0) {
        window.location.href = '02_cotizar.html';
        return;
    }

    // Actualizar nombre del equipo de inmediato desde el estado
    if (resumenModelo) {
        const equipoTexto = `${estado.marca || ''} ${estado.modelo || 'Tu equipo'}`.trim();
        resumenModelo.textContent = equipoTexto || 'Tu equipo';
    }

    try {
        const respuesta = await fetch('../data/planes.json');
        if (!respuesta.ok) throw new Error('No se pudo cargar el archivo planes.json');
        
        const planes = await respuesta.json();
        renderizarPlanes(planes, estado, resumenPrecio, btnContinuar);

    } catch (error) {
        console.error("Error al cargar los planes:", error);
        if (contenedorPlanes) {
            contenedorPlanes.innerHTML = `<p class="text-red-500 text-center col-span-full">Error al cargar los planes disponibles.</p>`;
        }
    }
});

function renderizarPlanes(planes, estado, resumenPrecio, btnContinuar) {
    const contenedor = document.getElementById('contenedor-planes');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    // Según Sección 4 del PDF: "Plus viene preseleccionado con badge 'Recomendado'"
    let planIdSeleccionado = estado.planSeleccionado || 'plus';
    
    // Asegurar que exista en la lista cargada
    let planSeleccionadoObj = planes.find(p => p.id === planIdSeleccionado) || planes.find(p => p.id === 'plus') || planes[0];
    planIdSeleccionado = planSeleccionadoObj.id;

    // Calcular cuota del plan seleccionado y sincronizar estado
    const cuotaSeleccionada = calcularCuota(estado.valor, planSeleccionadoObj.tasaAnual, estado.antiguedad);
    guardarEstado({
        planSeleccionado: planIdSeleccionado,
        precioPlan: cuotaSeleccionada,
        coberturasPlan: planSeleccionadoObj.coberturas,
        nombrePlan: planSeleccionadoObj.nombre
    });

    if (resumenPrecio) {
        resumenPrecio.textContent = `$ ${cuotaSeleccionada.toLocaleString('es-AR')} /mes`;
    }

    if (btnContinuar) {
        btnContinuar.disabled = false;
        btnContinuar.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    planes.forEach(plan => {
        // Cálculo con la fórmula oficial
        const cuotaMensual = calcularCuota(estado.valor, plan.tasaAnual, estado.antiguedad);
        const esSeleccionado = plan.id === planIdSeleccionado;

        const tarjeta = document.createElement('div');
        tarjeta.className = `bg-white p-5 rounded-3xl border transition-all cursor-pointer relative block ${
            esSeleccionado
                ? 'border-2 border-[var(--primary)] bg-[var(--primary-50)] shadow-xs'
                : 'border-[var(--border)] hover:border-[var(--primary)]'
        }`;
        tarjeta.dataset.planId = plan.id;

        tarjeta.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                    <h3 class="font-bold text-lg text-[var(--text)]">${plan.nombre}</h3>
                    ${plan.recomendado ? '<span class="bg-[var(--primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Recomendado</span>' : ''}
                </div>
                <input type="radio" name="plan" value="${plan.id}" ${esSeleccionado ? 'checked' : ''} class="w-5 h-5 accent-[var(--primary)] cursor-pointer">
            </div>
            
            <div class="mb-4 flex items-baseline gap-1">
                <span class="text-2xl font-black text-[var(--text)]">$ ${cuotaMensual.toLocaleString('es-AR')}</span>
                <span class="text-xs text-[var(--muted)] font-medium">/ mes</span>
            </div>

            <ul class="flex flex-col gap-2 text-xs font-medium">
                ${plan.coberturas.map(c => `<li class="flex items-center gap-2 text-[var(--text)]"><span class="text-[var(--success)] font-bold">✓</span> ${c}</li>`).join('')}
            </ul>
        `;

        tarjeta.addEventListener('click', () => {
            // Desmarcar todos los radios
            document.querySelectorAll('input[name="plan"]').forEach(r => {
                r.checked = (r.value === plan.id);
            });

            // Actualizar estado con el nuevo plan
            guardarEstado({
                planSeleccionado: plan.id,
                precioPlan: cuotaMensual,
                coberturasPlan: plan.coberturas,
                nombrePlan: plan.nombre
            });

            if (resumenPrecio) {
                resumenPrecio.textContent = `$ ${cuotaMensual.toLocaleString('es-AR')} /mes`;
            }

            // Actualizar estilos de las cards
            document.querySelectorAll('#contenedor-planes > div').forEach(t => {
                t.className = "bg-white p-5 rounded-3xl border border-[var(--border)] hover:border-[var(--primary)] transition-all cursor-pointer relative block";
            });
            tarjeta.className = "bg-white p-5 rounded-3xl border-2 border-[var(--primary)] bg-[var(--primary-50)] shadow-xs transition-all cursor-pointer relative block";
        });

        contenedor.appendChild(tarjeta);
    });

    if (btnContinuar) {
        btnContinuar.onclick = () => {
            if (!btnContinuar.disabled) {
                window.location.href = '04_datos_personales.html';
            }
        };
    }
}
