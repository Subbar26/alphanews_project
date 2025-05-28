"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import {
  User,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Edit3,
  Save,
  X,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Award,
  Calendar,
} from "lucide-react"
import { AuthContext } from "../contexts/AuthContext"
import axios from "axios"

export default function UserProfile() {
  
  const navigate = useNavigate()
  const { user, logout, token } = useContext(AuthContext)

  const BASE = "http://localhost:5100"
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const [datosUsuario, setDatosUsuario] = useState({
    nombre: "",
    email: "",
    telefono: "",
    descripcion: "",
    username: "",
    clave: "",
  })

  const [modoEdicion, setModoEdicion] = useState(false)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")
  const [exito, setExito] = useState("")
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
  const [cuentaEliminada, setCuentaEliminada] = useState(false)

  useEffect(() => {
    if (user) {
      cargarDatosUsuario()
    }
  }, [user])

  const cargarDatosUsuario = async () => {
    try {
      setCargando(true)
      setError("")
      const { data } = await axios.get(`${BASE}/usuarios/${user.id}`, { headers })
      setDatosUsuario({
        nombre: data.nombre || "",
        email: data.email || "",
        telefono: data.telefono || "",
        descripcion: data.descripcion || "",
        username: data.username || "",
        clave: "",
      })
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar datos del usuario")
    } finally {
      setCargando(false)
    }
  }

  const manejarCambio = (e) => {
    const { name, value } = e.target
    setDatosUsuario({ ...datosUsuario, [name]: value })
  }

  const guardarCambios = async (e) => {
    e.preventDefault()
    try {
      setCargando(true)
      setError("")
      setExito("")

      const cambios = {}
      Object.entries(datosUsuario).forEach(([k, v]) => {
        if (k !== "clave" && v.trim() !== "") cambios[k] = v
      })
      if (datosUsuario.clave.trim()) cambios.clave = datosUsuario.clave

      await axios.put(`${BASE}/usuarios/${user.id}`, cambios, { headers })
      setExito("Perfil actualizado correctamente")
      setModoEdicion(false)
      setDatosUsuario({ ...datosUsuario, clave: "" })
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el perfil")
    } finally {
      setCargando(false)
    }
  }

  const cancelarEdicion = () => {
    setModoEdicion(false)
    setError("")
    setExito("")
    cargarDatosUsuario()
  }

  const eliminarCuenta = async () => {
    try {
      setCargando(true)
      await axios.delete(`${BASE}/usuarios/${user.id}`, { headers })

      // Mostrar mensaje de éxito y redirigir después de 3 segundos
      setCuentaEliminada(true)
      setMostrarModalEliminar(false)

      setTimeout(() => {
        logout()
        navigate("/")
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar la cuenta")
      setCargando(false)
    }
  }

  // Pantalla de cuenta eliminada exitosamente
  if (cuentaEliminada) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cuenta Eliminada</h2>
          <p className="text-gray-600 mb-6">
            Tu cuenta ha sido eliminada exitosamente. Serás redirigido a la página principal en unos segundos.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: "100%" }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  if (cargando && !modoEdicion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Configuración de Perfil
                </h1>
                <p className="text-gray-600">Gestiona tu presencia en la comunidad periodística</p>
              </div>
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button onClick={() => setError("")} className="flex-shrink-0 text-red-400 hover:text-red-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {exito && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">Éxito</h3>
                <p className="text-sm text-green-700 mt-1">{exito}</p>
              </div>
              <button onClick={() => setExito("")} className="flex-shrink-0 text-green-400 hover:text-green-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Sidebar con información del usuario */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-8">
                <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 px-6 py-8">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white border-opacity-30">
                      <User className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{datosUsuario.nombre || "Periodista"}</h2>
                    <p className="text-blue-100">@{datosUsuario.username}</p>
                    <div className="mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 backdrop-blur-sm text-white border border-white border-opacity-30">
                        <Award className="h-3 w-3 mr-1" />
                        {user?.rol === "admin" ? "Editor Jefe" : user?.rol === "moderador" ? "Editor" : "Colaborador"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-3 text-gray-400" />
                      <span className="truncate">{datosUsuario.email || "No especificado"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{datosUsuario.telefono || "No especificado"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                      <span>Miembro desde 2024</span>
                    </div>
                  </div>

                  {datosUsuario.descripcion && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Acerca de mí</h4>
                      <p className="text-sm text-gray-600">{datosUsuario.descripcion}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Formulario principal */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Información del Periodista</h3>
                    <p className="text-sm text-gray-600">Actualiza tu perfil profesional</p>
                  </div>
                  {!modoEdicion ? (
                    <button
                      onClick={() => setModoEdicion(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={cancelarEdicion}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </button>
                      <button
                        onClick={guardarCambios}
                        disabled={cargando}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {cargando ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <form onSubmit={guardarCambios} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                        {modoEdicion ? (
                          <input
                            type="text"
                            name="nombre"
                            value={datosUsuario.nombre}
                            onChange={manejarCambio}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Ej: María García López"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-900">{datosUsuario.nombre || "No especificado"}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de Usuario</label>
                        {modoEdicion ? (
                          <input
                            type="text"
                            name="username"
                            value={datosUsuario.username}
                            onChange={manejarCambio}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Ej: maria_reportera"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-900">{datosUsuario.username || "No especificado"}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                        {modoEdicion ? (
                          <input
                            type="email"
                            name="email"
                            value={datosUsuario.email}
                            onChange={manejarCambio}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Ej: maria@periodicolocal.com"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-900">{datosUsuario.email || "No especificado"}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                        {modoEdicion ? (
                          <input
                            type="tel"
                            name="telefono"
                            value={datosUsuario.telefono}
                            onChange={manejarCambio}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Ej: +34 612 345 678"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-900">{datosUsuario.telefono || "No especificado"}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                      {modoEdicion ? (
                        <textarea
                          name="descripcion"
                          value={datosUsuario.descripcion}
                          onChange={manejarCambio}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Especialista en investigación política con 5 años de experiencia en medios digitales..."
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-900">{datosUsuario.descripcion || "No especificado"}</p>
                        </div>
                      )}
                    </div>

                    {modoEdicion && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nueva Contraseña (opcional)
                        </label>
                        <div className="relative">
                          <input
                            type={mostrarContrasena ? "text" : "password"}
                            name="clave"
                            value={datosUsuario.clave}
                            onChange={manejarCambio}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-colors"
                            placeholder="Deja en blanco para mantener la actual"
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
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Zona de peligro mejorada */}
              <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden border-l-4 border-red-500">
                <div className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 px-6 py-4 border-b border-red-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-900">Eliminar Cuenta de Periodista</h3>
                      <p className="text-sm text-red-700">Acción irreversible para tu perfil profesional</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-4">
                    Una vez que elimines tu cuenta, no hay vuelta atrás. Se perderán permanentemente:
                  </p>
                  <ul className="text-sm text-gray-600 mb-6 space-y-1">
                    <li>• Todos tus datos personales</li>
                    <li>• Comunidades creadas</li>
                    <li>• Noticias publicadas</li>
                    <li>• Comentarios y participaciones</li>
                  </ul>
                  <button
                    onClick={() => setMostrarModalEliminar(true)}
                    className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Cuenta Permanentemente
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal de confirmación mejorado */}
          {mostrarModalEliminar && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Confirmar Eliminación</h3>
                      <p className="text-sm text-gray-600">Esta acción es irreversible</p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800 font-medium mb-2">⚠️ Advertencia Final</p>
                    <p className="text-red-700 text-sm">
                      Al confirmar, tu cuenta <strong>@{datosUsuario.username}</strong> será eliminada permanentemente
                      junto con todos tus datos.
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setMostrarModalEliminar(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={eliminarCuenta}
                      disabled={cargando}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {cargando ? "Eliminando..." : "Sí, Eliminar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
