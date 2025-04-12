"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/context/language-context"

export default function SettingsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { t } = useLanguage()
  const { toast } = useToast()

  const handleOpenDialog = () => {
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  const handleSaveSettings = () => {
    toast({
      title: t("admin.settings.saveSuccess"),
      description: t("admin.settings.saveSuccessMessage"),
    })
    setIsDialogOpen(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown">{t("admin.settings.title")}</h2>
        <Button onClick={handleOpenDialog} className="bg-green hover:bg-green/90">
          {t("admin.settings.edit")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.settings.generalSettings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("admin.settings.underConstruction")}</p>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.settings.editSettings")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium leading-none text-gray-800">
                {t("admin.settings.siteName")}
              </label>
              <Input id="name" className="col-span-3 h-10" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              {t("admin.settings.cancel")}
            </Button>
            <Button type="submit" onClick={handleSaveSettings} className="bg-green hover:bg-green/90">
              {t("admin.settings.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
