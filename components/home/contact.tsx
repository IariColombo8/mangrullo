"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/context/language-context"
import { MapPin, Phone, Mail, Send } from "lucide-react"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // This would be replaced with actual Firebase function in a real app
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: t("contact.successTitle"),
        description: t("contact.successMessage"),
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      })
    } catch (error) {
      toast({
        title: t("contact.errorTitle"),
        description: t("contact.errorMessage"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="section-padding bg-beige">
      <div className="container-custom">
        <h2 className="section-title text-brown">{t("contact.title")}</h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">{t("contact.subtitle")}</p>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-brown mb-4">{t("contact.formTitle")}</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contact.form.name")} *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contact.form.email")} *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contact.form.phone")}
                </label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full" />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contact.form.message")} *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full min-h-[120px]"
                />
              </div>

              <Button type="submit" className="w-full bg-green hover:bg-green/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    {t("contact.form.sending")}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Send className="mr-2 h-4 w-4" />
                    {t("contact.form.send")}
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-brown mb-4">{t("contact.infoTitle")}</h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-green/10 p-3 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-green" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{t("contact.info.address")}</h4>
                    <p className="text-gray-600">Av. Coronel J. M. Salas, Federación, Entre Ríos</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green/10 p-3 rounded-full mr-4">
                    <Phone className="h-6 w-6 text-green" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{t("contact.info.phone")}</h4>
                    <p className="text-gray-600">
                      <a href="tel:+5493456551550" className="hover:text-green transition-colors">
                        +54 9 3456 551550
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green/10 p-3 rounded-full mr-4">
                    <Mail className="h-6 w-6 text-green" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{t("contact.info.email")}</h4>
                    <p className="text-gray-600">
                      <a href="mailto:elmangrullofederacion@gmail.com" className="hover:text-green transition-colors">
                      elmangrullofederacion@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="mt-8 h-64 bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3420.912827110814!2d-57.94400812437604!3d-30.972914774953384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95ada3de5d7ab995%3A0x997f47e1684e06a8!2sEl%20Mangrullo!5e0!3m2!1ses-419!2sar!4v1744424477822!5m2!1ses-419!2sar"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="El Mangrullo location"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
