import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayIcon,
  Block as BlockIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

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

const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
    <Box sx={{ color: 'primary.main', mt: 0.5 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="body1">{value || '-'}</Typography>
    </Box>
  </Box>
);

const CitaDetail = ({ open, onClose, cita, onEdit, onStatusChange }) => {
  const navigate = useNavigate();

  if (!cita) return null;

  const formatFecha = (fecha) => {
    try {
      return format(parseISO(fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return fecha;
    }
  };

  const handleNavigateToPatient = () => {
    if (cita.paciente?.id) {
      navigate(`/patients/${cita.paciente.id}`);
      onClose();
    }
  };

  const getStatusActions = () => {
    const actions = [];
    const estado = cita.estado;

    if (estado === 'programada') {
      actions.push(
        { label: 'Confirmar', status: 'confirmada', icon: <ThumbUpIcon />, color: 'success' },
        { label: 'Cancelar', status: 'cancelada', icon: <CancelIcon />, color: 'error' }
      );
    } else if (estado === 'confirmada') {
      actions.push(
        { label: 'Iniciar', status: 'en_progreso', icon: <PlayIcon />, color: 'warning' },
        { label: 'Cancelar', status: 'cancelada', icon: <CancelIcon />, color: 'error' },
        { label: 'No Asistió', status: 'no_asistio', icon: <BlockIcon />, color: 'warning' }
      );
    } else if (estado === 'en_progreso') {
      actions.push(
        { label: 'Completar', status: 'completada', icon: <CheckCircleIcon />, color: 'success' }
      );
    }

    return actions;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Detalle de Cita</Typography>
          <Box>
            <Tooltip title="Editar">
              <IconButton onClick={onEdit} size="small">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Chip
            label={estadoLabels[cita.estado]}
            sx={{
              backgroundColor: estadoColores[cita.estado],
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <InfoRow
          icon={<PersonIcon />}
          label="Paciente"
          value={
            <Box>
              <Typography
                variant="body1"
                sx={{
                  cursor: cita.paciente?.id ? 'pointer' : 'default',
                  color: cita.paciente?.id ? 'primary.main' : 'inherit',
                  '&:hover': cita.paciente?.id ? { textDecoration: 'underline' } : {},
                }}
                onClick={handleNavigateToPatient}
              >
                {cita.paciente?.nombres} {cita.paciente?.apellidos}
              </Typography>
              {cita.paciente?.historia_clinica && (
                <Typography variant="caption" color="textSecondary">
                  HC: {cita.paciente.historia_clinica}
                </Typography>
              )}
              {cita.paciente?.telefono && (
                <Typography variant="caption" color="textSecondary" display="block">
                  Tel: {cita.paciente.telefono}
                </Typography>
              )}
            </Box>
          }
        />

        <InfoRow
          icon={<CalendarIcon />}
          label="Fecha"
          value={formatFecha(cita.fecha)}
        />

        <InfoRow
          icon={<TimeIcon />}
          label="Horario"
          value={`${cita.hora_inicio} - ${cita.hora_fin}`}
        />

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Motivo de Consulta
          </Typography>
          <Typography variant="body1">
            {cita.motivo || 'No especificado'}
          </Typography>
        </Box>

        {cita.notas && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Notas
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {cita.notas}
            </Typography>
          </Box>
        )}

        {getStatusActions().length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Acciones Rápidas
            </Typography>
            <Grid container spacing={1}>
              {getStatusActions().map((action) => (
                <Grid item key={action.status}>
                  <Button
                    variant="outlined"
                    size="small"
                    color={action.color}
                    startIcon={action.icon}
                    onClick={() => onStatusChange(cita.id, action.status)}
                  >
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button variant="contained" onClick={onEdit} startIcon={<EditIcon />}>
          Editar Cita
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CitaDetail;
