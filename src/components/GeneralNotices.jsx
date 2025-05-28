"use client"

import { useState, useEffect, useContext } from "react"
import {
  Search,
  Calendar,
  User,
  Eye,
  Heart,
  MessageCircle,
  Filter,
  TrendingUp,
  Clock,
  Users,
  BookOpen,
  X,
  Tag,
  AlertTriangle,
  Globe,
} from "lucide-react"
import { AuthContext } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import axios from "axios"

export default function GeneralNotices() {
  const { token, user } = useContext(AuthContext)
  const [noticias, setNoticias] = useState([])
  const [noticiasFiltradas, setNoticiasFiltradas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("todas") // "todas", "con-comunidad", "sin-comunidad"
  const [filtroComunidad, setFiltroComunidad] = useState("todas")
  const [ordenamiento, setOrdenamiento] = useState("recientes")
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false)
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null)

  // URL base de tu API
  const BASE = "http://localhost:5100"
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  useEffect(() => {
    cargarNoticias()
  }, [])

  useEffect(() => {
    filtrarNoticias()
  }, [noticias, busqueda, filtroTipo, filtroComunidad, ordenamiento])

  const filtrarNoticias = () => {
    let filtradas = [...noticias]

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const b = busqueda.toLowerCase()
      filtradas = filtradas.filter(
        (n) =>
          n.titulo.toLowerCase().includes(b) ||
          n.contenido.toLowerCase().includes(b) ||
          n.comunidad?.titulo.toLowerCase().includes(b) ||
          n.autor?.nombre.toLowerCase().includes(b),
      )
    }

    // Filtrar por tipo (con/sin comunidad)
    if (filtroTipo === "con-comunidad") {
      filtradas = filtradas.filter((n) => n.comunidad)
    } else if (filtroTipo === "sin-comunidad") {
      filtradas = filtradas.filter((n) => !n.comunidad)
    }

    // Filtrar por comunidad específica (solo si hay comunidad)
    if (filtroComunidad !== "todas" && filtroTipo !== "sin-comunidad") {
      filtradas = filtradas.filter((n) => n.comunidad?._id === filtroComunidad)
    }

    // Ordenar
    switch (ordenamiento) {
      case "recientes":
        filtradas.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
        break
      case "antiguos":
        filtradas.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion))
        break
      case "populares":
        filtradas.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
        break
      case "comentarios":
        filtradas.sort((a, b) => (b.comentarios?.length || 0) - (a.comentarios?.length || 0))
        break
      default:
        break
    }

    setNoticiasFiltradas(filtradas)
  }

  async function cargarNoticias() {
    try {
      setCargando(true)
      const resp = await axios.get(`${BASE}/noticias`, { headers })
      setNoticias(resp.data)
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar noticias")
    } finally {
      setCargando(false)
    }
  }

  const verDetalleNoticia = (noticia) => {
    setNoticiaSeleccionada(noticia)
    setMostrarModalDetalle(true)
  }

  const darLike = async (noticiaId) => {
    if (!token) {
      setError("Debes iniciar sesión para dar like")
      return
    }
    try {
      await axios.post(`${BASE}/noticias/${noticiaId}/like`, { userId: user.id }, { headers })
      await cargarNoticias()
    } catch (err) {
      setError(err.response?.data?.error || "Error al dar like")
    }
  }

  const getEstadisticas = () => {
    const total = noticias.length
    const conComunidad = noticias.filter((n) => n.comunidad).length
    const sinComunidad = noticias.filter((n) => !n.comunidad).length
    const totalLikes = noticias.reduce((acc, n) => acc + (n.likes?.length || 0), 0)
    const totalComentarios = noticias.reduce((acc, n) => acc + (n.comentarios?.length || 0), 0)
    const comunidadesUnicas = new Set(noticias.map((n) => n.comunidad?._id).filter(Boolean)).size

    return { total, conComunidad, sinComunidad, totalLikes, totalComentarios, comunidadesUnicas }
  }

  const getComunidadesUnicas = () => {
    const comunidades = noticias
      .map((n) => n.comunidad)
      .filter((c) => c)
      .reduce((acc, curr) => {
        if (!acc.find((c) => c._id === curr._id)) {
          acc.push(curr)
        }
        return acc
      }, [])
    return comunidades
  }

  const formatearFecha = (fecha) => {
    const ahora = new Date()
    const fechaNoticia = new Date(fecha)
    const diferencia = ahora - fechaNoticia
    const minutos = Math.floor(diferencia / (1000 * 60))
    const horas = Math.floor(diferencia / (1000 * 60 * 60))
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

    if (minutos < 60) {
      return `Hace ${minutos} minutos`
    } else if (horas < 24) {
      return `Hace ${horas} horas`
    } else if (dias < 7) {
      return `Hace ${dias} días`
    } else {
      return fechaNoticia.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  const stats = getEstadisticas()
  const comunidades = getComunidadesUnicas()

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-8"></div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>

            {/* Cards skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
                Explorar Noticias
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl">
                Descubre las últimas noticias de toda la plataforma. Explora contenido independiente y noticias
                colaborativas de diferentes comunidades.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-sm text-slate-600">Noticias publicadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-sm font-medium text-slate-600">Total Noticias</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.conComunidad}</p>
                <p className="text-sm font-medium text-slate-600">Con Comunidad</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.sinComunidad}</p>
                <p className="text-sm font-medium text-slate-600">Independientes</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalLikes}</p>
                <p className="text-sm font-medium text-slate-600">Total Likes</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col space-y-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar noticias por título, contenido, autor o comunidad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-slate-600" />
                  <label className="text-sm font-medium text-slate-700">Tipo:</label>
                  <select
                    value={filtroTipo}
                    onChange={(e) => {
                      setFiltroTipo(e.target.value)
                      if (e.target.value === "sin-comunidad") {
                        setFiltroComunidad("todas")
                      }
                    }}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="todas">Todas las noticias</option>
                    <option value="con-comunidad">Con comunidad</option>
                    <option value="sin-comunidad">Independientes</option>
                  </select>
                </div>

                {filtroTipo !== "sin-comunidad" && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-slate-600" />
                    <label className="text-sm font-medium text-slate-700">Comunidad:</label>
                    <select
                      value={filtroComunidad}
                      onChange={(e) => setFiltroComunidad(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      disabled={filtroTipo === "sin-comunidad"}
                    >
                      <option value="todas">Todas las comunidades</option>
                      {comunidades.map((comunidad) => (
                        <option key={comunidad._id} value={comunidad._id}>
                          {comunidad.titulo}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-slate-600" />
                <label className="text-sm font-medium text-slate-700">Ordenar por:</label>
                <select
                  value={ordenamiento}
                  onChange={(e) => setOrdenamiento(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="recientes">Más recientes</option>
                  <option value="antiguos">Más antiguos</option>
                  <option value="populares">Más populares</option>
                  <option value="comentarios">Más comentados</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Noticias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {noticiasFiltradas.map((noticia) => (
            <article
              key={noticia._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-slate-200 group"
            >
              <div className="p-6">
                {/* Header de la noticia */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {noticia.autor?.nombre?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{noticia.autor?.nombre || "Autor"}</p>
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatearFecha(noticia.fechaCreacion)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {noticia.comunidad ? (
                      <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">{noticia.comunidad.titulo}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
                        <Globe className="h-3 w-3" />
                        <span className="font-medium">Independiente</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Título y contenido */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {noticia.titulo}
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{noticia.contenido}</p>
                </div>

                {/* Imagen si existe */}
                {noticia.imagen && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={noticia.imagen || "/placeholder.svg"}
                      alt={noticia.titulo}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => darLike(noticia._id)}
                      className="flex items-center space-x-1 text-slate-500 hover:text-red-500 transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{noticia.likes?.length || 0}</span>
                    </button>
                    <div className="flex items-center space-x-1 text-slate-500">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{noticia.comentarios?.length || 0}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => verDetalleNoticia(noticia)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Leer más</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Estado vacío */}
        {noticiasFiltradas.length === 0 && !cargando && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {busqueda || filtroTipo !== "todas" || filtroComunidad !== "todas"
                  ? "No se encontraron noticias"
                  : "Aún no hay noticias"}
              </h3>
              <p className="text-slate-600 mb-6">
                {busqueda || filtroTipo !== "todas" || filtroComunidad !== "todas"
                  ? "Intenta con otros términos de búsqueda o ajusta los filtros"
                  : "Las noticias aparecerán aquí cuando los usuarios las publiquen"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detalle de Noticia */}
      {mostrarModalDetalle && noticiaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header del Modal */}
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold line-clamp-1">{noticiaSeleccionada.titulo}</h2>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white bg-opacity-20 rounded-full">
                        <User className="h-3 w-3 mr-1" />
                        {noticiaSeleccionada.autor?.nombre || "Autor"}
                      </span>
                      {noticiaSeleccionada.comunidad ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white bg-opacity-20 rounded-full">
                          <Users className="h-3 w-3 mr-1" />
                          {noticiaSeleccionada.comunidad.titulo}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white bg-opacity-20 rounded-full">
                          <Globe className="h-3 w-3 mr-1" />
                          Independiente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarModalDetalle(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Información de la comunidad */}
              {noticiaSeleccionada.comunidad && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">
                          Publicado en: {noticiaSeleccionada.comunidad.titulo}
                        </h3>
                        <p className="text-sm text-blue-700">{noticiaSeleccionada.comunidad.descripcion}</p>
                      </div>
                    </div>
                    <Link
                      to={`/comunidades/${noticiaSeleccionada.comunidad._id}/noticias`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Ver comunidad
                    </Link>
                  </div>
                </div>
              )}

              {/* Imagen si existe */}
              {noticiaSeleccionada.imagen && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img
                    src={noticiaSeleccionada.imagen || "/placeholder.svg"}
                    alt={noticiaSeleccionada.titulo}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Contenido */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatearFecha(noticiaSeleccionada.fechaCreacion)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Tag className="h-4 w-4" />
                      <span>{noticiaSeleccionada.categoria || "General"}</span>
                    </div>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{noticiaSeleccionada.contenido}</p>
                </div>
              </div>

              {/* Estadísticas y acciones */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => darLike(noticiaSeleccionada._id)}
                    className="flex items-center space-x-2 text-slate-600 hover:text-red-500 transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    <span>{noticiaSeleccionada.likes?.length || 0} likes</span>
                  </button>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <MessageCircle className="h-5 w-5" />
                    <span>{noticiaSeleccionada.comentarios?.length || 0} comentarios</span>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarModalDetalle(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
