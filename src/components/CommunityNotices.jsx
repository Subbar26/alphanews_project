"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, Link } from "react-router-dom"
import {
    ArrowLeft,
    Plus,
    Search,
    Calendar,
    User,
    Eye,
    Heart,
    MessageCircle,
    TrendingUp,
    Clock,
    Users,
    BookOpen,
    X,
    AlertTriangle,
    FileText,
    Save,
    Globe,
    Lock,
    Sparkles,
    Edit3,
    Trash2,
} from "lucide-react"
import { AuthContext } from "../contexts/AuthContext"
import axios from "axios"

export default function CommunityNotices() {
    const { communityId } = useParams()
    const { token, user } = useContext(AuthContext)
    const [comunidad, setComunidad] = useState(null)
    const [noticias, setNoticias] = useState([])
    const [noticiasFiltradas, setNoticiasFiltradas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState("")
    const [busqueda, setBusqueda] = useState("")
    const [ordenamiento, setOrdenamiento] = useState("recientes")
    const [mostrarModalCrear, setMostrarModalCrear] = useState(false)
    const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false)
    const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null)

    // Estado para crear noticia - CAMPOS ACTUALIZADOS
    const [formNoticia, setFormNoticia] = useState({
        titulo: "",
        descripcion: "",
        texto: "",
    })

    // Agregar estos estados para manejar edición y eliminación
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
    const [noticiaEditando, setNoticiaEditando] = useState({
        titulo: "",
        descripcion: "",
        texto: "",
    })
    const [cargandoDetalle, setCargandoDetalle] = useState(false)

    // URL base de tu API
    const BASE = "http://localhost:5100"
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    useEffect(() => {
        if (communityId) {
            cargarComunidad()
            cargarNoticiasComunidad()
        }
    }, [communityId])

    useEffect(() => {
        filtrarNoticias()
    }, [noticias, busqueda, ordenamiento])

    const filtrarNoticias = () => {
        let filtradas = [...noticias]

        // Filtrar por búsqueda
        if (busqueda.trim()) {
            const b = busqueda.toLowerCase()
            filtradas = filtradas.filter(
                (n) =>
                    n.titulo.toLowerCase().includes(b) ||
                    n.descripcion?.toLowerCase().includes(b) ||
                    n.texto?.toLowerCase().includes(b) ||
                    n.autor?.username.toLowerCase().includes(b),
            )
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

    async function cargarComunidad() {
        try {
            const resp = await axios.get(`${BASE}/comunidades/${communityId}`, { headers })
            setComunidad(resp.data)
        } catch (err) {
            setError(err.response?.data?.error || "Error al cargar la comunidad")
        }
    }

    async function cargarNoticiasComunidad() {
        try {
            setCargando(true);
            const { data } = await axios.get(`${BASE}/comunidades/${communityId}/noticias`, { headers });
            const noticiasConUsername = await Promise.all(
                data.map(async (n) => {
                    const { data: user } = await axios.get(`${BASE}/usuarios/${n.autor}`, { headers });
                    // reconstruimos cada noticia para que autor sea { username: ... }
                    return {
                        ...n,
                        autor: {
                            _id: n.autor,
                            username: user.username
                        }
                    };
                })
            );
            setNoticias(noticiasConUsername);
        } catch (err) {
            setError(err.response?.data?.error || "Error al cargar noticias de la comunidad");
        } finally {
            setCargando(false);
        }
    }

    const crearNoticia = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                ...formNoticia,
                autor: user.id,
                comunidad: communityId,
            }
            const { data } = await axios.post(`${BASE}/noticias`, payload, { headers })
            setNoticias((prev) => [data, ...prev])
            setMostrarModalCrear(false)
            setFormNoticia({ titulo: "", descripcion: "", texto: "" })
        } catch (err) {
            setError(err.response?.data?.error || "Error al crear noticia")
        }
    }

    // Agregar esta función para cargar detalle de noticia por ID
    // Dentro de tu componente:
    const cargarDetalleNoticia = async (noticiaId) => {
        try {
            setCargandoDetalle(true);

            // 1) Traigo la noticia
            const { data: noticia } = await axios.get(
                `${BASE}/noticias/${noticiaId}`,
                { headers }
            );

            // 2) Extraigo el ID del autor, sea string u objeto
            const authorId = typeof noticia.autor === "object"
                ? noticia.autor._id
                : noticia.autor;

            // 3) Pido al endpoint de usuario
            const { data: autorData } = await axios.get(
                `${BASE}/usuarios/${authorId}`,
                { headers }
            );

            // 4) Reescribo noticia.autor para que solo tenga el username
            noticia.autor = {
                _id: authorId,
                username: autorData.username
            };

            // 5) Actualizo el state
            setNoticiaSeleccionada(noticia);

        } catch (err) {
            setError(err.response?.data?.error || "Error al cargar detalle de la noticia");
        } finally {
            setCargandoDetalle(false);
        }
    };

    // Función verDetalleNoticia SIN console.log
    const verDetalleNoticia = (noticia) => {
        // Muestra el modal mientras carga
        setNoticiaSeleccionada(noticia);
        setMostrarModalDetalle(true);
        cargarDetalleNoticia(noticia._id);
    };

    // Agregar función para editar noticia
    const editarNoticia = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                ...noticiaEditando,
            }
            const { data } = await axios.put(`${BASE}/noticias/${noticiaSeleccionada._id}`, payload, { headers })
            setNoticias((prev) => prev.map((n) => (n._id === data._id ? data : n)))
            setNoticiaSeleccionada(data)
            setMostrarModalEditar(false)
        } catch (err) {
            setError(err.response?.data?.error || "Error al editar la noticia")
        }
    }

    // Agregar función para eliminar noticia
    const eliminarNoticia = async () => {
        try {
            await axios.delete(`${BASE}/noticias/${noticiaSeleccionada._id}`, { headers })
            setNoticias((prev) => prev.filter((n) => n._id !== noticiaSeleccionada._id))
            setMostrarModalDetalle(false)
            setMostrarModalEliminar(false)
            setNoticiaSeleccionada(null)
        } catch (err) {
            setError(err.response?.data?.error || "Error al eliminar la noticia")
        }
    }

    // Agregar función para abrir modal de edición
    const abrirModalEditar = () => {
        setNoticiaEditando({
            titulo: noticiaSeleccionada.titulo,
            descripcion: noticiaSeleccionada.descripcion || "",
            texto: noticiaSeleccionada.texto || "",
        })
        setMostrarModalEditar(true)
    }

    // Agregar función para abrir modal de eliminación
    const abrirModalEliminar = () => {
        setMostrarModalEliminar(true)
    }

    // Función para verificar si el usuario es autor de la noticia
    const esAutor = (noticia) => {
        return noticia && user && (noticia.autor?._id === user.id || noticia.autor === user.id)
    }

    const esPropietario = () => comunidad && user && comunidad.propietario === user.id
    const esMiembro = () =>
        comunidad && user && (comunidad.propietario === user.id || comunidad.miembros?.includes(user.id))

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

    const getEstadisticas = () => {
        const total = noticias.length
        const totalLikes = noticias.reduce((acc, n) => acc + (n.likes?.length || 0), 0)
        const totalComentarios = noticias.reduce((acc, n) => acc + (n.comentarios?.length || 0), 0)
        const autoresUnicos = new Set(noticias.map((n) => n.autor?._id)).size

        return { total, totalLikes, totalComentarios, autoresUnicos }
    }

    const stats = getEstadisticas()

    if (cargando) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                                    <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
                                    <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!comunidad) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-12 w-12 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Comunidad no encontrada</h3>
                        <p className="text-slate-600 mb-6">La comunidad que buscas no existe o no tienes acceso a ella.</p>
                        <Link
                            to="/comunidades"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a Mis Comunidades
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Mejorado */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-6">
                        <Link
                            to="/comunidades"
                            className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Volver a Mis Comunidades
                        </Link>
                    </div>

                    {/* Card de Comunidad Mejorada */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                        {/* Header con gradiente */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <Users className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h1 className="text-3xl font-bold">{comunidad.titulo}</h1>
                                            {comunidad.esPrivada ? (
                                                <Lock className="h-5 w-5 text-white opacity-80" />
                                            ) : (
                                                <Globe className="h-5 w-5 text-white opacity-80" />
                                            )}
                                        </div>
                                        <p className="text-blue-100 mb-2 max-w-2xl">{comunidad.descripcion}</p>
                                        <div className="flex items-center space-x-4 text-sm text-blue-100">
                                            <span className="flex items-center space-x-1">
                                                <Users className="h-4 w-4" />
                                                <span>{comunidad.miembros?.length || 0} miembros</span>
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center space-x-1">
                                                <BookOpen className="h-4 w-4" />
                                                <span>{stats.total} noticias</span>
                                            </span>
                                            <span>•</span>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${esPropietario()
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : esMiembro()
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {esPropietario() ? "Propietario" : esMiembro() ? "Miembro" : "Visitante"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {esPropietario() && (
                                    <button
                                        onClick={() => setMostrarModalCrear(true)}
                                        className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                                    >
                                        <Plus className="h-5 w-5 mr-2" />
                                        Crear Noticia
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message Mejorado */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 rounded-xl p-4 flex items-start space-x-3 shadow-sm">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                        <button
                            onClick={() => setError("")}
                            className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Estadísticas Mejoradas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                                    {stats.total}
                                </p>
                                <p className="text-sm font-medium text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                                    Noticias Publicadas
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300">
                                <BookOpen className="h-6 w-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors duration-300">
                                    {stats.autoresUnicos}
                                </p>
                                <p className="text-sm font-medium text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                                    Autores Activos
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 group-hover:scale-110 transition-all duration-300">
                                <User className="h-6 w-6 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors duration-300">
                                    {stats.totalLikes}
                                </p>
                                <p className="text-sm font-medium text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                                    Total Likes
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-300">
                                <Heart className="h-6 w-6 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors duration-300">
                                    {stats.totalComentarios}
                                </p>
                                <p className="text-sm font-medium text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                                    Total Comentarios
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 group-hover:scale-110 transition-all duration-300">
                                <MessageCircle className="h-6 w-6 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros y Búsqueda Mejorados */}
                <div className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar noticias por título, descripción, contenido o autor..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
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

                {/* Grid de Noticias Mejorado */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {noticiasFiltradas.map((noticia) => (
                        <article
                            key={noticia._id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 group hover:border-blue-200"
                        >
                            <div className="p-6">
                                {/* Header de la noticia */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                            {noticia.autor?.username?.charAt(0)?.toUpperCase() || "A"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{noticia.autor?.username || "Autor"}</p>
                                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatearFecha(noticia.fechaCreacion)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                                        <Sparkles className="h-3 w-3" />
                                        <span className="font-medium">Noticia</span>
                                    </div>
                                </div>

                                {/* Título y descripción */}
                                <div className="mb-4">
                                    <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {noticia.titulo}
                                    </h2>
                                    {noticia.descripcion && (
                                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-2">{noticia.descripcion}</p>
                                    )}
                                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{noticia.texto}</p>
                                </div>

                                {/* Acciones */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex items-center space-x-4">
                                    </div>
                                    <button
                                        onClick={() => verDetalleNoticia(noticia)}
                                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span>Leer más</span>
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Estado vacío Mejorado */}
                {noticiasFiltradas.length === 0 && !cargando && (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="h-12 w-12 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                {busqueda ? "No se encontraron noticias" : "Aún no hay noticias en esta comunidad"}
                            </h3>
                            <p className="text-slate-600 mb-6">
                                {busqueda
                                    ? "Intenta con otros términos de búsqueda"
                                    : esPropietario()
                                        ? "Crea la primera noticia para esta comunidad y comienza a compartir información valiosa"
                                        : "Las noticias aparecerán aquí cuando se publiquen"}
                            </p>
                            {!busqueda && esPropietario() && (
                                <button
                                    onClick={() => setMostrarModalCrear(true)}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Crear Primera Noticia
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Crear Noticia */}
            {mostrarModalCrear && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header del Modal */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Crear Nueva Noticia</h2>
                                        <p className="text-blue-100 text-sm">Comparte información valiosa con tu comunidad</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMostrarModalCrear(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <form onSubmit={crearNoticia} className="space-y-6">
                                {/* Título */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Título de la Noticia
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formNoticia.titulo}
                                        onChange={(e) => setFormNoticia({ ...formNoticia, titulo: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-medium"
                                        placeholder="Ej: Nuevos desarrollos en inteligencia artificial..."
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Un título claro y atractivo para tu noticia</p>
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Descripción Breve
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formNoticia.descripcion}
                                        onChange={(e) => setFormNoticia({ ...formNoticia, descripcion: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Un resumen breve que capture la esencia de tu noticia..."
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Máximo 200 caracteres para el resumen</p>
                                </div>

                                {/* Texto Principal */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Contenido Principal
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={10}
                                        value={formNoticia.texto}
                                        onChange={(e) => setFormNoticia({ ...formNoticia, texto: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Escribe aquí el contenido completo de tu noticia..."
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        El contenido principal de tu noticia con todos los detalles
                                    </p>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex space-x-3 pt-6 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setMostrarModalCrear(false)}
                                        className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center font-medium shadow-lg hover:shadow-xl"
                                    >
                                        <Save className="h-5 w-5 mr-2" />
                                        Publicar Noticia
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalle de Noticia - DISEÑO MEJORADO CON BOTONES EN LA PARTE INFERIOR */}
            {mostrarModalDetalle && noticiaSeleccionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Header Limpio */}
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                        <BookOpen className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Detalle de Noticia</h2>
                                        <p className="text-sm text-slate-500">{comunidad.titulo}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMostrarModalDetalle(false)}
                                    className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Contenido Scrolleable */}
                        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                            {cargandoDetalle ? (
                                <div className="flex justify-center items-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : (
                                <div className="p-8">
                                    {/* Información del Autor */}
                                    <div className="flex items-center space-x-4 mb-6 p-4 bg-slate-50 rounded-xl">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                                            {noticiaSeleccionada.autor?.username?.charAt(0)?.toUpperCase() || "A"}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900">{noticiaSeleccionada.autor?.username || "Autor"}</p>
                                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatearFecha(noticiaSeleccionada.fechaCreacion)}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Heart className="h-4 w-4" />
                                                    <span>{noticiaSeleccionada.likes?.length || 0} likes</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span>{noticiaSeleccionada.comentarios?.length || 0} comentarios</span>
                                                </div>
                                            </div>
                                        </div>
                                        {esAutor(noticiaSeleccionada) && (
                                            <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                                                Tu artículo
                                            </div>
                                        )}
                                    </div>

                                    {/* Título */}
                                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                                        {noticiaSeleccionada.titulo}
                                    </h1>

                                    {/* Descripción Destacada */}
                                    {noticiaSeleccionada.descripcion && (
                                        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-xl">
                                            <p className="text-lg text-slate-700 italic leading-relaxed font-medium">
                                                {noticiaSeleccionada.descripcion}
                                            </p>
                                        </div>
                                    )}

                                    {/* Contenido Principal */}
                                    <div className="prose prose-lg max-w-none">
                                        <div className="text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
                                            {noticiaSeleccionada.texto}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer con Botones de Acción */}
                        <div className="border-t border-slate-200 bg-slate-50 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2 px-4 py-2 text-slate-600">
                                    </div>
                                </div>

                                {/* Botones de Autor */}
                                {esAutor(noticiaSeleccionada) && (
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={abrirModalEditar}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-lg hover:bg-blue-200 transition-colors"
                                        >
                                            <Edit3 className="h-4 w-4 mr-2" />
                                            Editar
                                        </button>
                                        <button
                                            onClick={abrirModalEliminar}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Noticia */}
            {mostrarModalEditar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header del Modal */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                        <Edit3 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Editar Noticia</h2>
                                        <p className="text-blue-100 text-sm">Actualiza la información de tu noticia</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMostrarModalEditar(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <form onSubmit={editarNoticia} className="space-y-6">
                                {/* Título */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Título de la Noticia
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={noticiaEditando.titulo}
                                        onChange={(e) => setNoticiaEditando({ ...noticiaEditando, titulo: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-medium"
                                        placeholder="Título de la noticia"
                                    />
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Descripción Breve
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={noticiaEditando.descripcion}
                                        onChange={(e) => setNoticiaEditando({ ...noticiaEditando, descripcion: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Un resumen breve que capture la esencia de tu noticia..."
                                    />
                                </div>

                                {/* Texto Principal */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Contenido Principal
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={10}
                                        value={noticiaEditando.texto}
                                        onChange={(e) => setNoticiaEditando({ ...noticiaEditando, texto: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Contenido completo de la noticia..."
                                    />
                                </div>

                                {/* Botones de acción */}
                                <div className="flex space-x-3 pt-6 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setMostrarModalEditar(false)}
                                        className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center font-medium shadow-lg hover:shadow-xl"
                                    >
                                        <Save className="h-5 w-5 mr-2" />
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Eliminar Noticia */}
            {mostrarModalEliminar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-slate-900">Eliminar Noticia</h2>
                                <button
                                    onClick={() => setMostrarModalEliminar(false)}
                                    className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <p className="text-center text-slate-600 mb-2">¿Estás seguro de que quieres eliminar la noticia</p>
                                <p className="text-center font-semibold text-slate-900 mb-4">"{noticiaSeleccionada?.titulo}"?</p>
                                <p className="text-center text-sm text-red-600">
                                    Esta acción no se puede deshacer. Se eliminará permanentemente la noticia.
                                </p>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setMostrarModalEliminar(false)}
                                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={eliminarNoticia}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
