import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/language-context";
import AdminHeader from "@/components/admin/header";
import CabinsManager from "@/components/admin/cabins-manager";
import BookingManager from "@/components/admin/booking-manager";
import TestimonialsManager from "@/components/admin/testimonials-manager";
import ActivitiesManager from "@/components/admin/activities-manager";
import SettingsManager from "@/components/admin/settings-manager";
import { Home, Calendar, MessageSquare, MapPin, Settings, Menu } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("cabins");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const statCards = [
    { icon: Home, count: 4, label: t("admin.dashboard.cabins"), color: "text-emerald-600" },
    { icon: Calendar, count: 12, label: t("admin.dashboard.bookings"), color: "text-blue-600" },
    { icon: MessageSquare, count: 4, label: t("admin.dashboard.testimonials"), color: "text-amber-600" },
    { icon: MapPin, count: 3, label: t("admin.dashboard.activities"), color: "text-purple-600" },
  ];

  const tabItems = [
    { value: "cabins", icon: Home, label: t("admin.tabs.cabins") },
    { value: "bookings", icon: Calendar, label: t("admin.tabs.bookings") },
    { value: "testimonials", icon: MessageSquare, label: t("admin.tabs.testimonials") },
    { value: "activities", icon: MapPin, label: t("admin.tabs.activities") },
    { value: "settings", icon: Settings, label: t("admin.tabs.settings") },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />

      <main className="container mx-auto py-6 px-4 md:px-6">
        {/* Welcome Card */}
        <Card className="mb-8 border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl md:text-3xl font-bold">{t("admin.dashboard.welcome")}</CardTitle>
            <CardDescription className="text-emerald-50">{t("admin.dashboard.description")}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-4 px-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card, index) => (
                <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <card.icon className={`h-8 w-8 ${card.color} mb-3`} />
                    <p className="text-2xl font-bold">{card.count}</p>
                    <p className="text-sm text-slate-500">{card.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden mb-4">
          <button 
            onClick={toggleMobileMenu}
            className="w-full flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-slate-200"
          >
            <span className="font-medium">{tabItems.find(tab => tab.value === activeTab)?.label}</span>
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            setMobileMenuOpen(false);
          }} className="w-full">
            {/* Mobile Menu */}
            <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} border-b border-slate-200`}>
              <div className="flex flex-col">
                {tabItems.map((tab) => (
                  <button
                    key={tab.value}
                    className={`flex items-center space-x-2 px-4 py-3 hover:bg-slate-50 ${
                      activeTab === tab.value ? 'bg-emerald-50 text-emerald-600 font-medium' : ''
                    }`}
                    onClick={() => {
                      setActiveTab(tab.value);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden md:block border-b border-slate-200">
              <TabsList className="flex w-full bg-transparent p-0">
                {tabItems.map((tab) => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className="flex-1 rounded-none border-b-2 border-transparent py-3 px-4 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-emerald-50 data-[state=active]:shadow-none"
                  >
                    <div className="flex items-center gap-2">
                      <tab.icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="p-4 md:p-6">
              <TabsContent value="cabins">
                <CabinsManager />
              </TabsContent>

              <TabsContent value="bookings">
                <BookingManager />
              </TabsContent>

              <TabsContent value="testimonials">
                <TestimonialsManager />
              </TabsContent>

              <TabsContent value="activities">
                <ActivitiesManager />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsManager />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}