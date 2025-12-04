# ✅ Próximos Pasos para Configurar IMS

Este documento te guía paso a paso en lo que **necesitas hacer manualmente** para terminar de configurar el proyecto en tu ordenador.

## 📋 Checklist de Configuración

### 1. ✅ Completado

- [x] Clonar el repositorio
- [x] Instalar dependencias (`npm install`)
- [x] Crear archivo `.env` con credenciales de Supabase
- [x] Servidor de desarrollo funcionando

### 2. 🔴 Pendiente - Configurar Google OAuth

**¿Por qué es necesario?**
El proyecto usa Google OAuth para autenticación. Sin esto, no podrás hacer login.

#### Paso A: Crear Credenciales en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Navega a: **APIs & Services** > **Credentials**
4. Click en **Create Credentials** > **OAuth 2.0 Client ID**
5. Si te pide configurar la pantalla de consentimiento:
   - Click en **Configure Consent Screen**
   - Selecciona **External**
   - Completa la información básica (nombre de la app, email de soporte)
   - En **Authorized domains** NO pongas nada por ahora
   - Guarda
6. Vuelve a **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
7. Selecciona **Web application**
8. Configura:
   - **Name**: IMS - Local Development
   - **Authorized JavaScript origins**:
     ```
     http://localhost:4321
     https://taqfbhvhhhxmacwtwhdc.supabase.co
     ```
   - **Authorized redirect URIs**:
     ```
     https://taqfbhvhhhxmacwtwhdc.supabase.co/auth/v1/callback
     ```
9. Click en **Create**
10. **GUARDA** el **Client ID** y **Client Secret** que te muestra

#### Paso B: Configurar en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto (taqfbhvhhhxmacwtwhdc)
3. Navega a: **Authentication** > **Providers**
4. Busca **Google** en la lista
5. Habilita el toggle
6. Pega:
   - **Client ID**: (el que copiaste de Google Cloud)
   - **Client Secret**: (el que copiaste de Google Cloud)
7. Click en **Save**

#### Verificar

1. Inicia el servidor: `npm run dev`
2. Abre el navegador en `http://localhost:4321`
3. Deberías ver la página de login
4. Click en **Login con Google**
5. Si funciona, serás redirigido a Google OAuth

**⚠️ Importante**: La primera vez que hagas login, se creará tu usuario automáticamente en la tabla `users`, pero **sin rol asignado**. Necesitas el siguiente paso para poder acceder.

---

### 3. 🔴 Pendiente - Asignar Rol de Admin a tu Usuario

**¿Por qué es necesario?**
Por defecto, los nuevos usuarios no tienen rol asignado. Necesitas ser admin para crear instalaciones.

#### Opción A: Usando Supabase Dashboard (Recomendado)

1. Haz login con Google al menos una vez (para que se cree tu usuario)
2. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
3. Selecciona tu proyecto
4. Navega a: **Table Editor** > **users**
5. Busca tu usuario (por email)
6. Click en la fila para editarla
7. En el campo **role**, cambia el valor a `admin`
8. Click en **Save**

#### Opción B: Usando SQL Editor

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard) > **SQL Editor**
2. Ejecuta:
   ```sql
   UPDATE users
   SET role = 'admin'
   WHERE email = 'tu-email@gmail.com';
   ```
3. Reemplaza `tu-email@gmail.com` por tu email real

#### Verificar

1. Cierra sesión en la app (si estás logueado)
2. Vuelve a hacer login
3. Deberías ser redirigido a `/admin` (dashboard de admin)
4. Si ves el dashboard, ¡funciona! 🎉

---

### 4. ⚪ Opcional - Configurar Push Notifications

**¿Es necesario?**
No, es opcional. Solo si quieres probar las notificaciones push.

#### Generar Claves VAPID

1. Ejecuta en la terminal:

   ```bash
   npx web-push generate-vapid-keys
   ```

2. Te mostrará algo como:

   ```
   =======================================
   Public Key:
   BMp7Y...ABC123

   Private Key:
   xyz789...DEF456
   =======================================
   ```

3. Copia ambas claves

#### Configurar en .env

1. Abre el archivo `.env`
2. Actualiza las variables:

   ```env
   PUBLIC_VAPID_PUBLIC_KEY=tu-public-key-aqui
   VAPID_PRIVATE_KEY=tu-private-key-aqui
   VAPID_SUBJECT=mailto:tu-email@example.com
   ```

3. Guarda el archivo
4. Reinicia el servidor

---

### 5. ⚪ Opcional - Crear Usuario Installer de Prueba

**¿Para qué?**
Para probar la funcionalidad de installers (asignar instalaciones, ver como installer, etc.)

#### Crear Usuario Installer

1. Pide a alguien más que haga login con su cuenta de Google
2. O crea otra cuenta de Google y haz login con ella
3. Una vez creado el usuario, asígnale rol de `installer`:
   ```sql
   UPDATE users
   SET role = 'installer'
   WHERE email = 'email-del-installer@gmail.com';
   ```

#### Probar Flujo Completo

1. Como **admin**:
   - Crea una instalación en `/admin/installations/new`
   - Asigna el installer que acabas de crear

2. Como **installer**:
   - Haz login con la cuenta del installer
   - Navega a `/installer/installations`
   - Deberías ver la instalación asignada
   - Abre el detalle y cambia el estado

---

## 🎯 Resumen de Pasos Obligatorios

Para que el proyecto funcione completamente, **debes hacer**:

1. ✅ Configurar Google OAuth (Paso 2)
2. ✅ Asignar rol de admin a tu usuario (Paso 3)

Los demás pasos son opcionales.

---

## 🧪 Verificar que Todo Funciona

### Checklist Final

- [ ] Puedo hacer login con Google
- [ ] Soy redirigido a `/admin` después de login
- [ ] Puedo ver el dashboard de admin
- [ ] Puedo crear una instalación nueva
- [ ] Puedo ver la lista de instalaciones
- [ ] Puedo abrir el detalle de una instalación
- [ ] Puedo editar una instalación
- [ ] Puedo asignar un installer (si tengo uno creado)

Si todos los checks están ✅, ¡el proyecto está completamente configurado!

---

## 🚀 Empezar a Desarrollar

Una vez que todo funcione:

1. **Lee la documentación de arquitectura**: `.docs/arquitectura.md`
2. **Revisa las fases del proyecto**: `PHASE_XX_SUMMARY.md` en la raíz
3. **Explora el código**: Empieza por `src/pages/` y `src/components/`
4. **Lee las convenciones**: `CLAUDE.md` en la raíz

---

## ❓ Problemas Comunes

### "No puedo hacer login con Google"

**Solución**:

- Verifica que Google OAuth está habilitado en Supabase
- Verifica que las redirect URIs en Google Cloud Console incluyen tu URL de Supabase
- Limpia cookies y vuelve a intentar

### "Me redirige a /login después de hacer login"

**Solución**:

- Tu usuario probablemente no tiene rol asignado
- Ve al Paso 3 y asigna rol de `admin` a tu usuario

### "Error: Missing Supabase environment variables"

**Solución**:

- Verifica que el archivo `.env` existe
- Verifica que tiene las variables `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`
- Reinicia el servidor de desarrollo

### "No veo mis instalaciones después de crearlas"

**Solución**:

- Verifica que estás logueado como admin
- Verifica que las políticas RLS están correctas en Supabase
- Revisa la consola del navegador para ver errores

---

## 🆘 ¿Sigues Atascado?

Si después de seguir estos pasos sigues teniendo problemas:

1. Revisa la documentación completa en `.docs/setup-local.md`
2. Revisa los logs del servidor (terminal donde corre `npm run dev`)
3. Revisa la consola del navegador (F12 > Console)
4. Verifica las políticas RLS en Supabase Dashboard

---

**Última actualización**: Diciembre 2025
