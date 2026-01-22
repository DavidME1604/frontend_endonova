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
  Avatar,
  LinearProgress,
  alpha,
} from '@mui/material';
import {
  People as PeopleIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  PendingActions as PendingActionsIcon,
  Receipt as ReceiptIcon,
  CalendarMonth as CalendarMonthIcon,
  AccessTime as AccessTimeIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  EventAvailable as EventAvailableIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { patientService, fichaService, presupuestoService, citaService } from '../../services/api';

// Componente de tarjeta estadística mejorada
const StatCard = ({ title, value, icon, color, trend, trendValue, subtitle }) => {
  const theme = useTheme();
  const isPositiveTrend = trend === 'up';

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '210px',
          height: '210px',
          background: alpha('#fff', 0.1),
          borderRadius: '50%',
          transform: 'translate(60px, -60px)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '210px',
          height: '210px',
          background: alpha('#fff', 0.05),
          borderRadius: '50%',
          transform: 'translate(100px, 20px)',
        },
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              variant="body2"
              sx={{ opacity: 0.9, fontWeight: 500, mb: 0.5 }}
            >
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {isPositiveTrend ? (
                  <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16, mr: 0.5 }} />
                )}
                <Typography variant="caption" fontWeight="bold">
                  {trendValue}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              backgroundColor: alpha('#fff', 0.2),
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Colores para el tema
const CHART_COLORS = {
  primary: '#00838F',
  secondary: '#26A69A',
  success: '#66bb6a',
  warning: '#ffa726',
  error: '#ef5350',
  info: '#29b6f6',
};

const PIE_COLORS = ['#00838F', '#26A69A', '#4db6ac', '#80cbc4', '#b2dfdb'];

const estadoColores = {
  programada: '#29b6f6',
  confirmada: '#66bb6a',
  en_progreso: '#ffa726',
  completada: '#78909c',
  cancelada: '#ef5350',
  no_asistio: '#ff7043',
};

const estadoLabels = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  en_progreso: 'En Progreso',
  completada: 'Completada',
  cancelada: 'Cancelada',
  no_asistio: 'No Asistio',
};

// Tooltip personalizado para gráficos
const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();

  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          p: 1.5,
          boxShadow: theme.shadows[4],
        }}
      >
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: entry.color }}
          >
            {entry.name}: ${entry.value?.toFixed(2) || 0}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

// Gráfico de área para ingresos mensuales
const IngresosAreaChart = ({ data }) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
        <Typography variant="body2" color="textSecondary">
          No hay datos de ingresos disponibles
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          dataKey="mes"
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          axisLine={{ stroke: theme.palette.divider }}
        />
        <YAxis
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          axisLine={{ stroke: theme.palette.divider }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="ingresos"
          name="Ingresos"
          stroke={CHART_COLORS.primary}
          strokeWidth={3}
          fill="url(#colorIngresos)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Gráfico circular para estados de presupuestos
const EstadosPresupuestoPieChart = ({ data }) => {
  const theme = useTheme();

  const defaultData = [
    { name: 'Aprobados', value: 30 },
    { name: 'Pendientes', value: 25 },
    { name: 'En Proceso', value: 20 },
    { name: 'Completados', value: 15 },
    { name: 'Cancelados', value: 10 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span style={{ color: theme.palette.text.primary, fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Gráfico de barras para comparación financiera
const FinancialBarChart = ({ facturado, cobrado, pendiente }) => {
  const theme = useTheme();

  const data = [
    { name: 'Facturado', valor: facturado, fill: CHART_COLORS.info },
    { name: 'Cobrado', valor: cobrado, fill: CHART_COLORS.success },
    { name: 'Pendiente', valor: pendiente, fill: CHART_COLORS.warning },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          type="number"
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          tickFormatter={(value) => `$${value}`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          width={80}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
          }}
          formatter={(value) => [`$${value.toFixed(2)}`, 'Monto']}
        />
        <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Indicador de progreso circular
const ProgressIndicator = ({ value, total, label, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="textSecondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          {percentage.toFixed(0)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: alpha(color, 0.2),
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
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
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
          gap: 2,
        }}
      >
        <CircularProgress size={50} thickness={4} />
        <Typography variant="body1" color="textSecondary">
          Cargando datos del dashboard...
        </Typography>
      </Box>
    );
  }

  const ingresoMesActual = stats.ingresosMensuales.length > 0
    ? stats.ingresosMensuales[stats.ingresosMensuales.length - 1]?.ingresos || 0
    : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Bienvenido al panel de control de ENDONOVA
        </Typography>
      </Box>

      {/* Tarjetas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Pacientes"
            value={stats.totalPatients}
            icon={<PeopleIcon sx={{ fontSize: 28, color: 'white' }} />}
            color="#00838F"
            trend="up"
            trendValue="+12% este mes"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Fichas Activas"
            value={stats.totalFichas}
            icon={<DescriptionIcon sx={{ fontSize: 28, color: 'white' }} />}
            color="#26A69A"
            subtitle="Tratamientos en curso"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Presupuestos"
            value={stats.presupuestosActivos}
            icon={<ReceiptIcon sx={{ fontSize: 28, color: 'white' }} />}
            color="#7E57C2"
            subtitle="Activos este mes"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ingresos del Mes"
            value={`$${ingresoMesActual.toFixed(2)}`}
            icon={<MoneyIcon sx={{ fontSize: 28, color: 'white' }} />}
            color="#42A5F5"
            trend="up"
            trendValue="+8% vs mes anterior"
          />
        </Grid>
      </Grid>

      {/* Gráficos principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Gráfico de ingresos */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Ingresos Mensuales
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tendencia de los ultimos 6 meses
                  </Typography>
                </Box>
                <Chip
                  icon={<TrendingUpIcon />}
                  label="En crecimiento"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              </Box>
              <IngresosAreaChart data={stats.ingresosMensuales} />
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución de presupuestos */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Estados de Presupuestos
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Distribucion actual
              </Typography>
              <EstadosPresupuestoPieChart />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Segunda fila de gráficos y datos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Resumen financiero */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: alpha(CHART_COLORS.primary, 0.1), mr: 2 }}>
                  <AccountBalanceIcon color="primary" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Resumen Financiero
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Balance general
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total Facturado
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="info.main">
                    ${stats.totalFacturado.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total Cobrado
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    ${stats.totalCobrado.toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">
                    Saldo Pendiente
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="warning.main">
                    ${stats.saldoPendiente.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <ProgressIndicator
                value={stats.totalCobrado}
                total={stats.totalFacturado}
                label="Tasa de cobro"
                color={CHART_COLORS.success}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Comparación financiera */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Comparativa Financiera
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Facturado vs Cobrado vs Pendiente
              </Typography>
              <FinancialBarChart
                facturado={stats.totalFacturado}
                cobrado={stats.totalCobrado}
                pendiente={stats.saldoPendiente}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Próximas citas */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: alpha(CHART_COLORS.primary, 0.1), mr: 2 }}>
                    <CalendarMonthIcon color="primary" />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Proximas Citas
                  </Typography>
                </Box>
                <Chip label={proximasCitas.length} size="small" color="primary" />
              </Box>

              {proximasCitas.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 4,
                  }}
                >
                  <EventAvailableIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    No hay citas programadas
                  </Typography>
                </Box>
              ) : (
                <List dense disablePadding>
                  {proximasCitas.map((cita, index) => (
                    <React.Fragment key={cita.id}>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 1,
                          cursor: 'pointer',
                          borderRadius: 1,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          },
                        }}
                        onClick={() => navigate('/calendario')}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: alpha(estadoColores[cita.estado], 0.1),
                            }}
                          >
                            <AccessTimeIcon
                              sx={{ fontSize: 16, color: estadoColores[cita.estado] }}
                            />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight="medium" noWrap>
                              {cita.paciente?.nombres} {cita.paciente?.apellidos}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Typography variant="caption" color="textSecondary">
                                {format(parseISO(cita.fecha), 'dd MMM', { locale: es })} - {cita.hora_inicio}
                              </Typography>
                              <Chip
                                label={estadoLabels[cita.estado]}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  backgroundColor: alpha(estadoColores[cita.estado], 0.15),
                                  color: estadoColores[cita.estado],
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < proximasCitas.length - 1 && <Divider sx={{ my: 0.5 }} />}
                    </React.Fragment>
                  ))}
                </List>
              )}

              <Button
                fullWidth
                variant="outlined"
                endIcon={<ChevronRightIcon />}
                onClick={() => navigate('/calendario')}
                sx={{ mt: 2 }}
              >
                Ver Calendario Completo
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Accesos rápidos */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Accesos Rapidos
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate('/patients/new')}
                    sx={{ py: 2 }}
                  >
                    Nuevo Paciente
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                    onClick={() => navigate('/fichas/new')}
                    sx={{ py: 2 }}
                  >
                    Nueva Ficha
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    onClick={() => navigate('/presupuestos/nuevo')}
                    sx={{ py: 2 }}
                  >
                    Nuevo Presupuesto
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CalendarMonthIcon />}
                    onClick={() => navigate('/calendario')}
                    sx={{ py: 2 }}
                  >
                    Ver Calendario
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
