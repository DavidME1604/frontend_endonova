import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { presupuestoService } from '../../services/api';
import { toast } from 'react-toastify';

const PagoDialog = ({ open, onClose, presupuesto, onSuccess }) => {
  if (!presupuesto) return null;

  const saldoActual = parseFloat(presupuesto.saldo) || (parseFloat(presupuesto.total || 0) - parseFloat(presupuesto.total_pagado || 0));

  const pagoSchema = Yup.object().shape({
    fecha: Yup.date()
      .required('La fecha es requerida')
      .max(new Date(), 'La fecha no puede ser futura'),
    valor: Yup.number()
      .required('El valor es requerido')
      .positive('El valor debe ser mayor a 0')
      .max(saldoActual, `El valor no puede ser mayor al saldo pendiente ($${parseFloat(saldoActual || 0).toFixed(2)})`),
    actividad: Yup.string().required('La descripción es requerida'),
  });

  const initialValues = {
    fecha: new Date().toISOString().split('T')[0],
    valor: '',
    actividad: '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await presupuestoService.addPago(presupuesto.id, values);

      if (response.data.success) {
        toast.success('Pago registrado exitosamente');
        onSuccess();
      }
    } catch (error) {
      console.error('Error registering pago:', error);
      toast.error(error.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    return `$${parseFloat(value || 0).toFixed(2)}`;
  };

  const calculateNuevoSaldo = (valor) => {
    const pagoValor = parseFloat(valor) || 0;
    return Math.max(0, parseFloat(saldoActual || 0) - pagoValor);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Registrar Pago - Presupuesto #{presupuesto.id}
        </Typography>
      </DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={pagoSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 1,
                      mb: 2,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Total Presupuesto
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(presupuesto.total)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Total Pagado
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {formatCurrency(presupuesto.total_pagado)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Saldo Actual
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="warning.main">
                          {formatCurrency(saldoActual)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Nuevo Saldo
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                          {formatCurrency(calculateNuevoSaldo(values.valor))}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="fecha"
                    name="fecha"
                    label="Fecha de Pago"
                    type="date"
                    value={values.fecha}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.fecha && Boolean(errors.fecha)}
                    helperText={touched.fecha && errors.fecha}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="valor"
                    name="valor"
                    label="Valor del Pago"
                    type="number"
                    inputProps={{
                      step: '0.01',
                      min: '0',
                      max: parseFloat(saldoActual || 0),
                    }}
                    value={values.valor}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.valor && Boolean(errors.valor)}
                    helperText={touched.valor && errors.valor}
                    placeholder="0.00"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="actividad"
                    name="actividad"
                    label="Descripción / Actividad"
                    multiline
                    rows={3}
                    value={values.actividad}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.actividad && Boolean(errors.actividad)}
                    helperText={touched.actividad && errors.actividad}
                    placeholder="Ej: Pago por consulta, Abono a tratamiento, etc."
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Registrar Pago'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default PagoDialog;
