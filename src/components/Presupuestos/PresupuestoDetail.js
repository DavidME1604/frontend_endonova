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
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
  AttachMoney as MoneyIcon,
  AccountBalanceWallet as WalletIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { presupuestoService } from '../../services/api';
import { toast } from 'react-toastify';
import PagoDialog from './PagoDialog';

const PresupuestoDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [presupuesto, setPresupuesto] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [pagoDialogOpen, setPagoDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const presupuestoResponse = await presupuestoService.getById(id);

      if (presupuestoResponse.data.success) {
        // El backend ahora devuelve todo en data (presupuesto con actos, pagos, paciente incluidos)
        const data = presupuestoResponse.data.data;
        setPresupuesto(data);
        setPagos(data.pagos || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
      navigate('/presupuestos');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenPagoDialog = () => {
    setPagoDialogOpen(true);
  };

  const handleClosePagoDialog = () => {
    setPagoDialogOpen(false);
  };

  const handlePagoSuccess = () => {
    fetchData();
    handleClosePagoDialog();
  };

  const getEstado = () => {
    if (!presupuesto) return 'pendiente';
    const saldo = presupuesto.saldo || (presupuesto.total - presupuesto.total_pagado);
    if (saldo === 0 || presupuesto.total_pagado >= presupuesto.total) {
      return 'pagado';
    } else if (presupuesto.total_pagado > 0) {
      return 'parcial';
    }
    return 'pendiente';
  };

  const getEstadoChip = () => {
    const estado = getEstado();
    const configs = {
      pagado: { label: 'Pagado', color: 'success' },
      parcial: { label: 'Parcial', color: 'warning' },
      pendiente: { label: 'Pendiente', color: 'error' },
    };
    return <Chip label={configs[estado].label} color={configs[estado].color} />;
  };

  const formatCurrency = (value) => {
    return `$${parseFloat(value || 0).toFixed(2)}`;
  };

  const getProgressPercentage = () => {
    if (!presupuesto || presupuesto.total === 0) return 0;
    return (presupuesto.total_pagado / presupuesto.total) * 100;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!presupuesto) return null;

  const saldo = presupuesto.saldo || (presupuesto.total - presupuesto.total_pagado);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/presupuestos')}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Presupuesto #{presupuesto.id}
          </Typography>
          <Box sx={{ ml: 2 }}>{getEstadoChip()}</Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/presupuestos/${id}/editar`)}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            startIcon={<PaymentIcon />}
            onClick={handleOpenPagoDialog}
            disabled={getEstado() === 'pagado'}
          >
            Registrar Pago
          </Button>
        </Box>
      </Box>

      {/* Resumen Financiero */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#e3f2fd' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Total
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {formatCurrency(presupuesto.total)}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#e8f5e9' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Pagado
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {formatCurrency(presupuesto.total_pagado)}
                  </Typography>
                </Box>
                <WalletIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#fff3e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Saldo Pendiente
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {formatCurrency(saldo)}
                  </Typography>
                </Box>
                <ReceiptIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Progreso de Pago
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressPercentage()}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {getProgressPercentage().toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Información General" />
            <Tab label="Actos / Procedimientos" />
            <Tab label="Historial de Pagos" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Tab 1: Información General */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Paciente
                </Typography>
                <Typography variant="h6">
                  {presupuesto.paciente
                    ? `${presupuesto.paciente.nombres} ${presupuesto.paciente.apellidos}`
                    : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Ficha Endodóntica
                </Typography>
                <Typography variant="h6">
                  Ficha #{presupuesto.ficha_id}
                  {presupuesto.ficha?.pieza_dental && ` - Pieza ${presupuesto.ficha.pieza_dental}`}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Fecha de Creación
                </Typography>
                <Typography variant="body1">
                  {presupuesto.created_at
                    ? new Date(presupuesto.created_at).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Última Actualización
                </Typography>
                <Typography variant="body1">
                  {presupuesto.updated_at
                    ? new Date(presupuesto.updated_at).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">
                  Total del Presupuesto
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(presupuesto.total)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">
                  Total Pagado
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {formatCurrency(presupuesto.total_pagado)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">
                  Saldo Pendiente
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {formatCurrency(saldo)}
                </Typography>
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Actos / Procedimientos */}
          {tabValue === 1 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>#</strong></TableCell>
                    <TableCell><strong>Actividad</strong></TableCell>
                    <TableCell align="right"><strong>Costo Unitario</strong></TableCell>
                    <TableCell align="right"><strong>Cantidad</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {presupuesto.actos && presupuesto.actos.length > 0 ? (
                    presupuesto.actos.map((acto, index) => (
                      <TableRow key={index}>
                        <TableCell>{acto.numero}</TableCell>
                        <TableCell>{acto.actividad}</TableCell>
                        <TableCell align="right">{formatCurrency(acto.costo_unitario)}</TableCell>
                        <TableCell align="right">{acto.cantidad}</TableCell>
                        <TableCell align="right">
                          <strong>{formatCurrency(acto.total)}</strong>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                          No hay actos registrados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {presupuesto.actos && presupuesto.actos.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        <strong>Total:</strong>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(presupuesto.total)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 3: Historial de Pagos */}
          {tabValue === 2 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Actividad</strong></TableCell>
                    <TableCell align="right"><strong>Valor</strong></TableCell>
                    <TableCell align="right"><strong>Saldo Anterior</strong></TableCell>
                    <TableCell align="right"><strong>Saldo Actual</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagos.length > 0 ? (
                    pagos.map((pago) => (
                      <TableRow key={pago.id}>
                        <TableCell>{pago.id}</TableCell>
                        <TableCell>
                          {pago.fecha ? new Date(pago.fecha).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>{pago.actividad || '-'}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={formatCurrency(pago.valor)}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(pago.saldo_anterior)}</TableCell>
                        <TableCell align="right">
                          <strong>{formatCurrency(pago.saldo_actual)}</strong>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                          No hay pagos registrados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <PagoDialog
        open={pagoDialogOpen}
        onClose={handleClosePagoDialog}
        presupuesto={presupuesto}
        onSuccess={handlePagoSuccess}
      />
    </Box>
  );
};

export default PresupuestoDetail;
