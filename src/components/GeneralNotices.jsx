"use client"

import { useState, useEffect, useContext, useRef } from "react"
import {
    Search,
    MessageCircle,
    Eye,
    X,
    Edit3,
    Trash2,
    User,
    Heart,
    Share2,
    BookOpen,
    Filter,
    AlertTriangle,
    Clock,
    Send,
    Save,
    Calendar,
    TrendingUp,
    Users,
    Globe,
} from "lucide-react"
import { AuthContext } from "../contexts/AuthContext"
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
    const [cargandoDetalle, setCargandoDetalle] = useState(false)
    const [comentarios, setComentarios] = useState([])
    const [nuevoComentario, setNuevoComentario] = useState("")
    const [comentarioEditando, setComentarioEditando] = useState(null)
    const [textoEditado, setTextoEditado] = useState("")
    const [cargandoComentarios, setCargandoComentarios] = useState(false)
    const [cargandoLike, setCargandoLike] = useState(false)
    const comentarioRef = useRef(null)
    const [textoEditando, setTextoEditando] = useState("")

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
        let filtradas = [...noticias];

        // Filtrar por búsqueda (case-insensitive y sin errores con undefined)
        if (busqueda.trim()) {
            const b = busqueda.trim().toLowerCase();

            filtradas = filtradas.filter((n) => {
                // Todos los campos donde queremos buscar
                const valuesToSearch = [
                    n.titulo,
                    n.descripcion,
                    n.texto || n.contenido,
                    n.autor?.username,
                    n.comunidad?.titulo,
                    n.autor?.nombre
                ];

                // Si alguna de esas cadenas, convertida a minúsculas, incluye el término
                return valuesToSearch.some(val =>
                    (val ?? "").toLowerCase().includes(b)
                );
            });
        }

        if (filtroTipo === "con-comunidad") {
            // Sólo si viene un objeto comunidad con _id y título
            filtradas = filtradas.filter((n) =>
                n.comunidad != null &&
                typeof n.comunidad === "object" &&
                n.comunidad._id &&
                n.comunidad.titulo
            )
        } else if (filtroTipo === "sin-comunidad") {
            filtradas = filtradas.filter((n) =>
                // O bien comunitario viene como null
                n.comunidad == null ||
                // o viene mal formado (sin título)
                !n.comunidad.titulo
            )
        }


        // Filtrar por comunidad específica
        if (filtroComunidad !== "todas" && filtroTipo !== "sin-comunidad") {
            filtradas = filtradas.filter((n) => n.comunidad?._id === filtroComunidad);
        }

        // Ordenar
        switch (ordenamiento) {
            case "recientes":
                filtradas.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
                break;
            case "antiguos":
                filtradas.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion));
                break;
            case "populares":
                filtradas.sort((a, b) => contarLikes(b) - contarLikes(a));
                break;
            case "comentarios":
                filtradas.sort((a, b) => (b.comentarios?.length || 0) - (a.comentarios?.length || 0));
                break;
        }

        setNoticiasFiltradas(filtradas);
    };

    async function cargarNoticias() {
        try {
            setCargando(true)

            // 1) Traemos todas las noticias
            const { data: noticiasRaw } = await axios.get(`${BASE}/noticias`, { headers })

            // 2) Para cada noticia, buscamos:
            //    - los datos del autor (username)
            //    - los datos de la comunidad asociada (titulo y descripcion) — si existe comunidad
            const noticiasEnriquecidas = await Promise.all(
                noticiasRaw.map(async (n) => {
                    // 2a) Autor
                    const { data: autorData } = await axios.get(`${BASE}/usuarios/${n.autor}`, { headers })

                    // 2b) Comunidad (opcional)
                    let comunidad = null
                    if (n.comunidad) {
                        try {
                            const { data: commData } = await axios.get(`${BASE}/comunidades/${n.comunidad}`, { headers })
                            comunidad = {
                                _id: commData._id,
                                titulo: commData.titulo,
                                descripcion: commData.descripcion,
                            }
                        } catch {
                            // Si falla la petición de comunidad, la dejamos en null
                            comunidad = null
                        }
                    }

                    // 3) Devolvemos la noticia "enchulada"
                    return {
                        ...n,
                        autor: {
                            _id: n.autor,
                            username: autorData.username,
                        },
                        comunidad,
                    }
                }),
            )

            // 4) Actualizamos el estado una sola vez
            setNoticias(noticiasEnriquecidas)
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.error || "Error al cargar noticias generales")
        } finally {
            setCargando(false)
        }
    }

    // 1) Cargar detalle de noticia y enriquecer autor/comunidad
    const cargarDetalleNoticia = async (noticiaId) => {
        setCargandoDetalle(true);
        try {
            const { data: noticia } = await axios.get(`${BASE}/noticias/${noticiaId}`, { headers });

            // enriquecemos autor
            const authorId = typeof noticia.autor === 'object'
                ? noticia.autor._id
                : noticia.autor;
            const { data: autorData } = await axios.get(`${BASE}/usuarios/${authorId}`, { headers });
            noticia.autor = { _id: authorId, username: autorData.username };

            // enriquecemos comunidad (igual que antes)…
            if (noticia.comunidad) {
                try {
                    const { data: commData } = await axios.get(
                        `${BASE}/comunidades/${noticia.comunidad}`,
                        { headers }
                    );
                    noticia.comunidad = {
                        _id: commData._id,
                        titulo: commData.titulo,
                        descripcion: commData.descripcion
                    };
                } catch { }
            }

            // asignamos noticiaSeleccionada
            setNoticiaSeleccionada(noticia);

            // 2) Enriquecemos los comentarios del mismo objeto noticia.comentarios
            const comentariosRaw = noticia.comentarios || [];
            const comentariosEnriquecidos = await Promise.all(
                comentariosRaw.map(async c => {
                    try {
                        const { data: u } = await axios.get(
                            `${BASE}/usuarios/${c.usuario}`,
                            { headers }
                        );
                        return { ...c, usuario: { _id: c.usuario, username: u.username } };
                    } catch {
                        return { ...c, usuario: { _id: c.usuario, username: 'desconocido' } };
                    }
                })
            );
            setComentarios(comentariosEnriquecidos);

        } catch (err) {
            console.error(err);
            setError('Error al cargar detalle de la noticia');
        } finally {
            setCargandoDetalle(false);
        }
    };

    const verDetalleNoticia = async (noticia) => {
        // Abrimos el modal
        setMostrarModalDetalle(true)
        // Y cargamos T O D O el detalle por su ID:
        await cargarDetalleNoticia(noticia._id)
    }

    const handleCalificacion = async (noticiaObj, likeValue) => {
        if (!user || !token) {
            setError("Debes iniciar sesión para reaccionar");
            return;
        }
        setCargandoLike(true);
        try {
            // 1) ¿Ya existe una calificación de este usuario?
            const miCalif = getMiCalificacion(noticiaObj)

            let updatedNoticia;
            if (!miCalif) {
                // ➕ Primera vez: POST /noticias/:id/calificaciones
                const { data } = await axios.post(
                    `${BASE}/noticias/${noticiaObj._id}/calificaciones`,
                    { usuario: user.id, like: likeValue ? 1 : 0 },
                    { headers }
                );
                updatedNoticia = data;
            } else if (miCalif.like === likeValue) {
                // ❌ Si hace clic dos veces en el mismo botón, lo borramos: DELETE
                const { data } = await axios.delete(
                    `${BASE}/noticias/${noticiaObj._id}/calificaciones/${user.id}`,
                    { headers }
                );
                updatedNoticia = data.noticia;
            } else {
                // 🔄 Cambio de like a dislike (o viceversa): PUT
                const { data } = await axios.put(
                    `${BASE}/noticias/${noticiaObj._id}/calificaciones/${user.id}`,
                    { like: likeValue ? 1 : 0 },
                    { headers }
                );
                updatedNoticia = data;
            }

            // 🔧 reinyectamos autor y comunidad para no perderlos
            updatedNoticia = {
                ...updatedNoticia,
                autor: noticiaObj.autor,
                comunidad: noticiaObj.comunidad
            }

            // 2) Sustituye la noticia en tu listado y en el modal
            setNoticias((prev) =>
                prev.map((n) =>
                    n._id === updatedNoticia._id ? updatedNoticia : n
                )
            );
            if (noticiaSeleccionada?._id === updatedNoticia._id) {
                setNoticiaSeleccionada(updatedNoticia);
                // recarga también el array de calificaciones
                // (si en tu controlador retorna la noticia, ya lo tienes)
                setComentarios((prev) => prev); // sin tocar los comentarios
            }
        } catch (err) {
            setError(err.response?.data?.error || "Error al reaccionar");
        } finally {
            setCargandoLike(false);
        }
    };


    const agregarComentario = async (e) => {
        e.preventDefault();
        if (!user || !nuevoComentario.trim()) {
            setError("Debes iniciar sesión para comentar");
            return;
        }

        try {

            // el controlador devuelve la noticia YA actualizado
            const { data: noticiaActualizada } = await axios.post(
                `${BASE}/noticias/${noticiaSeleccionada._id}/comentarios`,
                { usuario: user.id, texto: nuevoComentario },
                { headers }
            );


            // en lugar de empujar manualmente, recarga TODO el detalle:
            await cargarDetalleNoticia(noticiaActualizada._id);

            setNuevoComentario("");
        } catch (err) {
            setError(err.response?.data?.error || "Error al agregar comentario");
        }
    };

    const iniciarEdicionComentario = (comentario) => {
        setComentarioEditando(comentario._id)
        setTextoEditado(comentario.texto)
        // Enfocar el campo de texto después de renderizar
        setTimeout(() => {
            if (comentarioRef.current) {
                comentarioRef.current.focus()
            }
        }, 0)
    }

    const cancelarEdicionComentario = () => {
        setComentarioEditando(null)
        setTextoEditado("")
    }

    const guardarEdicionComentario = async (comentarioId) => {
        if (!textoEditado.trim()) return

        try {
            const { data } = await axios.put(
                `${BASE}/noticias/${noticiaSeleccionada._id}/comentarios/${comentarioId}`,
                { texto: textoEditado },
                { headers },
            )

            setComentarios((prev) =>
                prev.map((c) => (c._id === comentarioId ? { ...c, texto: textoEditado, fechaEdicion: data.fechaEdicion } : c)),
            )
            setComentarioEditando(null)
            setTextoEditado("")
        } catch (err) {
            setError(err.response?.data?.error || "Error al editar comentario")
        }
    }

    const eliminarComentario = async (comentarioId) => {
        try {
            await axios.delete(`${BASE}/noticias/${noticiaSeleccionada._id}/comentarios/${comentarioId}`, { headers })

            setComentarios((prev) => prev.filter((c) => c._id !== comentarioId))

            // Actualizar contador de comentarios en la noticia
            setNoticiaSeleccionada((prev) => ({
                ...prev,
                comentarios: (prev.comentarios || []).filter((id) => id !== comentarioId),
            }))

            // Actualizar también en la lista de noticias
            setNoticias((prev) =>
                prev.map((n) =>
                    n._id === noticiaSeleccionada._id
                        ? { ...n, comentarios: (n.comentarios || []).filter((id) => id !== comentarioId) }
                        : n,
                ),
            )
        } catch (err) {
            setError(err.response?.data?.error || "Error al eliminar comentario")
        }
    }

    const esAutorComentario = (comentario) => {
        return comentario && user && comentario.usuario?._id === user.id
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

    // 1) Busca la calificación que este usuario dio (si existe)
    const getMiCalificacion = noticia =>
        noticia.calificaciones?.find(c => {
            // si viene usuario como objeto o como string, lo normalizamos a string:
            const userIdEnCalif = typeof c.usuario === 'object'
                ? c.usuario._id
                : c.usuario
            return userIdEnCalif === user.id
        })

    // 2) Devuelve true/false según el tipo
    const usuarioHaDadoLike = noticia =>
        Boolean(getMiCalificacion(noticia)?.like)

    const usuarioHaDadoDislike = noticia =>
        getMiCalificacion(noticia)
            ? getMiCalificacion(noticia).like === false
            : false

    // 3) Contadores de likes y dislikes
    const contarLikes = noticia =>
        noticia.calificaciones?.filter(c => c.like).length || 0

    const contarDislikes = noticia =>
        noticia.calificaciones?.filter(c => !c.like).length || 0


    const getEstadisticas = () => {
        const total = noticias.length
        const conComunidad = noticias.filter((n) => n.comunidad).length
        const sinComunidad = noticias.filter((n) => !n.comunidad).length
        const totalLikes = noticias.reduce((acc, n) => acc + contarLikes(n), 0)
        const totalDislikes = noticias.reduce((acc, n) => acc + contarDislikes(n), 0)
        const totalComentarios = noticias.reduce((acc, n) => acc + (n.comentarios?.length || 0), 0)
        const comunidadesUnicas = new Set(noticias.map((n) => n.comunidad?._id).filter(Boolean)).size

        return { total, conComunidad, sinComunidad, totalLikes, totalDislikes, totalComentarios, comunidadesUnicas }
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

    const stats = getEstadisticas()
    const comunidades = getComunidadesUnicas()

    if (cargando) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        {/* Header skeleton */}
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>

                        {/* Search skeleton */}
                        <div className="h-14 bg-gray-200 rounded-xl mb-8"></div>

                        {/* Cards skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                                    {stats.total}
                                </p>
                                <p className="text-sm font-medium text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                                    Total Noticias
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300">
                                <BookOpen className="h-6 w-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors duration-300">
                                    {stats.totalLikes}
                                </p>
                                <p className="text-sm font-medium text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                                    Total Likes
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 group-hover:scale-110 transition-all duration-300">
                                <Heart className="h-6 w-6 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {noticiasFiltradas.map((noticia) => (
                        <article
                            key={noticia._id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-slate-200 group"
                        >
                            <div className="p-6">
                                {/* Header de la noticia */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{noticia.autor?.username || "Autor"}</p>
                                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatearFecha(noticia.fechaCreacion)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Título y contenido */}
                                <div className="mb-4">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {noticia.titulo}
                                    </h2>
                                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                                        {noticia.contenido || noticia.texto}
                                    </p>
                                </div>

                                {/* Acciones */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => handleCalificacion(noticia, true)}
                                            disabled={cargandoLike}
                                            className={`flex items-center space-x-1 transition-colors ${usuarioHaDadoLike(noticia) ? "text-green-600" : "text-slate-500 hover:text-green-600"
                                                }`}
                                        >
                                            <Heart className={`h-4 w-4 ${usuarioHaDadoLike(noticia) ? "fill-current" : ""}`} />
                                            <span className="text-sm">{contarLikes(noticia)}</span>
                                        </button>
                                        <button
                                            onClick={() => handleCalificacion(noticia, false)}
                                            disabled={cargandoLike}
                                            className={`flex items-center space-x-1 transition-colors ${usuarioHaDadoDislike(noticia) ? "text-red-600" : "text-slate-500 hover:text-red-600"
                                                }`}
                                        >
                                            <Heart className={`h-4 w-4 rotate-180 ${usuarioHaDadoDislike(noticia) ? "fill-current" : ""}`} />
                                            <span className="text-sm">{contarDislikes(noticia)}</span>
                                        </button>
                                        <div className="flex items-center space-x-1 text-slate-500">
                                            <MessageCircle className="h-4 w-4" />
                                            <span className="text-sm">{noticia.comentarios?.length || 0}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => verDetalleNoticia(noticia)}
                                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
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

            {/* Modal Detalle Noticia - MEJORADO PARA MOSTRAR INFORMACIÓN COMPLETA */}
            {mostrarModalDetalle && noticiaSeleccionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Header del Modal */}
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                        <BookOpen className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Detalle de Noticia</h2>
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
                                                    <span>{contarLikes(noticiaSeleccionada)} me gusta</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span>{comentarios.length} comentarios</span>
                                                </div>
                                            </div>
                                        </div>
                                     
                                    </div>

                                    {/* Información de la comunidad si existe */}
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
                                            </div>
                                        </div>
                                    )}

                                    {/* Título */}
                                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                                        {noticiaSeleccionada.titulo}
                                    </h1>

                                    {/* Descripción Destacada si existe */}
                                    {noticiaSeleccionada.descripcion && (
                                        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-xl">
                                            <p className="text-lg text-slate-700 italic leading-relaxed font-medium">
                                                {noticiaSeleccionada.descripcion}
                                            </p>
                                        </div>
                                    )}

                                    {/* Contenido Principal */}
                                    <div className="prose prose-lg max-w-none mb-8">
                                        <div className="text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
                                            {noticiaSeleccionada.texto || noticiaSeleccionada.contenido}
                                        </div>
                                    </div>

                                    {/* Estadísticas de la noticia */}
                                    <div className="flex items-center justify-between py-4 border-t border-slate-200 mb-6">
                                        <div className="flex items-center space-x-6">
                                            <button
                                                onClick={() => handleCalificacion(noticiaSeleccionada, true)}
                                                disabled={cargandoLike}
                                                className={`flex items-center space-x-2 ${usuarioHaDadoLike(noticiaSeleccionada)
                                                    ? "text-green-600"
                                                    : "text-slate-500 hover:text-green-600"
                                                    } transition-colors`}
                                            >
                                                <Heart
                                                    className={`h-5 w-5 ${cargandoLike ? "animate-pulse" : ""}`}
                                                    fill={usuarioHaDadoLike(noticiaSeleccionada) ? "currentColor" : "none"}
                                                />
                                                <span>{contarLikes(noticiaSeleccionada)} me gusta</span>
                                            </button>
                                            <button
                                                onClick={() => handleCalificacion(noticiaSeleccionada, false)}
                                                disabled={cargandoLike}
                                                className={`flex items-center space-x-2 ${usuarioHaDadoDislike(noticiaSeleccionada)
                                                    ? "text-red-600"
                                                    : "text-slate-500 hover:text-red-600"
                                                    } transition-colors`}
                                            >
                                                <Heart
                                                    className={`h-5 w-5 rotate-180 ${cargandoLike ? "animate-pulse" : ""}`}
                                                    fill={usuarioHaDadoDislike(noticiaSeleccionada) ? "currentColor" : "none"}
                                                />
                                                <span>{contarDislikes(noticiaSeleccionada)} no me gusta</span>
                                            </button>
                                            <div className="flex items-center space-x-2 text-slate-500">
                                                <MessageCircle className="h-5 w-5" />
                                                <span>{comentarios.length} comentarios</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sección de comentarios */}
                                    <div className="border-t border-slate-200 pt-6">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                            <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                                            Comentarios
                                        </h3>

                                        {/* Formulario para agregar comentario */}
                                        {user && (
                                            <form onSubmit={agregarComentario} className="mb-6">
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <User className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <textarea
                                                            value={nuevoComentario}
                                                            onChange={(e) => setNuevoComentario(e.target.value)}
                                                            placeholder="Escribe un comentario..."
                                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                                            rows={2}
                                                        ></textarea>
                                                        <button
                                                            type="submit"
                                                            disabled={!nuevoComentario.trim()}
                                                            className="absolute right-3 bottom-3 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Send className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        )}

                                        {/* Lista de comentarios */}
                                        <div className="space-y-4">
                                            {cargandoComentarios ? (
                                                <div className="animate-pulse space-y-4">
                                                    {[...Array(3)].map((_, i) => (
                                                        <div key={i} className="flex items-start space-x-3">
                                                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                                            <div className="flex-1">
                                                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                                                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                                                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : comentarios.length > 0 ? (
                                                comentarios.map((comentario) => (
                                                    <div key={comentario._id} className="bg-slate-50 rounded-xl p-4">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <User className="h-5 w-5 text-white" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <div>
                                                                        <p className="text-sm font-medium text-slate-900">{comentario.usuario?.username}</p>
                                                                        <p className="text-xs text-slate-500">
                                                                            {formatearFecha(comentario.fechaCreacion)}
                                                                            {comentario.fechaEdicion && <span className="ml-2 italic">(editado)</span>}
                                                                        </p>
                                                                    </div>
                                                                    {esAutorComentario(comentario) && (
                                                                        <div className="relative">
                                                                            <div className="flex space-x-1">
                                                                                <button
                                                                                    onClick={() => iniciarEdicionComentario(comentario)}
                                                                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                                >
                                                                                    <Edit3 className="h-4 w-4" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => eliminarComentario(comentario._id)}
                                                                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {comentarioEditando === comentario._id ? (
                                                                    <div className="mt-2">
                                                                        <textarea
                                                                            ref={comentarioRef}
                                                                            value={textoEditado}
                                                                            onChange={(e) => setTextoEditado(e.target.value)}
                                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-sm"
                                                                            rows={2}
                                                                        ></textarea>
                                                                        <div className="flex justify-end space-x-2 mt-2">
                                                                            <button
                                                                                onClick={cancelarEdicionComentario}
                                                                                className="px-3 py-1 text-xs border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                                                            >
                                                                                Cancelar
                                                                            </button>
                                                                            <button
                                                                                onClick={() => guardarEdicionComentario(comentario._id)}
                                                                                disabled={!textoEditado.trim()}
                                                                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            >
                                                                                <Save className="h-3 w-3 mr-1" />
                                                                                Guardar
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-slate-700 text-sm mt-1">{comentario.texto}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8">
                                                    <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                                    <p className="text-slate-500">No hay comentarios aún. ¡Sé el primero en comentar!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
