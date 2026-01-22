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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { presupuestoService, fichaService } from '../../services/api';
import { toast } from 'react-toastify';

// Procedimientos dentales predefinidos
const PROCEDIMIENTOS = [
  { actividad: 'Consulta y diagnóstico', costo: 25.00 },
  { actividad: 'Radiografía periapical', costo: 15.00 },
  { actividad: 'Radiografía panorámica', costo: 45.00 },
  { actividad: 'Limpieza dental', costo: 40.00 },
  { actividad: 'Profilaxis', costo: 35.00 },
  { actividad: 'Aplicación de flúor', costo: 20.00 },
  { actividad: 'Sellantes', costo: 25.00 },
  { actividad: 'Resina simple', costo: 45.00 },
  { actividad: 'Resina compuesta', costo: 65.00 },
  { actividad: 'Amalgama', costo: 35.00 },
  { actividad: 'Endodoncia unirradicular', costo: 150.00 },
  { actividad: 'Endodoncia birradicular', costo: 200.00 },
  { actividad: 'Endodoncia multirradicular', costo: 280.00 },
  { actividad: 'Extracción simple', costo: 40.00 },
  { actividad: 'Extracción compleja', costo: 80.00 },
  { actividad: 'Corona provisional', costo: 60.00 },
  { actividad: 'Corona definitiva', costo: 350.00 },
  { actividad: 'Blanqueamiento', costo: 200.00 },
  { actividad: 'Tratamiento periodontal', costo: 120.00 },
];

const presupuestoSchema = Yup.object().shape({
  ficha_id: Yup.number()
    .required('Debe seleccionar una ficha')
    .positive('Debe seleccionar una ficha válida'),
  actos: Yup.array()
    .of(
      Yup.object().shape({
        numero: Yup.number().required('Requerido').min(1, 'Mínimo 1'),
        actividad: Yup.string().required('La actividad es requerida'),
        costo_unitario: Yup.number()
          .required('Requerido')
          .min(0, 'Debe ser mayor o igual a 0'),
        cantidad: Yup.number()
          .required('Requerido')
          .min(1, 'Debe ser al menos 1'),
      })
    )
    .min(1, 'Debe agregar al menos un acto'),
});

const PresupuestoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fichas, setFichas] = useState([]);
  const [loadingFichas, setLoadingFichas] = useState(false);
  const [initialValues, setInitialValues] = useState({
    ficha_id: '',
    actos: [
      {
        numero: 1,
        actividad: '',
        costo_unitario: 0,
        cantidad: 1,
        total: 0,
      },
    ],
  });

  useEffect(() => {
    fetchFichas();
    if (isEditMode) {
      fetchPresupuesto();
    }
  }, [id]);

  const fetchFichas = async () => {
    try {
      setLoadingFichas(true);
      const response = await fichaService.getAll({});
      if (response.data.success) {
        setFichas(response.data.data.fichas || []);
      }
    } catch (error) {
      console.error('Error fetching fichas:', error);
      toast.error('Error al cargar las fichas');
    } finally {
      setLoadingFichas(false);
    }
  };

  const fetchPresupuesto = async () => {
    try {
      setLoading(true);
      const response = await presupuestoService.getById(id);
      if (response.data.success) {
        const presupuesto = response.data.data;
        setInitialValues({
          ficha_id: presupuesto.ficha_id,
          actos: presupuesto.actos || [],
        });
      }
    } catch (error) {
      console.error('Error fetching presupuesto:', error);
      toast.error('Error al cargar los datos del presupuesto');
      navigate('/presupuestos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Calcular el total
      const total = values.actos.reduce((sum, acto) => sum + acto.total, 0);

      const dataToSend = {
        ficha_id: values.ficha_id,
        total: total,
        actos: values.actos,
      };

      if (isEditMode) {
        await presupuestoService.update(id, dataToSend);
        toast.success('Presupuesto actualizado exitosamente');
      } else {
        await presupuestoService.create(dataToSend);
        toast.success('Presupuesto creado exitosamente');
      }
      navigate('/presupuestos');
    } catch (error) {
      console.error('Error saving presupuesto:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el presupuesto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcedimientoChange = (index, procedimiento, setFieldValue, values) => {
    if (procedimiento) {
      const costoUnitario = procedimiento.costo;
      const cantidad = values.actos[index].cantidad || 1;
      const total = costoUnitario * cantidad;

      setFieldValue(`actos.${index}.actividad`, procedimiento.actividad);
      setFieldValue(`actos.${index}.costo_unitario`, costoUnitario);
      setFieldValue(`actos.${index}.total`, total);
    }
  };

  const handleCantidadChange = (index, cantidad, setFieldValue, values) => {
    const costoUnitario = values.actos[index].costo_unitario || 0;
    const total = costoUnitario * cantidad;
    setFieldValue(`actos.${index}.cantidad`, cantidad);
    setFieldValue(`actos.${index}.total`, total);
  };

  const calculateTotal = (actos) => {
    return actos.reduce((sum, acto) => sum + (acto.total || 0), 0);
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
          onClick={() => navigate('/presupuestos')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold">
          {isEditMode ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={presupuestoSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, setFieldValue, handleBlur, isSubmitting }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={fichas}
                      getOptionLabel={(option) =>
                        `Ficha #${option.id} - ${option.paciente_nombre || 'N/A'} - Pieza ${option.pieza_tratada || 'N/A'}`
                      }
                      loading={loadingFichas}
                      value={fichas.find(f => f.id === values.ficha_id) || null}
                      onChange={(event, newValue) => {
                        setFieldValue('ficha_id', newValue ? newValue.id : '');
                      }}
                      onBlur={handleBlur}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Seleccionar Ficha"
                          error={touched.ficha_id && Boolean(errors.ficha_id)}
                          helperText={touched.ficha_id && errors.ficha_id}
                          disabled={isEditMode}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Actos / Procedimientos
                    </Typography>
                    <FieldArray name="actos">
                      {({ remove, push }) => (
                        <>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell width="80px"><strong>#</strong></TableCell>
                                  <TableCell><strong>Actividad</strong></TableCell>
                                  <TableCell width="140px"><strong>Costo Unit.</strong></TableCell>
                                  <TableCell width="100px"><strong>Cantidad</strong></TableCell>
                                  <TableCell width="140px"><strong>Total</strong></TableCell>
                                  <TableCell width="80px" align="center"><strong>Acción</strong></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {values.actos.map((acto, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <TextField
                                        type="number"
                                        size="small"
                                        value={acto.numero}
                                        onChange={(e) => setFieldValue(`actos.${index}.numero`, parseInt(e.target.value))}
                                        error={
                                          touched.actos?.[index]?.numero &&
                                          Boolean(errors.actos?.[index]?.numero)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <FormControl fullWidth size="small">
                                        <Select
                                          value={acto.actividad}
                                          onChange={(e) => {
                                            const selectedProc = PROCEDIMIENTOS.find(
                                              p => p.actividad === e.target.value
                                            );
                                            if (selectedProc) {
                                              handleProcedimientoChange(index, selectedProc, setFieldValue, values);
                                            } else {
                                              setFieldValue(`actos.${index}.actividad`, e.target.value);
                                            }
                                          }}
                                          error={
                                            touched.actos?.[index]?.actividad &&
                                            Boolean(errors.actos?.[index]?.actividad)
                                          }
                                        >
                                          <MenuItem value="">
                                            <em>Seleccionar o escribir</em>
                                          </MenuItem>
                                          {PROCEDIMIENTOS.map((proc, i) => (
                                            <MenuItem key={i} value={proc.actividad}>
                                              {proc.actividad} - ${proc.costo.toFixed(2)}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        type="number"
                                        size="small"
                                        value={acto.costo_unitario}
                                        onChange={(e) => {
                                          const costoUnitario = parseFloat(e.target.value) || 0;
                                          const total = costoUnitario * acto.cantidad;
                                          setFieldValue(`actos.${index}.costo_unitario`, costoUnitario);
                                          setFieldValue(`actos.${index}.total`, total);
                                        }}
                                        error={
                                          touched.actos?.[index]?.costo_unitario &&
                                          Boolean(errors.actos?.[index]?.costo_unitario)
                                        }
                                        InputProps={{
                                          startAdornment: '$',
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        type="number"
                                        size="small"
                                        value={acto.cantidad}
                                        onChange={(e) => {
                                          const cantidad = parseInt(e.target.value) || 1;
                                          handleCantidadChange(index, cantidad, setFieldValue, values);
                                        }}
                                        error={
                                          touched.actos?.[index]?.cantidad &&
                                          Boolean(errors.actos?.[index]?.cantidad)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" fontWeight="bold">
                                        ${(acto.total || 0).toFixed(2)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => remove(index)}
                                        disabled={values.actos.length === 1}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>

                          {typeof errors.actos === 'string' && touched.actos && (
                            <FormHelperText error sx={{ ml: 2 }}>
                              {errors.actos}
                            </FormHelperText>
                          )}

                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                              startIcon={<AddIcon />}
                              onClick={() =>
                                push({
                                  numero: values.actos.length + 1,
                                  actividad: '',
                                  costo_unitario: 0,
                                  cantidad: 1,
                                  total: 0,
                                })
                              }
                            >
                              Agregar Acto
                            </Button>

                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h6">
                                Total: ${calculateTotal(values.actos).toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        </>
                      )}
                    </FieldArray>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/presupuestos')}
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

export default PresupuestoForm;
