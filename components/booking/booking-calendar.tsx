"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Plus } from "lucide-react"

interface Appointment {
  id: string
  clientName: string
  service: string
  date: string
  time: string
  status: "confirmed" | "pending" | "completed"
  duration: string
}

export function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const mockAppointments: Appointment[] = [
    {
      id: "1",
      clientName: "Sarah Johnson",
      service: "Microblading Consultation",
      date: "2024-01-15",
      time: "10:00 AM",
      status: "confirmed",
      duration: "2 hours",
    },
    {
      id: "2",
      clientName: "Emma Davis",
      service: "Lip Blush Touch-up",
      date: "2024-01-15",
      time: "2:00 PM",
      status: "pending",
      duration: "1.5 hours",
    },
    {
      id: "3",
      clientName: "Maria Rodriguez",
      service: "Eyebrow Mapping",
      date: "2024-01-16",
      time: "11:00 AM",
      status: "confirmed",
      duration: "1 hour",
    },
  ]

  const todaysAppointments = mockAppointments.filter((apt) => apt.date === selectedDate)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-sage/20 text-sage-600 border-sage/30"
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "completed":
        return "bg-green-100 text-green-700 border-green-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-sage/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sage-600">
          <Calendar className="h-5 w-5" />
          Appointment Calendar
        </CardTitle>
        <CardDescription>View and manage your daily appointments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-sage/30 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-sage/50"
          />
          <Button 
            onClick={() => alert('Please use the main booking calendar at /booking to create new appointments')}
            className="bg-gradient-to-r from-sage to-sage-600 hover:from-sage-600 hover:to-sage text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>

        <div className="space-y-4">
          {todaysAppointments.length > 0 ? (
            todaysAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 rounded-lg border border-sage/20 bg-white/50 hover:bg-white/70 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-sage-600" />
                    <span className="font-medium text-foreground">{appointment.clientName}</span>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{appointment.service}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {appointment.time}
                  </div>
                  <span>Duration: {appointment.duration}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No appointments scheduled for this date</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
