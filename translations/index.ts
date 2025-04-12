const translations = {
  es: {
    nav: {
      home: "Inicio",
      cabins: "Cabañas",
      gallery: "Galería",
      activities: "Actividades",
      contact: "Contacto",
      login: "Iniciar Sesión",
      logout: "Cerrar Sesión",
      admin: "Admin",
    },
    hero: {
      bookNow: "Reservar Ahora",
    },
    cabins: {
      title: "Nuestras Cabañas",
      subtitle:
        "Descubra nuestras acogedoras cabañas, diseñadas para brindarle confort y tranquilidad en medio de la naturaleza.",
      capacity: "{{count}} personas",
      perNight: "por noche",
      details: "Ver Detalles",
      bookNow: "Reservar Ahora",
      bookOnBooking: "Reservar en Booking.com",
      amenities: {
        wifi: "WiFi STARLINK",
        ac: "Aire Acondicionado",
        pets: "Mascotas Permitidas",
        kitchen: "Cocina Equipada",
      },
      modal: {
        details: "Detalles",
        amenities: "Comodidades",
        availability: "Disponibilidad",
        description: "Descripción",
        checkAvailability: "Consulta la disponibilidad",
        booked: "Reservado",
        available: "Disponible",
      },
    },
    gallery: {
      title: "Galería",
      subtitle: "Explore nuestra galería de imágenes y descubra la belleza de El Mangrullo.",
      filters: {
        all: "Todos",
        cabins: "Cabañas",
        pool: "Pileta",
        surroundings: "Entorno",
      },
    },
    activities: {
      title: "Actividades Cercanas",
      subtitle: "Descubra las maravillosas actividades y atracciones que puede disfrutar durante su estadía.",
      distance: "A {{distance}} de distancia",
      
     
      close: "Cerrar",
    },
    testimonials: {
      title: "Lo que dicen nuestros huéspedes",
      subtitle: "Descubra las experiencias de quienes ya han disfrutado de El Mangrullo.",
    },
    contact: {
      title: "Contáctenos",
      subtitle: "Estamos aquí para responder cualquier pregunta que pueda tener.",
      formTitle: "Envíenos un mensaje",
      infoTitle: "Información de contacto",
      form: {
        name: "Nombre",
        email: "Correo electrónico",
        phone: "Teléfono",
        message: "Mensaje",
        send: "Enviar Mensaje",
        sending: "Enviando...",
      },
      info: {
        address: "Dirección",
        phone: "Teléfono",
        email: "Correo electrónico",
      },
      successTitle: "¡Mensaje enviado!",
      successMessage: "Gracias por contactarnos. Le responderemos a la brevedad.",
      errorTitle: "Error",
      errorMessage: "Hubo un problema al enviar su mensaje. Por favor, inténtelo nuevamente.",
    },
    footer: {
      about:
        "Un rincón para desconectar y disfrutar de nuestros departamentos totalmente equipados, pensados para tu confort. Naturaleza, tranquilidad y la mejor atención.",
      quickLinks: "Enlaces rápidos",
      contactUs: "Contáctenos",
      rights: "Todos los derechos reservados.",
    },
    whatsapp: {
      label: "Contactar por WhatsApp",
    },
    login: {
      title: "Iniciar Sesión",
      subtitle: "Acceda al panel de administración",
      email: "Correo electrónico",
      password: "Contraseña",
      login: "Iniciar Sesión",
      loggingIn: "Iniciando sesión...",
      orContinueWith: "O continuar con",
      adminCredentials: "Para fines de demostración, puede usar cualquier correo y contraseña.",
      backToHome: "Volver al inicio",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",
    },
    admin: {
      dashboard: {
        welcome: "Bienvenido al Panel de Administración",
        description: "Gestione sus cabañas, reservas, testimonios y actividades desde aquí.",
        cabins: "Cabañas",
        bookings: "Reservas",
        testimonials: "Testimonios",
        activities: "Actividades",
      },
      header: {
        viewSite: "Ver sitio",
        profile: "Perfil",
        settings: "Configuración",
        logout: "Cerrar sesión",
        loggingOut: "Cerrando sesión...",
      },
      tabs: {
        cabins: "Cabañas",
        bookings: "Reservas",
        testimonials: "Testimonios",
        activities: "Actividades",
        settings: "Configuración",
      },
      cabins: {
        title: "Gestión de Cabañas",
        addNew: "Agregar Cabaña",
        perNight: "por noche",
        capacity: "{{count}} personas",
        edit: "Editar",
        delete: "Eliminar",
        editCabin: "Editar Cabaña",
        addCabin: "Agregar Cabaña",
        tabs: {
          general: "General",
          descriptions: "Descripciones",
          amenities: "Comodidades",
        },
        form: {
          nameEs: "Nombre (Español)",
          nameEn: "Nombre (Inglés)",
          namePt: "Nombre (Portugués)",
          price: "Precio por noche (USD)",
          capacity: "Capacidad (personas)",
          image: "Imagen",
          upload: "Subir",
          descriptionEs: "Descripción (Español)",
          descriptionEn: "Descripción (Inglés)",
          descriptionPt: "Descripción (Portugués)",
        },
        amenities: {
          wifi: "WiFi STARLINK",
          ac: "Aire Acondicionado",
          pets: "Mascotas Permitidas",
          kitchen: "Cocina Equipada",
        },
        cancel: "Cancelar",
        update: "Actualizar",
        create: "Crear",
        confirmDelete: "Confirmar eliminación",
        confirmDeleteMessage: "¿Está seguro que desea eliminar la cabaña '{{name}}'? Esta acción no se puede deshacer.",
        deleteSuccess: "Cabaña eliminada",
        deleteSuccessMessage: "La cabaña ha sido eliminada correctamente.",
        updateSuccess: "Cabaña actualizada",
        updateSuccessMessage: "La cabaña ha sido actualizada correctamente.",
        addSuccess: "Cabaña agregada",
        addSuccessMessage: "La cabaña ha sido agregada correctamente.",
      },
      bookings: {
        title: "Gestión de Reservas",
        syncWithBooking: "Sincronizar con Booking.com",
        syncing: "Sincronizando...",
        tabs: {
          list: "Lista",
          calendar: "Calendario",
        },
        bookingId: "ID de Reserva",
        guests: "Huéspedes",
        total: "Total",
        source: "Fuente",
        details: "Detalles",
        confirm: "Confirmar",
        cancel: "Cancelar",
        statuses: {
          confirmed: "Confirmada",
          pending: "Pendiente",
          cancelled: "Cancelada",
        },
        syncSuccess: "Sincronización exitosa",
        syncSuccessMessage: "Las reservas se han sincronizado correctamente con Booking.com.",
        statusChanged: "Estado cambiado",
        statusChangedMessage: "El estado de la reserva ha sido cambiado a '{{status}}'.",
        noBookings: "No hay reservas para esta fecha.",
      },
      testimonials: {
        title: "Gestión de Testimonios",
        addNew: "Agregar Testimonio",
        pendingReviews: "Reseñas pendientes",
        noPendingReviews: "No hay reseñas pendientes de aprobación.",
        approvedReviews: "Reseñas aprobadas",
        pending: "Pendiente",
        approved: "Aprobada",
        edit: "Editar",
        approve: "Aprobar",
        reject: "Rechazar",
        delete: "Eliminar",
        editTestimonial: "Editar Testimonio",
        addTestimonial: "Agregar Testimonio",
        form: {
          name: "Nombre",
          location: "Ubicación",
          rating: "Calificación",
          image: "Imagen",
          upload: "Subir",
          imagePreview: "Vista previa de la imagen",
          textEs: "Texto (Español)",
          textEn: "Texto (Inglés)",
          textPt: "Texto (Portugués)",
        },
        cancel: "Cancelar",
        update: "Actualizar",
        create: "Crear",
        confirmDelete: "Confirmar eliminación",
        confirmDeleteMessage:
          "¿Está seguro que desea eliminar el testimonio de '{{name}}'? Esta acción no se puede deshacer.",
        deleteSuccess: "Testimonio eliminado",
        deleteSuccessMessage: "El testimonio ha sido eliminado correctamente.",
        updateSuccess: "Testimonio actualizado",
        updateSuccessMessage: "El testimonio ha sido actualizado correctamente.",
        addSuccess: "Testimonio agregado",
        addSuccessMessage: "El testimonio ha sido agregado correctamente.",
        approveSuccess: "Testimonio aprobado",
        approveSuccessMessage: "El testimonio ha sido aprobado y ahora es visible en el sitio.",
        rejectSuccess: "Testimonio rechazado",
        rejectSuccessMessage: "El testimonio ha sido rechazado y no será visible en el sitio.",
      },
      activities: {
        title: "Gestión de Actividades",
        addNew: "Agregar Actividad",
        distance: "A {{distance}} de distancia",
        edit: "Editar",
        delete: "Eliminar",
        editActivity: "Editar Actividad",
        addActivity: "Agregar Actividad",
        form: {
          titleEs: "Título (Español)",
          titleEn: "Título (Inglés)",
          titlePt: "Título (Portugués)",
          location: "Ubicación",
          distance: "Distancia",
          image: "Imagen",
          upload: "Subir",
          descriptionEs: "Descripción (Español)",
          descriptionEn: "Descripción (Inglés)",
          descriptionPt: "Descripción (Portugués)",
        },
        cancel: "Cancelar",
        update: "Actualizar",
        create: "Crear",
        confirmDelete: "Confirmar eliminación",
        confirmDeleteMessage:
          "¿Está seguro que desea eliminar la actividad '{{name}}'? Esta acción no se puede deshacer.",
        deleteSuccess: "Actividad eliminada",
        deleteSuccessMessage: "La actividad ha sido eliminada correctamente.",
        updateSuccess: "Actividad actualizada",
        updateSuccessMessage: "La actividad ha sido actualizada correctamente.",
        addSuccess: "Actividad agregada",
        addSuccessMessage: "La actividad ha sido agregada correctamente.",
      },
      settings: {
        title: "Configuración",
        edit: "Editar",
        generalSettings: "Configuración General",
        underConstruction: "Esta sección está en construcción.",
        editSettings: "Editar Configuración",
        siteName: "Nombre del Sitio",
        cancel: "Cancelar",
        save: "Guardar",
        saveSuccess: "Configuración guardada",
        saveSuccessMessage: "La configuración ha sido guardada correctamente.",
      },
    },
  },
  en: {
    nav: {
      home: "Home",
      cabins: "Cabins",
      gallery: "Gallery",
      activities: "Activities",
      contact: "Contact",
      login: "Login",
      logout: "Logout",
      admin: "Admin",
    },
    hero: {
      bookNow: "Book Now",
    },
    cabins: {
      title: "Our Cabins",
      subtitle: "Discover our cozy cabins, designed to provide comfort and tranquility in the midst of nature.",
      capacity: "{{count}} people",
      perNight: "per night",
      details: "View Details",
      bookNow: "Book Now",
      bookOnBooking: "Book on Booking.com",
      amenities: {
        wifi: "STARLINK WiFi",
        ac: "Air Conditioning",
        pets: "Pets Allowed",
        kitchen: "Equipped Kitchen",
      },
      modal: {
        details: "Details",
        amenities: "Amenities",
        availability: "Availability",
        description: "Description",
        checkAvailability: "Check availability",
        booked: "Booked",
        available: "Available",
      },
    },
    gallery: {
      title: "Gallery",
      subtitle: "Explore our image gallery and discover the beauty of El Mangrullo.",
      filters: {
        all: "All",
        cabins: "Cabins",
        pool: "Pool",
        surroundings: "Surroundings",
      },
    },
    activities: {
      title: "Nearby Activities",
      subtitle: "Discover the wonderful activities and attractions you can enjoy during your stay.",
      distance: "{{distance}} away",
      addNew: "Add Activity",
      addNewDescription: "Add a new activity to show guests.",
      close: "Close",
    },
    testimonials: {
      title: "What Our Guests Say",
      subtitle: "Discover the experiences of those who have already enjoyed El Mangrullo.",
    },
    contact: {
      title: "Contact Us",
      subtitle: "We are here to answer any questions you may have.",
      formTitle: "Send us a message",
      infoTitle: "Contact information",
      form: {
        name: "Name",
        email: "Email",
        phone: "Phone",
        message: "Message",
        send: "Send Message",
        sending: "Sending...",
      },
      info: {
        address: "Address",
        phone: "Phone",
        email: "Email",
      },
      successTitle: "Message sent!",
      successMessage: "Thank you for contacting us. We will respond shortly.",
      errorTitle: "Error",
      errorMessage: "There was a problem sending your message. Please try again.",
    },
    footer: {
      about:
        "El Mangrullo offers luxury cabins in a unique natural environment, with all the amenities for an unforgettable stay.",
      quickLinks: "Quick links",
      contactUs: "Contact us",
      rights: "All rights reserved.",
    },
    whatsapp: {
      label: "Contact via WhatsApp",
    },
    login: {
      title: "Login",
      subtitle: "Access the admin panel",
      email: "Email",
      password: "Password",
      login: "Login",
      loggingIn: "Logging in...",
      orContinueWith: "Or continue with",
      adminCredentials: "For demonstration purposes, you can use any email and password.",
      backToHome: "Back to home",
      showPassword: "Show password",
      hidePassword: "Hide password",
    },
    admin: {
      dashboard: {
        welcome: "Welcome to the Admin Panel",
        description: "Manage your cabins, bookings, testimonials, and activities from here.",
        cabins: "Cabins",
        bookings: "Bookings",
        testimonials: "Testimonials",
        activities: "Activities",
      },
      header: {
        viewSite: "View site",
        profile: "Profile",
        settings: "Settings",
        logout: "Logout",
        loggingOut: "Logging out...",
      },
      tabs: {
        cabins: "Cabins",
        bookings: "Bookings",
        testimonials: "Testimonials",
        activities: "Activities",
        settings: "Settings",
      },
      cabins: {
        title: "Cabins Management",
        addNew: "Add Cabin",
        perNight: "per night",
        capacity: "{{count}} people",
        edit: "Edit",
        delete: "Delete",
        editCabin: "Edit Cabin",
        addCabin: "Add Cabin",
        tabs: {
          general: "General",
          descriptions: "Descriptions",
          amenities: "Amenities",
        },
        form: {
          nameEs: "Name (Spanish)",
          nameEn: "Name (English)",
          namePt: "Name (Portuguese)",
          price: "Price per night (USD)",
          capacity: "Capacity (people)",
          image: "Image",
          upload: "Upload",
          descriptionEs: "Description (Spanish)",
          descriptionEn: "Description (English)",
          descriptionPt: "Description (Portuguese)",
        },
        amenities: {
          wifi: "STARLINK WiFi",
          ac: "Air Conditioning",
          pets: "Pets Allowed",
          kitchen: "Equipped Kitchen",
        },
        cancel: "Cancel",
        update: "Update",
        create: "Create",
        confirmDelete: "Confirm deletion",
        confirmDeleteMessage: "Are you sure you want to delete the cabin '{{name}}'? This action cannot be undone.",
        deleteSuccess: "Cabin deleted",
        deleteSuccessMessage: "The cabin has been successfully deleted.",
        updateSuccess: "Cabin updated",
        updateSuccessMessage: "The cabin has been successfully updated.",
        addSuccess: "Cabin added",
        addSuccessMessage: "The cabin has been successfully added.",
      },
      bookings: {
        title: "Bookings Management",
        syncWithBooking: "Sync with Booking.com",
        syncing: "Syncing...",
        tabs: {
          list: "List",
          calendar: "Calendar",
        },
        bookingId: "Booking ID",
        guests: "Guests",
        total: "Total",
        source: "Source",
        details: "Details",
        confirm: "Confirm",
        cancel: "Cancel",
        statuses: {
          confirmed: "Confirmed",
          pending: "Pending",
          cancelled: "Cancelled",
        },
        syncSuccess: "Sync successful",
        syncSuccessMessage: "Bookings have been successfully synchronized with Booking.com.",
        statusChanged: "Status changed",
        statusChangedMessage: "The booking status has been changed to '{{status}}'.",
        noBookings: "No bookings for this date.",
      },
      testimonials: {
        title: "Testimonials Management",
        addNew: "Add Testimonial",
        pendingReviews: "Pending reviews",
        noPendingReviews: "No reviews pending approval.",
        approvedReviews: "Approved reviews",
        pending: "Pending",
        approved: "Approved",
        edit: "Edit",
        approve: "Approve",
        reject: "Reject",
        delete: "Delete",
        editTestimonial: "Edit Testimonial",
        addTestimonial: "Add Testimonial",
        form: {
          name: "Name",
          location: "Location",
          rating: "Rating",
          image: "Image",
          upload: "Upload",
          imagePreview: "Image preview",
          textEs: "Text (Spanish)",
          textEn: "Text (English)",
          textPt: "Text (Portuguese)",
        },
        cancel: "Cancel",
        update: "Update",
        create: "Create",
        confirmDelete: "Confirm deletion",
        confirmDeleteMessage:
          "Are you sure you want to delete the testimonial from '{{name}}'? This action cannot be undone.",
        deleteSuccess: "Testimonial deleted",
        deleteSuccessMessage: "The testimonial has been successfully deleted.",
        updateSuccess: "Testimonial updated",
        updateSuccessMessage: "The testimonial has been successfully updated.",
        addSuccess: "Testimonial added",
        addSuccessMessage: "The testimonial has been successfully added.",
        approveSuccess: "Testimonial approved",
        approveSuccessMessage: "The testimonial has been approved and is now visible on the site.",
        rejectSuccess: "Testimonial rejected",
        rejectSuccessMessage: "The testimonial has been rejected and will not be visible on the site.",
      },
      activities: {
        title: "Activities Management",
        addNew: "Add Activity",
        distance: "{{distance}} away",
        edit: "Edit",
        delete: "Delete",
        editActivity: "Edit Activity",
        addActivity: "Add Activity",
        form: {
          titleEs: "Title (Spanish)",
          titleEn: "Title (English)",
          titlePt: "Title (Portuguese)",
          location: "Location",
          distance: "Distance",
          image: "Image",
          upload: "Upload",
          descriptionEs: "Description (Spanish)",
          descriptionEn: "Description (English)",
          descriptionPt: "Description (Portuguese)",
        },
        cancel: "Cancel",
        update: "Update",
        create: "Create",
        confirmDelete: "Confirm deletion",
        confirmDeleteMessage: "Are you sure you want to delete the activity '{{name}}'? This action cannot be undone.",
        deleteSuccess: "Activity deleted",
        deleteSuccessMessage: "The activity has been successfully deleted.",
        updateSuccess: "Activity updated",
        updateSuccessMessage: "The activity has been successfully updated.",
        addSuccess: "Activity added",
        addSuccessMessage: "The activity has been successfully added.",
      },
      settings: {
        title: "Settings",
        edit: "Edit",
        generalSettings: "General Settings",
        underConstruction: "This section is under construction.",
        editSettings: "Edit Settings",
        siteName: "Site Name",
        cancel: "Cancel",
        save: "Save",
        saveSuccess: "Settings saved",
        saveSuccessMessage: "The settings have been successfully saved.",
      },
    },
  },
  pt: {
    nav: {
      home: "Início",
      cabins: "Cabanas",
      gallery: "Galeria",
      activities: "Atividades",
      contact: "Contato",
      login: "Entrar",
      logout: "Sair",
      admin: "Admin",
    },
    hero: {
      bookNow: "Reservar Agora",
    },
    cabins: {
      title: "Nossas Cabanas",
      subtitle:
        "Descubra nossas aconchegantes cabanas, projetadas para proporcionar conforto e tranquilidade em meio à natureza.",
      capacity: "{{count}} pessoas",
      perNight: "por noite",
      details: "Ver Detalhes",
      bookNow: "Reservar Agora",
      bookOnBooking: "Reservar no Booking.com",
      amenities: {
        wifi: "WiFi STARLINK",
        ac: "Ar Condicionado",
        pets: "Animais Permitidos",
        kitchen: "Cozinha Equipada",
      },
      modal: {
        details: "Detalhes",
        amenities: "Comodidades",
        availability: "Disponibilidade",
        description: "Descrição",
        checkAvailability: "Verifique a disponibilidade",
        booked: "Reservado",
        available: "Disponível",
      },
    },
    gallery: {
      title: "Galeria",
      subtitle: "Explore nossa galeria de imagens e descubra a beleza de El Mangrullo.",
      filters: {
        all: "Todos",
        cabins: "Cabanas",
        pool: "Piscina",
        surroundings: "Entorno",
      },
    },
    activities: {
      title: "Atividades Próximas",
      subtitle: "Descubra as maravilhosas atividades e atrações que você pode desfrutar durante sua estadia.",
      distance: "A {{distance}} de distância",
      addNew: "Adicionar Atividade",
      addNewDescription: "Adicionar uma nova atividade para mostrar aos hóspedes.",
      close: "Fechar",
    },
    testimonials: {
      title: "O que nossos hóspedes dizem",
      subtitle: "Descubra as experiências daqueles que já desfrutaram de El Mangrullo.",
    },
    contact: {
      title: "Contate-nos",
      subtitle: "Estamos aqui para responder qualquer pergunta que você possa ter.",
      formTitle: "Envie-nos uma mensagem",
      infoTitle: "Informações de contato",
      form: {
        name: "Nome",
        email: "Email",
        phone: "Telefone",
        message: "Mensagem",
        send: "Enviar Mensagem",
        sending: "Enviando...",
      },
      info: {
        address: "Endereço",
        phone: "Telefone",
        email: "Email",
      },
      successTitle: "Mensagem enviada!",
      successMessage: "Obrigado por nos contatar. Responderemos em breve.",
      errorTitle: "Erro",
      errorMessage: "Houve um problema ao enviar sua mensagem. Por favor, tente novamente.",
    },
    footer: {
      about:
        "El Mangrullo oferece cabanas de luxo em um ambiente natural único, com todas as comodidades para uma estadia inesquecível.",
      quickLinks: "Links rápidos",
      contactUs: "Contate-nos",
      rights: "Todos os direitos reservados.",
    },
    whatsapp: {
      label: "Contato via WhatsApp",
    },
    login: {
      title: "Entrar",
      subtitle: "Acesse o painel de administração",
      email: "Email",
      password: "Senha",
      login: "Entrar",
      loggingIn: "Entrando...",
      orContinueWith: "Ou continue com",
      adminCredentials: "Para fins de demonstração, você pode usar qualquer email e senha.",
      backToHome: "Voltar ao início",
      showPassword: "Mostrar senha",
      hidePassword: "Ocultar senha",
    },
    admin: {
      dashboard: {
        welcome: "Bem-vindo ao Painel de Administração",
        description: "Gerencie suas cabanas, reservas, depoimentos e atividades a partir daqui.",
        cabins: "Cabanas",
        bookings: "Reservas",
        testimonials: "Depoimentos",
        activities: "Atividades",
      },
      header: {
        viewSite: "Ver site",
        profile: "Perfil",
        settings: "Configurações",
        logout: "Sair",
        loggingOut: "Saindo...",
      },
      tabs: {
        cabins: "Cabanas",
        bookings: "Reservas",
        testimonials: "Depoimentos",
        activities: "Atividades",
        settings: "Configurações",
      },
      cabins: {
        title: "Gestão de Cabanas",
        addNew: "Adicionar Cabana",
        perNight: "por noite",
        capacity: "{{count}} pessoas",
        edit: "Editar",
        delete: "Excluir",
        editCabin: "Editar Cabana",
        addCabin: "Adicionar Cabana",
        tabs: {
          general: "Geral",
          descriptions: "Descrições",
          amenities: "Comodidades",
        },
        form: {
          nameEs: "Nome (Espanhol)",
          nameEn: "Nome (Inglês)",
          namePt: "Nome (Português)",
          price: "Preço por noite (USD)",
          capacity: "Capacidade (pessoas)",
          image: "Imagem",
          upload: "Enviar",
          descriptionEs: "Descrição (Espanhol)",
          descriptionEn: "Descrição (Inglês)",
          descriptionPt: "Descrição (Português)",
        },
        amenities: {
          wifi: "WiFi STARLINK",
          ac: "Ar Condicionado",
          pets: "Animais Permitidos",
          kitchen: "Cozinha Equipada",
        },
        cancel: "Cancelar",
        update: "Atualizar",
        create: "Criar",
        confirmDelete: "Confirmar exclusão",
        confirmDeleteMessage: "Tem certeza que deseja excluir a cabana '{{name}}'? Esta ação não pode ser desfeita.",
        deleteSuccess: "Cabana excluída",
        deleteSuccessMessage: "A cabana foi excluída com sucesso.",
        updateSuccess: "Cabana atualizada",
        updateSuccessMessage: "A cabana foi atualizada com sucesso.",
        addSuccess: "Cabana adicionada",
        addSuccessMessage: "A cabana foi adicionada com sucesso.",
      },
      bookings: {
        title: "Gestão de Reservas",
        syncWithBooking: "Sincronizar com Booking.com",
        syncing: "Sincronizando...",
        tabs: {
          list: "Lista",
          calendar: "Calendário",
        },
        bookingId: "ID da Reserva",
        guests: "Hóspedes",
        total: "Total",
        source: "Fonte",
        details: "Detalhes",
        confirm: "Confirmar",
        cancel: "Cancelar",
        statuses: {
          confirmed: "Confirmada",
          pending: "Pendente",
          cancelled: "Cancelada",
        },
        syncSuccess: "Sincronização bem-sucedida",
        syncSuccessMessage: "As reservas foram sincronizadas com sucesso com o Booking.com.",
        statusChanged: "Status alterado",
        statusChangedMessage: "O status da reserva foi alterado para '{{status}}'.",
        noBookings: "Não há reservas para esta data.",
      },
      testimonials: {
        title: "Gestão de Depoimentos",
        addNew: "Adicionar Depoimento",
        pendingReviews: "Avaliações pendentes",
        noPendingReviews: "Não há avaliações pendentes de aprovação.",
        approvedReviews: "Avaliações aprovadas",
        pending: "Pendente",
        approved: "Aprovada",
        edit: "Editar",
        approve: "Aprovar",
        reject: "Rejeitar",
        delete: "Excluir",
        editTestimonial: "Editar Depoimento",
        addTestimonial: "Adicionar Depoimento",
        form: {
          name: "Nome",
          location: "Localização",
          rating: "Avaliação",
          image: "Imagem",
          upload: "Enviar",
          imagePreview: "Pré-visualização da imagem",
          textEs: "Texto (Espanhol)",
          textEn: "Texto (Inglês)",
          textPt: "Texto (Português)",
        },
        cancel: "Cancelar",
        update: "Atualizar",
        create: "Criar",
        confirmDelete: "Confirmar exclusão",
        confirmDeleteMessage:
          "Tem certeza que deseja excluir o depoimento de '{{name}}'? Esta ação não pode ser desfeita.",
        deleteSuccess: "Depoimento excluído",
        deleteSuccessMessage: "O depoimento foi excluído com sucesso.",
        updateSuccess: "Depoimento atualizado",
        updateSuccessMessage: "O depoimento foi atualizado com sucesso.",
        addSuccess: "Depoimento adicionado",
        addSuccessMessage: "O depoimento foi adicionado com sucesso.",
        approveSuccess: "Depoimento aprovado",
        approveSuccessMessage: "O depoimento foi aprovado e agora está visível no site.",
        rejectSuccess: "Depoimento rejeitado",
        rejectSuccessMessage: "O depoimento foi rejeitado e não será visível no site.",
      },
      activities: {
        title: "Gestão de Atividades",
        addNew: "Adicionar Atividade",
        distance: "A {{distance}} de distância",
        edit: "Editar",
        delete: "Excluir",
        editActivity: "Editar Atividade",
        addActivity: "Adicionar Atividade",
        form: {
          titleEs: "Título (Espanhol)",
          titleEn: "Título (Inglês)",
          titlePt: "Título (Português)",
          location: "Localização",
          distance: "Distância",
          image: "Imagem",
          upload: "Enviar",
          descriptionEs: "Descrição (Espanhol)",
          descriptionEn: "Descrição (Inglês)",
          descriptionPt: "Descrição (Português)",
        },
        cancel: "Cancelar",
        update: "Atualizar",
        create: "Criar",
        confirmDelete: "Confirmar exclusão",
        confirmDeleteMessage: "Tem certeza que deseja excluir a atividade '{{name}}'? Esta ação não pode ser desfeita.",
        deleteSuccess: "Atividade excluída",
        deleteSuccessMessage: "A atividade foi excluída com sucesso.",
        updateSuccess: "Atividade atualizada",
        updateSuccessMessage: "A atividade foi atualizada com sucesso.",
        addSuccess: "Atividade adicionada",
        addSuccessMessage: "A atividade foi adicionada com sucesso.",
      },
      settings: {
        title: "Configurações",
        edit: "Editar",
        generalSettings: "Configurações Gerais",
        underConstruction: "Esta seção está em construção.",
        editSettings: "Editar Configurações",
        siteName: "Nome do Site",
        cancel: "Cancelar",
        save: "Salvar",
        saveSuccess: "Configurações salvas",
        saveSuccessMessage: "As configurações foram salvas com sucesso.",
      },
    },
  },
}

export default translations
