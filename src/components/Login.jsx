"use client"

import { useState, useContext } from "react"
import { Eye, EyeOff, CheckCircle2, User, Lock } from 'lucide-react'
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"

export default function Login() {
  const navigate = useNavigate()
  const { token, login } = useContext(AuthContext);

  const [datosFormulario, setDatosFormulario] = useState({
    identificador: "", // Puede ser email o nombre de usuario
    contrasena: "",
  })

  const [errores, setErrores] = useState({
    identificador: "",
    contrasena: "",
  })

  const [errorGeneral, setErrorGeneral] = useState("")
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [loginExitoso, setLoginExitoso] = useState(false)
  const [recordarme, setRecordarme] = useState(false)

  const validarFormulario = () => {
    let esValido = true
    const nuevosErrores = { ...errores }

    // Validación de identificador (email o nombre de usuario)
    if (!datosFormulario.identificador.trim()) {
      nuevosErrores.identificador = "El email o nombre de usuario es obligatorio"
      esValido = false
    } else {
      nuevosErrores.identificador = ""
    }

    // Validación de contraseña
    if (!datosFormulario.contrasena) {
      nuevosErrores.contrasena = "La contraseña es obligatoria"
      esValido = false
    } else {
      nuevosErrores.contrasena = ""
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
    e.preventDefault();
    if (!validarFormulario()) return;
    setEnviando(true);
    try {
      const res = await fetch("http://localhost:5100/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          username: datosFormulario.identificador,
          clave: datosFormulario.contrasena
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.error || "Error");
      login(data.token);
      navigate("/");
    } catch (err) {
      setErrorGeneral(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full mx-auto">
        <div className="md:flex">
          {/* Sección de imagen */}
          <div className="md:w-1/2 relative">
            <div className="absolute inset-0 bg-blue-600 bg-opacity-80 z-10">
              <div className="h-full p-8 flex flex-col justify-center">
                <div className="bg-blue-700 bg-opacity-70 p-6 rounded-xl border border-white border-opacity-20 shadow-lg">
                  <h2 className="text-3xl font-bold text-white mb-4 flex items-center">
                    <span className="bg-white text-blue-600 px-2 py-1 rounded mr-2">α</span>
                    AlphaNews
                  </h2>
                  <p className="text-blue-100 mb-6">
                    Bienvenido de nuevo. Inicia sesión para acceder a las últimas noticias y colaborar con la comunidad.
                  </p>
                  <div className="flex items-center space-x-2 text-blue-100">
                    <div className="h-5 w-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Accede a contenido exclusivo</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-100 mt-2">
                    <div className="h-5 w-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Comenta en las noticias</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-100 mt-2">
                    <div className="h-5 w-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Publica tus propias historias</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full h-full">
              <img
                src="https://images.pexels.com/photos/3944454/pexels-photo-3944454.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Periodista trabajando"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Sección de formulario */}
          <div className="md:w-1/2 p-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h2>
                <p className="text-gray-600 mt-1">Accede a tu cuenta de AlphaNews</p>
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
                    <h3 className="text-sm font-medium text-red-800">Error de autenticación</h3>
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

              <form onSubmit={manejarEnvio} className="space-y-6">
                <div>
                  <label htmlFor="identificador" className="block text-sm font-medium text-gray-700 mb-1">
                    Email o Nombre de Usuario
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="identificador"
                      name="identificador"
                      value={datosFormulario.identificador}
                      onChange={manejarCambio}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errores.identificador
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200"
                        }`}
                      placeholder="maria_reportera o maria@ejemplo.com"
                    />
                  </div>
                  {errores.identificador && <p className="mt-1 text-sm text-red-500">{errores.identificador}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">
                      Contraseña
                    </label>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={mostrarContrasena ? "text" : "password"}
                      id="contrasena"
                      name="contrasena"
                      value={datosFormulario.contrasena}
                      onChange={manejarCambio}
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errores.contrasena ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
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

                <div className="flex items-center">
                  <input
                    id="recordarme"
                    name="recordarme"
                    type="checkbox"
                    checked={recordarme}
                    onChange={() => setRecordarme(!recordarme)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="recordarme" className="ml-2 block text-sm text-gray-700">
                    Recordar mi sesión
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={enviando}
                    className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg ${enviando ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                  >
                    {enviando ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Iniciando sesión...
                      </span>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">O continúa con</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path
                          fill="#4285F4"
                          d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                        />
                        <path
                          fill="#34A853"
                          d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                        />
                        <path
                          fill="#EA4335"
                          d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                        />
                      </g>
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <svg
                      className="h-5 w-5 text-[#1877F2]"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-gray-600">
                ¿No tienes una cuenta?{" "}
                <Link to="/registro"
                  className="font-medium text-blue-600 hover:text-blue-700">
                  Regístrate ahora
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}