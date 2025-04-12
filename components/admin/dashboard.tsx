"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/context/language-context"
import AdminHeader from "@/components/admin/header"
import CabinsManager from "@/components/admin/cabins-manager"
import BookingManager from "@/components/admin/booking-manager"
import TestimonialsManager from "@/components/admin/testimonials-manager"
import ActivitiesManager from "@/components/admin/activities-manager"
import SettingsManager from "@/components/admin/settings-manager"
import { Home, Calendar, MessageSquare, MapPin, Settings } from "lucide-react"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("cabins")
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="container mx-auto py-6 px-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("admin.dashboard.welcome")}</CardTitle>
            <CardDescription>{t("admin.dashboard.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Home className="h-8 w-8 text-green mb-2" />
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-sm text-muted-foreground">{t("admin.dashboard.cabins")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Calendar className="h-8 w-8 text-green mb-2" />
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">{t("admin.dashboard.bookings")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <MessageSquare className="h-8 w-8 text-green mb-2" />
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-sm text-muted-foreground">{t("admin.dashboard.testimonials")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <MapPin className="h-8 w-8 text-green mb-2" />
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">{t("admin.dashboard.activities")}</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 h-auto">
            <TabsTrigger value="cabins" className="py-2 data-[state=active]:bg-green data-[state=active]:text-white">
              <Home className="h-4 w-4 mr-2" />
              {t("admin.tabs.cabins")}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="py-2 data-[state=active]:bg-green data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              {t("admin.tabs.bookings")}
            </TabsTrigger>
            <TabsTrigger
              value="testimonials"
              className="py-2 data-[state=active]:bg-green data-[state=active]:text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {t("admin.tabs.testimonials")}
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="py-2 data-[state=active]:bg-green data-[state=active]:text-white"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {t("admin.tabs.activities")}
            </TabsTrigger>
            <TabsTrigger value="settings" className="py-2 data-[state=active]:bg-green data-[state=active]:text-white">
              <Settings className="h-4 w-4 mr-2" />
              {t("admin.tabs.settings")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cabins" className="p-4 bg-white rounded-lg border">
            <CabinsManager />
          </TabsContent>

          <TabsContent value="bookings" className="p-4 bg-white rounded-lg border">
            <BookingManager />
          </TabsContent>

          <TabsContent value="testimonials" className="p-4 bg-white rounded-lg border">
            <TestimonialsManager />
          </TabsContent>

          <TabsContent value="activities" className="p-4 bg-white rounded-lg border">
            <ActivitiesManager />
          </TabsContent>

          <TabsContent value="settings" className="p-4 bg-white rounded-lg border">
            <SettingsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
