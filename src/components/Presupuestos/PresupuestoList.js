import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  CircularProgress,
  InputAdornment,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { presupuestoService } from '../../services/api';
import { toast } from 'react-toastify';
import PagoDialog from './PagoDialog';

const PresupuestoList = () => {
  const navigate = useNavigate();
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPresupuestos, setTotalPresupuestos] = useState(0);
  const [pagoDialogOpen, setPagoDialogOpen] = useState(false);
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null);

  useEffect(() => {
    fetchPresupuestos();
  }, [page, rowsPerPage, searchTerm, estadoFilter]);

  const fetchPresupuestos = async () => {
    try {
      setLoading(true);
      const response = await presupuestoService.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        estado: estadoFilter !== 'todos' ? estadoFilter : undefined,
      });

      if (response.data.success) {
        setPresupuestos(response.data.data.presupuestos);
        setTotalPresupuestos(response.data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching presupuestos:', error);
      toast.error('Error al cargar presupuestos');
    } finally {
      setLoading(false);
    }
  };

  const getEstado = (presupuesto) => {
    const saldo = presupuesto.saldo || (presupuesto.total - presupuesto.total_pagado);
    if (saldo === 0 || presupuesto.total_pagado >= presupuesto.total) {
      return 'pagado';
    } else if (presupuesto.total_pagado > 0) {
      return 'parcial';
    }
    return 'pendiente';
  };

  const getEstadoChip = (presupuesto) => {
    const estado = getEstado(presupuesto);
    const configs = {
      pagado: { label: 'Pagado', color: 'success' },
      parcial: { label: 'Parcial', color: 'warning' },
      pendiente: { label: 'Pendiente', color: 'error' },
    };
    return <Chip label={configs[estado].label} color={configs[estado].color} size="small" />;
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleEstadoFilterChange = (event, newEstado) => {
    if (newEstado !== null) {
      setEstadoFilter(newEstado);
      setPage(0);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este presupuesto?')) {
      try {
        await presupuestoService.delete(id);
        toast.success('Presupuesto eliminado exitosamente');
        fetchPresupuestos();
      } catch (error) {
        console.error('Error deleting presupuesto:', error);
        toast.error('Error al eliminar presupuesto');
      }
    }
  };

  const handleOpenPagoDialog = (presupuesto) => {
    setSelectedPresupuesto(presupuesto);
    setPagoDialogOpen(true);
  };

  const handleClosePagoDialog = () => {
    setPagoDialogOpen(false);
    setSelectedPresupuesto(null);
  };

  const handlePagoSuccess = () => {
    fetchPresupuestos();
    handleClosePagoDialog();
  };

  const formatCurrency = (value) => {
    return `$${parseFloat(value || 0).toFixed(2)}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Gestión de Presupuestos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/presupuestos/nuevo')}
        >
          Nuevo Presupuesto
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar por paciente o número de ficha..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <ToggleButtonGroup
              value={estadoFilter}
              exclusive
              onChange={handleEstadoFilterChange}
              size="small"
            >
              <ToggleButton value="todos">Todos</ToggleButton>
              <ToggleButton value="pendiente">Pendiente</ToggleButton>
              <ToggleButton value="parcial">Parcial</ToggleButton>
              <ToggleButton value="pagado">Pagado</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>ID</strong></TableCell>
                      <TableCell><strong>Paciente</strong></TableCell>
                      <TableCell><strong>Ficha</strong></TableCell>
                      <TableCell align="right"><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>Pagado</strong></TableCell>
                      <TableCell align="right"><strong>Saldo</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                      <TableCell align="center"><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {presupuestos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                            No se encontraron presupuestos
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      presupuestos.map((presupuesto) => {
                        const saldo = presupuesto.saldo || (presupuesto.total - presupuesto.total_pagado);
                        return (
                          <TableRow key={presupuesto.id} hover>
                            <TableCell>{presupuesto.id}</TableCell>
                            <TableCell>
                              {presupuesto.paciente
                                ? `${presupuesto.paciente.nombres} ${presupuesto.paciente.apellidos}`
                                : '-'}
                            </TableCell>
                            <TableCell>#{presupuesto.ficha_id}</TableCell>
                            <TableCell align="right">{formatCurrency(presupuesto.total)}</TableCell>
                            <TableCell align="right">{formatCurrency(presupuesto.total_pagado)}</TableCell>
                            <TableCell align="right">{formatCurrency(saldo)}</TableCell>
                            <TableCell>{getEstadoChip(presupuesto)}</TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => navigate(`/presupuestos/${presupuesto.id}`)}
                                title="Ver detalles"
                              >
                                <VisibilityIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => navigate(`/presupuestos/${presupuesto.id}/editar`)}
                                title="Editar"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleOpenPagoDialog(presupuesto)}
                                title="Registrar pago"
                                disabled={getEstado(presupuesto) === 'pagado'}
                              >
                                <PaymentIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(presupuesto.id)}
                                title="Eliminar"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={totalPresupuestos}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            </>
          )}
        </CardContent>
      </Card>

      {selectedPresupuesto && (
        <PagoDialog
          open={pagoDialogOpen}
          onClose={handleClosePagoDialog}
          presupuesto={selectedPresupuesto}
          onSuccess={handlePagoSuccess}
        />
      )}
    </Box>
  );
};

export default PresupuestoList;
