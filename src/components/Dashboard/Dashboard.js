import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  PendingActions as PendingActionsIcon,
  Receipt as ReceiptIcon,
  CalendarMonth as CalendarMonthIcon,
  AccessTime as AccessTimeIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { patientService, fichaService, presupuestoService, citaService } from '../../services/api';

const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 2,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const IngresosMensualesChart = ({ data }) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 3 }}>
        No hay datos disponibles
      </Typography>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.ingresos), 1);

  return (
    <Box sx={{ mt: 2 }}>
      {data.map((item, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="textSecondary">
              {item.mes}
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="primary">
              ${item.ingresos.toFixed(2)}
            </Typography>
          </Box>
          <Box
            sx={{
              width: '100%',
              height: 24,
              backgroundColor: theme.palette.mode === 'dark' ? '#333333' : '#e0e0e0',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${(item.ingresos / maxValue) * 100}%`,
                height: '100%',
                backgroundColor: theme.palette.primary.main,
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

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

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalFichas: 0,
    totalFacturado: 0,
    totalCobrado: 0,
    saldoPendiente: 0,
    presupuestosActivos: 0,
    ingresosMensuales: [],
    loading: true,
  });
  const [proximasCitas, setProximasCitas] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchProximasCitas();
  }, []);

  const fetchProximasCitas = async () => {
    try {
      const response = await citaService.getProximas(7);
      const citasData = response.data.data || response.data || [];
      setProximasCitas(citasData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching proximas citas:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [patientsResponse, fichasResponse, estadisticasResponse] = await Promise.all([
        patientService.getAll({ limit: 1 }),
        fichaService.getAll({ limit: 1 }),
        presupuestoService.getEstadisticas().catch(() => ({ data: { data: null } })),
      ]);

      const estadisticas = estadisticasResponse.data?.data || {};

      setStats({
        totalPatients: patientsResponse.data.data.pagination.total,
        totalFichas: fichasResponse.data.data.pagination.total,
        totalFacturado: estadisticas.total_facturado || 0,
        totalCobrado: estadisticas.total_cobrado || 0,
        saldoPendiente: estadisticas.saldo_pendiente || 0,
        presupuestosActivos: estadisticas.presupuestos_activos || 0,
        ingresosMensuales: estadisticas.ingresos_mensuales || [],
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({ ...stats, loading: false });
    }
  };

  if (stats.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Resumen del sistema de gestión odontológica
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Pacientes"
            value={stats.totalPatients}
            icon={<PeopleIcon sx={{ fontSize: 40, color: 'white' }} />}
            color="#1976d2"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Fichas Endodónticas"
            value={stats.totalFichas}
            icon={<DescriptionIcon sx={{ fontSize: 40, color: 'white' }} />}
            color="#2e7d32"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tratamientos Activos"
            value={stats.totalFichas}
            icon={<TrendingUpIcon sx={{ fontSize: 40, color: 'white' }} />}
            color="#ed6c02"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ingresos del Mes"
            value="$0"
            icon={<MoneyIcon sx={{ fontSize: 40, color: 'white' }} />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }} fontWeight="bold">
        Estadísticas Financieras
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Facturado"
            value={`$${stats.totalFacturado.toFixed(2)}`}
            icon={<MoneyIcon sx={{ fontSize: 40, color: 'white' }} />}
            color="#0288d1"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Cobrado"
            value={`$${stats.totalCobrado.toFixed(2)}`}
            icon={<AccountBalanceIcon sx={{ fontSize: 40, color: 'white' }} />}
            color="#2e7d32"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Saldo Pendiente"
            value={`$${stats.saldoPendiente.toFixed(2)}`}
            icon={<PendingActionsIcon sx={{ fontSize: 40, color: 'white' }} />}
            color="#f57c00"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Presupuestos Activos"
            value={stats.presupuestosActivos}
            icon={<ReceiptIcon sx={{ fontSize: 40, color: 'white' }} />}
            color="#c62828"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Próximas Citas
                </Typography>
                <CalendarMonthIcon color="primary" />
              </Box>
              {proximasCitas.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No hay citas programadas
                </Typography>
              ) : (
                <List dense disablePadding>
                  {proximasCitas.map((cita, index) => (
                    <React.Fragment key={cita.id}>
                      <ListItem
                        sx={{ px: 0, cursor: 'pointer' }}
                        onClick={() => navigate('/calendario')}
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
                                  height: 18,
                                  fontSize: '0.65rem',
                                  backgroundColor: estadoColores[cita.estado],
                                  color: 'white',
                                }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < proximasCitas.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
              <Button
                fullWidth
                variant="text"
                endIcon={<ChevronRightIcon />}
                onClick={() => navigate('/calendario')}
                sx={{ mt: 2 }}
              >
                Ver Calendario
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Tratamientos Pendientes
              </Typography>
              <Typography variant="body2" color="textSecondary">
                No hay datos disponibles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Ingresos Últimos 6 Meses
              </Typography>
              <IngresosMensualesChart data={stats.ingresosMensuales} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Bienvenido al Sistema ENDONOVA
          </Typography>
          <Typography variant="body1" paragraph>
            Este sistema te permite gestionar de manera eficiente:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2">Registro y seguimiento de pacientes</Typography>
            </li>
            <li>
              <Typography variant="body2">
                Fichas de diagnóstico y tratamiento endodóntico
              </Typography>
            </li>
            <li>
              <Typography variant="body2">Odontogramas interactivos</Typography>
            </li>
            <li>
              <Typography variant="body2">Presupuestos y control de pagos</Typography>
            </li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
