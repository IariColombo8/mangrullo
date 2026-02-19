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
    <section id="contact" className="section-padding bg-beige py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title text-brown">{t("contact.title")}</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">{t("contact.subtitle")}</p>
        </div>

        {/* Contact Info and Map - Horizontal layout on desktop */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-brown mb-6">{t("contact.infoTitle")}</h3>

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
                      <a href="tel:+5493456551306" className="hover:text-green transition-colors">
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
            <div className="h-80 lg:h-full min-h-64 bg-gray-200 rounded-lg overflow-hidden shadow-sm">
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
