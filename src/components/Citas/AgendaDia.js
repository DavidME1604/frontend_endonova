import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  IconButton,
  Button,
  Divider,
  Tooltip,
  Paper,
  TextField,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { format, addDays, subDays, isToday, isBefore, isAfter, parse } from 'date-fns';
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

const AgendaDia = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);

  const fetchCitasDelDia = useCallback(async () => {
    try {
      setLoading(true);
      const fechaStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await citaService.getByFecha(fechaStr);
      const citasData = response.data.data || response.data || [];
      const sortedCitas = citasData.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
      setCitas(sortedCitas);
    } catch (error) {
      console.error('Error fetching citas del dia:', error);
      toast.error('Error al cargar las citas del día');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchCitasDelDia();
  }, [fetchCitasDelDia]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handlePrevDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleDateChange = (event) => {
    setSelectedDate(new Date(event.target.value + 'T00:00:00'));
  };

  const handleOpenForm = (cita = null) => {
    setSelectedCita(cita);
    setFormOpen(true);
  };

  const handleOpenDetail = (cita) => {
    setSelectedCita(cita);
    setDetailOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedCita(null);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedCita(null);
  };

  const handleFormSubmit = () => {
    handleCloseForm();
    fetchCitasDelDia();
  };

  const handleEditFromDetail = () => {
    setDetailOpen(false);
    setFormOpen(true);
  };

  const handleStatusChange = async (citaId, newStatus) => {
    try {
      await citaService.updateEstado(citaId, newStatus);
      toast.success('Estado actualizado correctamente');
      fetchCitasDelDia();
      handleCloseDetail();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleQuickStatusChange = async (citaId, newStatus) => {
    try {
      await citaService.updateEstado(citaId, newStatus);
      toast.success('Estado actualizado');
      fetchCitasDelDia();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar');
    }
  };

  const isCurrentTimeSlot = (horaInicio, horaFin) => {
    if (!isToday(selectedDate)) return false;

    const now = currentTime;
    const inicio = parse(horaInicio, 'HH:mm', selectedDate);
    const fin = parse(horaFin, 'HH:mm', selectedDate);

    return isAfter(now, inicio) && isBefore(now, fin);
  };

  const isPastTime = (horaFin) => {
    if (!isToday(selectedDate)) return isBefore(selectedDate, new Date());

    const fin = parse(horaFin, 'HH:mm', selectedDate);
    return isBefore(fin, currentTime);
  };

  const getCurrentTimePosition = () => {
    if (!isToday(selectedDate)) return null;

    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getQuickActions = (cita) => {
    const actions = [];
    const estado = cita.estado;

    if (estado === 'programada') {
      actions.push({ icon: <CheckCircleIcon fontSize="small" />, status: 'confirmada', tooltip: 'Confirmar', color: 'success' });
    } else if (estado === 'confirmada') {
      actions.push({ icon: <PlayIcon fontSize="small" />, status: 'en_progreso', tooltip: 'Iniciar', color: 'warning' });
    } else if (estado === 'en_progreso') {
      actions.push({ icon: <CheckCircleIcon fontSize="small" />, status: 'completada', tooltip: 'Completar', color: 'success' });
    }

    return actions;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Agenda del Día
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Vista detallada de las citas programadas
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={handlePrevDay}>
                <ChevronLeftIcon />
              </IconButton>

              <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
              </Typography>

              <IconButton onClick={handleNextDay}>
                <ChevronRightIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                type="date"
                size="small"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
              />

              <Button
                variant="outlined"
                startIcon={<TodayIcon />}
                onClick={handleToday}
                disabled={isToday(selectedDate)}
              >
                Hoy
              </Button>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
              >
                Nueva Cita
              </Button>
            </Box>
          </Box>

          {isToday(selectedDate) && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#d32f2f', animation: 'pulse 2s infinite' }} />
              <Typography variant="body2" color="textSecondary">
                Hora actual: {getCurrentTimePosition()}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : citas.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No hay citas programadas para este día
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
                sx={{ mt: 2 }}
              >
                Programar una cita
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ position: 'relative' }}>
          {citas.map((cita, index) => {
            const isCurrent = isCurrentTimeSlot(cita.hora_inicio, cita.hora_fin);
            const isPast = isPastTime(cita.hora_fin);

            return (
              <Paper
                key={cita.id}
                elevation={isCurrent ? 4 : 1}
                sx={{
                  mb: 2,
                  borderLeft: 4,
                  borderColor: estadoColores[cita.estado],
                  opacity: isPast && cita.estado !== 'completada' && cita.estado !== 'cancelada' ? 0.7 : 1,
                  backgroundColor: isCurrent ? 'action.hover' : 'background.paper',
                  transition: 'all 0.3s',
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Box sx={{ minWidth: 100 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {cita.hora_inicio}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          a {cita.hora_fin}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {cita.paciente?.nombres} {cita.paciente?.apellidos}
                        </Typography>
                        {cita.paciente?.historia_clinica && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            HC: {cita.paciente.historia_clinica}
                          </Typography>
                        )}
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                          {cita.motivo || 'Sin motivo especificado'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={estadoLabels[cita.estado]}
                        size="small"
                        sx={{
                          backgroundColor: estadoColores[cita.estado],
                          color: 'white',
                        }}
                      />

                      {getQuickActions(cita).map((action, idx) => (
                        <Tooltip key={idx} title={action.tooltip}>
                          <IconButton
                            size="small"
                            color={action.color}
                            onClick={() => handleQuickStatusChange(cita.id, action.status)}
                          >
                            {action.icon}
                          </IconButton>
                        </Tooltip>
                      ))}

                      <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => handleOpenDetail(cita)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenForm(cita)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {cita.notas && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="textSecondary">
                        Notas: {cita.notas}
                      </Typography>
                    </>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      <CitaForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        cita={selectedCita}
        initialDate={format(selectedDate, 'yyyy-MM-dd')}
      />

      <CitaDetail
        open={detailOpen}
        onClose={handleCloseDetail}
        cita={selectedCita}
        onEdit={handleEditFromDetail}
        onStatusChange={handleStatusChange}
      />

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default AgendaDia;
