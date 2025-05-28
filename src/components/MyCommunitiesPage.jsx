"use client"

import { useState, useEffect, useContext } from "react"
import { Users, Plus, Search, Calendar, MessageCircle, Eye, X, Edit3, Trash2, Settings, TrendingUp, Globe, Lock, MoreVertical, AlertTriangle } from 'lucide-react'
import { AuthContext } from "../contexts/AuthContext"
import axios from "axios"
import { Link } from "react-router-dom"

export default function MyCommunitiesPage() {
    const { user, token } = useContext(AuthContext)
    const [comunidades, setComunidades] = useState([])
    const [comunidadesFiltradas, setComunidadesFiltradas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState("")
    const [busqueda, setBusqueda] = useState("")
    const [mostrarModalCrear, setMostrarModalCrear] = useState(false)
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
    const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false)
    const [comunidadSeleccionada, setComunidadSeleccionada] = useState(null)
    const [ordenamiento, setOrdenamiento] = useState("recientes")

    // Estado para crear/editar comunidad
    const [formComunidad, setFormComunidad] = useState({
        titulo: "",
        descripcion: "",
        esPrivada: false,
    })

    // URL base de tu API
    const BASE = "http://localhost:5100"
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    useEffect(() => {
        if (!user?.id) return
        cargarMisComunidades()
    }, [user])

    useEffect(() => {
        filtrarComunidades()
    }, [comunidades, busqueda, ordenamiento])

    const filtrarComunidades = () => {
        let filtradas = [...comunidades]

        // Filtrar por búsqueda
        if (busqueda.trim()) {
            const b = busqueda.toLowerCase()
            filtradas = filtradas.filter((c) => c.titulo.toLowerCase().includes(b) || c.descripcion.toLowerCase().includes(b))
        }

        // Ordenar
        switch (ordenamiento) {
            case "recientes":
                filtradas.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
                break
            case "antiguos":
                filtradas.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion))
                break
            case "miembros":
                filtradas.sort((a, b) => (b.miembros?.length || 0) - (a.miembros?.length || 0))
                break
            case "noticias":
                filtradas.sort((a, b) => (b.noticias?.length || 0) - (a.noticias?.length || 0))
                break
            default:
                break
        }

        setComunidadesFiltradas(filtradas)
    }

    async function cargarMisComunidades() {
        try {
            setCargando(true)
            const { data } = await axios.get(`${BASE}/comunidades/${user.id}/comunidades`, { headers })
            setComunidades(data)
        } catch (err) {
            setError(err.response?.data?.error || "Error al cargar tus comunidades")
        } finally {
            setCargando(false)
        }
    }

    // Inserta este useEffect tras el que recarga al cerrar el modal de detalles
    useEffect(() => {
        if (mostrarModalDetalles === false && comunidadSeleccionada !== null) {
            cargarMisComunidades()
        }
    }, [mostrarModalDetalles])

    // *** NUEVO: sincroniza comunidadSeleccionada cuando cambie la lista completa ***
    useEffect(() => {
        if (!comunidadSeleccionada) return
        const actualizada = comunidades.find(c => c._id === comunidadSeleccionada._id)
        if (actualizada) {
            setComunidadSeleccionada(actualizada)
        }
    }, [comunidades])


    const crearComunidad = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                ...formComunidad,
                propietario: user.id,
            }
            const { data } = await axios.post(`${BASE}/comunidades/create`, payload, { headers })
            setComunidades((prev) => [...prev, data])
            setMostrarModalCrear(false)
            setFormComunidad({ titulo: "", descripcion: "", esPrivada: false })
        } catch (err) {
            setError(err.response?.data?.error || "Error al crear comunidad")
        }
    }

    const editarComunidad = async (e) => {
        e.preventDefault()
        try {
            const { data } = await axios.put(`${BASE}/comunidades/${comunidadSeleccionada._id}`, formComunidad, { headers })
            setComunidades((prev) => prev.map((c) => (c._id === comunidadSeleccionada._id ? data : c)))
            setMostrarModalEditar(false)
            setComunidadSeleccionada(null)
            setFormComunidad({ titulo: "", descripcion: "", esPrivada: false })
        } catch (err) {
            setError(err.response?.data?.error || "Error al editar comunidad")
        }
    }

    const eliminarComunidad = async () => {
        try {
            await axios.delete(`${BASE}/comunidades/${comunidadSeleccionada._id}`, { headers })
            setComunidades((prev) => prev.filter((c) => c._id !== comunidadSeleccionada._id))
            setMostrarModalEliminar(false)
            setComunidadSeleccionada(null)
        } catch (err) {
            setError(err.response?.data?.error || "Error al eliminar comunidad")
        }
    }

    const abrirModalEditar = (comunidad) => {
        setComunidadSeleccionada(comunidad)
        setFormComunidad({
            titulo: comunidad.titulo,
            descripcion: comunidad.descripcion,
            esPrivada: comunidad.esPrivada || false,
        })
        setMostrarModalEditar(true)
    }

    const abrirModalEliminar = (comunidad) => {
        setComunidadSeleccionada(comunidad)
        setMostrarModalEliminar(true)
    }

    const verDetallesComunidad = async (comunidad) => {
        try {
            const { data: fresh } = await axios.get(
                `${BASE}/comunidades/${comunidad._id}`,
                { headers }
            )
            setComunidades(prev => prev.map(c => (c._id === fresh._id ? fresh : c)))
            setComunidadSeleccionada(fresh)
            setMostrarModalDetalles(true)
        } catch (err) {
            setError(err.response?.data?.error || "Error al cargar detalles de la comunidad")
        }
    }


    const esPropietario = (comunidad) => comunidad.propietario === user?.id

    const getEstadisticas = () => {
        const total = comunidades.length
        const propietario = comunidades.filter((c) => esPropietario(c)).length
        const miembro = total - propietario
        const totalMiembros = comunidades.reduce((acc, c) => acc + (c.miembros?.length || 0), 0)
        const totalNoticias = comunidades.reduce((acc, c) => acc + (c.noticias?.length || 0), 0)

        return { total, propietario, miembro, totalMiembros, totalNoticias }
    }

    const stats = getEstadisticas()

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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                                    <div className="flex space-x-2">
                                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                                        <div className="h-8 bg-gray-200 rounded w-8"></div>
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
                                Mis Comunidades
                            </h1>
                            <p className="text-lg text-slate-600 max-w-2xl">
                                Gestiona y colabora en comunidades de noticias. Crea espacios para compartir información y conectar con
                                otros periodistas.
                            </p>
                        </div>
                        <button
                            onClick={() => setMostrarModalCrear(true)}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Nueva Comunidad
                        </button>
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
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">{stats.total}</p>
                                <p className="text-sm font-medium text-slate-600 group-hover:text-slate-700 transition-colors duration-300">Total Comunidades</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300">
                                <Users className="h-6 w-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors duration-300">{stats.propietario}</p>
                                <p className="text-sm font-medium text-slate-600 group-hover:text-slate-700 transition-colors duration-300">Como Propietario</p>
                            </div>
                            <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 group-hover:scale-110 transition-all duration-300">
                                <Settings className="h-6 w-6 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors duration-300">{stats.totalMiembros}</p>
                                <p className="text-sm font-medium text-slate-600 group-hover:text-slate-700 transition-colors duration-300">Total Miembros</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-300">
                                <TrendingUp className="h-6 w-6 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Búsqueda y Ordenamiento */}
                <div className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar comunidades por nombre o descripción..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-slate-700">Ordenar por:</label>
                            <select
                                value={ordenamiento}
                                onChange={(e) => setOrdenamiento(e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                                <option value="recientes">Más recientes</option>
                                <option value="antiguos">Más antiguos</option>
                                <option value="miembros">Más miembros</option>
                                <option value="noticias">Más noticias</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Grid de Comunidades */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {comunidadesFiltradas.map((comunidad) => (
                        <div
                            key={comunidad._id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-slate-200 group"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {comunidad.titulo}
                                            </h3>
                                            {comunidad.esPrivada && <Lock className="h-4 w-4 text-slate-400" />}
                                            {!comunidad.esPrivada && <Globe className="h-4 w-4 text-slate-400" />}
                                        </div>
                                        <span
                                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${esPropietario(comunidad)
                                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                }`}
                                        >
                                            {esPropietario(comunidad) ? "Propietario" : "Miembro"}
                                        </span>
                                    </div>

                                    {esPropietario(comunidad) && (
                                        <div className="relative">
                                            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">{comunidad.descripcion}</p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Users className="h-4 w-4 mr-2 text-slate-400" />
                                        <span>{comunidad.miembros?.length || 0} miembros</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-500">
                                        <MessageCircle className="h-4 w-4 mr-2 text-slate-400" />
                                        <span>{comunidad.noticias?.length || 0} noticias publicadas</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                                        <span>
                                            Creada{" "}
                                            {new Date(comunidad.fechaCreacion).toLocaleDateString("es-ES", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => verDetallesComunidad(comunidad)}
                                        className="flex-1 px-3 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        Ver Detalles
                                    </button>

                                    {esPropietario(comunidad) && (
                                        <>
                                            <button
                                                onClick={() => abrirModalEditar(comunidad)}
                                                className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => abrirModalEliminar(comunidad)}
                                                className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Estado vacío */}
                {comunidadesFiltradas.length === 0 && !cargando && (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="h-12 w-12 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                {busqueda ? "No se encontraron comunidades" : "Aún no tienes comunidades"}
                            </h3>
                            <p className="text-slate-600 mb-6">
                                {busqueda
                                    ? "Intenta con otros términos de búsqueda o ajusta los filtros"
                                    : "Crea tu primera comunidad para empezar a colaborar con otros periodistas"}
                            </p>
                            {!busqueda && (
                                <button
                                    onClick={() => setMostrarModalCrear(true)}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Crear Mi Primera Comunidad
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Crear Comunidad */}
            {mostrarModalCrear && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-semibold text-slate-900">Crear Nueva Comunidad</h2>
                                <button
                                    onClick={() => setMostrarModalCrear(false)}
                                    className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={crearComunidad} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre de la Comunidad</label>
                                    <input
                                        type="text"
                                        required
                                        value={formComunidad.titulo}
                                        onChange={(e) => setFormComunidad({ ...formComunidad, titulo: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Ej: Periodistas de Tecnología"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formComunidad.descripcion}
                                        onChange={(e) => setFormComunidad({ ...formComunidad, descripcion: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Describe el propósito y objetivos de tu comunidad..."
                                    />
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setMostrarModalCrear(false)}
                                        className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                                    >
                                        Crear Comunidad
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Comunidad */}
            {mostrarModalEditar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-semibold text-slate-900">Editar Comunidad</h2>
                                <button
                                    onClick={() => setMostrarModalEditar(false)}
                                    className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={editarComunidad} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre de la Comunidad</label>
                                    <input
                                        type="text"
                                        required
                                        value={formComunidad.titulo}
                                        onChange={(e) => setFormComunidad({ ...formComunidad, titulo: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formComunidad.descripcion}
                                        onChange={(e) => setFormComunidad({ ...formComunidad, descripcion: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    />
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setMostrarModalEditar(false)}
                                        className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Eliminar Comunidad */}
            {mostrarModalEliminar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-slate-900">Eliminar Comunidad</h2>
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
                                <p className="text-center text-slate-600 mb-2">¿Estás seguro de que quieres eliminar la comunidad</p>
                                <p className="text-center font-semibold text-slate-900 mb-4">"{comunidadSeleccionada?.titulo}"?</p>
                                <p className="text-center text-sm text-red-600">
                                    Esta acción no se puede deshacer. Se eliminarán todos los datos asociados.
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
                                    onClick={eliminarComunidad}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalles Comunidad */}
            {mostrarModalDetalles && comunidadSeleccionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header del Modal */}
                        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{comunidadSeleccionada.titulo}</h2>
                                        <div className="flex items-center space-x-3 mt-1">
                                            {comunidadSeleccionada.esPrivada ? (
                                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white bg-opacity-20 rounded-full">
                                                    <Lock className="h-3 w-3 mr-1" />
                                                    Privada
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white bg-opacity-20 rounded-full">
                                                    <Globe className="h-3 w-3 mr-1" />
                                                    Pública
                                                </span>
                                            )}
                                            <span
                                                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${esPropietario(comunidadSeleccionada)
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-green-100 text-green-800"
                                                    }`}
                                            >
                                                {esPropietario(comunidadSeleccionada) ? "Propietario" : "Miembro"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMostrarModalDetalles(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Descripción */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                    <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                                    Descripción
                                </h3>
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-slate-700 leading-relaxed">{comunidadSeleccionada.descripcion}</p>
                                </div>
                            </div>

                            {/* Estadísticas Principales */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-700 group-hover:scale-110 transition-all duration-300">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <p className="text-2xl font-bold text-blue-900 group-hover:text-blue-800 transition-colors duration-300">{comunidadSeleccionada.miembros?.length || 0}</p>
                                    <p className="text-sm text-blue-700 group-hover:text-blue-600 transition-colors duration-300">Miembros</p>
                                </div>

                                <Link
                                    to={`/comunidades/${comunidadSeleccionada._id}/noticias`}
                                    className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative"
                                    title={esPropietario(comunidadSeleccionada) ? "Haz clic para ver y crear noticias" : "Haz clic para ver las noticias"}
                                >
                                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-emerald-700 group-hover:scale-110 transition-all duration-300">
                                        <MessageCircle className="h-5 w-5 text-white" />
                                    </div>
                                    <p className="text-sm text-emerald-700 group-hover:text-emerald-600 transition-colors duration-300">
                                        {esPropietario(comunidadSeleccionada) ? "Noticias - Crear" : "Noticias"}
                                    </p>
                                    {esPropietario(comunidadSeleccionada) && (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <Plus className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                </Link>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-700 group-hover:scale-110 transition-all duration-300">
                                        <Calendar className="h-5 w-5 text-white" />
                                    </div>
                                    <p className="text-sm font-bold text-purple-900 group-hover:text-purple-800 transition-colors duration-300">
                                        {new Date(comunidadSeleccionada.fechaCreacion).toLocaleDateString("es-ES", {
                                            day: "2-digit",
                                            month: "short",
                                        })}
                                    </p>
                                    <p className="text-sm text-purple-700 group-hover:text-purple-600 transition-colors duration-300">Creada</p>
                                </div>

                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-orange-700 group-hover:scale-110 transition-all duration-300">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                    <p className="text-sm font-bold text-orange-900 group-hover:text-orange-800 transition-colors duration-300">Activa</p>
                                    <p className="text-sm text-orange-700 group-hover:text-orange-600 transition-colors duration-300">Estado</p>
                                </div>
                            </div>

                            {/* Información Detallada */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white border border-slate-200 rounded-xl p-6">
                                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                                        <Settings className="h-5 w-5 mr-2 text-slate-600" />
                                        Configuración
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                            <span className="text-sm text-slate-600">Tipo de comunidad</span>
                                            <span className="text-sm font-medium text-slate-900">
                                                {comunidadSeleccionada.esPrivada ? "Privada" : "Pública"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                            <span className="text-sm text-slate-600">Tu rol</span>
                                            <span className="text-sm font-medium text-slate-900">
                                                {esPropietario(comunidadSeleccionada) ? "Propietario" : "Miembro"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-sm text-slate-600">Fecha de creación</span>
                                            <span className="text-sm font-medium text-slate-900">
                                                {new Date(comunidadSeleccionada.fechaCreacion).toLocaleDateString("es-ES", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-xl p-6">
                                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                                        <TrendingUp className="h-5 w-5 mr-2 text-slate-600" />
                                        Actividad Reciente
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3 py-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm text-slate-600">Comunidad activa</span>
                                        </div>
                                        <div className="flex items-center space-x-3 py-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm text-slate-600">
                                                {comunidadSeleccionada.miembros?.length || 0} miembros participando
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
                                <button
                                    onClick={() => setMostrarModalDetalles(false)}
                                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
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
