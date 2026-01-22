import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Add as AddIcon,
  Payment as PaymentIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { fichaService, presupuestoService } from '../../services/api';
import { toast } from 'react-toastify';
import OdontogramaInteractivo from '../Odontograma/OdontogramaInteractivo';
import PagoDialog from '../Presupuestos/PagoDialog';

const FichaDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // Estados para presupuesto
  const [presupuesto, setPresupuesto] = useState(null);
  const [actos, setActos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loadingPresupuesto, setLoadingPresupuesto] = useState(false);
  const [pagoDialogOpen, setPagoDialogOpen] = useState(false);

  useEffect(() => {
    fetchFicha();
  }, [id]);

  useEffect(() => {
    if (tabValue === 2 && id) {
      fetchPresupuesto();
    }
  }, [tabValue, id]);

  const fetchFicha = async () => {
    try {
      setLoading(true);
      const response = await fichaService.getById(id);
      if (response.data.success) {
        setFicha(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching ficha:', error);
      toast.error('Error al cargar la ficha');
      navigate('/fichas');
    } finally {
      setLoading(false);
    }
  };

  const fetchPresupuesto = async () => {
    try {
      setLoadingPresupuesto(true);
      const response = await presupuestoService.getByFicha(id);
      if (response.data.success) {
        setPresupuesto(response.data.data.presupuesto);
        setActos(response.data.data.actos || []);
        setPagos(response.data.data.pagos || []);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // No hay presupuesto para esta ficha
        setPresupuesto(null);
        setActos([]);
        setPagos([]);
      } else {
        console.error('Error fetching presupuesto:', error);
        toast.error('Error al cargar el presupuesto');
      }
    } finally {
      setLoadingPresupuesto(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePagoSuccess = () => {
    setPagoDialogOpen(false);
    fetchPresupuesto();
    toast.success('Pago registrado exitosamente');
  };

  const formatCurrency = (value) => {
    return `$${parseFloat(value || 0).toFixed(2)}`;
  };

  const getEstadoPago = () => {
    if (!presupuesto) return null;
    if (parseFloat(presupuesto.saldo || 0) == 0) return { label: 'Pagado', color: 'success' };
    if (parseFloat(presupuesto.total_pagado || 0) > 0) return { label: 'Parcial', color: 'warning' };
    return { label: 'Pendiente', color: 'error' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ficha) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/fichas')}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Ficha Endodóntica
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<PrintIcon />}>
            Imprimir
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/fichas/${id}/edit`)}
          >
            Editar
          </Button>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Información General" />
        <Tab label="Odontograma" />
        <Tab label="Presupuesto" />
      </Tabs>

      {/* Tab 0: Información General */}
      {tabValue === 0 && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Datos del Paciente
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Historia Clínica
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {ficha.historia_clinica}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Paciente
                  </Typography>
                  <Typography variant="body1">
                    {ficha.nombres} {ficha.apellidos}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    Pieza Dental
                  </Typography>
                  <Chip label={ficha.pieza_dental} color="primary" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    Fecha
                  </Typography>
                  <Typography variant="body1">
                    {new Date(ficha.fecha).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    Dr. Referidor
                  </Typography>
                  <Typography variant="body1">{ficha.dr_referidor || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Motivo de Consulta
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">{ficha.motivo_consulta}</Typography>

                  {ficha.antecedentes && (
                    <>
                      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                        Antecedentes
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body1">{ficha.antecedentes}</Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Causas
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {ficha.causa_caries && <Chip label="Caries" size="small" color="error" />}
                    {ficha.causa_traumatismo && (
                      <Chip label="Traumatismo" size="small" color="warning" />
                    )}
                    {ficha.causa_reabsorciones && (
                      <Chip label="Reabsorciones" size="small" />
                    )}
                    {ficha.causa_tratamiento_anterior && (
                      <Chip label="Tratamiento Anterior" size="small" />
                    )}
                    {ficha.causa_finalidad_protetica && (
                      <Chip label="Finalidad Protética" size="small" />
                    )}
                    {ficha.causa_endoperiodontal && (
                      <Chip label="Endoperiodontal" size="small" />
                    )}
                    {ficha.causa_otras && (
                      <Chip label={`Otras: ${ficha.causa_otras}`} size="small" />
                    )}
                  </Box>

                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                    Dolor
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={1}>
                    {ficha.dolor_naturaleza && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Naturaleza:</strong> {ficha.dolor_naturaleza}
                        </Typography>
                      </Grid>
                    )}
                    {ficha.dolor_calidad && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Calidad:</strong> {ficha.dolor_calidad}
                        </Typography>
                      </Grid>
                    )}
                    {ficha.dolor_localizacion && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Localización:</strong> {ficha.dolor_localizacion}
                        </Typography>
                      </Grid>
                    )}
                    {ficha.dolor_duracion && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Duración:</strong> {ficha.dolor_duracion}
                        </Typography>
                      </Grid>
                    )}
                    {ficha.dolor_iniciado_por && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Iniciado por:</strong> {ficha.dolor_iniciado_por}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Zona Periapical
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {ficha.zona_normal && <Chip label="Normal" size="small" color="success" />}
                    {ficha.zona_tumefaccion && <Chip label="Tumefacción" size="small" />}
                    {ficha.zona_adenopatias && <Chip label="Adenopatías" size="small" />}
                    {ficha.zona_dolor_palpacion && (
                      <Chip label="Dolor a la palpación" size="small" />
                    )}
                    {ficha.zona_fistula && <Chip label="Fístula" size="small" />}
                    {ficha.zona_flemon && <Chip label="Flemón" size="small" />}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Examen Periodontal
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Profundidad de Bolsa:</strong> {ficha.profundidad_bolsa || 'N/A'} mm
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Movilidad:</strong> Grado {ficha.movilidad}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Supuración:</strong> {ficha.supuracion ? 'Sí' : 'No'}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                    Evaluación Radiográfica - Cámara
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {ficha.camara_normal && <Chip label="Normal" size="small" />}
                    {ficha.camara_estrecha && <Chip label="Estrecha" size="small" />}
                    {ficha.camara_calcificada && <Chip label="Calcificada" size="small" />}
                    {ficha.camara_amplia && <Chip label="Amplia" size="small" />}
                    {ficha.camara_nodulos && <Chip label="Nódulos" size="small" />}
                    {ficha.camara_reabsorcion_interna && (
                      <Chip label="Reabsorción Interna" size="small" />
                    )}
                    {ficha.camara_reabsorcion_externa && (
                      <Chip label="Reabsorción Externa" size="small" />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Tab 1: Odontograma */}
      {tabValue === 1 && <OdontogramaInteractivo fichaId={id} />}

      {/* Tab 2: Presupuesto */}
      {tabValue === 2 && (
        <>
          {loadingPresupuesto ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : !presupuesto ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No hay presupuesto asociado a esta ficha
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Crea un presupuesto para registrar los procedimientos y pagos del tratamiento.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/presupuestos/nuevo?ficha_id=${id}`)}
                >
                  Crear Presupuesto
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Resumen del Presupuesto */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Resumen del Presupuesto
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={getEstadoPago()?.label}
                        color={getEstadoPago()?.color}
                        size="small"
                      />
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/presupuestos/${presupuesto.id}`)}
                      >
                        Ver Detalle
                      </Button>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          Total Presupuesto
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                          {formatCurrency(presupuesto.total)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          Total Pagado
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                          {formatCurrency(presupuesto.total_pagado)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: parseFloat(presupuesto.saldo || 0) > 0 ? '#fff3e0' : '#e8f5e9', borderRadius: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          Saldo Pendiente
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color={parseFloat(presupuesto.saldo || 0) > 0 ? 'warning.main' : 'success.main'}>
                          {formatCurrency(presupuesto.saldo)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Tabla de Actos/Procedimientos */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Procedimientos
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>#</strong></TableCell>
                          <TableCell><strong>Actividad</strong></TableCell>
                          <TableCell align="right"><strong>Costo Unit.</strong></TableCell>
                          <TableCell align="center"><strong>Cant.</strong></TableCell>
                          <TableCell align="right"><strong>Total</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {actos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                                No hay procedimientos registrados
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          actos.map((acto) => (
                            <TableRow key={acto.id}>
                              <TableCell>{acto.numero}</TableCell>
                              <TableCell>{acto.actividad}</TableCell>
                              <TableCell align="right">{formatCurrency(acto.costo_unitario)}</TableCell>
                              <TableCell align="center">{acto.cantidad}</TableCell>
                              <TableCell align="right">{formatCurrency(acto.total)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Tabla de Pagos */}
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Historial de Pagos
                    </Typography>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<PaymentIcon />}
                      onClick={() => setPagoDialogOpen(true)}
                      disabled={parseFloat(presupuesto.saldo || 0) == 0}
                    >
                      Registrar Pago
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Fecha</strong></TableCell>
                          <TableCell><strong>Descripción</strong></TableCell>
                          <TableCell align="right"><strong>Valor</strong></TableCell>
                          <TableCell align="right"><strong>Saldo Ant.</strong></TableCell>
                          <TableCell align="right"><strong>Saldo Act.</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pagos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                                No hay pagos registrados
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          pagos.map((pago) => (
                            <TableRow key={pago.id}>
                              <TableCell>
                                {new Date(pago.fecha).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{pago.actividad || '-'}</TableCell>
                              <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                {formatCurrency(pago.valor)}
                              </TableCell>
                              <TableCell align="right">{formatCurrency(pago.saldo_anterior)}</TableCell>
                              <TableCell align="right">{formatCurrency(pago.saldo_actual)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Dialog para registrar pago */}
              <PagoDialog
                open={pagoDialogOpen}
                onClose={() => setPagoDialogOpen(false)}
                presupuesto={presupuesto}
                onSuccess={handlePagoSuccess}
              />
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default FichaDetail;
