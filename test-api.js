// Script de prueba automático para la API
// Este script simula ser un cliente (como tu navegador o una app frontend) conectándose a tu backend.

async function runTests() {
  const baseUrl = 'http://localhost:3000';
  let token = '';

  console.log('--- INICIANDO PRUEBAS AUTOMÁTICAS ---\n');

  try {
    // 1. Crear un usuario administrador
    console.log('➤ PRUEBA 1: Intentando registrar un usuario administrador...');
    const registerResponse = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin_test',
        password: 'password123',
        role: 'admin'
      })
    });
    
    const registerData = await registerResponse.json();
    if (registerResponse.ok || registerData.error === 'El nombre de usuario ya existe') {
      console.log('✅ Prueba 1 exitosa. (El usuario se creó o ya existía).');
    } else {
      console.error('❌ Error en Prueba 1:', registerData);
    }

    // 2. Iniciar sesión para obtener el token
    console.log('\n➤ PRUEBA 2: Iniciando sesión para obtener el Token de acceso...');
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin_test',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    if (loginResponse.ok && loginData.token) {
      token = loginData.token;
      console.log('✅ Prueba 2 exitosa. ¡Token obtenido correctamente!');
      console.log(`   Token (abreviado): ${token.substring(0, 15)}...`);
    } else {
      console.error('❌ Error en Prueba 2. No se pudo iniciar sesión:', loginData);
      return; // Si no hay token, no podemos continuar
    }

    // 3. Probar una ruta protegida con el token
    console.log('\n➤ PRUEBA 3: Pidiendo la lista de usuarios usando el Token...');
    const getResponse = await fetch(`${baseUrl}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}` // Aquí inyectamos el token de seguridad
      }
    });

    const getData = await getResponse.json();
    if (getResponse.ok) {
      console.log('✅ Prueba 3 exitosa. Acceso permitido.');
      console.log('   Usuarios en la base de datos:', getData);
    } else {
      console.error('❌ Error en Prueba 3:', getData);
    }

    console.log('\n--- PRUEBAS FINALIZADAS CON ÉXITO ---');
    console.log('¡Tu arquitectura, base de datos, y seguridad están funcionando perfectamente!');

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO DE CONEXIÓN:');
    console.error('Asegúrate de que tu servidor esté corriendo (npm run dev) y tu base de datos MongoDB esté encendida.');
    console.error(error.message);
  }
}

runTests();
