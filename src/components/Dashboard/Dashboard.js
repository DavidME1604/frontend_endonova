import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { patientService, fichaService } from '../../services/api';

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

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalFichas: 0,
    loading: true,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [patientsResponse, fichasResponse] = await Promise.all([
        patientService.getAll({ limit: 1 }),
        fichaService.getAll({ limit: 1 }),
      ]);

      setStats({
        totalPatients: patientsResponse.data.data.pagination.total,
        totalFichas: fichasResponse.data.data.pagination.total,
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

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Pacientes Recientes
              </Typography>
              <Typography variant="body2" color="textSecondary">
                No hay datos disponibles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
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
