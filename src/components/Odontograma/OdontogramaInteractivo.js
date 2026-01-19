import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { odontogramaService } from '../../services/api';
import { toast } from 'react-toastify';

const ESTADOS_DENTALES = [
  { value: 'Sano', color: '#4caf50', label: 'Sano' },
  { value: 'Caries', color: '#f44336', label: 'Caries' },
  { value: 'Obturado', color: '#2196f3', label: 'Obturado' },
  { value: 'Endodoncia', color: '#9c27b0', label: 'Endodoncia' },
  { value: 'Corona', color: '#ff9800', label: 'Corona' },
  { value: 'Puente', color: '#795548', label: 'Puente' },
  { value: 'Extraído', color: '#000000', label: 'Extraído' },
  { value: 'Implante', color: '#607d8b', label: 'Implante' },
  { value: 'Fractura', color: '#e91e63', label: 'Fractura' },
  { value: 'Ausente', color: '#9e9e9e', label: 'Ausente' },
  { value: 'En tratamiento', color: '#ffc107', label: 'En tratamiento' },
];

// Dientes por cuadrante según notación FDI
const DIENTES = {
  1: [18, 17, 16, 15, 14, 13, 12, 11], // Cuadrante superior derecho
  2: [21, 22, 23, 24, 25, 26, 27, 28], // Cuadrante superior izquierdo
  3: [38, 37, 36, 35, 34, 33, 32, 31], // Cuadrante inferior izquierdo
  4: [48, 47, 46, 45, 44, 43, 42, 41], // Cuadrante inferior derecho
};

const Tooth = ({ numero, estado, onClick, isSelected }) => {
  const estadoObj = ESTADOS_DENTALES.find((e) => e.value === estado) || ESTADOS_DENTALES[0];

  return (
    <Tooltip title={`Diente ${numero}: ${estadoObj.label}`}>
      <Box
        onClick={onClick}
        sx={{
          width: 50,
          height: 60,
          border: isSelected ? '3px solid #1976d2' : '2px solid #ccc',
          borderRadius: 2,
          backgroundColor: estadoObj.color,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: 3,
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {numero}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: '8px',
            color: 'white',
            textAlign: 'center',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {estadoObj.label}
        </Typography>
      </Box>
    </Tooltip>
  );
};

const OdontogramaInteractivo = ({ fichaId, onSave }) => {
  const [dientes, setDientes] = useState({});
  const [selectedDiente, setSelectedDiente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fichaId) {
      fetchOdontograma();
    } else {
      // Inicializar todos los dientes como "Sano"
      const initialDientes = {};
      Object.values(DIENTES).flat().forEach((num) => {
        initialDientes[num] = {
          diente_numero: num,
          cuadrante: Math.floor(num / 10),
          estado: 'Sano',
          notas: '',
        };
      });
      setDientes(initialDientes);
      setLoading(false);
    }
  }, [fichaId]);

  const fetchOdontograma = async () => {
    try {
      setLoading(true);
      const response = await odontogramaService.getByFicha(fichaId);
      if (response.data.success) {
        const odontogramaData = response.data.data.todos || [];
        const dientesObj = {};

        // Inicializar todos los dientes
        Object.values(DIENTES).flat().forEach((num) => {
          dientesObj[num] = {
            diente_numero: num,
            cuadrante: Math.floor(num / 10),
            estado: 'Sano',
            notas: '',
          };
        });

        // Actualizar con datos del servidor
        odontogramaData.forEach((d) => {
          dientesObj[d.diente_numero] = d;
        });

        setDientes(dientesObj);
      }
    } catch (error) {
      console.error('Error fetching odontograma:', error);
      // Si no existe, inicializar con valores por defecto
      const initialDientes = {};
      Object.values(DIENTES).flat().forEach((num) => {
        initialDientes[num] = {
          diente_numero: num,
          cuadrante: Math.floor(num / 10),
          estado: 'Sano',
          notas: '',
        };
      });
      setDientes(initialDientes);
    } finally {
      setLoading(false);
    }
  };

  const handleDienteClick = (numero) => {
    setSelectedDiente(numero);
  };

  const handleEstadoChange = (estado) => {
    if (selectedDiente) {
      setDientes((prev) => ({
        ...prev,
        [selectedDiente]: {
          ...prev[selectedDiente],
          estado,
        },
      }));
    }
  };

  const handleNotasChange = (event) => {
    if (selectedDiente) {
      setDientes((prev) => ({
        ...prev,
        [selectedDiente]: {
          ...prev[selectedDiente],
          notas: event.target.value,
        },
      }));
    }
  };

  const handleSave = async () => {
    if (!fichaId) {
      toast.error('Debe guardar la ficha primero');
      return;
    }

    try {
      const dientesArray = Object.values(dientes).map((d) => ({
        diente_numero: d.diente_numero,
        cuadrante: d.cuadrante,
        estado: d.estado,
        notas: d.notas,
      }));

      await odontogramaService.create({
        ficha_id: fichaId,
        dientes: dientesArray,
      });

      toast.success('Odontograma guardado exitosamente');
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving odontograma:', error);
      toast.error('Error al guardar el odontograma');
    }
  };

  if (loading) return <Typography>Cargando odontograma...</Typography>;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Odontograma Interactivo
        </Typography>

        {/* Leyenda de Estados */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {ESTADOS_DENTALES.map((estado) => (
            <Chip
              key={estado.value}
              label={estado.label}
              size="small"
              sx={{
                backgroundColor: estado.color,
                color: 'white',
              }}
            />
          ))}
        </Box>

        {/* Odontograma Visual */}
        <Box sx={{ mb: 3 }}>
          {/* Cuadrantes Superiores */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            {/* Cuadrante 1 - Superior Derecho */}
            <Box sx={{ display: 'flex', gap: 1, mr: 4 }}>
              {DIENTES[1].map((num) => (
                <Tooth
                  key={num}
                  numero={num}
                  estado={dientes[num]?.estado || 'Sano'}
                  onClick={() => handleDienteClick(num)}
                  isSelected={selectedDiente === num}
                />
              ))}
            </Box>

            {/* Cuadrante 2 - Superior Izquierdo */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {DIENTES[2].map((num) => (
                <Tooth
                  key={num}
                  numero={num}
                  estado={dientes[num]?.estado || 'Sano'}
                  onClick={() => handleDienteClick(num)}
                  isSelected={selectedDiente === num}
                />
              ))}
            </Box>
          </Box>

          {/* Línea divisoria */}
          <Box
            sx={{
              height: 2,
              backgroundColor: '#333',
              mb: 2,
              mx: 'auto',
              width: '90%',
            }}
          />

          {/* Cuadrantes Inferiores */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {/* Cuadrante 4 - Inferior Derecho */}
            <Box sx={{ display: 'flex', gap: 1, mr: 4 }}>
              {DIENTES[4].map((num) => (
                <Tooth
                  key={num}
                  numero={num}
                  estado={dientes[num]?.estado || 'Sano'}
                  onClick={() => handleDienteClick(num)}
                  isSelected={selectedDiente === num}
                />
              ))}
            </Box>

            {/* Cuadrante 3 - Inferior Izquierdo */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {DIENTES[3].map((num) => (
                <Tooth
                  key={num}
                  numero={num}
                  estado={dientes[num]?.estado || 'Sano'}
                  onClick={() => handleDienteClick(num)}
                  isSelected={selectedDiente === num}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Panel de Edición */}
        {selectedDiente && (
          <Card variant="outlined" sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Editando Diente: {selectedDiente}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={dientes[selectedDiente]?.estado || 'Sano'}
                    onChange={(e) => handleEstadoChange(e.target.value)}
                    label="Estado"
                  >
                    {ESTADOS_DENTALES.map((estado) => (
                      <MenuItem key={estado.value} value={estado.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              backgroundColor: estado.color,
                              borderRadius: 1,
                            }}
                          />
                          {estado.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  label="Notas"
                  value={dientes[selectedDiente]?.notas || ''}
                  onChange={handleNotasChange}
                  placeholder="Observaciones sobre este diente..."
                />
              </Grid>
            </Grid>
          </Card>
        )}

        {/* Botón Guardar */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!fichaId}
          >
            Guardar Odontograma
          </Button>
        </Box>

        {!fichaId && (
          <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
            * Debe guardar la ficha primero antes de guardar el odontograma
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default OdontogramaInteractivo;
