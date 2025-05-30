import {chromium} from 'playwright';

const FRONTEND_URL = 'http://localhost:5173';

const users = [
    {
        nombre: 'Elena Vasquez',
        username: 'elenavasquez',
        email: 'elena@example.com',
        clave: 'Password123!',
        community: {
            titulo: 'Ciencia y Cosmos',
            descripcion: 'Un espacio para debatir ciencia y cosmos',
            noticias: [
                {
                    titulo: 'El Telescopio James Webb Revela Galaxias Primitivas',
                    descripcion: 'Nuevas imágenes del JWST desafían los modelos actuales sobre la formación del universo temprano.',
                    contenido: 'Las observaciones del JWST han identificado galaxias increíblemente masivas y maduras en una época en que el universo tenía solo 500 millones de años, obligando a reconsiderar teorías de formación galáctica.'
                },
                {
                    titulo: 'El Misterio de la Materia Oscura',
                    descripcion: 'Qué sabemos y qué no sobre esta componente invisible del cosmos.',
                    contenido: 'La materia oscura representa aproximadamente el 27% del universo, pero aún no sabemos exactamente qué es. Diversos experimentos buscan detectarla mediante interacciones débiles con la materia ordinaria.'
                },
                {
                    titulo: 'Ondas Gravitacionales: Una Nueva Ventana al Universo',
                    descripcion: 'Cómo los detectores LIGO y Virgo están revolucionando la astronomía.',
                    contenido: 'Las ondas gravitacionales, predichas por Einstein, permiten estudiar eventos cósmicos extremos como la colisión de agujeros negros, abriendo nuevas posibilidades en astronomía multi-mensajero.'
                },
                {
                    titulo: 'Explorando Marte: La Búsqueda de Vida',
                    descripcion: 'Las últimas misiones y sus hallazgos sobre el planeta rojo.',
                    contenido: 'Rovers como Perseverance están analizando la superficie marciana en busca de señales de vida pasada, ayudando a entender la historia geológica y atmosférica de Marte.'
                },
                {
                    titulo: 'La Teoría del Multiverso',
                    descripcion: '¿Existen otros universos además del nuestro?',
                    contenido: 'Algunas teorías cosmológicas sugieren la existencia de múltiples universos paralelos, aunque aún son altamente especulativas y difíciles de probar empíricamente.'
                },
            ],
        },
    },
    {
        nombre: 'Beatriz Durán',
        username: 'beatrizduran',
        email: 'beatriz@example.com',
        clave: 'Password123!',
        community: {
            titulo: 'Viajeros del Mundo',
            descripcion: 'Comunidad creada automáticamente para Viajeros del Mundo',
            noticias: [
                {
                    titulo: 'Guía Definitiva para Viajar Solo por el Sudeste Asiático',
                    descripcion: 'Desde los templos de Angkor Wat hasta las playas de Tailandia, te damos los mejores consejos de presupuesto, seguridad y rutas para tu primera gran aventura en solitario.',
                    contenido: 'El Sudeste Asiático es el destino por excelencia para los mochileros. Su bajo costo, la amabilidad de su gente y su increíble diversidad cultural lo hacen ideal para un viaje transformador. Te contamos cómo moverte, dónde alojarte y qué no te puedes perder.'
                },
                {
                    titulo: 'Lisboa: La Capital Europea de los Nómadas Digitales',
                    descripcion: 'Descubre por qué miles de trabajadores remotos han elegido Lisboa como su base. Espacios de coworking, coste de vida y una vibrante comunidad internacional.',
                    contenido: 'Con su clima agradable, su deliciosa gastronomía y una conexión a internet de alta velocidad, Lisboa se ha consolidado como un paraíso para los nómadas digitales. Analizamos los mejores barrios para vivir, los visados disponibles y cómo integrarse en la escena local.'
                },
                {
                    titulo: 'Patagonia: Trekking entre Gigantes de Hielo y Montañas de Granito',
                    descripcion: 'Una guía completa para planificar tu viaje a las Torres del Paine y El Chaltén, los dos epicentros del senderismo en el fin del mundo.',
                    contenido: 'La Patagonia es una tierra de superlativos. Sus paisajes sobrecogedores atraen a senderistas de todo el planeta. Te explicamos las mejores épocas para ir, cómo reservar refugios y qué equipo es indispensable para enfrentarte a su clima impredecible.'
                },
                {
                    titulo: 'Japón con Poco Presupuesto: Misión Posible',
                    descripcion: 'Japón tiene fama de ser un destino caro, pero con estos trucos podrás disfrutar del país del sol naciente sin arruinarte.',
                    contenido: 'Desde el Japan Rail Pass para ahorrar en transporte hasta los konbinis (tiendas de conveniencia) que ofrecen comida deliciosa y barata, pasando por los hostales cápsula, hay muchas formas de experimentar Japón de manera económica. Te las contamos todas.'
                },
                {
                    titulo: 'Las Joyas Ocultas de Europa del Este',
                    descripcion: 'Más allá de Praga y Budapest, existen ciudades llenas de historia y belleza que aún no han sido invadidas por el turismo de masas.',
                    contenido: 'Explora la arquitectura medieval de Tallin en Estonia, la vibrante vida nocturna de Belgrado en Serbia o los impresionantes lagos de Plitvice en Croacia. Europa del Este ofrece una autenticidad y unos precios que ya son difíciles de encontrar en el oeste del continente.'
                }
            ]
        }
    },
    {
        nombre: 'David Mora',
        username: 'davidmora',
        email: 'david@example.com',
        clave: 'Password123!',
        community: {
            titulo: 'Cine de Culto',
            descripcion: 'Comunidad creada automáticamente para Cine de Culto',
            noticias: [
                {
                    titulo: 'Blade Runner: Más Humano que los Humanos',
                    descripcion: 'Análisis de la obra maestra de Ridley Scott, sus temas existenciales sobre la memoria, la identidad y la empatía en un mundo distópico.',
                    contenido: 'Estrenada en 1982 con poco éxito, "Blade Runner" se ha convertido en la película de ciencia ficción más influyente de la historia. Su estética ciberpunk y su profunda exploración filosófica sobre qué nos hace humanos siguen generando debates y análisis décadas después.'
                },
                {
                    titulo: 'Cómo "Pulp Fiction" Resucitó el Cine Independiente',
                    descripcion: 'En 1994, la estructura no lineal, los diálogos afilados y la violencia estilizada de Quentin Tarantino cambiaron las reglas del juego para siempre.',
                    contenido: 'Con un presupuesto modesto y un guion que rompía todas las convenciones, "Pulp Fiction" demostró que el cine independiente podía ser comercialmente exitoso y artísticamente revolucionario. Su impacto se siente en cada película que juega con la cronología y celebra la cultura pop.'
                },
                {
                    titulo: 'El Laberinto de David Lynch: Interpretando "Mulholland Drive"',
                    descripcion: 'Intentamos descifrar los símbolos, los sueños y las realidades alternativas en la que es considerada por muchos críticos como la mejor película del siglo XXI.',
                    contenido: '"Mulholland Drive" no es una película para ser entendida, sino para ser experimentada. Es un viaje onírico a los rincones más oscuros de Hollywood y la psique humana, una obra maestra surrealista que se resiste a una única interpretación y que recompensa múltiples visionados.'
                },
                {
                    titulo: 'La Nostalgia Mágica de Studio Ghibli',
                    descripcion: 'Desde "Mi Vecino Totoro" hasta "El Viaje de Chihiro", exploramos los temas recurrentes de Hayao Miyazaki: la infancia, el pacifismo y la conexión con la naturaleza.',
                    contenido: 'Las películas de Studio Ghibli son un refugio. Su animación artesanal, sus personajes femeninos fuertes y sus mundos llenos de imaginación y melancolía han creado un legado universal que trasciende culturas y generaciones. Son un canto a la belleza de los momentos pequeños y la importancia de la bondad.'
                },
                {
                    titulo: 'Por Qué "El Gran Lebowski" es una Obra Maestra Zen',
                    descripcion: 'La comedia de los hermanos Coen es mucho más que un simple personaje vago. Es una filosofía sobre cómo navegar el caos del mundo moderno.',
                    contenido: '"The Dude" (El Nota) es un héroe posmoderno. En un mundo de nihilistas, millonarios y conspiraciones, su pasividad y su deseo de que le devuelvan la alfombra se convierten en una forma de resistencia. La película es un estudio brillante sobre la apatía, la amistad y el arte de "dejarse llevar".'
                }
            ]
        }
    },
    {
        nombre: 'Laura Gómez',
        username: 'lauragomez',
        email: 'laura@example.com',
        clave: 'Password123!',
        community: {
            titulo: 'Desarrollo Web Pro',
            descripcion: 'Comunidad creada automáticamente para Desarrollo Web Pro',
            noticias: [
                {
                    titulo: 'Gestión de Estado en React: ¿Alternativas a Redux en 2025?',
                    descripcion: 'Con la llegada de Hooks y nuevas librerías como Zustand y Jotai, ¿sigue siendo Redux la mejor opción para aplicaciones complejas?',
                    contenido: 'Redux dominó la gestión de estado en React durante años, pero su verbosidad llevó a la creación de alternativas más simples y directas. Analizamos el estado actual del ecosistema, comparando la sintaxis y el rendimiento de las soluciones más populares para ayudarte a decidir.'
                },
                {
                    titulo: 'El Auge de Svelte y SvelteKit: ¿El Futuro sin Virtual DOM?',
                    descripcion: 'Svelte compila tu código a JavaScript imperativo y altamente optimizado en tiempo de compilación, en lugar de usar un Virtual DOM en tiempo de ejecución.',
                    contenido: 'Este enfoque radical promete aplicaciones más rápidas y con menos código. Con SvelteKit ofreciendo una experiencia de desarrollo completa (routing, SSR), exploramos si Svelte está listo para destronar a React y Vue como el rey de los frameworks.'
                },
                {
                    titulo: 'Micro-frontends: Pros y Contras de la Arquitectura Distribuida',
                    descripcion: 'Dividir tu aplicación monolítica de frontend en piezas más pequeñas y manejables, desarrolladas por equipos independientes. ¿Es la solución a todos tus problemas?',
                    contenido: 'Los micro-frontends prometen escalabilidad y autonomía para los equipos, pero también introducen complejidad en la coordinación, el versionado y el rendimiento. Analizamos cuándo tiene sentido adoptar esta arquitectura y qué herramientas pueden facilitar la transición.'
                },
                {
                    titulo: 'WebAssembly (WASM): La Próxima Frontera del Rendimiento Web',
                    descripcion: 'WASM permite ejecutar código escrito en lenguajes como C++, Rust o Go en el navegador a velocidades cercanas a las nativas.',
                    contenido: 'No es un reemplazo de JavaScript, sino un complemento. Es ideal para tareas computacionalmente intensivas como videojuegos, edición de video o simulaciones científicas directamente en la web. Exploramos su estado actual y cómo empezar a usarlo.'
                },
                {
                    titulo: 'GraphQL vs. REST: Una Comparación Honesta',
                    descripcion: 'GraphQL permite a los clientes solicitar exactamente los datos que necesitan, pero ¿compensa la complejidad adicional en el backend?',
                    contenido: 'Mientras que REST se basa en múltiples endpoints con estructuras de datos fijas, GraphQL ofrece un único endpoint flexible. Comparamos ambos enfoques en términos de rendimiento, cacheo, curva de aprendizaje y casos de uso ideales para cada uno.'
                }
            ]
        }
    },
    {
        nombre: 'Carlos Ruiz',
        username: 'carlosruiz',
        email: 'carlos@example.com',
        clave: 'Password123!',
        community: {
            titulo: 'Cocina Creativa',
            descripcion: 'Comparte tus recetas y técnicas innovadoras',
            noticias: [
                {
                    titulo: 'El Arte del Sous-Vide: Cocción a Baja Temperatura en Casa',
                    descripcion: 'Descubre cómo la técnica de los restaurantes de alta cocina puede transformar tus platos.',
                    contenido: 'El sous-vide, o cocción al vacío a baja temperatura, ya no es exclusivo de los chefs con estrellas Michelin. Con equipos asequibles, cualquier aficionado puede lograr resultados perfectos en carnes y vegetales.'
                },
                {
                    titulo: 'Fermentación Casera: Más Allá del Pan de Masa Madre',
                    descripcion: 'Explora el mundo del kimchi, kombucha y kéfir para mejorar tu salud digestiva.',
                    contenido: 'La fermentación es una técnica ancestral que añade probióticos beneficiosos y complejidad de sabor a los alimentos. Aprende los conceptos básicos para empezar a experimentar.'
                },
                {
                    titulo: 'Deconstrucción de un Clásico: Tiramisú del Siglo XXI',
                    descripcion: 'Reimaginamos el postre italiano separando sus componentes en texturas inesperadas.',
                    contenido: 'Presentamos espuma de mascarpone, "caviar" de café hecho con esferificación y bizcocho crujiente para una nueva experiencia del tiramisú.'
                },
                {
                    titulo: 'Umami: El Quinto Sabor y Cómo Potenciarlo',
                    descripcion: 'Identifica y usa ingredientes ricos en glutamato para platos irresistibles.',
                    contenido: 'Champiñones, tomates maduros, salsa de soja y parmesano son ricos en umami. Aprende a combinarlos para crear platos con sabor profundo y sabroso.'
                },
                {
                    titulo: 'Técnicas de Emplatado para Sorprender a tus Invitados',
                    descripcion: 'Secretos del color, altura y composición para platos de revista.',
                    contenido: 'Usa brochas, salsas artísticas y disposición asimétrica para elevar cualquier cena a una experiencia gastronómica memorable.'
                },
            ],
        },
    },
];

async function runBot() {
    const browser = await chromium.launch({headless: false, slowMo: 100});
    const page = await browser.newPage();

    try {
        for (const user of users) {
            console.log(`🧑‍💻 Registrando usuario: ${user.username} ...`);
            await page.goto(FRONTEND_URL);
            await page.getByRole('link', {name: 'Registrarse'}).click();

            await page.getByRole('textbox', {name: 'Nombre Completo'}).fill(user.nombre);
            await page.getByRole('textbox', {name: 'Nombre de Usuario'}).fill(user.username);
            await page.getByRole('textbox', {name: 'Correo Electrónico'}).fill(user.email);
            await page.getByRole('textbox', {name: 'Contraseña', exact: true}).fill(user.clave);
            await page.getByRole('textbox', {name: 'Confirmar Contraseña'}).fill(user.clave);
            await page.getByRole('button', {name: 'Crear Cuenta'}).click();

            await page.waitForSelector('h2:has-text("¡Registro Exitoso!")');

            console.log(`🔑 Iniciando sesión como ${user.username}...`);
            await page.click('a[href="/login"]');
            await page.getByLabel('Email o Nombre de Usuario').fill(user.username);
            await page.getByLabel('Contraseña').fill(user.clave);
            await page.getByRole('button', {name: 'Iniciar Sesión'}).click();
            await page.waitForURL(`${FRONTEND_URL}/`);

            console.log(`🏠 Creando comunidad: ${user.community.titulo}...`);
            await page.getByRole('link', {name: 'Mis Comunidades'}).click();
            await page.getByRole('button', {name: 'Nueva Comunidad'}).click();
            await page.getByPlaceholder('Ej: Periodistas de Tecnología').fill(user.community.titulo);
            await page.getByPlaceholder('Describe el propósito y objetivos de tu comunidad...').fill(user.community.descripcion);
            await page.getByRole('button', {name: 'Crear Comunidad'}).click();

            await page.waitForSelector(`text=${user.community.titulo}`, {timeout: 5000});

            console.log(`➡️ Entrando a la comunidad ${user.community.titulo}...`);
            const communityCard = page.locator('div', {has: page.locator(`h3:text("${user.community.titulo}")`)});
            const verDetallesBtn = communityCard.locator('button', {hasText: 'Ver Detalles'});
            await verDetallesBtn.waitFor({state: 'visible'});
            await verDetallesBtn.click();

            await page.locator('a[href*="/comunidades/"][href*="/noticias"]').click();

            console.log(`📝 Creando ${user.community.noticias.length} noticias para ${user.community.titulo}...`);

            for (const [i, noticia] of user.community.noticias.entries()) {
                console.log(`  - Publicando noticia ${i + 1}: ${noticia.titulo}`);

                const crearNoticiaBtn = page.locator('button', {hasText: 'Crear Noticia'});
                await crearNoticiaBtn.waitFor({state: 'visible'});
                await crearNoticiaBtn.click();

                await page.getByPlaceholder('Ej: Nuevos desarrollos en inteligencia artificial...').fill(noticia.titulo);
                await page.getByPlaceholder('Un resumen breve que capture la esencia de tu noticia...').fill(noticia.descripcion);
                await page.getByPlaceholder('Escribe aquí el contenido completo de tu noticia...').fill(noticia.contenido);

                await page.getByRole('button', {name: 'Publicar Noticia'}).click();

                await page.waitForSelector(`text=${noticia.titulo}`, {timeout: 5000});

                console.log(`    ✅ Noticia publicada`);
            }

            // Logout para pasar al siguiente usuario, si tu app tiene logout
            // ... después de crear las noticias

            console.log('6️⃣ Cerrando sesión...');
            await page.getByRole('button', {name: /U Usuario/i}).click();
            await page.getByRole('button', {name: 'Cerrar Sesión'}).click();

            console.log('✅ Sesión cerrada correctamente.');

            await page.waitForTimeout(1000);
        }

        console.log('🎉 ¡Todos los usuarios y comunidades han sido creados exitosamente!');
    } catch (error) {
        console.error('❌ Error durante la ejecución del bot:', error);
    } finally {
        await browser.close();
    }
}

runBot();
