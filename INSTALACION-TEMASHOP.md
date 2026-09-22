# 🛍️ TemaShop - Guía de Instalación y Uso

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- **Node.js** (v18 o superior) → [Descargar aquí](https://nodejs.org)
- **Git** (opcional) → [Descargar aquí](https://git-scm.com)
- Un editor de código (recomendado: [Visual Studio Code](https://code.visualstudio.com))

### ✅ Verificar que tienes Node.js instalado:

Abre Terminal/CMD y escribe:
```bash
node --version
npm --version
```

Si ves números de versión, ¡estás listo! Si no, descarga Node.js.

---

## 🚀 Instalación Rápida (3 pasos)

### **Paso 1: Navega a la carpeta del proyecto**

```bash
cd ruta/a/tu/carpeta/temashop-project
```

**En Windows:**
```bash
cd C:\Users\TuUsuario\Desktop\temashop-project
```

**En Mac/Linux:**
```bash
cd ~/Desktop/temashop-project
```

---

### **Paso 2: Instala las dependencias**

```bash
npm install
```

Esto descargará todos los paquetes necesarios (puede tardar 2-3 minutos la primera vez).

---

### **Paso 3: Ejecuta el proyecto**

```bash
npm run dev
```

**Resultado esperado:**
```
  VITE v8.3.0  ready in 234 ms

  ➜  Local:   http://localhost:3000
  ➜  press h to show help
```

Abre tu navegador en `http://localhost:3000` 

¡**Listo! Tu tienda está corriendo** 🎉

---

## 📱 Estructura del Proyecto

```
temashop-project/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Navbar.tsx       # Barra de navegación
│   │   ├── CartDrawer.tsx   # Carrito de compras
│   │   ├── CheckoutModal.tsx # Checkout
│   │   ├── AdminPanel.tsx   # Panel de administrador
│   │   ├── ProductCard.tsx  # Tarjeta de producto
│   │   └── ...
│   ├── data/
│   │   └── initialProducts.ts # Datos de productos
│   ├── utils/
│   │   └── storage.ts       # Funciones de almacenamiento
│   ├── types.ts             # Tipos TypeScript
│   ├── App.tsx              # Componente principal
│   └── main.tsx             # Punto de entrada
├── public/                  # Archivos estáticos
├── index.html               # HTML principal
├── vite.config.ts           # Configuración de Vite
├── tsconfig.json            # Configuración TypeScript
├── tailwind.config.ts       # Configuración Tailwind CSS
├── package.json             # Dependencias
└── .env.example             # Variables de entorno (ejemplo)
```

---

## 🎨 Componentes Principales

### **1. Navbar.tsx**
Barra de navegación superior con:
- Logo
- Búsqueda
- Carrito
- Opciones de usuario

### **2. ProductCard.tsx**
Tarjeta individual de producto con:
- Imagen
- Nombre
- Precio
- Rating
- Botón de agregar al carrito

### **3. CartDrawer.tsx**
Panel deslizante del carrito que muestra:
- Productos agregados
- Subtotal
- Opciones de checkout

### **4. CheckoutModal.tsx**
Modal de checkout con:
- Datos de envío
- Método de pago
- Resumen de orden

### **5. AdminPanel.tsx**
Panel de administrador con:
- Gestión de productos
- Estadísticas de ventas
- Análisis de tráfico
- Órdenes

### **6. AdminAnalytics.tsx**
Gráficos y análisis con:
- Gráficos de ventas
- Estadísticas de usuarios
- KPIs importantes

---

## 🛠️ Comandos Útiles

### **Desarrollo**
```bash
npm run dev
```
Inicia el servidor de desarrollo con hot reload (los cambios se ven al instante).

### **Build (Producción)**
```bash
npm run build
```
Crea una versión optimizada para producción en la carpeta `dist/`.

### **Preview**
```bash
npm run preview
```
Previsualiza cómo se verá la versión de producción.

### **Linting**
```bash
npm run lint
```
Verifica errores de TypeScript.

### **Limpiar**
```bash
npm run clean
```
Elimina carpetas de construcción anterior.

---

## 📝 Personalización Frecuente

### **1. Cambiar el nombre de la tienda**

En `src/App.tsx`, busca:
```typescript
const appName = "TemaShop";
```

Cámbialo por tu nombre de tienda.

### **2. Agregar/Modificar Productos**

En `src/data/initialProducts.ts`:
```typescript
export const initialProducts = [
  {
    id: 1,
    name: "Nombre del Producto",
    price: 99.99,
    category: "Categoría",
    image: "URL o emoji",
    rating: 4.5,
    reviews: 128,
    description: "Descripción",
  },
  // Agrega más productos aquí
];
```

### **3. Cambiar Colores (Tailwind CSS)**

En `tailwind.config.ts`:
```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#1a3a70',   // Azul principal
        secondary: '#2a5ab8', // Azul secundario
        accent: '#f39c12',    // Naranja
      },
    },
  },
};
```

Luego usa en HTML:
```html
<button class="bg-primary text-white">Botón</button>
```

### **4. Cambiar el Logo**

En `src/components/Navbar.tsx`, busca el logo emoji y cámbialo:
```typescript
<span className="text-2xl">🛍️</span> {/* Cambia el emoji */}
```

---

## 🌐 Desplegar a Internet

### **Opción 1: Vercel (Recomendado)**

1. Crea una cuenta en [vercel.com](https://vercel.com)
2. Conecta tu repositorio GitHub
3. Haz click en "Deploy"
4. ¡Tu sitio estará en línea!

### **Opción 2: Netlify**

1. Crea una cuenta en [netlify.com](https://netlify.com)
2. Arrastra la carpeta `dist/` después de ejecutar `npm run build`
3. ¡Listo!

### **Opción 3: Tu propio servidor**

Después de ejecutar `npm run build`:
```bash
# La carpeta dist/ contiene los archivos listos para producción
# Sube solo el contenido de dist/ a tu servidor
```

---

## 🔧 Solución de Problemas

### **Error: "node: command not found"**
Solución: Instala Node.js desde [nodejs.org](https://nodejs.org)

### **Error: "npm ERR! code ENOENT"**
Solución: Asegúrate de estar en la carpeta correcta del proyecto

### **Puerto 3000 ya está en uso**
Solución:
```bash
npm run dev -- --port 3001
```

### **Cambios no se ven en el navegador**
Solución:
1. Guarda el archivo (Ctrl+S)
2. Presiona F5 para refrescar el navegador
3. Limpia el caché del navegador (Ctrl+Shift+Del)

---

## 📚 Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **React** | 19.0.1 | Framework UI |
| **TypeScript** | 7.0.2 | Tipado de JavaScript |
| **Vite** | 8.3.0 | Bundler y dev server |
| **Tailwind CSS** | 4.3.3 | Estilos CSS |
| **Recharts** | 3.10.1 | Gráficos |
| **Motion** | 12.23.24 | Animaciones |
| **Lucide React** | 0.546.0 | Iconos |
| **Google GenAI** | 2.4.0 | AI Integration |

---

## 🚀 Próximos Pasos

1. **Instala y ejecuta** el proyecto
2. **Personaliza** con tus productos y colores
3. **Prueba** todas las funcionalidades
4. **Conecta** un backend si necesitas datos dinámicos
5. **Implementa** pagos (Stripe, PayPal)
6. **Despliega** a internet (Vercel, Netlify)

---

## 💡 Tips Profesionales

✅ **Usa TypeScript** - Evita bugs antes de que ocurran
✅ **Tailwind CSS** - Estilos consistentes y eficientes
✅ **Componentes reutilizables** - Copia y personaliza componentes existentes
✅ **localStorage** - Los datos se guardan en el navegador del usuario
✅ **Responsive** - El diseño ya funciona en móviles

---

## 📞 Soporte

- **Documentación de React:** https://react.dev
- **Documentación de Vite:** https://vitejs.dev
- **Documentación de Tailwind:** https://tailwindcss.com
- **Documentación de TypeScript:** https://www.typescriptlang.org

---

**¡Listo para empezar! 🚀**

Si tienes problemas, revisa la sección "Solución de Problemas" o busca en Google el error exacto.

Creado: 22 de Septiembre, 2026
