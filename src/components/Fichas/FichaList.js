import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { fichaService } from '../../services/api';
import { toast } from 'react-toastify';

const FichaList = () => {
  const navigate = useNavigate();
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalFichas, setTotalFichas] = useState(0);

  useEffect(() => {
    fetchFichas();
  }, [page, rowsPerPage]);

  const fetchFichas = async () => {
    try {
      setLoading(true);
      const response = await fichaService.getAll({
        page: page + 1,
        limit: rowsPerPage,
      });

      if (response.data.success) {
        setFichas(response.data.data.fichas);
        setTotalFichas(response.data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching fichas:', error);
      toast.error('Error al cargar las fichas');
    } finally {
      setLoading(false);
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
    if (window.confirm('¿Está seguro de eliminar esta ficha?')) {
      try {
        await fichaService.delete(id);
        toast.success('Ficha eliminada exitosamente');
        fetchFichas();
      } catch (error) {
        console.error('Error deleting ficha:', error);
        toast.error('Error al eliminar la ficha');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Fichas Endodónticas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/fichas/new')}
        >
          Nueva Ficha
        </Button>
      </Box>

      <Card>
        <CardContent>
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
                      <TableCell><strong>Historia Clínica</strong></TableCell>
                      <TableCell><strong>Paciente</strong></TableCell>
                      <TableCell><strong>Pieza Dental</strong></TableCell>
                      <TableCell><strong>Fecha</strong></TableCell>
                      <TableCell><strong>Motivo</strong></TableCell>
                      <TableCell align="center"><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fichas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                            No se encontraron fichas
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      fichas.map((ficha) => (
                        <TableRow key={ficha.id} hover>
                          <TableCell>{ficha.historia_clinica}</TableCell>
                          <TableCell>
                            {ficha.nombres} {ficha.apellidos}
                          </TableCell>
                          <TableCell>
                            <Chip label={ficha.pieza_dental} size="small" color="primary" />
                          </TableCell>
                          <TableCell>
                            {new Date(ficha.fecha).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {ficha.motivo_consulta?.substring(0, 50)}
                            {ficha.motivo_consulta?.length > 50 ? '...' : ''}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/fichas/${ficha.id}`)}
                              title="Ver detalles"
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/fichas/${ficha.id}/edit`)}
                              title="Editar"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(ficha.id)}
                              title="Eliminar"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={totalFichas}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default FichaList;
