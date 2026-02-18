Guía de assets - VFX / ANIMACIONES 2D
=====================================

Objetivo
--------
Estandarizar efectos visuales para recompensas, ruleta, rarezas y feedback de acciones.

Tipos de efectos esperados
--------------------------
1) Partículas básicas (chispas, polvo mágico)
2) Flashes/halos (impacto de premio)
3) Trazos/estelas (movimiento en ruleta)
4) Confetti místico (epic)

Intensidad por rareza
---------------------
- common: 10-20 partículas, duración breve (0.8-1.2s)
- rare: 24-40 partículas, halo suave (1.2-1.8s)
- epic: 48-80 partículas, halo + burst + glow (1.8-2.6s)

Estilo visual
-------------
- Colores cálidos y mágicos: dorado, naranja, violeta suave, turquesa tenue.
- Evitar colores neón puros fuera de epic.
- Texturas de partícula simples, sin ruido excesivo.

Formato técnico
---------------
- Sprites sueltos PNG/WebP con transparencia
- (Opcional) Sprite sheet para bursts repetibles
- Dimensiones comunes: 32x32, 64x64, 128x128
- Peso objetivo: < 30 KB por partícula base, < 200 KB por sheet

Performance y accesibilidad
---------------------------
- Diseñar assets para poder desactivar animaciones (prefers-reduced-motion).
- Mantener versión "lite" de cada efecto para dispositivos modestos.
- Evitar efectos con overdraw extremo en toda pantalla.

Nomenclatura
------------
- vfx-spark-common-01.png
- vfx-halo-rare-01.png
- vfx-burst-epic-01.png
- vfx-confetti-epic-01.png

Checklist
---------
[ ] Se ve bien sobre fondos oscuros.
[ ] Se distingue por rareza.
[ ] No tapa texto crítico de la interfaz.
[ ] Escala bien en 1x/2x DPR.
