"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/language-context"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Menu, X } from "lucide-react"
import LanguageSelector from "@/components/ui/language-selector"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-brown shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
      <Link href="/" className="flex items-center">
      <img 
        src="logo1.png" // logo
        alt="El Mangrullo" 
        className="h-30000 w-auto max-w-[150px]" // Ajusta la altura según necesites
      />
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
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-8 w-8 rounded-full p-0 hover:bg-brown-light"
                    aria-label="User menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user?.photoURL || "/placeholder-user.jpg"} 
                        alt={user?.displayName || "User"} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-brown-light text-white">
                        {user?.displayName?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">
                        {user?.displayName || "Usuario"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="w-full flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Panel de Admin
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem 
                    onSelect={handleLogout} // Cambiado de onClick a onSelect
                    className="cursor-pointer focus:bg-gray-100"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoggingOut ? "Cerrar sesión" : "Cerrar sesión"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
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
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="relative h-8 w-8 rounded-full p-0 hover:bg-brown-light"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={user?.photoURL || "/placeholder-user.jpg"} 
                            alt={user?.displayName || "User"} 
                          />
                          <AvatarFallback className="bg-brown-light text-white">
                            {user?.displayName?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none truncate">
                            {user?.displayName || "Usuario"}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground truncate">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {user?.isAdmin && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link 
                              href="/admin" 
                              className="w-full flex items-center"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Panel de Admin
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem 
                        onSelect={() => {
                          handleLogout()
                          setIsMobileMenuOpen(false)
                        }}
                        className="cursor-pointer focus:bg-gray-100"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button 
                  asChild 
                  variant="outline" 
                  className="text-white border-white hover:bg-white/20"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link href="/login">{t("nav.login")}</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}