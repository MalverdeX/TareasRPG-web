Guía de assets - AVATARES (TareasRPG)
====================================

Objetivo
--------
Definir el estilo visual y técnico de los retratos/avatar del jugador para mantener coherencia con la interfaz medieval-fantástica.

Estilo artístico recomendado
----------------------------
1) Ilustración 2D estilo fantasy-medieval semi-realista o cartoon estilizado.
2) Luz cálida (tono antorcha): resaltes dorados/ámbar.
3) Contraste medio-alto para destacar sobre fondos oscuros.
4) Personaje encuadrado de hombros hacia arriba (busto), mirada al frente o 3/4.

Paleta sugerida
---------------
- Sombras: #1A0E08, #2C1810
- Medios: #3E2418, #8B4513
- Acentos: #D2691E, #FFD700
- Piel/hueso/tejido: tonos cálidos y desaturados

Tamaño y formato
----------------
- Tamaño principal: 256x256 px (fuente maestra)
- Tamaño de uso actual en UI: 80x80 px (se redimensiona con CSS)
- Formato recomendado: PNG o WebP con fondo transparente
- Peso objetivo: < 150 KB por avatar

Fondo y composición
-------------------
- Fondo transparente (preferido) o fondo neutro oscuro suave.
- Evitar fondos detallados que compitan con la UI.
- Margen interno mínimo de 8% para no cortar casco/cabello al aplicar border-radius.

Nomenclatura de archivos
------------------------
- player-default.png (obligatorio como fallback local)
- player-mage-01.png
- player-warrior-01.png
- player-ranger-01.png

Accesibilidad y UX
------------------
- El rostro debe ser reconocible a 80x80 px.
- Evitar combinaciones de color de bajo contraste.
- Incluir variedad de tono de piel, género y rasgos para representación amplia.

Checklist de calidad
--------------------
[ ] Se ve bien en 80x80 y 160x160.
[ ] No tiene halo blanco en bordes transparentes.
[ ] Contraste suficiente con borde dorado del avatar.
[ ] Mantiene estilo medieval-fantasy del proyecto.
