# 🛡️ MÓDULO DE AGILIDAD OPERATIVA (MAO) — LARAIGO
## Hoja de Ruta y Plan Técnico de Trabajo (Semanas 1 a 4)

Mapeo cronológico de auditorías, blindaje de seguridad, modularización por carpetas (`/src/`) y estabilización operativa desde **v2.0.3 hacia v2.1.0**.

---

## 📌 Ficha Ejecutiva del Proyecto
- **Período de Ejecución:** Lunes 09 de Noviembre al Viernes 04 de Diciembre de 2026 (4 Semanas).
- **Área Responsable:** Área de Activaciones (Modo Completo) / Soporte Técnico.
- **Áreas de Alcance:** Área de Activaciones (Piloto/BETA) y Otras Áreas (Despliegue al 80%).
- **Objetivo General:** Garantizar máxima seguridad del API, optimizar la arquitectura del código mediante modularización por carpetas y asegurar cero interrupciones en la atención.
- **Complejidad:** 🔴 Muy Alta (Crítico / Multicapa).
- **Gobernanza:** Ventanas de mantenimiento bi-semanales con permisos de Administrador en Windows (HKLM).

---

## 📅 Estructura de Actividades por Semana

### ■ SEMANA 1: Blindaje de Seguridad Integral de la API y Modularización en Bloques
- **Fechas:** 09 Nov – 13 Nov 2026 | **Release:** `v2.0.4 Hardened`
- **Estado:** ✅ COMPLETADO (100%) - Listo para Pase a Producción
- **Actividades Clave:**
  1. *Auditoría de Credenciales y Memoria RAM:* Eliminación de `localStorage.setItem('__lc_bearer_token')`. Token en variable privada volátil en RAM.
  2. *Handshake Criptográfico (_nonce):* Firma efímera entre `content.js` y `page-bridge.js`. Comandos F12 rechazados.
  3. *Ofuscación de Endpoints y SQL:* Enmascaramiento en memoria (`_k`) de rutas `/api/...` y procedimientos SQL. Restricción estricta a `*.laraigo.com`.
  4. *Idempotencia y Concurrencia:* `inFlightReplies` + timeout con `AbortController` (9.5s) para 0 POSTs duplicados.
  5. *Supresión Doble Envío DOM:* Verificación de historial de chat antes de teclear.
  6. *Modularización inicial:* `page-bridge.js` (9 bloques) y `content.js` (12 bloques).

### ■ SEMANA 2: Auditoría Línea por Línea y Desacoplamiento en Carpetas (/src/)
- **Fechas:** 16 Nov – 20 Nov 2026 | **Release:** `v2.0.5 Modular Architecture`
- **Estado:** 🟡 EN EJECUCIÓN (30%)
- **Actividades Clave:**
  1. *Desacoplamiento /src/:* `/src/security/`, `/src/network/`, `/src/redux/`, `/src/vision/`, `/src/rules/` y `/src/ui/`.
  2. *Auditoría Garbage Collector:* Prevención de fugas de memoria en turnos continuos de 8 horas.
  3. *Optimización Event Listeners:* Limpieza de `MutationObserver` y `addEventListener`.
  4. *Benchmarking de Recursos:* Consumo de RAM < 35 MB por pestaña en Core i3/i5 con 8GB RAM.

### ■ SEMANA 3: Pruebas de Estrés en Ambiente Real y Calibración Operativa por Áreas
- **Fechas:** 23 Nov – 27 Nov 2026 | **Release:** `v2.0.6 Release Candidate`
- **Estado:** ⚪ PLANIFICADO (0%)
- **Actividades Clave:**
  1. *Pruebas de Ráfagas:* 5 a 10 tickets simultáneos en Asignados sin bloqueos de interfaz.
  2. *Calibración Activaciones:* Precisión > 98% en los 6 submotivos técnicos.
  3. *Auditoría Otras Áreas:* Modo Solo Saludo en el 80% del parque desplegado (SLA en 0s).
  4. *Resiliencia ante Micro-Cortes:* Auto-recuperación del Bearer Token sin recargar página (F5).

### ■ SEMANA 4: Consolidación a v2.1.0, Empaquetado Administrativo y Entrega Ejecutiva
- **Fechas:** 30 Nov – 04 Dic 2026 | **Release:** `v2.1.0 Versión Final Estable`
- **Estado:** ⚪ PLANIFICADO (0%)
- **Actividades Clave:**
  1. *Feature Freeze & Calidad:* Congelamiento de código y pruebas de regresión completas.
  2. *Paquete USB Consolidado:* Instalador automatizado batch/VBS para despliegue Windows en registro HKLM.
  3. *Manual de Operación:* Ficha de 1 página para supervisores sobre el selector de modos.
  4. *Informe de Impacto:* Reporte gerencial de SLA, cumplimiento y blindaje de seguridad.

---

## 💻 Visualización y Acceso
- **Archivo local:** [`index.html`](file:///C:/Users/alexa/.gemini/antigravity/scratch/project-roadmap-tracker/index.html)
- **Repositorio GitHub:** [AnGeLJoHnLl/procesos_proyeco](https://github.com/AnGeLJoHnLl/procesos_proyeco)
- **Web Pública en GitHub Pages:** `https://angeljohnll.github.io/procesos_proyeco/`
