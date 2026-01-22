import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Autocomplete,
  CircularProgress,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format, addMinutes, parse } from 'date-fns';
import { toast } from 'react-toastify';
import { citaService, patientService } from '../../services/api';

const duracionesPredefinidasMinutos = [
  { label: '30 minutos', value: 30 },
  { label: '1 hora', value: 60 },
  { label: '1 hora 30 min', value: 90 },
  { label: '2 horas', value: 120 },
];

const estadoOptions = [
  { value: 'programada', label: 'Programada', color: '#1976d2' },
  { value: 'confirmada', label: 'Confirmada', color: '#2e7d32' },
  { value: 'en_progreso', label: 'En Progreso', color: '#ed6c02' },
  { value: 'completada', label: 'Completada', color: '#757575' },
  { value: 'cancelada', label: 'Cancelada', color: '#d32f2f' },
  { value: 'no_asistio', label: 'No Asistió', color: '#f57c00' },
];

const validationSchema = Yup.object({
  paciente_id: Yup.number().required('El paciente es requerido'),
  fecha: Yup.string().required('La fecha es requerida'),
  hora_inicio: Yup.string().required('La hora de inicio es requerida'),
  hora_fin: Yup.string().required('La hora de fin es requerida'),
  motivo: Yup.string().required('El motivo es requerido').min(3, 'Mínimo 3 caracteres'),
  estado: Yup.string().required('El estado es requerido'),
});

const CitaForm = ({ open, onClose, onSubmit, cita, initialDate, initialTime }) => {
  const [pacientes, setPacientes] = useState([]);
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [duracionSeleccionada, setDuracionSeleccionada] = useState(30);

  const isEditing = Boolean(cita?.id);

  const formik = useFormik({
    initialValues: {
      paciente_id: '',
      fecha: initialDate || format(new Date(), 'yyyy-MM-dd'),
      hora_inicio: initialTime || '09:00',
      hora_fin: '09:30',
      motivo: '',
      estado: 'programada',
      notas: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (isEditing) {
          await citaService.update(cita.id, values);
          toast.success('Cita actualizada correctamente');
        } else {
          await citaService.create(values);
          toast.success('Cita creada correctamente');
        }
        resetForm();
        setSelectedPaciente(null);
        onSubmit();
      } catch (error) {
        console.error('Error saving cita:', error);
        const errorMsg = error.response?.data?.message || 'Error al guardar la cita';
        toast.error(errorMsg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      fetchPacientes('');
    }
  }, [open]);

  useEffect(() => {
    if (cita && open) {
      formik.setValues({
        paciente_id: cita.paciente_id || '',
        fecha: cita.fecha || format(new Date(), 'yyyy-MM-dd'),
        hora_inicio: cita.hora_inicio || '09:00',
        hora_fin: cita.hora_fin || '09:30',
        motivo: cita.motivo || '',
        estado: cita.estado || 'programada',
        notas: cita.notas || '',
      });
      if (cita.paciente) {
        setSelectedPaciente(cita.paciente);
      }
    } else if (open && !cita) {
      const fecha = initialDate || format(new Date(), 'yyyy-MM-dd');
      const horaInicio = initialTime || '09:00';
      const horaFin = calcularHoraFin(horaInicio, duracionSeleccionada);

      formik.setValues({
        paciente_id: '',
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        motivo: '',
        estado: 'programada',
        notas: '',
      });
      setSelectedPaciente(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cita, open, initialDate, initialTime]);

  const fetchPacientes = async (search) => {
    try {
      setLoadingPacientes(true);
      const params = search ? { search } : { limit: 20 };
      const response = await patientService.getAll(params);
      const pacientesData = response.data.data?.patients || response.data.data || [];
      setPacientes(pacientesData);
    } catch (error) {
      console.error('Error fetching pacientes:', error);
    } finally {
      setLoadingPacientes(false);
    }
  };

  const handlePacienteSearch = (event, value) => {
    if (value && value.length >= 2) {
      fetchPacientes(value);
    }
  };

  const handlePacienteChange = (event, newValue) => {
    setSelectedPaciente(newValue);
    formik.setFieldValue('paciente_id', newValue?.id || '');
  };

  const calcularHoraFin = (horaInicio, duracionMinutos) => {
    const baseDate = parse(horaInicio, 'HH:mm', new Date());
    const endDate = addMinutes(baseDate, duracionMinutos);
    return format(endDate, 'HH:mm');
  };

  const handleDuracionChange = (event) => {
    const duracion = event.target.value;
    setDuracionSeleccionada(duracion);
    const nuevaHoraFin = calcularHoraFin(formik.values.hora_inicio, duracion);
    formik.setFieldValue('hora_fin', nuevaHoraFin);
  };

  const handleHoraInicioChange = (event) => {
    const nuevaHoraInicio = event.target.value;
    formik.setFieldValue('hora_inicio', nuevaHoraInicio);
    const nuevaHoraFin = calcularHoraFin(nuevaHoraInicio, duracionSeleccionada);
    formik.setFieldValue('hora_fin', nuevaHoraFin);
  };

  const handleClose = () => {
    formik.resetForm();
    setSelectedPaciente(null);
    setDuracionSeleccionada(30);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {isEditing ? 'Editar Cita' : 'Nueva Cita'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  value={selectedPaciente}
                  onChange={handlePacienteChange}
                  onInputChange={handlePacienteSearch}
                  options={pacientes}
                  getOptionLabel={(option) =>
                    option ? `${option.nombres} ${option.apellidos} - ${option.historia_clinica || 'Sin HC'}` : ''
                  }
                  loading={loadingPacientes}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Box>
                        <Typography variant="body1">
                          {option.nombres} {option.apellidos}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          HC: {option.historia_clinica || 'N/A'} | Tel: {option.telefono || 'N/A'}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Paciente"
                      required
                      error={formik.touched.paciente_id && Boolean(formik.errors.paciente_id)}
                      helperText={formik.touched.paciente_id && formik.errors.paciente_id}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingPacientes ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha"
                  name="fecha"
                  value={formik.values.fecha}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.fecha && Boolean(formik.errors.fecha)}
                  helperText={formik.touched.fecha && formik.errors.fecha}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Duración</InputLabel>
                  <Select
                    value={duracionSeleccionada}
                    label="Duración"
                    onChange={handleDuracionChange}
                  >
                    {duracionesPredefinidasMinutos.map((d) => (
                      <MenuItem key={d.value} value={d.value}>
                        {d.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Hora Inicio"
                  name="hora_inicio"
                  value={formik.values.hora_inicio}
                  onChange={handleHoraInicioChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.hora_inicio && Boolean(formik.errors.hora_inicio)}
                  helperText={formik.touched.hora_inicio && formik.errors.hora_inicio}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Hora Fin"
                  name="hora_fin"
                  value={formik.values.hora_fin}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.hora_fin && Boolean(formik.errors.hora_fin)}
                  helperText={formik.touched.hora_fin && formik.errors.hora_fin}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Motivo de Consulta"
                  name="motivo"
                  value={formik.values.motivo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.motivo && Boolean(formik.errors.motivo)}
                  helperText={formik.touched.motivo && formik.errors.motivo}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="estado"
                    value={formik.values.estado}
                    label="Estado"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.estado && Boolean(formik.errors.estado)}
                  >
                    {estadoOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            size="small"
                            sx={{
                              backgroundColor: option.color,
                              color: 'white',
                              width: 12,
                              height: 12,
                              '& .MuiChip-label': { display: 'none' },
                            }}
                          />
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notas"
                  name="notas"
                  value={formik.values.notas}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  multiline
                  rows={3}
                  placeholder="Notas adicionales sobre la cita..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={24} />
            ) : isEditing ? (
              'Actualizar'
            ) : (
              'Crear Cita'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CitaForm;
