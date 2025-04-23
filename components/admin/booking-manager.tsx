"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Calendar as CalendarIcon, Loader2, X } from "lucide-react"
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import { Calendar } from "@/components/ui/calendar"

export default function GoogleCalendarContainer() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <GoogleCalendarView />
    </GoogleOAuthProvider>
  )
}

function GoogleCalendarView() {
  const { toast } = useToast()
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [calendarList, setCalendarList] = useState<any[]>([])
  const [selectedCalendar, setSelectedCalendar] = useState<string>("primary")
  const [date, setDate] = useState<Date>(new Date())
  const [eventsByDate, setEventsByDate] = useState<{[key: string]: any[]}>({})
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([])
  const [showEventDetails, setShowEventDetails] = useState<boolean>(false)
  
  // Función para obtener la lista de calendarios
  const fetchCalendarList = async (token: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        setCalendarList(data.items);
      }
    } catch (error) {
      console.error('Error fetching calendar list:', error);
    }
  }

  // Función para obtener eventos del calendario
  const fetchCalendarEvents = async (token: string, calendarId = selectedCalendar) => {
    try {
      setIsLoading(true)
      
      // Configurar el primer día del mes actual
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      
      // Configurar el último día del mes siguiente
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 2, 0);
      
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${firstDay.toISOString()}&timeMax=${lastDay.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=250`;
      
      console.log("Fetching calendar events with URL:", url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(`Error al obtener eventos: ${responseData.error?.message || response.statusText}`);
      }
      
      if (responseData.items && Array.isArray(responseData.items)) {
        console.log(`Found ${responseData.items.length} events`);
        
        // Categorizar eventos por tipo
        const categorizedEvents = responseData.items.map((event: any) => {
          let category = 'default';
          
          // Identificar feriados
          if (event.summary?.toLowerCase().includes('feriado') || 
              event.description?.toLowerCase().includes('feriado') ||
              event.summary?.toLowerCase().includes('holiday')) {
            category = 'holiday';
          }
          
          // Identificar eventos de BNB
          else if (event.summary?.toLowerCase().includes('bnb') || 
                  event.description?.toLowerCase().includes('bnb')) {
            category = 'bnb';
          }
          
          return {
            ...event,
            category
          };
        });
        
        setEvents(categorizedEvents);
        
        // Organizar eventos por fecha
        const eventMap: {[key: string]: any[]} = {};
        
        categorizedEvents.forEach(event => {
          let startDate;
          
          if (event.start?.date) {
            // Evento de día completo
            startDate = event.start.date;
          } else if (event.start?.dateTime) {
            // Evento con hora específica
            startDate = event.start.dateTime.split('T')[0];
          } else {
            return; // Ignorar eventos sin fecha
          }
          
          if (!eventMap[startDate]) {
            eventMap[startDate] = [];
          }
          
          eventMap[startDate].push(event);
        });
        
        setEventsByDate(eventMap);
        
        // Seleccionar eventos del día actual
        const todayStr = new Date().toISOString().split('T')[0];
        setSelectedDayEvents(eventMap[todayStr] || []);
      } else {
        setEvents([]);
        setEventsByDate({});
        setSelectedDayEvents([]);
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar eventos del calendario",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Hook para manejar el inicio de sesión con Google
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Login successful");
      
      setAccessToken(tokenResponse.access_token);
      
      // Primero obtenemos la lista de calendarios
      await fetchCalendarList(tokenResponse.access_token);
      
      // Luego obtenemos los eventos del calendario primario
      await fetchCalendarEvents(tokenResponse.access_token);
      
      setIsSignedIn(true);
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      toast({
        title: "Error de autenticación",
        description: "No se pudo iniciar sesión con Google",
        variant: "destructive"
      });
    },
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    flow: 'implicit',
  });

  // Manejar cambio de calendario
  const handleCalendarChange = async (calendarId: string) => {
    if (!accessToken) return;
    
    setSelectedCalendar(calendarId);
    await fetchCalendarEvents(accessToken, calendarId);
  };

  // Manejar cambio de mes
  const handleMonthChange = async (newDate: Date) => {
    setDate(newDate);
    
    if (accessToken) {
      await fetchCalendarEvents(accessToken);
    }
  };

  // Manejar selección de día
  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    
    const dayStr = day.toISOString().split('T')[0];
    setSelectedDayEvents(eventsByDate[dayStr] || []);
    setShowEventDetails(true);
  };

  // Cerrar sesión
  const handleSignOut = () => {
    setIsSignedIn(false);
    setAccessToken(null);
    setEvents([]);
    setCalendarList([]);
    setEventsByDate({});
    setSelectedDayEvents([]);
  };

  // Manejar inicio/cierre de sesión
  const handleAuthClick = () => {
    if (isSignedIn) {
      handleSignOut();
    } else {
      login();
    }
  };

  // Formatear fecha y hora de un evento
  const formatEventDateTime = (dateTimeString: string | undefined, dateString: string | undefined) => {
    if (!dateTimeString && !dateString) return "Fecha no disponible";
    
    const date = new Date(dateTimeString || dateString || "");
    
    if (dateTimeString) {
      // Para eventos con hora específica
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      // Para eventos de día completo
      return "Todo el día";
    }
  };

  // Función para generar las clases CSS para los días con eventos
  const getDayClassName = (day: Date): string => {
    const dayStr = day.toISOString().split('T')[0];
    const dayEvents = eventsByDate[dayStr] || [];
    
    if (dayEvents.length === 0) return "";
    
    const hasHoliday = dayEvents.some(event => event.category === 'holiday');
    const hasBNB = dayEvents.some(event => event.category === 'bnb');
    
    if (hasHoliday) return "bg-blue-100 rounded-md";
    if (hasBNB) return "bg-pink-100 rounded-md";
    return "bg-gray-100 rounded-md";
  };

  // Cerrar panel de detalles
  const closeEventDetails = () => {
    setShowEventDetails(false);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-wrap justify-between items-center border-b pb-4">
          <h2 className="text-xl md:text-2xl font-bold">Google Calendar</h2>
          <Button 
            onClick={handleAuthClick}
            disabled={isLoading}
            className={isSignedIn ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isSignedIn ? (
              "Cerrar sesión"
            ) : (
              "Iniciar con Google"
            )}
          </Button>
        </CardHeader>
        
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : isSignedIn ? (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                {/* Selector de calendario */}
                {calendarList.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seleccionar calendario:
                    </label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={selectedCalendar}
                      onChange={(e) => handleCalendarChange(e.target.value)}
                    >
                      <option value="primary">Calendario principal</option>
                      {calendarList.map(calendar => (
                        <option key={calendar.id} value={calendar.id}>
                          {calendar.summary} {calendar.primary ? '(Principal)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Leyenda de colores */}
                <div className="mb-4 flex gap-4 justify-start text-sm flex-wrap">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-100 rounded-sm mr-1"></div>
                    <span>Feriados</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-pink-100 rounded-sm mr-1"></div>
                    <span>BNB</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-100 rounded-sm mr-1"></div>
                    <span>Otros eventos</span>
                  </div>
                </div>
                
                {/* Calendario */}
                <div className="border rounded-lg p-1 md:p-3">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDaySelect}
                    onMonthChange={handleMonthChange}
                    className="w-full"
                    modifiers={{
                      hasEvents: (day) => {
                        const dayStr = day.toISOString().split('T')[0];
                        return !!eventsByDate[dayStr]?.length;
                      }
                    }}
                    modifiersClassNames={{
                      hasEvents: "font-bold"
                    }}
                    components={{
                      Day: (props) => {
                        const customClass = getDayClassName(props.date);
                        return (
                          <div className={`${customClass} hover:bg-gray-200 cursor-pointer p-2 text-center`}>
                            {props.date.getDate()}
                            {eventsByDate[props.date.toISOString().split('T')[0]]?.length > 0 && (
                              <span className="block h-1">
                                •
                              </span>
                            )}
                          </div>
                        );
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Panel lateral para eventos del día seleccionado */}
              <div className={`w-full md:w-1/2 ${showEventDetails ? 'block' : 'hidden md:block'}`}>
                <div className="border rounded-lg p-4 relative">
                  <div className="md:hidden absolute top-2 right-2">
                    <button 
                      onClick={closeEventDetails}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <h3 className="font-medium text-lg mb-4">
                    Eventos para {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </h3>
                  
                  {selectedDayEvents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDayEvents.map(event => {
                        let bgColor = "bg-white";
                        let borderColor = "border-gray-200";
                        
                        if (event.category === 'holiday') {
                          bgColor = "bg-blue-50";
                          borderColor = "border-blue-200";
                        } else if (event.category === 'bnb') {
                          bgColor = "bg-pink-50";
                          borderColor = "border-pink-200";
                        }
                        
                        return (
                          <div 
                            key={event.id} 
                            className={`p-3 border ${borderColor} ${bgColor} rounded-lg shadow-sm`}
                          >
                            <div className="flex items-start gap-3">
                              <CalendarIcon className="text-gray-500 mt-1 flex-shrink-0" size={18} />
                              <div>
                                <h4 className="font-medium">{event.summary || "Evento sin título"}</h4>
                                <p className="text-sm text-gray-600">
                                  {formatEventDateTime(event.start?.dateTime, event.start?.date)}
                                </p>
                                {event.location && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    <span className="font-medium">Ubicación:</span> {event.location}
                                  </p>
                                )}
                                {event.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {event.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500">No hay eventos para este día</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg text-gray-500">Inicia sesión para ver tu calendario</p>
              <p className="text-sm text-gray-400 mt-2">Podrás ver tus eventos, feriados y más</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}