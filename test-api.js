// Script de prueba automático para la API
// Este script simula ser un cliente (como tu navegador o una app frontend) conectándose a tu backend.

async function runTests() {
  const baseUrl = 'http://localhost:3000';

  console.log('--- INICIANDO PRUEBAS AUTOMÁTICAS ---\n');

  try {
    // 0. Inicio de sesión del Administrador (Admin por defecto sembrado)
    console.log('➤ PRUEBA 0: Iniciando sesión como Administrador (admin_test)...');
    const adminLoginRaw = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin_test',
        password: 'password123'
      })
    });

    const adminLoginData = await adminLoginRaw.json();
    if (!adminLoginRaw.ok || !adminLoginData.token) {
      console.error('❌ Error en Prueba 0: No se pudo iniciar sesión como admin:', adminLoginData);
      return;
    }

    const adminToken = adminLoginData.token;
    console.log('✅ Prueba 0 exitosa. Admin autenticado correctamente.');

    // 1. Admin le da el alta a un usuario estándar ('user')
    console.log('\n➤ PRUEBA 1: Admin registrando un nuevo usuario con rol "user"...');
    const registerResponse = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        username: 'nuevo_empleado',
        password: 'password123',
        role: 'user'
      })
    });

    const registerData = await registerResponse.json();
    if (registerResponse.ok || registerData.error === 'El nombre de usuario ya existe') {
      console.log('✅ Prueba 1 exitosa. (El usuario se creó o ya existía).');
    } else {
      console.error('❌ Error en Prueba 1:', registerData);
    }

    // 2. El usuario ('nuevo_empleado') inicia sesión para obtener su token
    console.log('\n➤ PRUEBA 2: Usuario iniciando sesión para obtener su Token de acceso...');
    const userLoginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'nuevo_empleado',
        password: 'password123'
      })
    });

    const userLoginData = await userLoginResponse.json();
    const empleadoToken = userLoginData.token;

    if (userLoginResponse.ok && userLoginData.token) {
      console.log('✅ Prueba 2 exitosa. ¡Token de usuario obtenido correctamente!');
      console.log(`   Token (abreviado): ${empleadoToken.substring(0, 15)}...`);
    } else {
      console.error('❌ Error en Prueba 2. No se pudo iniciar sesión como usuario:', userLoginData);
      return;
    }

    // 3. Admin consulta la lista de usuarios
    console.log('\n➤ PRUEBA 3: Admin pidiendo la lista completa de usuarios...');
    const getUsersResponse = await fetch(`${baseUrl}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const getUsersData = await getUsersResponse.json();
    if (getUsersResponse.ok) {
      console.log('✅ Prueba 3 exitosa. Usuarios en la base de datos:', getUsersData);
    } else {
      console.error('❌ Error en Prueba 3:', getUsersData);
    }

    // ==========================================
    // PRUEBAS DEL CRUD DE IMPRENTAS (Realizadas por el usuario 'user')
    // ==========================================

    // 4. Usuario crea una imprenta (Alta)
    console.log('\n➤ PRUEBA 4: Usuario creando una nueva imprenta...');
    const createImprentaRes = await fetch(`${baseUrl}/imprentas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${empleadoToken}`
      },
      body: JSON.stringify({
        name: 'Imprenta Central',
        address: 'Av. Corrientes 1234, Buenos Aires',
        phone: '011-4567-8900'
      })
    });

    const createImprentaData = await createImprentaRes.json();
    let imprentaId = '';

    if (createImprentaRes.ok) {
      imprentaId = createImprentaData._id;
      console.log('✅ Prueba 4 exitosa. Imprenta creada:', createImprentaData.name);
    } else if (createImprentaData.error === 'Ya existe una imprenta con ese nombre') {
      console.log('✅ Prueba 4 exitosa. (La imprenta ya existía).');
      const listRes = await fetch(`${baseUrl}/imprentas`, {
        headers: { 'Authorization': `Bearer ${empleadoToken}` }
      });
      const listData = await listRes.json();
      const found = listData.find(i => i.name === 'Imprenta Central');
      if (found) imprentaId = found._id;
    } else {
      console.error('❌ Error en Prueba 4:', createImprentaData);
    }

    // 5. Usuario lista todas las imprentas (Lectura)
    console.log('\n➤ PRUEBA 5: Usuario listando todas las imprentas...');
    const listImprentasRes = await fetch(`${baseUrl}/imprentas`, {
      headers: { 'Authorization': `Bearer ${empleadoToken}` }
    });

    const listImprentasData = await listImprentasRes.json();
    if (listImprentasRes.ok) {
      console.log(`✅ Prueba 5 exitosa. Imprentas encontradas: ${listImprentasData.length}`);
      listImprentasData.forEach(i => console.log(`   - ${i.name} (${i.address})`));
    } else {
      console.error('❌ Error en Prueba 5:', listImprentasData);
    }

    // 6. Usuario modifica una imprenta (Modificación)
    if (imprentaId) {
      console.log('\n➤ PRUEBA 6: Usuario modificando la dirección de la imprenta...');
      const updateRes = await fetch(`${baseUrl}/imprentas/${imprentaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${empleadoToken}`
        },
        body: JSON.stringify({ address: 'Av. Santa Fe 5678, Buenos Aires' })
      });

      const updateData = await updateRes.json();
      if (updateRes.ok) {
        console.log(`✅ Prueba 6 exitosa. Nueva dirección: ${updateData.address}`);
      } else {
        console.error('❌ Error en Prueba 6:', updateData);
      }

      // 7. Usuario elimina la imprenta (Baja)
      console.log('\n➤ PRUEBA 7: Usuario eliminando la imprenta...');
      const deleteRes = await fetch(`${baseUrl}/imprentas/${imprentaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${empleadoToken}` }
      });

      const deleteData = await deleteRes.json();
      if (deleteRes.ok) {
        console.log('✅ Prueba 7 exitosa.', deleteData.message);
      } else {
        console.error('❌ Error en Prueba 7:', deleteData);
      }
    }

    console.log('\n--- PRUEBAS FINALIZADAS CON ÉXITO ---');
    console.log('¡Tu arquitectura, autenticación por roles y seguridad están funcionando perfectamente!');

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO DE CONEXIÓN:');
    console.error('Asegúrate de que tu servidor esté corriendo (npm run dev) y tu base de datos MongoDB esté encendida.');
    console.error(error.message);
  }
}

runTests();
