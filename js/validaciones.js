// js/validaciones.js
// Funciones puras de validación (Sección 5.2 del PDF).
// Devuelven null si el valor es válido, o el mensaje de error correspondiente.

export function validarMarca(marca) {
    if (!marca || !marca.trim()) {
        return "Elegí una marca";
    }
    return null;
}

export function validarModelo(modelo) {
    if (!modelo || typeof modelo !== 'string') {
        return "Ingresá el modelo del equipo";
    }
    const limpio = modelo.trim();
    if (limpio.length < 2 || limpio.length > 40) {
        return "Ingresá el modelo del equipo";
    }
    return null;
}

export function validarValor(valor) {
    if (valor === undefined || valor === null || valor === '') {
        return "El valor debe estar entre $100.000 y $2.500.000";
    }
    const num = typeof valor === 'string'
        ? Number(valor.replace(/\D/g, ''))
        : Number(valor);

    if (isNaN(num) || num < 100000 || num > 2500000) {
        return "El valor debe estar entre $100.000 y $2.500.000";
    }
    return null;
}

export function validarAntiguedad(antiguedad) {
    const validas = ['menos-1', '1-2', 'mas-2', 'menos de 1 año', '1 a 2 años', 'más de 2 años'];
    if (!antiguedad || !validas.includes(antiguedad)) {
        return "Indicá la antigüedad";
    }
    return null;
}

export function validarNombre(nombre) {
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
        return "Ingresá tu nombre / apellido";
    }
    return null;
}

export function validarApellido(apellido) {
    if (!apellido || typeof apellido !== 'string' || apellido.trim().length < 2) {
        return "Ingresá tu nombre / apellido";
    }
    return null;
}

export function validarDni(dni) {
    if (!dni) return "El DNI debe tener 7 u 8 números";
    const limpio = dni.toString().trim();
    if (!/^\d{7,8}$/.test(limpio)) {
        return "El DNI debe tener 7 u 8 números";
    }
    return null;
}

export function validarEdad(fechaNacimientoStr) {
    if (!fechaNacimientoStr || typeof fechaNacimientoStr !== 'string') {
        return "Tenés que ser mayor de edad";
    }

    let anio, mes, dia;
    const str = fechaNacimientoStr.trim();

    if (str.includes('/')) {
        const partes = str.split('/');
        if (partes.length !== 3) return "Tenés que ser mayor de edad";
        dia = parseInt(partes[0], 10);
        mes = parseInt(partes[1], 10);
        anio = parseInt(partes[2], 10);
    } else if (str.includes('-')) {
        const partes = str.split('-');
        if (partes.length !== 3) return "Tenés que ser mayor de edad";
        anio = parseInt(partes[0], 10);
        mes = parseInt(partes[1], 10);
        dia = parseInt(partes[2], 10);
    } else {
        return "Tenés que ser mayor de edad";
    }

    if (isNaN(dia) || isNaN(mes) || isNaN(anio)) return "Tenés que ser mayor de edad";
    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return "Tenés que ser mayor de edad";

    const hoy = new Date();
    let edad = hoy.getFullYear() - anio;
    const mesDif = (hoy.getMonth() + 1) - mes;
    if (mesDif < 0 || (mesDif === 0 && hoy.getDate() < dia)) {
        edad--;
    }

    if (edad < 18 || edad > 120) {
        return "Tenés que ser mayor de edad";
    }
    return null;
}

export function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !regex.test(email.trim())) {
        return "Ingresá un email válido";
    }
    return null;
}

export function validarCelular(celular) {
    if (!celular) return "Ej.: 11 5555-1234";
    const limpio = celular.toString().replace(/[\s-]/g, '');
    // 10 dígitos sin 0 ni 15
    if (!/^\d{10}$/.test(limpio) || limpio.startsWith('0') || limpio.startsWith('15')) {
        return "Ej.: 11 5555-1234";
    }
    return null;
}

export function validarTerminos(terminos) {
    if (!terminos) {
        return "Tenés que aceptar los términos";
    }
    return null;
}

export function validarTarjeta(tarjeta) {
    if (!tarjeta) return "Número de tarjeta inválido";
    const limpio = tarjeta.toString().replace(/\s/g, '');
    if (!/^\d{16}$/.test(limpio)) {
        return "Número de tarjeta inválido";
    }
    return null;
}

export function validarTitular(titular) {
    if (!titular || typeof titular !== 'string' || titular.trim().length < 2) {
        return "Ingresá el nombre del titular";
    }
    return null;
}

export function validarVencimiento(vencimiento) {
    if (!vencimiento || typeof vencimiento !== 'string') {
        return "Vencimiento inválido";
    }
    const match = vencimiento.trim().match(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/);
    if (!match) {
        return "Vencimiento inválido";
    }
    const mes = parseInt(match[1], 10);
    let anio = parseInt(match[2], 10);
    if (anio < 100) anio += 2000;

    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1;

    if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
        return "Vencimiento inválido";
    }
    return null;
}

export function validarCvv(cvv) {
    if (!cvv) return "CVV inválido";
    const limpio = cvv.toString().trim();
    if (!/^\d{3}$/.test(limpio)) {
        return "CVV inválido";
    }
    return null;
}
