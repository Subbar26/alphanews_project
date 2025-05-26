"use client"

// Component: FormularioRegistro
import { useState } from "react"
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"
import API from "../api"

export default function Register() {
  const [datosFormulario, setDatosFormulario] = useState({
    nombre: "",
    email: "",
    descripcion: "",
    contrasena: "",
    confirmarContrasena: "",
    nombreUsuario: "",
    telefono: "",
  })

  const [errores, setErrores] = useState({
    nombre: "",
    email: "",
    descripcion: "",
    contrasena: "",
    confirmarContrasena: "",
    nombreUsuario: "",
    telefono: "",
  })

  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [registroExitoso, setRegistroExitoso] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState("")

  const validarFormulario = () => {
    let esValido = true
    const nuevosErrores = { ...errores }

    // Validación de nombre
    if (!datosFormulario.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio"
      esValido = false
    } else {
      nuevosErrores.nombre = ""
    }

    // Validación de email
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!datosFormulario.email.trim()) {
      nuevosErrores.email = "El email es obligatorio"
      esValido = false
    } else if (!regexEmail.test(datosFormulario.email)) {
      nuevosErrores.email = "Por favor, introduce un email válido"
      esValido = false
    } else {
      nuevosErrores.email = ""
    }

    // Validación de descripción
    if (datosFormulario.descripcion.trim() && datosFormulario.descripcion.length > 200) {
      nuevosErrores.descripcion = "La descripción no debe exceder los 200 caracteres"
      esValido = false
    } else {
      nuevosErrores.descripcion = ""
    }

    // Validación de contraseña
    if (!datosFormulario.contrasena) {
      nuevosErrores.contrasena = "La contraseña es obligatoria"
      esValido = false
    } else if (datosFormulario.contrasena.length < 8) {
      nuevosErrores.contrasena = "La contraseña debe tener al menos 8 caracteres"
      esValido = false
    } else {
      nuevosErrores.contrasena = ""
    }

    // Validación de confirmar contraseña
    if (datosFormulario.contrasena !== datosFormulario.confirmarContrasena) {
      nuevosErrores.confirmarContrasena = "Las contraseñas no coinciden"
      esValido = false
    } else {
      nuevosErrores.confirmarContrasena = ""
    }

    // Validación de nombre de usuario
    if (!datosFormulario.nombreUsuario.trim()) {
      nuevosErrores.nombreUsuario = "El nombre de usuario es obligatorio"
      esValido = false
    } else if (datosFormulario.nombreUsuario.includes(" ")) {
      nuevosErrores.nombreUsuario = "El nombre de usuario no debe contener espacios"
      esValido = false
    } else {
      nuevosErrores.nombreUsuario = ""
    }

    // Validación de teléfono
    const regexTelefono = /^\d{9,10}$/
    if (datosFormulario.telefono && !regexTelefono.test(datosFormulario.telefono)) {
      nuevosErrores.telefono = "Por favor, introduce un número de teléfono válido"
      esValido = false
    } else {
      nuevosErrores.telefono = ""
    }

    setErrores(nuevosErrores)
    return esValido
  }

  const manejarCambio = (e) => {
    const { name, value } = e.target
    setDatosFormulario({
      ...datosFormulario,
      [name]: value,
    })
  }

  const manejarEnvio = async (e) => {
    e.preventDefault()

    if (validarFormulario()) {
      setEnviando(true)
      setErrorGeneral("")

      try {
        // Simulación de llamada a API
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Llamada real al endpoint de registro
        await API.post("/register", {
          nombre: datosFormulario.nombre,
          username: datosFormulario.nombreUsuario,
          email: datosFormulario.email,
          clave: datosFormulario.contrasena,
          telefono: datosFormulario.telefono,
          descripcion: datosFormulario.descripcion
        })

        setRegistroExitoso(true)
        // Resetear formulario después del envío exitoso
        setDatosFormulario({
          nombre: "",
          email: "",
          descripcion: "",
          contrasena: "",
          confirmarContrasena: "",
          nombreUsuario: "",
          telefono: "",
        })
      } catch (error) {
        // si el back envía `{ msg: "..." }`, lo capturamos
        setErrorGeneral(error.response?.data?.msg || "Error inesperado")
        console.error("Error de registro:", error)
      } finally {
        setEnviando(false)
      }
    }
  }

  const obtenerFortalezaContrasena = (contrasena) => {
    if (!contrasena) return { fortaleza: 0, etiqueta: "" }

    const tieneMinus = /[a-z]/.test(contrasena)
    const tieneMayus = /[A-Z]/.test(contrasena)
    const tieneNumero = /[0-9]/.test(contrasena)
    const tieneEspecial = /[^A-Za-z0-9]/.test(contrasena)

    let fortaleza = 0
    if (contrasena.length >= 8) fortaleza += 1
    if (tieneMinus && tieneMayus) fortaleza += 1
    if (tieneNumero) fortaleza += 1
    if (tieneEspecial) fortaleza += 1

    const etiquetas = ["Débil", "Regular", "Buena", "Fuerte"]
    return {
      fortaleza,
      etiqueta: fortaleza > 0 ? etiquetas[fortaleza - 1] : "",
    }
  }

  const fortalezaContrasena = obtenerFortalezaContrasena(datosFormulario.contrasena)

  if (registroExitoso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full mx-auto">
          <div className="md:flex">
            <div className="md:w-1/2 bg-blue-600 p-8 flex items-center justify-center">
              <div className="text-center">
                <CheckCircle2 className="w-20 h-20 text-white mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">¡Registro Exitoso!</h2>
                <p className="text-blue-100 mb-6 max-w-sm mx-auto">
                  Tu cuenta ha sido creada correctamente. Ahora formas parte de nuestra comunidad de noticias
                  colaborativas.
                </p>
              </div>
            </div>
            <div className="md:w-1/2 p-8">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">¿Qué sigue?</h3>
                  <p className="text-gray-600">Explora nuestras noticias o comienza a colaborar</p>
                </div>
                <div className="space-y-4">
                  <Link
                    to="/login"
                    className="w-full block text-center py-3 px-4 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition duration-200"
                  >
                    Iniciar Sesión
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-5xl w-full mx-auto">
        <div className="md:flex">
          {/* Sección de imagen */}
          <div className="md:w-2/5 relative">
            <div className="absolute inset-0 bg-blue-600 bg-opacity-80 z-10">
              <div className="h-full p-8 flex flex-col justify-center">
                <div className="bg-blue-700 bg-opacity-70 p-6 rounded-xl border border-white border-opacity-20 shadow-lg">
                  <h2 className="text-3xl font-bold text-white mb-4 flex items-center">
                    <span className="bg-white text-blue-600 px-2 py-1 rounded mr-2">α</span>
                    AlphaNews
                  </h2>
                  <p className="text-blue-100 mb-6">
                    Únete a nuestra comunidad de periodistas y colaboradores. Comparte tus historias y haz que tu voz
                    sea escuchada.
                  </p>
                  <div className="flex items-center space-x-2 text-blue-100">
                    <div className="h-5 w-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Publica tus propias noticias</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-100 mt-2">
                    <div className="h-5 w-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Colabora con otros periodistas</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-100 mt-2">
                    <div className="h-5 w-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Construye tu audiencia</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full h-full">
              <img src="/photo.png" alt="Sala de redacción de noticias" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Sección de formulario */}
          <div className="md:w-3/5 p-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Crea tu Cuenta</h2>
                <p className="text-gray-600 mt-1">Únete a nuestra comunidad de noticias</p>
              </div>

              {errorGeneral && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800">Error en el registro</h3>
                    <p className="mt-1 text-sm text-red-700">{errorGeneral}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setErrorGeneral("")}
                      className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:text-red-600"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={manejarEnvio} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={datosFormulario.nombre}
                      onChange={manejarCambio}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errores.nombre ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                      }`}
                      placeholder="María García"
                    />
                    {errores.nombre && <p className="mt-1 text-sm text-red-500">{errores.nombre}</p>}
                  </div>

                  <div>
                    <label htmlFor="nombreUsuario" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de Usuario
                    </label>
                    <input
                      type="text"
                      id="nombreUsuario"
                      name="nombreUsuario"
                      value={datosFormulario.nombreUsuario}
                      onChange={manejarCambio}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errores.nombreUsuario
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      placeholder="maria_reportera"
                    />
                    {errores.nombreUsuario && <p className="mt-1 text-sm text-red-500">{errores.nombreUsuario}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={datosFormulario.email}
                    onChange={manejarCambio}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errores.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                    }`}
                    placeholder="maria.garcia@ejemplo.com"
                  />
                  {errores.email && <p className="mt-1 text-sm text-red-500">{errores.email}</p>}
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={datosFormulario.telefono}
                    onChange={manejarCambio}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errores.telefono ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                    }`}
                    placeholder="612345678"
                  />
                  {errores.telefono && <p className="mt-1 text-sm text-red-500">{errores.telefono}</p>}
                </div>

                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={datosFormulario.descripcion}
                    onChange={manejarCambio}
                    rows="2"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errores.descripcion ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                    }`}
                    placeholder="Cuéntanos sobre ti y tus intereses en periodismo..."
                  />
                  <div className="flex justify-between mt-1">
                    <span
                      className={`text-xs ${datosFormulario.descripcion.length > 200 ? "text-red-500" : "text-gray-500"}`}
                    >
                      {datosFormulario.descripcion.length}/200
                    </span>
                    {errores.descripcion && <p className="text-sm text-red-500">{errores.descripcion}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarContrasena ? "text" : "password"}
                        id="contrasena"
                        name="contrasena"
                        value={datosFormulario.contrasena}
                        onChange={manejarCambio}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errores.contrasena
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:ring-blue-200"
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setMostrarContrasena(!mostrarContrasena)}
                      >
                        {mostrarContrasena ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errores.contrasena && <p className="mt-1 text-sm text-red-500">{errores.contrasena}</p>}
                  </div>

                  <div>
                    <label htmlFor="confirmarContrasena" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarConfirmarContrasena ? "text" : "password"}
                        id="confirmarContrasena"
                        name="confirmarContrasena"
                        value={datosFormulario.confirmarContrasena}
                        onChange={manejarCambio}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errores.confirmarContrasena
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:ring-blue-200"
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
                      >
                        {mostrarConfirmarContrasena ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errores.confirmarContrasena && (
                      <p className="mt-1 text-sm text-red-500">{errores.confirmarContrasena}</p>
                    )}
                  </div>
                </div>

                {datosFormulario.contrasena && (
                  <div className="mt-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-medium text-gray-500">Fortaleza de contraseña:</div>
                      <div
                        className={`text-xs font-medium ${
                          fortalezaContrasena.fortaleza === 1
                            ? "text-red-500"
                            : fortalezaContrasena.fortaleza === 2
                              ? "text-yellow-500"
                              : fortalezaContrasena.fortaleza === 3
                                ? "text-green-500"
                                : fortalezaContrasena.fortaleza === 4
                                  ? "text-green-600"
                                  : ""
                        }`}
                      >
                        {fortalezaContrasena.etiqueta}
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          fortalezaContrasena.fortaleza === 1
                            ? "bg-red-500 w-1/4"
                            : fortalezaContrasena.fortaleza === 2
                              ? "bg-yellow-500 w-2/4"
                              : fortalezaContrasena.fortaleza === 3
                                ? "bg-green-500 w-3/4"
                                : fortalezaContrasena.fortaleza === 4
                                  ? "bg-green-600 w-full"
                                  : "w-0"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {datosFormulario.contrasena &&
                  datosFormulario.confirmarContrasena &&
                  datosFormulario.contrasena === datosFormulario.confirmarContrasena && (
                    <p className="mt-1 text-sm text-green-500 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Las contraseñas coinciden
                    </p>
                  )}

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={enviando}
                    className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg ${
                      enviando ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {enviando ? "Creando cuenta..." : "Crear Cuenta"}
                  </button>
                </div>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
