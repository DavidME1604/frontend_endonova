import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { fichaService, patientService } from '../../services/api';
import { toast } from 'react-toastify';

const fichaSchema = Yup.object().shape({
  paciente_id: Yup.number().required('Seleccione un paciente'),
  pieza_dental: Yup.string().required('La pieza dental es requerida'),
  fecha: Yup.date().required('La fecha es requerida'),
  dr_referidor: Yup.string(),
  motivo_consulta: Yup.string().required('El motivo de consulta es requerido'),
  antecedentes: Yup.string(),
});

const FichaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [initialValues, setInitialValues] = useState({
    paciente_id: searchParams.get('paciente_id') || '',
    pieza_dental: '',
    fecha: new Date().toISOString().split('T')[0],
    dr_referidor: '',
    motivo_consulta: '',
    antecedentes: '',
    
    // CAUSAS
    causa_caries: false,
    causa_traumatismo: false,
    causa_reabsorciones: false,
    causa_tratamiento_anterior: false,
    causa_finalidad_protetica: false,
    causa_endoperiodontal: false,
    causa_otras: '',
    
    // DOLOR
    dolor_naturaleza: '',
    dolor_calidad: '',
    dolor_localizacion: '',
    dolor_duracion: '',
    dolor_iniciado_por: '',
    
    // ZONA PERIAPICAL
    zona_normal: false,
    zona_tumefaccion: false,
    zona_adenopatias: false,
    zona_dolor_palpacion: false,
    zona_fistula: false,
    zona_flemon: false,
    
    // EXAMEN PERIODONTAL
    profundidad_bolsa: '',
    movilidad: 0,
    supuracion: false,
    
    // CÁMARA
    camara_normal: false,
    camara_estrecha: false,
    camara_calcificada: false,
    camara_amplia: false,
    camara_nodulos: false,
    camara_reabsorcion_interna: false,
    camara_reabsorcion_externa: false,
  });

  useEffect(() => {
    fetchPatients();
    if (isEditMode) {
      fetchFicha();
    } else if (searchParams.get('paciente_id')) {
      fetchPatient(searchParams.get('paciente_id'));
    }
  }, [id]);

  const fetchPatients = async () => {
    try {
      const response = await patientService.getAll({ limit: 100 });
      if (response.data.success) {
        setPatients(response.data.data.patients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchPatient = async (patientId) => {
    try {
      const response = await patientService.getById(patientId);
      if (response.data.success) {
        setSelectedPatient(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    }
  };

  const fetchFicha = async () => {
    try {
      setLoading(true);
      const response = await fichaService.getById(id);
      if (response.data.success) {
        const data = response.data.data;
        setInitialValues({
          ...data,
          fecha: data.fecha.split('T')[0],
        });
        if (data.paciente_id) {
          fetchPatient(data.paciente_id);
        }
      }
    } catch (error) {
      console.error('Error fetching ficha:', error);
      toast.error('Error al cargar la ficha');
      navigate('/fichas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await fichaService.update(id, values);
        toast.success('Ficha actualizada exitosamente');
      } else {
        await fichaService.create(values);
        toast.success('Ficha creada exitosamente');
      }
      navigate('/fichas');
    } catch (error) {
      console.error('Error saving ficha:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la ficha');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/fichas')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold">
          {isEditMode ? 'Editar Ficha Endodóntica' : 'Nueva Ficha Endodóntica'}
        </Typography>
      </Box>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={fichaSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
          <Form>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Información General
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={patients}
                      getOptionLabel={(option) =>
                        `${option.historia_clinica} - ${option.nombres} ${option.apellidos}`
                      }
                      value={selectedPatient}
                      onChange={(event, newValue) => {
                        setSelectedPatient(newValue);
                        setFieldValue('paciente_id', newValue?.id || '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Paciente"
                          error={touched.paciente_id && Boolean(errors.paciente_id)}
                          helperText={touched.paciente_id && errors.paciente_id}
                        />
                      )}
                      disabled={isEditMode}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      id="pieza_dental"
                      name="pieza_dental"
                      label="Pieza Dental"
                      placeholder="16"
                      value={values.pieza_dental}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.pieza_dental && Boolean(errors.pieza_dental)}
                      helperText={touched.pieza_dental && errors.pieza_dental}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      id="fecha"
                      name="fecha"
                      label="Fecha"
                      type="date"
                      value={values.fecha}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.fecha && Boolean(errors.fecha)}
                      helperText={touched.fecha && errors.fecha}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="dr_referidor"
                      name="dr_referidor"
                      label="Dr. Referidor"
                      value={values.dr_referidor}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      id="motivo_consulta"
                      name="motivo_consulta"
                      label="Motivo Principal de la Consulta"
                      value={values.motivo_consulta}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.motivo_consulta && Boolean(errors.motivo_consulta)}
                      helperText={touched.motivo_consulta && errors.motivo_consulta}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      id="antecedentes"
                      name="antecedentes"
                      label="Antecedentes de la Enfermedad Actual"
                      value={values.antecedentes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* CAUSAS */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Causas
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.causa_caries}
                          onChange={handleChange}
                          name="causa_caries"
                        />
                      }
                      label="Caries"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.causa_traumatismo}
                          onChange={handleChange}
                          name="causa_traumatismo"
                        />
                      }
                      label="Traumatismo"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.causa_reabsorciones}
                          onChange={handleChange}
                          name="causa_reabsorciones"
                        />
                      }
                      label="Reabsorciones"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.causa_tratamiento_anterior}
                          onChange={handleChange}
                          name="causa_tratamiento_anterior"
                        />
                      }
                      label="Tratamiento Anterior"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.causa_finalidad_protetica}
                          onChange={handleChange}
                          name="causa_finalidad_protetica"
                        />
                      }
                      label="Finalidad Protética"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.causa_endoperiodontal}
                          onChange={handleChange}
                          name="causa_endoperiodontal"
                        />
                      }
                      label="Endoperiodontal"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="causa_otras"
                      name="causa_otras"
                      label="Otras Causas"
                      value={values.causa_otras}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* DOLOR */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Dolor
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <FormLabel>Naturaleza</FormLabel>
                      <RadioGroup
                        row
                        name="dolor_naturaleza"
                        value={values.dolor_naturaleza}
                        onChange={handleChange}
                      >
                        <FormControlLabel value="No hay dolor" control={<Radio />} label="No hay dolor" />
                        <FormControlLabel value="Leve" control={<Radio />} label="Leve" />
                        <FormControlLabel value="Moderado" control={<Radio />} label="Moderado" />
                        <FormControlLabel value="Intenso" control={<Radio />} label="Intenso" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <FormLabel>Calidad</FormLabel>
                      <RadioGroup
                        row
                        name="dolor_calidad"
                        value={values.dolor_calidad}
                        onChange={handleChange}
                      >
                        <FormControlLabel value="Sordo" control={<Radio />} label="Sordo" />
                        <FormControlLabel value="Agudo" control={<Radio />} label="Agudo" />
                        <FormControlLabel value="Pulsátil" control={<Radio />} label="Pulsátil" />
                        <FormControlLabel value="Continuo" control={<Radio />} label="Continuo" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <FormLabel>Localización</FormLabel>
                      <RadioGroup
                        row
                        name="dolor_localizacion"
                        value={values.dolor_localizacion}
                        onChange={handleChange}
                      >
                        <FormControlLabel value="Localizado" control={<Radio />} label="Localizado" />
                        <FormControlLabel value="Difuso" control={<Radio />} label="Difuso" />
                        <FormControlLabel value="Referido" control={<Radio />} label="Referido" />
                        <FormControlLabel value="Irradiado a" control={<Radio />} label="Irradiado" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <FormLabel>Duración</FormLabel>
                      <RadioGroup
                        row
                        name="dolor_duracion"
                        value={values.dolor_duracion}
                        onChange={handleChange}
                      >
                        <FormControlLabel value="Segundos" control={<Radio />} label="Segundos" />
                        <FormControlLabel value="Fugaz" control={<Radio />} label="Fugaz" />
                        <FormControlLabel value="Minutos" control={<Radio />} label="Minutos" />
                        <FormControlLabel value="Horas" control={<Radio />} label="Horas" />
                        <FormControlLabel value="Persistente" control={<Radio />} label="Persistente" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="dolor_iniciado_por"
                      name="dolor_iniciado_por"
                      label="Iniciado por (Frío, Calor, Dulces, Ácidos, Espontáneo, Masticación, Percusión, etc.)"
                      value={values.dolor_iniciado_por}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* ZONA PERIAPICAL */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Zona Periapical
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.zona_normal}
                          onChange={handleChange}
                          name="zona_normal"
                        />
                      }
                      label="Normal"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.zona_tumefaccion}
                          onChange={handleChange}
                          name="zona_tumefaccion"
                        />
                      }
                      label="Tumefacción"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.zona_adenopatias}
                          onChange={handleChange}
                          name="zona_adenopatias"
                        />
                      }
                      label="Adenopatías"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.zona_dolor_palpacion}
                          onChange={handleChange}
                          name="zona_dolor_palpacion"
                        />
                      }
                      label="Dolor a la palpación"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.zona_fistula}
                          onChange={handleChange}
                          name="zona_fistula"
                        />
                      }
                      label="Fístula"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.zona_flemon}
                          onChange={handleChange}
                          name="zona_flemon"
                        />
                      }
                      label="Flemón"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* EXAMEN PERIODONTAL */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Examen Periodontal
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      id="profundidad_bolsa"
                      name="profundidad_bolsa"
                      label="Profundidad de Bolsa (mm)"
                      value={values.profundidad_bolsa}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      inputProps={{ step: 0.1, min: 0 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <FormLabel>Movilidad (0-3)</FormLabel>
                      <RadioGroup
                        row
                        name="movilidad"
                        value={values.movilidad.toString()}
                        onChange={(e) => setFieldValue('movilidad', parseInt(e.target.value))}
                      >
                        <FormControlLabel value="0" control={<Radio />} label="0" />
                        <FormControlLabel value="1" control={<Radio />} label="1" />
                        <FormControlLabel value="2" control={<Radio />} label="2" />
                        <FormControlLabel value="3" control={<Radio />} label="3" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.supuracion}
                          onChange={handleChange}
                          name="supuracion"
                        />
                      }
                      label="Supuración"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* EVALUACIÓN RADIOGRÁFICA - CÁMARA */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Evaluación Radiográfica - Cámara
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.camara_normal}
                          onChange={handleChange}
                          name="camara_normal"
                        />
                      }
                      label="Normal"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.camara_estrecha}
                          onChange={handleChange}
                          name="camara_estrecha"
                        />
                      }
                      label="Estrecha"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.camara_calcificada}
                          onChange={handleChange}
                          name="camara_calcificada"
                        />
                      }
                      label="Calcificada"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.camara_amplia}
                          onChange={handleChange}
                          name="camara_amplia"
                        />
                      }
                      label="Amplia"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.camara_nodulos}
                          onChange={handleChange}
                          name="camara_nodulos"
                        />
                      }
                      label="Nódulos"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.camara_reabsorcion_interna}
                          onChange={handleChange}
                          name="camara_reabsorcion_interna"
                        />
                      }
                      label="Reabsorción Interna"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.camara_reabsorcion_externa}
                          onChange={handleChange}
                          name="camara_reabsorcion_externa"
                        />
                      }
                      label="Reabsorción Externa"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/fichas')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Guardar Ficha'}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default FichaForm;
