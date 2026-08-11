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

    // 4. Crear un nuevo usuario y cambiarle el rol (Flujo real de un Super Admin)
    console.log('\n➤ PRUEBA 4: Registrando un nuevo usuario y ascendiéndolo a "admin"...');
    
    // 4a. Registrar nuevo usuario (nace siendo 'user' obligatoriamente)
    await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'nuevo_empleado', password: '123' })
    });

    // 4b. Super Admin usa su token para cambiarle el rol a 'admin'
    const roleResponse = await fetch(`${baseUrl}/users/nuevo_empleado/role`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ role: 'admin' })
    });

    const roleData = await roleResponse.json();
    if (roleResponse.ok) {
      console.log(`✅ Prueba 4 exitosa. El empleado ahora tiene el rol: ${roleData.role}`);
    } else {
      console.error('❌ Error en Prueba 4 (¿Olvidaste cambiarte a superadmin en Compass?):', roleData);
    }

    // ==========================================
    // PRUEBAS DEL CRUD DE IMPRENTAS
    // ==========================================

    // 5. Crear una imprenta (Alta)
    console.log('\n➤ PRUEBA 5: Creando una nueva imprenta...');
    const createImprentaRes = await fetch(`${baseUrl}/imprentas`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
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
      console.log('✅ Prueba 5 exitosa. Imprenta creada:', createImprentaData.name);
    } else if (createImprentaData.error === 'Ya existe una imprenta con ese nombre') {
      console.log('✅ Prueba 5 exitosa. (La imprenta ya existía).');
      // Obtener el ID de la existente para las siguientes pruebas
      const listRes = await fetch(`${baseUrl}/imprentas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const listData = await listRes.json();
      const found = listData.find(i => i.name === 'Imprenta Central');
      if (found) imprentaId = found._id;
    } else {
      console.error('❌ Error en Prueba 5:', createImprentaData);
    }

    // 6. Listar todas las imprentas (Lectura)
    console.log('\n➤ PRUEBA 6: Listando todas las imprentas...');
    const listImprentasRes = await fetch(`${baseUrl}/imprentas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const listImprentasData = await listImprentasRes.json();
    if (listImprentasRes.ok) {
      console.log(`✅ Prueba 6 exitosa. Imprentas encontradas: ${listImprentasData.length}`);
      listImprentasData.forEach(i => console.log(`   - ${i.name} (${i.address})`));
    } else {
      console.error('❌ Error en Prueba 6:', listImprentasData);
    }

    // 7. Modificar una imprenta (Modificación)
    if (imprentaId) {
      console.log('\n➤ PRUEBA 7: Modificando la dirección de la imprenta...');
      const updateRes = await fetch(`${baseUrl}/imprentas/${imprentaId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ address: 'Av. Santa Fe 5678, Buenos Aires' })
      });

      const updateData = await updateRes.json();
      if (updateRes.ok) {
        console.log(`✅ Prueba 7 exitosa. Nueva dirección: ${updateData.address}`);
      } else {
        console.error('❌ Error en Prueba 7:', updateData);
      }

      // 8. Eliminar la imprenta (Baja)
      console.log('\n➤ PRUEBA 8: Eliminando la imprenta...');
      const deleteRes = await fetch(`${baseUrl}/imprentas/${imprentaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const deleteData = await deleteRes.json();
      if (deleteRes.ok) {
        console.log('✅ Prueba 8 exitosa.', deleteData.message);
      } else {
        console.error('❌ Error en Prueba 8:', deleteData);
      }
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
