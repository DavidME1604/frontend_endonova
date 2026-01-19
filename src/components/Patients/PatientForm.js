import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { patientService } from '../../services/api';
import { toast } from 'react-toastify';

const patientSchema = Yup.object().shape({
  historia_clinica: Yup.string()
    .required('La historia clínica es requerida')
    .matches(/^HC-\d+$/, 'Formato inválido (Ej: HC-001)'),
  nombres: Yup.string()
    .min(2, 'Mínimo 2 caracteres')
    .required('Los nombres son requeridos'),
  apellidos: Yup.string()
    .min(2, 'Mínimo 2 caracteres')
    .required('Los apellidos son requeridos'),
  edad: Yup.number()
    .min(1, 'La edad debe ser mayor a 0')
    .max(150, 'Edad inválida')
    .required('La edad es requerida'),
  domicilio: Yup.string().required('El domicilio es requerido'),
  telefono: Yup.string()
    .matches(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos')
    .required('El teléfono es requerido'),
});

const PatientForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    historia_clinica: '',
    nombres: '',
    apellidos: '',
    edad: '',
    domicilio: '',
    telefono: '',
  });

  useEffect(() => {
    if (isEditMode) {
      fetchPatient();
    }
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const response = await patientService.getById(id);
      if (response.data.success) {
        setInitialValues(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error('Error al cargar los datos del paciente');
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await patientService.update(id, values);
        toast.success('Paciente actualizado exitosamente');
      } else {
        await patientService.create(values);
        toast.success('Paciente creado exitosamente');
      }
      navigate('/patients');
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el paciente');
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
          onClick={() => navigate('/patients')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold">
          {isEditMode ? 'Editar Paciente' : 'Nuevo Paciente'}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={patientSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="historia_clinica"
                      name="historia_clinica"
                      label="Historia Clínica"
                      placeholder="HC-001"
                      value={values.historia_clinica}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.historia_clinica && Boolean(errors.historia_clinica)}
                      helperText={touched.historia_clinica && errors.historia_clinica}
                      disabled={isEditMode}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="edad"
                      name="edad"
                      label="Edad"
                      type="number"
                      value={values.edad}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.edad && Boolean(errors.edad)}
                      helperText={touched.edad && errors.edad}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="nombres"
                      name="nombres"
                      label="Nombres"
                      value={values.nombres}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.nombres && Boolean(errors.nombres)}
                      helperText={touched.nombres && errors.nombres}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="apellidos"
                      name="apellidos"
                      label="Apellidos"
                      value={values.apellidos}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.apellidos && Boolean(errors.apellidos)}
                      helperText={touched.apellidos && errors.apellidos}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="domicilio"
                      name="domicilio"
                      label="Domicilio"
                      value={values.domicilio}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.domicilio && Boolean(errors.domicilio)}
                      helperText={touched.domicilio && errors.domicilio}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="telefono"
                      name="telefono"
                      label="Teléfono"
                      placeholder="0987654321"
                      value={values.telefono}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.telefono && Boolean(errors.telefono)}
                      helperText={touched.telefono && errors.telefono}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/patients')}
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
                    {isSubmitting ? <CircularProgress size={24} /> : 'Guardar'}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PatientForm;
