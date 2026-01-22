import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, addDays, isSameDay, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { citaService } from '../../services/api';
import CitaForm from './CitaForm';
import CitaDetail from './CitaDetail';

const estadoColores = {
  programada: '#1976d2',
  confirmada: '#2e7d32',
  en_progreso: '#ed6c02',
  completada: '#757575',
  cancelada: '#d32f2f',
  no_asistio: '#f57c00',
};

const estadoLabels = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  en_progreso: 'En Progreso',
  completada: 'Completada',
  cancelada: 'Cancelada',
  no_asistio: 'No Asistió',
};

const CalendarioCitas = () => {
  const [citas, setCitas] = useState([]);
  const [proximasCitas, setProximasCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const calendarRef = React.useRef(null);

  const fetchCitas = useCallback(async (start, end) => {
    try {
      setLoading(true);
      const params = {
        fecha_inicio: format(start, 'yyyy-MM-dd'),
        fecha_fin: format(end, 'yyyy-MM-dd'),
        limit: 100, // Obtener suficientes citas para el calendario
      };
      if (filtroEstado !== 'todos') {
        params.estado = filtroEstado;
      }
      const response = await citaService.getAll(params);
      // El backend devuelve { data: { citas: [...], pagination: {...} } }
      const citasData = response.data?.data?.citas || response.data?.data || response.data || [];
      setCitas(Array.isArray(citasData) ? citasData : []);
    } catch (error) {
      console.error('Error fetching citas:', error);
      toast.error('Error al cargar las citas');
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }, [filtroEstado]);

  const fetchProximasCitas = useCallback(async () => {
    try {
      const response = await citaService.getProximas(7);
      const proximasData = response.data.data || response.data || [];
      setProximasCitas(proximasData);
    } catch (error) {
      console.error('Error fetching proximas citas:', error);
    }
  }, []);

  useEffect(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    fetchCitas(start, end);
    fetchProximasCitas();
  }, [selectedDate, filtroEstado, fetchCitas, fetchProximasCitas]);

  const handleDatesSet = (dateInfo) => {
    fetchCitas(dateInfo.start, dateInfo.end);
  };

  const handleEventClick = (clickInfo) => {
    const citaId = clickInfo.event.id;
    const cita = citas.find(c => String(c.id) === String(citaId));
    if (cita) {
      setSelectedCita(cita);
      setDetailOpen(true);
    }
  };

  const handleDateClick = (info) => {
    setSelectedSlot({
      fecha: info.dateStr,
      hora_inicio: info.date.getHours() >= 8 ? format(info.date, 'HH:mm') : '09:00',
    });
    setSelectedCita(null);
    setFormOpen(true);
  };

  const handleEventDrop = async (dropInfo) => {
    const citaId = dropInfo.event.id;
    const newStart = dropInfo.event.start;
    const newEnd = dropInfo.event.end;

    try {
      await citaService.update(citaId, {
        fecha: format(newStart, 'yyyy-MM-dd'),
        hora_inicio: format(newStart, 'HH:mm'),
        hora_fin: newEnd ? format(newEnd, 'HH:mm') : format(addDays(newStart, 0), 'HH:mm'),
      });
      toast.success('Cita reprogramada correctamente');
      refreshData();
    } catch (error) {
      console.error('Error updating cita:', error);
      toast.error('Error al reprogramar la cita');
      dropInfo.revert();
    }
  };

  const handleEventResize = async (resizeInfo) => {
    const citaId = resizeInfo.event.id;
    const newEnd = resizeInfo.event.end;

    try {
      await citaService.update(citaId, {
        hora_fin: format(newEnd, 'HH:mm'),
      });
      toast.success('Duración de cita actualizada');
      refreshData();
    } catch (error) {
      console.error('Error updating cita:', error);
      toast.error('Error al actualizar la duración');
      resizeInfo.revert();
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedCita(null);
    setSelectedSlot(null);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedCita(null);
  };

  const handleEditFromDetail = () => {
    setDetailOpen(false);
    setFormOpen(true);
  };

  const refreshData = () => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    fetchCitas(start, end);
    fetchProximasCitas();
  };

  const handleFormSubmit = () => {
    handleFormClose();
    refreshData();
  };

  const handleStatusChange = async (citaId, newStatus) => {
    try {
      await citaService.updateEstado(citaId, newStatus);
      toast.success('Estado actualizado correctamente');
      refreshData();
      handleDetailClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const events = citas.map(cita => {
    // Extraer solo la parte de fecha (YYYY-MM-DD) si viene en formato ISO completo
    const fechaStr = typeof cita.fecha === 'string' && cita.fecha.includes('T')
      ? cita.fecha.split('T')[0]
      : format(new Date(cita.fecha), 'yyyy-MM-dd');

    // Asegurar formato HH:mm para las horas (quitar segundos si existen)
    const horaInicio = cita.hora_inicio?.substring(0, 5) || '09:00';
    const horaFin = cita.hora_fin?.substring(0, 5) || '10:00';

    return {
      id: String(cita.id),
      title: `${cita.paciente?.nombres || 'Paciente'} ${cita.paciente?.apellidos || ''} - ${cita.motivo || 'Consulta'}`,
      start: `${fechaStr}T${horaInicio}`,
      end: `${fechaStr}T${horaFin}`,
      backgroundColor: estadoColores[cita.estado] || '#1976d2',
      borderColor: estadoColores[cita.estado] || '#1976d2',
      extendedProps: {
        paciente: cita.paciente,
        motivo: cita.motivo,
        estado: cita.estado,
        notas: cita.notas,
      },
    };
  });

  const navigateMiniCalendar = (direction) => {
    const newDate = new Date(miniCalendarDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setMiniCalendarDate(newDate);
  };

  const handleMiniCalendarDateClick = (date) => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(date);
    }
    setSelectedDate(date);
  };

  const generateMiniCalendarDays = () => {
    const year = miniCalendarDate.getFullYear();
    const month = miniCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  if (loading && citas.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Calendario de Citas
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Gestiona las citas de tus pacientes
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Box sx={{
                '& .fc': { fontFamily: 'inherit' },
                '& .fc-toolbar-title': { fontSize: '1.2rem' },
                '& .fc-button': {
                  textTransform: 'capitalize',
                  fontSize: '0.875rem',
                },
                '& .fc-event': {
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                },
                '& .fc-timegrid-slot': {
                  height: '40px',
                },
              }}>
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                  }}
                  locale="es"
                  events={events}
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  slotMinTime="07:00:00"
                  slotMaxTime="21:00:00"
                  slotDuration="00:30:00"
                  allDaySlot={false}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  eventDrop={handleEventDrop}
                  eventResize={handleEventResize}
                  datesSet={handleDatesSet}
                  height="auto"
                  buttonText={{
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <IconButton size="small" onClick={() => navigateMiniCalendar(-1)}>
                  <ChevronLeftIcon />
                </IconButton>
                <Typography variant="subtitle1" fontWeight="bold">
                  {format(miniCalendarDate, 'MMMM yyyy', { locale: es })}
                </Typography>
                <IconButton size="small" onClick={() => navigateMiniCalendar(1)}>
                  <ChevronRightIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, textAlign: 'center' }}>
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                  <Typography key={i} variant="caption" color="textSecondary" fontWeight="bold">
                    {day}
                  </Typography>
                ))}
                {generateMiniCalendarDays().map((date, i) => (
                  <Paper
                    key={i}
                    elevation={0}
                    sx={{
                      p: 0.5,
                      cursor: date ? 'pointer' : 'default',
                      borderRadius: 1,
                      backgroundColor: date && isSameDay(date, selectedDate) ? 'primary.main' : 'transparent',
                      color: date && isSameDay(date, selectedDate) ? 'white' : 'inherit',
                      '&:hover': date ? { backgroundColor: date && isSameDay(date, selectedDate) ? 'primary.dark' : 'action.hover' } : {},
                    }}
                    onClick={() => date && handleMiniCalendarDateClick(date)}
                  >
                    <Typography variant="caption">
                      {date ? date.getDate() : ''}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Filtrar por Estado
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtroEstado}
                  label="Estado"
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  {Object.entries(estadoLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: estadoColores[key],
                          }}
                        />
                        {label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Próximas Citas (7 días)
              </Typography>
              {proximasCitas.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No hay citas programadas
                </Typography>
              ) : (
                <List dense>
                  {proximasCitas.slice(0, 5).map((cita, index) => (
                    <React.Fragment key={cita.id}>
                      <ListItem
                        sx={{ px: 0, cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedCita(cita);
                          setDetailOpen(true);
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <AccessTimeIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight="medium">
                              {cita.paciente?.nombres} {cita.paciente?.apellidos}
                            </Typography>
                          }
                          secondary={
                            <Box component="span">
                              <Typography variant="caption" display="block">
                                {format(parseISO(cita.fecha), 'dd MMM', { locale: es })} - {cita.hora_inicio}
                              </Typography>
                              <Chip
                                label={estadoLabels[cita.estado]}
                                size="small"
                                sx={{
                                  mt: 0.5,
                                  height: 20,
                                  fontSize: '0.65rem',
                                  backgroundColor: estadoColores[cita.estado],
                                  color: 'white',
                                }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < proximasCitas.slice(0, 5).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Leyenda de Estados
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.entries(estadoLabels).map(([key, label]) => (
                  <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: 1,
                        backgroundColor: estadoColores[key],
                      }}
                    />
                    <Typography variant="caption">{label}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <CitaForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        cita={selectedCita}
        initialDate={selectedSlot?.fecha}
        initialTime={selectedSlot?.hora_inicio}
      />

      <CitaDetail
        open={detailOpen}
        onClose={handleDetailClose}
        cita={selectedCita}
        onEdit={handleEditFromDetail}
        onStatusChange={handleStatusChange}
      />
    </Box>
  );
};

export default CalendarioCitas;
