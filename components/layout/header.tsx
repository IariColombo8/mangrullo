"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/language-context"
import { useAuth } from "@/context/auth-context"
import LanguageSelector from "@/components/ui/language-selector"
import { Menu, X } from "lucide-react"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useLanguage()
  const { user } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-brown shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          El Mangrullo
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/#cabins" className="text-white hover:text-gray-200 transition-colors">
            {t("nav.cabins")}
          </Link>
          <Link href="/#gallery" className="text-white hover:text-gray-200 transition-colors">
            {t("nav.gallery")}
          </Link>
          <Link href="/#activities" className="text-white hover:text-gray-200 transition-colors">
            {t("nav.activities")}
          </Link>
          <Link href="/#contact" className="text-white hover:text-gray-200 transition-colors">
            {t("nav.contact")}
          </Link>

          <LanguageSelector />

          {user ? (
            <Button asChild variant="outline" className="text-white border-white hover:bg-white/20">
              <Link href="/admin">{t("nav.admin")}</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="text-white border-white hover:bg-white/20">
              <Link href="/login">{t("nav.login")}</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-brown py-4">
          <nav className="container mx-auto px-4 flex flex-col space-y-4">
            <Link
              href="/#cabins"
              className="text-white hover:text-gray-200 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("nav.cabins")}
            </Link>
            <Link
              href="/#gallery"
              className="text-white hover:text-gray-200 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("nav.gallery")}
            </Link>
            <Link
              href="/#activities"
              className="text-white hover:text-gray-200 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("nav.activities")}
            </Link>
            <Link
              href="/#contact"
              className="text-white hover:text-gray-200 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("nav.contact")}
            </Link>

            <div className="flex items-center justify-between pt-2">
              <LanguageSelector />

              {user ? (
                <Button asChild variant="outline" className="text-white border-white hover:bg-white/20">
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                    {t("nav.admin")}
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="text-white border-white hover:bg-white/20">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    {t("nav.login")}
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
