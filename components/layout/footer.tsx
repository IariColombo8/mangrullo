"use client"

import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-brown text-white">
      <div className="container mx-auto py-8 md:py-12 px-4">
        <div className="text-center md:hidden mb-8">
          <h3 className="text-xl font-bold mb-3">El Mangrullo</h3>
          <div className="flex justify-center space-x-6 mb-4">
            <a
              href="https://www.facebook.com/elmangrullo.federacion/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={22} />
            </a>
            <a
              href="https://www.instagram.com/el_mangrullo_federacion/?hl=es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={22} />
            </a>
          </div>
          <p className="text-white/90 text-sm">
            Descubre la tranquilidad y el confort en El Mangrullo, tu hogar lejos de casa en Federación, Entre Ríos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="hidden md:block">
            <h3 className="text-xl font-bold mb-4">El Mangrullo</h3>
            <p className="text-white/90 mb-4">
              Descubre la tranquilidad y el confort en El Mangrullo, tu hogar lejos de casa en Federación, Entre Ríos.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/elmangrullo.federacion/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Facebook"
              >
                <Facebook />
              </a>
              <a
                href="https://www.instagram.com/el_mangrullo_federacion/?hl=es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Instagram"
              >
                <Instagram />
              </a>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              <li><Link href="/#gallery" className="text-white/90 hover:text-white transition-colors">Galería</Link></li>
              <li><Link href="/#departamentos" className="text-white/90 hover:text-white transition-colors">Departamentos</Link></li>
              <li><Link href="/#activities" className="text-white/90 hover:text-white transition-colors">Actividades</Link></li>
              <li><Link href="/#contact" className="text-white/90 hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold mb-4">Contáctanos</h3>
            <ul className="space-y-3">
              <li className="flex items-start justify-center sm:justify-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-white/90 text-sm">
                  Av. Coronel J. M. Salas, Federación, Entre Ríos, Argentina
                </span>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                <a href="tel:+5493456551550" className="text-white/90 hover:text-white transition-colors text-sm">
                  +54 9 3456 551550
                </a>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                <a href="mailto:elmangrullofederacion@gmail.com" className="text-white/90 hover:text-white transition-colors text-sm truncate">
                  elmangrullofederacion@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-white/80 text-sm">
          <p>&copy; {currentYear} El Mangrullo. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
