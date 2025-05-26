"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Link } from "react-router-dom"

export default function Navbar() {
    const [menuAbierto, setMenuAbierto] = useState(false)

    const alternarMenu = () => {
        setMenuAbierto(!menuAbierto)
    }

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo y nombre */}
                    <Link to="/" className="flex items-center">
                        <div className="bg-blue-600 text-white font-bold text-xl p-2 rounded-md mr-2">
                            α
                        </div>
                        <span className="text-xl font-bold text-gray-800">
                            AlphaNews
                        </span>
                    </Link>
                    {/* Enlaces de navegación - Escritorio */}
                    <div className="hidden md:flex items-center space-x-4">
                        <a
                            href="#"
                            className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Inicio
                        </a>
                        <a
                            href="#"
                            className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Noticias
                        </a>
                        <a
                            href="#"
                            className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Colaborar
                        </a>
                        <Link
                            to="/login"
                            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors ml-2"
                        >
                            Iniciar Sesión
                        </Link>
                        <Link
                            to="/registro"
                            className="bg-gray-100 text-blue-600 hover:bg-gray-200 border border-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Registro
                        </Link>
                    </div>

                    {/* Botón de menú móvil */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={alternarMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Abrir menú principal</span>
                            {menuAbierto ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menú móvil */}
            {menuAbierto && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a
                            href="#"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                        >
                            Inicio
                        </a>
                        <a
                            href="#"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                        >
                            Noticias
                        </a>
                        <a
                            href="#"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                        >
                            Colaborar
                        </a>
                        <a
                            href="#"
                            className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 mt-2"
                        >
                            Iniciar Sesión
                        </a>
                        <a
                            href="#"
                            className="block px-3 py-2 rounded-md text-base font-medium bg-gray-100 text-blue-600 hover:bg-gray-200 border border-blue-600"
                        >
                            Registro
                        </a>
                    </div>
                </div>
            )}
        </nav>
    )
}
