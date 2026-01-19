# 🚀 Guía de Instalación Rápida - Frontend

## Instalación en 5 Pasos

### 1️⃣ Verificar Prerequisitos

```bash
# Verificar Node.js (debe ser v18+)
node --version

# Verificar npm
npm --version

# Asegúrate que el BACKEND esté corriendo en http://localhost:3000
```

### 2️⃣ Instalar Dependencias

```bash
cd frontend-odontologia
npm install
```

**Nota:** La instalación puede tomar 2-3 minutos.

### 3️⃣ Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# El archivo .env debe contener:
# REACT_APP_API_URL=http://localhost:3000/api
```

### 4️⃣ Iniciar la Aplicación

```bash
npm start
```

La aplicación se abrirá automáticamente en `http://localhost:3000` (si el puerto está ocupado, usará el 3001).

### 5️⃣ Credenciales de Prueba

Si ya ejecutaste los seeds del backend, puedes usar:

**Usuario de Prueba:**
- Email: `admin@endonova.com`
- Password: `admin123`

O crea tu propio usuario desde el formulario de registro.

---

## ✅ Verificación de Instalación

Si ves la pantalla de login, ¡la instalación fue exitosa!

### Flujo de Prueba Rápido

1. ✅ Hacer login o registrarse
2. ✅ Ver el dashboard
3. ✅ Crear un paciente
4. ✅ Crear una ficha para ese paciente
5. ✅ Editar el odontograma

---

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 is already in use"
El frontend intentará usar el puerto 3001 automáticamente, o puedes:
```bash
PORT=3002 npm start
```

### Error: "Network Error" al hacer login
Verifica que el backend esté corriendo:
```bash
curl http://localhost:3000/api/auth/verify
```

### Error de CORS
El backend debe tener CORS habilitado. Verifica que esté configurado correctamente.

---

## 📱 Acceso desde Otros Dispositivos

Para acceder desde tu celular o tablet en la misma red:

```bash
# Iniciar con host 0.0.0.0
HOST=0.0.0.0 npm start

# Luego accede desde: http://[TU_IP_LOCAL]:3000
# Ejemplo: http://192.168.1.100:3000
```

---

## 🎯 Siguiente Paso

Revisa el README.md completo para entender toda la funcionalidad del sistema.

**¡Disfruta usando ENDONOVA! 🦷**
