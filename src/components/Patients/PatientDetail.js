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
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { patientService, fichaService } from '../../services/api';
import { toast } from 'react-toastify';

const PatientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientResponse, fichasResponse] = await Promise.all([
        patientService.getById(id),
        fichaService.getAll({ paciente_id: id }),
      ]);

      if (patientResponse.data.success) {
        setPatient(patientResponse.data.data);
      }

      if (fichasResponse.data.success) {
        setFichas(fichasResponse.data.data.fichas);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!patient) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/patients')}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Detalles del Paciente
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/patients/${id}/edit`)}
        >
          Editar
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Información Personal
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Historia Clínica
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {patient.historia_clinica}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Nombres
                  </Typography>
                  <Typography variant="body1">{patient.nombres}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Apellidos
                  </Typography>
                  <Typography variant="body1">{patient.apellidos}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Edad
                  </Typography>
                  <Typography variant="body1">{patient.edad} años</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body1">{patient.telefono}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Domicilio
                  </Typography>
                  <Typography variant="body1">{patient.domicilio}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Estado
                  </Typography>
                  <Chip label="Activo" size="small" color="success" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Fichas Endodónticas
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/fichas/new?paciente_id=${id}`)}
                >
                  Nueva Ficha
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {fichas.length === 0 ? (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 3 }}>
                  No hay fichas registradas
                </Typography>
              ) : (
                <List>
                  {fichas.map((ficha) => (
                    <ListItem
                      key={ficha.id}
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                          cursor: 'pointer',
                        },
                      }}
                      onClick={() => navigate(`/fichas/${ficha.id}`)}
                    >
                      <DescriptionIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText
                        primary={`Pieza Dental: ${ficha.pieza_dental}`}
                        secondary={`Fecha: ${new Date(ficha.fecha).toLocaleDateString()} - ${
                          ficha.motivo_consulta?.substring(0, 50)
                        }...`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientDetail;
