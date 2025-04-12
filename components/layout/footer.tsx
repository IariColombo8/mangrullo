"use client"

import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react"
import { useLanguage } from "@/context/language-context"

export default function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-brown text-white">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">El Mangrullo</h3>
            <p className="text-white-300 mb-4">{t("footer.about")}</p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white-300 transition-colors"
                aria-label="Facebook"
              >
                <Facebook />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white-300 transition-colors"
                aria-label="Instagram"
              >
                <Instagram />
              </a>
              <a
                href="https://www.booking.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white-300 transition-colors"
                aria-label="Booking.com"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                  <path d="M12 8v8" />
                  <path d="M8 12h8" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#cabins" className="text-white-300 hover:text-white transition-colors">
                  {t("nav.cabins")}
                </Link>
              </li>
              <li>
                <Link href="/#gallery" className="text-white-300 hover:text-white transition-colors">
                  {t("nav.gallery")}
                </Link>
              </li>
              <li>
                <Link href="/#activities" className="text-white-300 hover:text-white transition-colors">
                  {t("nav.activities")}
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-white-300 hover:text-white transition-colors">
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-white-300 hover:text-white transition-colors">
                  {t("nav.login")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t("footer.contactUs")}</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 text-white" />
                <span className="text-white-300">Av. Coronel J. M. Salas, Federación, Entre Ríos, Argentina</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-white" />
                <a href="tel:+5493456551550" className="text-white-300 hover:text-white transition-colors">
                  +54 9 3456 551550
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-white" />
                <a href="mailto:elmangrullofederacion@gmail.com" className="text-white-300 hover:text-white transition-colors">
                  elmangrullofederacion@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white-700 mt-8 pt-8 text-center text-white-400 text-sm">
          <p>
            &copy; {currentYear} El Mangrullo. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  )
}
