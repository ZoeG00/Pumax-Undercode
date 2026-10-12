const { Usuario, Empleado, Sesion } = require('../models');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios con empleado
exports.getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      where: { activo: true },
      include: [{
        model: Empleado,
        as: 'empleado',
        attributes: ['id', 'nombre', 'apellido', 'dni', 'cargo']
      }],
      attributes: { exclude: ['password_hash'] } // No mostrar password
    });
    res.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo usuarios',
      error: error.message
    });
  }
};

// Obtener usuario por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id, {
      include: [{
        model: Empleado,
        as: 'empleado'
      }],
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo usuario',
      error: error.message
    });
  }
};

// Crear usuario
exports.create = async (req, res) => {
  try {
    const { username, password, password_hash, rol, empleado_id, activo } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario es requerido'
      });
    }

    const rawPassword = password || password_hash;
    if (!rawPassword) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña es requerida'
      });
    }

    // Hashear password con bcrypt
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Mapear rol si viene del frontend (ej: 'EMPLEADO' -> 'VENDEDOR')
    const ROLES_VALIDOS = ['ADMIN', 'VENDEDOR', 'DEPOSITO', 'FACTURACION', 'VIAJANTE'];
    let rolNormalizado = (rol || 'VENDEDOR').toUpperCase();
    if (rolNormalizado === 'EMPLEADO') {
      rolNormalizado = 'VENDEDOR';
    }
    if (!ROLES_VALIDOS.includes(rolNormalizado)) {
      rolNormalizado = 'VENDEDOR';
    }

    const usuario = await Usuario.create({
      username: username.trim(),
      password_hash: hashedPassword,
      rol: rolNormalizado,
      empleado_id: empleado_id || null,
      activo: activo !== undefined ? activo : true
    });
    
    // No devolver el password en la respuesta
    const usuarioSinPassword = usuario.toJSON();
    delete usuarioSinPassword.password_hash;
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: usuarioSinPassword
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creando usuario',
      error: error.message
    });
  }
};

// Actualizar usuario
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioExistente = await Usuario.findByPk(id);

    if (!usuarioExistente) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const updateData = { ...req.body };

    // Si viene password, hashearlo
    if (updateData.password) {
      updateData.password_hash = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }

    // Normalizar rol si viene especificado
    if (updateData.rol) {
      const ROLES_VALIDOS = ['ADMIN', 'VENDEDOR', 'DEPOSITO', 'FACTURACION', 'VIAJANTE'];
      let rolNormalizado = updateData.rol.toUpperCase();
      if (rolNormalizado === 'EMPLEADO') rolNormalizado = 'VENDEDOR';
      if (ROLES_VALIDOS.includes(rolNormalizado)) {
        updateData.rol = rolNormalizado;
      } else {
        delete updateData.rol;
      }
    }

    // Si se enviaron datos de empleado (nombre, apellido, email) y el usuario tiene empleado asociado
    if (usuarioExistente.empleado_id && (updateData.nombre || updateData.apellido || updateData.email)) {
      const empleadoUpdate = {};
      if (updateData.nombre) empleadoUpdate.nombre = updateData.nombre;
      if (updateData.apellido) empleadoUpdate.apellido = updateData.apellido;
      if (updateData.email) empleadoUpdate.email = updateData.email;

      await Empleado.update(empleadoUpdate, {
        where: { id: usuarioExistente.empleado_id }
      });
    }

    // Limpiar campos que no pertenecen a la tabla usuarios
    delete updateData.nombre;
    delete updateData.apellido;
    delete updateData.email;

    await usuarioExistente.update(updateData);

    const usuario = await Usuario.findByPk(id, {
      include: [{
        model: Empleado,
        as: 'empleado',
        attributes: ['id', 'nombre', 'apellido', 'dni', 'cargo']
      }],
      attributes: { exclude: ['password_hash'] }
    });
    
    res.json({
      success: true,
      message: 'Usuario actualizado',
      data: usuario
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error actualizando usuario',
      error: error.message
    });
  }
};

// Eliminar usuario (soft delete)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Usuario.update(
      { activo: false },
      { where: { id } }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario desactivado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error eliminando usuario',
      error: error.message
    });
  }
};

// ============================================
// MI CUENTA (cualquier usuario autenticado, solo sobre sí mismo)
// ============================================

const EMPLEADO_ATTRS = ['id', 'nombre', 'apellido', 'dni', 'cargo', 'telefono', 'email', 'direccion', 'fecha_ingreso'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;

const buscarMiCuenta = (id) =>
  Usuario.findByPk(id, {
    include: [{ model: Empleado, as: 'empleado', attributes: EMPLEADO_ATTRS }],
    attributes: { exclude: ['password_hash'] }
  });

// Datos de la cuenta del usuario logueado
exports.getMe = async (req, res) => {
  try {
    const usuario = await buscarMiCuenta(req.user.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({ success: true, data: usuario });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error obteniendo tu cuenta', error: error.message });
  }
};

// Editar datos personales propios (nunca rol, estado ni username)
exports.updateMe = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario || !usuario.empleado_id) {
      return res.status(400).json({
        success: false,
        message: 'Tu usuario no tiene una ficha de empleado asociada. Pedile a un administrador que la cargue.'
      });
    }

    const { nombre, apellido, email, telefono, direccion } = req.body;
    const cambios = {};

    if (nombre !== undefined) {
      if (!String(nombre).trim()) {
        return res.status(400).json({ success: false, message: 'El nombre no puede quedar vacío' });
      }
      cambios.nombre = String(nombre).trim().slice(0, 100);
    }
    if (apellido !== undefined) {
      if (!String(apellido).trim()) {
        return res.status(400).json({ success: false, message: 'El apellido no puede quedar vacío' });
      }
      cambios.apellido = String(apellido).trim().slice(0, 100);
    }
    if (email !== undefined) {
      const valor = String(email).trim();
      if (valor && !EMAIL_REGEX.test(valor)) {
        return res.status(400).json({ success: false, message: 'El email no es válido' });
      }
      cambios.email = valor ? valor.slice(0, 100) : null;
    }
    if (telefono !== undefined) {
      const valor = String(telefono).trim();
      cambios.telefono = valor ? valor.slice(0, 20) : null;
    }
    if (direccion !== undefined) {
      const valor = String(direccion).trim();
      cambios.direccion = valor || null;
    }

    if (Object.keys(cambios).length > 0) {
      await Empleado.update(cambios, { where: { id: usuario.empleado_id } });
    }

    const actualizado = await buscarMiCuenta(req.user.id);
    res.json({ success: true, message: 'Datos actualizados', data: actualizado });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error actualizando tus datos', error: error.message });
  }
};

// Cambiar la contraseña propia (exige la actual)
exports.changeMyPassword = async (req, res) => {
  try {
    const { password_actual, password_nueva } = req.body;

    if (!password_actual || !password_nueva) {
      return res.status(400).json({ success: false, message: 'Completá la contraseña actual y la nueva' });
    }
    if (String(password_nueva).length < PASSWORD_MIN) {
      return res.status(400).json({
        success: false,
        message: `La nueva contraseña debe tener al menos ${PASSWORD_MIN} caracteres`
      });
    }
    if (password_nueva === password_actual) {
      return res.status(400).json({ success: false, message: 'La nueva contraseña debe ser distinta de la actual' });
    }

    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Mismo criterio que el login (hash bcrypt o, en cuentas viejas, texto plano)
    const esHash = usuario.password_hash.startsWith('$2a$') || usuario.password_hash.startsWith('$2b$');
    const actualValida = esHash
      ? await bcrypt.compare(password_actual, usuario.password_hash)
      : usuario.password_hash === password_actual;

    // 400 y no 401: el front interpreta 401 como "sesión vencida"
    if (!actualValida) {
      return res.status(400).json({ success: false, message: 'La contraseña actual no es correcta' });
    }

    await usuario.update({ password_hash: await bcrypt.hash(password_nueva, 10) });
    res.json({ success: true, message: 'Contraseña actualizada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cambiando la contraseña', error: error.message });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar que se enviaron los datos requeridos
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username y password son requeridos'
      });
    }

    // Buscar usuario activo por username
    const usuario = await Usuario.findOne({
      where: {
        username: username,
        activo: true
      },
      include: [{
        model: Empleado,
        as: 'empleado',
        attributes: ['id', 'nombre', 'apellido', 'dni', 'cargo']
      }]
    });

    // Verificar si existe el usuario
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Comparar password con bcrypt (con fallback para compatibilidad con contraseñas en texto plano)
    let passwordValido = false;
    if (usuario.password_hash.startsWith('$2a$') || usuario.password_hash.startsWith('$2b$')) {
      passwordValido = await bcrypt.compare(password, usuario.password_hash);
    } else {
      passwordValido = (usuario.password_hash === password);
      if (passwordValido) {
        // Auto-migrar la contraseña a hash bcrypt seguro
        const hash = await bcrypt.hash(password, 10);
        await usuario.update({ password_hash: hash });
      }
    }

    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar último acceso
    await usuario.update({
      ultimo_acceso: new Date()
    });

    // Generar token de sesión
    const token = require('crypto').randomBytes(32).toString('hex');
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 7); // Token válido por 7 días

    // Crear sesión en la base de datos
    await Sesion.create({
      usuario_id: usuario.id,
      token: token,
      fecha_expiracion: fechaExpiracion,
      activo: true
    });

    // Preparar respuesta sin password
    const usuarioSinPassword = usuario.toJSON();
    delete usuarioSinPassword.password_hash;

    res.json({
      success: true,
      message: 'Login exitoso',
      data: usuarioSinPassword,
      token: token // Enviar token al frontend
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el login',
      error: error.message
    });
  }
};

// Verificar sesión activa
exports.verificarSesion = async (req, res) => {
  try {
    const token = req.headers['x-session-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de sesión'
      });
    }

    // Buscar sesión activa en la base de datos
    const sesion = await Sesion.findOne({
      where: {
        token: token,
        activo: true
      },
      include: [{
        model: Usuario,
        as: 'usuario',
        where: { activo: true },
        include: [{
          model: Empleado,
          as: 'empleado',
          attributes: ['id', 'nombre', 'apellido', 'dni', 'cargo']
        }]
      }]
    });

    if (!sesion) {
      return res.status(401).json({
        success: false,
        message: 'Sesión inválida o expirada'
      });
    }

    // Verificar si el token está expirado
    if (sesion.estaExpirado()) {
      // Desactivar la sesión
      await sesion.update({ activo: false });
      return res.status(401).json({
        success: false,
        message: 'Sesión expirada'
      });
    }

    // Preparar respuesta sin password
    const usuarioSinPassword = sesion.usuario.toJSON();
    delete usuarioSinPassword.password_hash;

    res.json({
      success: true,
      message: 'Sesión válida',
      data: usuarioSinPassword,
      token: token // Devolver el token para que el frontend lo mantenga
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verificando sesión',
      error: error.message
    });
  }
};