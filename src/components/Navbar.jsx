"use client"

import { useState, useContext, useEffect, useRef } from "react"
import { Menu, X, User, LogOut, Settings, Home, Users, Globe } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [perfilAbierto, setPerfilAbierto] = useState(false)
  const { token, logout, user } = useContext(AuthContext)
  const navigate = useNavigate()
  const perfilRef = useRef(null)

  const alternarMenu = () => setMenuAbierto(!menuAbierto)
  const alternarPerfil = () => setPerfilAbierto(!perfilAbierto)
  const cerrarMenus = () => {
    setMenuAbierto(false)
    setPerfilAbierto(false)
  }

  const handleLogout = () => {
    logout()
    navigate("/")
    setPerfilAbierto(false)
  }

  // Cierra el dropdown de perfil al clicar fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (perfilRef.current && !perfilRef.current.contains(e.target)) {
        setPerfilAbierto(false)
      }
    }
    if (perfilAbierto) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [perfilAbierto])

  return (
    <nav className="bg-white shadow-lg border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group" onClick={cerrarMenus}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xl p-2 rounded-lg mr-3 shadow-md group-hover:shadow-lg transition-shadow">
              α
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                AlphaNews
              </span>
              <span className="text-xs text-slate-500 -mt-1">Noticias Colaborativas</span>
            </div>
          </Link>

          {/* Links desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className="flex items-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <Home className="h-4 w-4 mr-2" /> Inicio
            </Link>

            <Link
              to="/noticias"
              className="flex items-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <Globe className="h-4 w-4 mr-2" /> Explorar
            </Link>

            {token && (
              <Link
                to="/comunidades"
                className="flex items-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                <Users className="h-4 w-4 mr-2" /> Mis Comunidades
              </Link>
            )}

            {token ? (
              <div className="relative ml-4" ref={perfilRef}>
                <button
                  onClick={alternarPerfil}
                  className="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.nombre?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900">{user?.nombre || "Usuario"}</p>
                    <p className="text-xs text-slate-500">Periodista</p>
                  </div>
                </button>

                {perfilAbierto && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">{user.username}</p>
                    </div>
                    <Link
                      to="/usuario"
                      onClick={cerrarMenus}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="h-4 w-4 mr-3" /> Mi Perfil
                    </Link>
                    <Link
                      to="/configuracion"
                      onClick={cerrarMenus}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3" /> Configuración
                    </Link>
                    <div className="border-t border-slate-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" /> Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Botón móvil */}
          <div className="md:hidden flex items-center">
            <button
              onClick={alternarMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            >
              <span className="sr-only">Abrir menú principal</span>
              {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {menuAbierto && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {token && (
              <div className="flex items-center space-x-3 bg-slate-50 rounded-lg p-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                  {user?.nombre?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.username}</p>
                </div>
              </div>
            )}

            <Link to="/" onClick={cerrarMenus} className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <Home className="h-5 w-5 mr-3" /> Inicio
            </Link>

            <Link to="/noticias" onClick={cerrarMenus} className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <Globe className="h-5 w-5 mr-3" /> Explorar
            </Link>

            {token && (
              <>
                <Link to="/comunidades" onClick={cerrarMenus} className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <Users className="h-5 w-5 mr-3" /> Mis Comunidades
                </Link>
                <Link to="/usuario" onClick={cerrarMenus} className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <User className="h-5 w-5 mr-3" /> Mi Perfil
                </Link>
                <Link to="/configuracion" onClick={cerrarMenus} className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <Settings className="h-5 w-5 mr-3" /> Configuración
                </Link>
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <button onClick={handleLogout} className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="h-5 w-5 mr-3" /> Cerrar Sesión
                  </button>
                </div>
              </>
            )}

            {!token && (
              <div className="border-t border-slate-200 pt-4 mt-4 space-y-2">
                <Link to="/login" onClick={cerrarMenus} className="block w-full text-center px-4 py-3 rounded-lg text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-slate-300">
                  Iniciar Sesión
                </Link>
                <Link to="/registro" onClick={cerrarMenus} className="block w-full text-center px-4 py-3 rounded-lg text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay para cerrar menú móvil */}
      {menuAbierto && <div className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden" onClick={cerrarMenus}></div>}
    </nav>
  )
}
