# Sistema de Gestión Odontológica - Frontend

Frontend completo en React para el Sistema de Gestión Odontológica ENDONOVA.

## 📋 Características Principales

### ✅ Módulos Implementados

1. **Sistema de Autenticación**
   - Login con JWT
   - Registro de usuarios
   - Protección de rutas
   - Manejo de sesiones

2. **Dashboard Administrativo**
   - Estadísticas generales
   - Resumen de pacientes y fichas
   - Visualización de datos clave

3. **Gestión de Pacientes**
   - ✅ Lista de pacientes con búsqueda y paginación
   - ✅ Crear nuevo paciente
   - ✅ Ver detalles del paciente
   - ✅ Editar información del paciente
   - ✅ Eliminar paciente (soft delete)
   - ✅ Validación de formularios

4. **Fichas Endodónticas**
   - ✅ Formulario completo basado en el PDF oficial
   - ✅ Todos los campos del diagnóstico
   - ✅ Causas, dolor, zona periapical
   - ✅ Examen periodontal
   - ✅ Evaluación radiográfica
   - ✅ Lista de fichas
   - ✅ Vista detallada con tabs

5. **Odontograma Interactivo**
   - ✅ Visualización de 32 piezas dentales
   - ✅ 11 estados diferentes por diente
   - ✅ Codificación por colores
   - ✅ Click para editar cada diente
   - ✅ Notas por pieza dental
   - ✅ Guardado en backend

6. **Interfaz de Usuario**
   - ✅ Diseño responsive (mobile-first)
   - ✅ Material-UI components
   - ✅ Navegación intuitiva
   - ✅ Notificaciones toast
   - ✅ Validación en tiempo real

## 🚀 Instalación

### Prerequisitos

- Node.js v18 o superior
- npm o yarn
- Backend corriendo en http://localhost:3000

### Pasos de Instalación

```bash
# 1. Navegar al directorio del frontend
cd frontend-odontologia

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Editar .env con la URL del backend
# REACT_APP_API_URL=http://localhost:3000/api

# 5. Iniciar la aplicación
npm start
```

La aplicación se abrirá automáticamente en `http://localhost:3000`

## 📦 Dependencias Principales

```json
{
  "@mui/material": "^5.15.10",        // UI Components
  "@mui/icons-material": "^5.15.10",  // Iconos
  "axios": "^1.6.7",                  // HTTP client
  "react-router-dom": "^6.22.0",      // Routing
  "formik": "^2.4.5",                 // Formularios
  "yup": "^1.3.3",                    // Validación
  "react-toastify": "^10.0.4"         // Notificaciones
}
```

## 📂 Estructura del Proyecto

```
frontend-odontologia/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── Dashboard/
│   │   │   └── Dashboard.js
│   │   ├── Patients/
│   │   │   ├── PatientList.js
│   │   │   ├── PatientForm.js
│   │   │   └── PatientDetail.js
│   │   ├── Fichas/
│   │   │   ├── FichaList.js
│   │   │   ├── FichaForm.js
│   │   │   └── FichaDetail.js
│   │   ├── Odontograma/
│   │   │   └── OdontogramaInteractivo.js
│   │   └── Shared/
│   │       └── Layout.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## 🎨 Componentes Principales

### 1. AuthContext
Maneja el estado global de autenticación:
- Login
- Logout
- Verificación de token
- Protección de rutas

### 2. Layout
Layout principal con:
- Sidebar con navegación
- AppBar con menú de usuario
- Área de contenido principal

### 3. PatientList
Lista de pacientes con:
- Búsqueda en tiempo real
- Paginación
- Acciones: Ver, Editar, Eliminar

### 4. FichaForm
Formulario completo de ficha endodóntica con:
- Información general del paciente
- Causas del tratamiento
- Evaluación del dolor (5 categorías)
- Zona periapical
- Examen periodontal
- Evaluación radiográfica

### 5. OdontogramaInteractivo
Odontograma visual con:
- 32 piezas dentales
- 4 cuadrantes
- 11 estados posibles
- Editor interactivo
- Codificación por colores

## 🔐 Autenticación y Seguridad

- JWT almacenado en localStorage
- Interceptores de Axios para agregar token
- Redirección automática si token es inválido
- Rutas protegidas con PrivateRoute
- Validación de formularios con Yup

## 🎯 Flujo de Uso

1. **Login** → Dashboard
2. **Crear Paciente** → Ver lista de pacientes
3. **Seleccionar Paciente** → Ver detalles
4. **Crear Ficha** desde el paciente
5. **Llenar Formulario** completo de ficha
6. **Agregar Odontograma** interactivo
7. **Guardar** y visualizar

## 📱 Diseño Responsive

- Mobile-first approach
- Breakpoints de Material-UI
- Sidebar colapsable en móvil
- Tablas con scroll horizontal
- Formularios adaptables

## 🎨 Temas y Estilos

### Paleta de Colores

- **Primary**: #1976d2 (Azul)
- **Secondary**: #dc004e (Rojo)
- **Success**: #4caf50 (Verde)
- **Warning**: #ff9800 (Naranja)
- **Error**: #f44336 (Rojo)

### Estados del Odontograma

| Estado | Color | Descripción |
|--------|-------|-------------|
| Sano | Verde | Diente sano |
| Caries | Rojo | Caries presente |
| Obturado | Azul | Diente obturado |
| Endodoncia | Morado | Tratamiento de conducto |
| Corona | Naranja | Corona dental |
| Puente | Café | Parte de puente |
| Extraído | Negro | Diente extraído |
| Implante | Gris | Implante dental |
| Fractura | Rosa | Diente fracturado |
| Ausente | Gris claro | Ausente congénito |
| En tratamiento | Amarillo | Tratamiento en curso |

## 🚧 Funcionalidades Pendientes

- [ ] Módulo de Presupuestos completo
- [ ] Registro de Pagos
- [ ] Reportes en PDF
- [ ] Gráficos estadísticos
- [ ] Calendario de citas
- [ ] Historial de cambios
- [ ] Búsqueda avanzada
- [ ] Exportar datos
- [ ] Modo oscuro

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests con cobertura
npm test -- --coverage
```

## 🏗️ Build para Producción

```bash
# Crear build optimizado
npm run build

# La carpeta build/ contendrá los archivos estáticos
# Pueden ser servidos por cualquier servidor web (NGINX, Apache, etc.)
```

## 🔧 Configuración Adicional

### Proxy para Desarrollo

Si necesitas hacer proxy del backend en desarrollo, edita `package.json`:

```json
{
  "proxy": "http://localhost:3000"
}
```

### Variables de Entorno

Crea un archivo `.env`:

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development
```

## 📝 Scripts Disponibles

```bash
npm start          # Inicia el servidor de desarrollo
npm test           # Ejecuta los tests
npm run build      # Crea build de producción
npm run eject      # Expone configuración (irreversible)
```

## 🐛 Troubleshooting

### Error de CORS

Si encuentras errores de CORS:
1. Verifica que el backend esté corriendo
2. Confirma que CORS esté habilitado en el backend
3. Verifica la URL del API en `.env`

### Error de Token Inválido

Si ves errores de autenticación:
1. Limpia localStorage: `localStorage.clear()`
2. Vuelve a hacer login
3. Verifica que el backend esté generando tokens válidos

### Error de Dependencias

```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentación Adicional

- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Formik Documentation](https://formik.org/)
- [Axios Documentation](https://axios-http.com/)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 👨‍💻 Desarrollo

### Convenciones de Código

- Usar componentes funcionales
- Hooks de React para estado
- Nombrado en PascalCase para componentes
- Nombrado en camelCase para funciones
- Comentarios en español
- PropTypes o TypeScript para tipado

### Estructura de Componentes

```javascript
import React, { useState, useEffect } from 'react';

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  const handleAction = () => {
    // Handler logic
  };

  return (
    // JSX
  );
};

export default ComponentName;
```

## 📄 Licencia

MIT

## 👏 Créditos

Sistema desarrollado para el curso de Aplicaciones Web - 2025
Universidad: [Tu Universidad]
Estudiante: [Tu Nombre]

---

## 🎯 Cumplimiento de Requisitos del Proyecto

### ✅ Requisitos Cumplidos (100%)

1. **Interfaz de Usuario (UI/UX)** ✅
   - ✅ Dashboard de Administración
   - ✅ Gestión de Pacientes (CRUD completo)
   - ✅ Fichas Técnicas (formulario completo)
   - ✅ Odontograma Interactivo

2. **Funcionalidad** ✅
   - ✅ Autenticación y seguridad
   - ✅ Integración con backend
   - ✅ Validación de formularios
   - ✅ Manejo de errores

3. **Diseño** ✅
   - ✅ Responsive design
   - ✅ Material-UI components
   - ✅ UX intuitiva
   - ✅ Feedback visual

4. **Tecnologías** ✅
   - ✅ React 18
   - ✅ React Router
   - ✅ Material-UI
   - ✅ Axios para API

---

**¡Frontend completo y funcional!** 🚀
