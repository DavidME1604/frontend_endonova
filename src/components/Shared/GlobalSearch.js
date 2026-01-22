import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  InputAdornment,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  alpha,
  Collapse,
  Avatar,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  CalendarMonth as CalendarMonthIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  ChevronRight as ChevronRightIcon,
  PersonOutline as PersonOutlineIcon,
  MedicalServices as MedicalServicesIcon,
  AttachMoney as AttachMoneyIcon,
  Event as EventIcon,
  FilterList as FilterListIcon,
  Keyboard as KeyboardIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { patientService, fichaService, presupuestoService, citaService } from '../../services/api';

// Categorías de búsqueda
const SEARCH_CATEGORIES = {
  patients: {
    key: 'patients',
    label: 'Pacientes',
    icon: PeopleIcon,
    color: '#00838F',
    path: '/patients',
  },
  fichas: {
    key: 'fichas',
    label: 'Fichas',
    icon: DescriptionIcon,
    color: '#26A69A',
    path: '/fichas',
  },
  presupuestos: {
    key: 'presupuestos',
    label: 'Presupuestos',
    icon: ReceiptIcon,
    color: '#7E57C2',
    path: '/presupuestos',
  },
  citas: {
    key: 'citas',
    label: 'Citas',
    icon: CalendarMonthIcon,
    color: '#42A5F5',
    path: '/calendario',
  },
};

// Historial de búsquedas recientes (guardado en localStorage)
const RECENT_SEARCHES_KEY = 'endonova-recent-searches';
const MAX_RECENT_SEARCHES = 5;

const getRecentSearches = () => {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (search) => {
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter((s) => s.query !== search.query);
    const updated = [search, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
};

// Componente de resultado individual
const SearchResultItem = ({ result, category, onClick, theme }) => {
  const CategoryIcon = SEARCH_CATEGORIES[category].icon;
  const categoryColor = SEARCH_CATEGORIES[category].color;

  const getResultTitle = () => {
    switch (category) {
      case 'patients':
        return `${result.nombres} ${result.apellidos}`;
      case 'fichas':
        return `Ficha #${result.id} - ${result.paciente?.nombres || ''} ${result.paciente?.apellidos || ''}`;
      case 'presupuestos':
        return `Presupuesto #${result.id} - ${result.paciente?.nombres || ''} ${result.paciente?.apellidos || ''}`;
      case 'citas':
        return `${result.paciente?.nombres || ''} ${result.paciente?.apellidos || ''}`;
      default:
        return 'Sin título';
    }
  };

  const getResultSubtitle = () => {
    switch (category) {
      case 'patients':
        return `Historia: ${result.numero_historia || 'N/A'} | Tel: ${result.telefono || 'N/A'}`;
      case 'fichas':
        return `Pieza: ${result.pieza_dental || 'N/A'} | Diagnóstico: ${result.diagnostico || 'N/A'}`;
      case 'presupuestos':
        return `Total: $${result.total?.toFixed(2) || '0.00'} | Estado: ${result.estado || 'N/A'}`;
      case 'citas':
        const fecha = result.fecha ? format(parseISO(result.fecha), 'dd MMM yyyy', { locale: es }) : 'N/A';
        return `${fecha} - ${result.hora_inicio || ''} | ${result.motivo || 'Sin motivo'}`;
      default:
        return '';
    }
  };

  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 2,
          mb: 0.5,
          '&:hover': {
            backgroundColor: alpha(categoryColor, 0.08),
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 44 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              backgroundColor: alpha(categoryColor, 0.1),
            }}
          >
            <CategoryIcon sx={{ fontSize: 20, color: categoryColor }} />
          </Avatar>
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body2" fontWeight="medium" noWrap>
              {getResultTitle()}
            </Typography>
          }
          secondary={
            <Typography variant="caption" color="textSecondary" noWrap>
              {getResultSubtitle()}
            </Typography>
          }
        />
        <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
      </ListItemButton>
    </ListItem>
  );
};

// Componente de categoría de resultados
const SearchResultCategory = ({ category, results, onResultClick, theme, expanded }) => {
  const CategoryIcon = SEARCH_CATEGORIES[category].icon;
  const categoryColor = SEARCH_CATEGORIES[category].color;
  const categoryLabel = SEARCH_CATEGORIES[category].label;

  if (results.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, px: 1 }}>
        <CategoryIcon sx={{ fontSize: 18, color: categoryColor, mr: 1 }} />
        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: categoryColor }}>
          {categoryLabel}
        </Typography>
        <Chip
          label={results.length}
          size="small"
          sx={{
            ml: 1,
            height: 20,
            fontSize: '0.7rem',
            backgroundColor: alpha(categoryColor, 0.1),
            color: categoryColor,
          }}
        />
      </Box>
      <List dense disablePadding>
        {results.slice(0, expanded ? 10 : 3).map((result) => (
          <SearchResultItem
            key={`${category}-${result.id}`}
            result={result}
            category={category}
            onClick={() => onResultClick(result, category)}
            theme={theme}
          />
        ))}
      </List>
      {results.length > 3 && !expanded && (
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ pl: 1, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          +{results.length - 3} más resultados
        </Typography>
      )}
    </Box>
  );
};

// Accesos directos sugeridos
const QuickActions = ({ onNavigate, theme }) => {
  const actions = [
    { label: 'Nuevo Paciente', path: '/patients/new', icon: PersonOutlineIcon, color: '#00838F' },
    { label: 'Nueva Ficha', path: '/fichas/new', icon: MedicalServicesIcon, color: '#26A69A' },
    { label: 'Nuevo Presupuesto', path: '/presupuestos/nuevo', icon: AttachMoneyIcon, color: '#7E57C2' },
    { label: 'Ver Calendario', path: '/calendario', icon: EventIcon, color: '#42A5F5' },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1.5, px: 1 }}>
        Acciones rápidas
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {actions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <Chip
              key={action.path}
              icon={<ActionIcon sx={{ fontSize: 16 }} />}
              label={action.label}
              onClick={() => onNavigate(action.path)}
              sx={{
                backgroundColor: alpha(action.color, 0.1),
                color: action.color,
                '&:hover': {
                  backgroundColor: alpha(action.color, 0.2),
                },
                '& .MuiChip-icon': {
                  color: action.color,
                },
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

// Búsquedas recientes
const RecentSearches = ({ searches, onSearch, onClear, theme }) => {
  if (searches.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 1 }}>
        <Typography variant="subtitle2" color="textSecondary">
          Búsquedas recientes
        </Typography>
        <Typography
          variant="caption"
          color="primary"
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={onClear}
        >
          Limpiar
        </Typography>
      </Box>
      <List dense disablePadding>
        {searches.map((search, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              onClick={() => onSearch(search.query)}
              sx={{ borderRadius: 2, py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <HistoryIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" noWrap>
                    {search.query}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

const GlobalSearch = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    patients: [],
    fichas: [],
    presupuestos: [],
    citas: [],
  });
  const [activeFilters, setActiveFilters] = useState(['patients', 'fichas', 'presupuestos', 'citas']);
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());
  const [showFilters, setShowFilters] = useState(false);

  // Focus en el input cuando se abre el dialog
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Limpiar al cerrar
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults({ patients: [], fichas: [], presupuestos: [], citas: [] });
    }
  }, [open]);

  // Búsqueda con debounce
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim());
      } else {
        setResults({ patients: [], fichas: [], presupuestos: [], citas: [] });
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, activeFilters]);

  const performSearch = async (searchQuery) => {
    setLoading(true);

    try {
      const searchPromises = [];
      const searchCategories = [];

      if (activeFilters.includes('patients')) {
        searchPromises.push(
          patientService.getAll({ search: searchQuery, limit: 10 }).catch(() => ({ data: { data: { patients: [] } } }))
        );
        searchCategories.push('patients');
      }

      if (activeFilters.includes('fichas')) {
        searchPromises.push(
          fichaService.getAll({ search: searchQuery, limit: 10 }).catch(() => ({ data: { data: { fichas: [] } } }))
        );
        searchCategories.push('fichas');
      }

      if (activeFilters.includes('presupuestos')) {
        searchPromises.push(
          presupuestoService.getAll({ search: searchQuery, limit: 10 }).catch(() => ({ data: { data: { presupuestos: [] } } }))
        );
        searchCategories.push('presupuestos');
      }

      if (activeFilters.includes('citas')) {
        searchPromises.push(
          citaService.getAll({ search: searchQuery, limit: 10 }).catch(() => ({ data: { data: { citas: [] } } }))
        );
        searchCategories.push('citas');
      }

      const responses = await Promise.all(searchPromises);

      const newResults = {
        patients: [],
        fichas: [],
        presupuestos: [],
        citas: [],
      };

      responses.forEach((response, index) => {
        const category = searchCategories[index];
        const data = response.data?.data;

        switch (category) {
          case 'patients':
            newResults.patients = data?.patients || [];
            break;
          case 'fichas':
            newResults.fichas = data?.fichas || [];
            break;
          case 'presupuestos':
            newResults.presupuestos = data?.presupuestos || [];
            break;
          case 'citas':
            newResults.citas = data?.citas || [];
            break;
        }
      });

      setResults(newResults);

      // Guardar búsqueda reciente si hay resultados
      const totalResults = Object.values(newResults).reduce((sum, arr) => sum + arr.length, 0);
      if (totalResults > 0) {
        saveRecentSearch({ query: searchQuery, timestamp: Date.now() });
        setRecentSearches(getRecentSearches());
      }
    } catch (error) {
      console.error('Error en búsqueda global:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result, category) => {
    const basePath = SEARCH_CATEGORIES[category].path;
    let targetPath = basePath;

    switch (category) {
      case 'patients':
        targetPath = `/patients/${result.id}`;
        break;
      case 'fichas':
        targetPath = `/fichas/${result.id}`;
        break;
      case 'presupuestos':
        targetPath = `/presupuestos/${result.id}`;
        break;
      case 'citas':
        targetPath = '/calendario';
        break;
    }

    onClose();
    navigate(targetPath);
  };

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleFilterChange = (event, newFilters) => {
    if (newFilters.length > 0) {
      setActiveFilters(newFilters);
    }
  };

  const clearRecentSearches = () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  };

  const handleRecentSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
  const hasQuery = query.trim().length >= 2;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '80vh',
          position: 'fixed',
          top: '10%',
        },
      }}
      TransitionComponent={Fade}
      transitionDuration={200}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header con búsqueda */}
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            position: 'sticky',
            top: 0,
            backgroundColor: theme.palette.background.paper,
            zIndex: 1,
          }}
        >
          <TextField
            ref={inputRef}
            fullWidth
            placeholder="Buscar pacientes, fichas, presupuestos, citas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SearchIcon color="action" />
                  )}
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title="Filtros">
                      <IconButton
                        size="small"
                        onClick={() => setShowFilters(!showFilters)}
                        sx={{
                          backgroundColor: showFilters ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                        }}
                      >
                        <FilterListIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {query && (
                      <IconButton size="small" onClick={() => setQuery('')}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                    <Chip
                      icon={<KeyboardIcon sx={{ fontSize: 14 }} />}
                      label="ESC"
                      size="small"
                      variant="outlined"
                      sx={{ height: 24, fontSize: '0.7rem' }}
                      onClick={onClose}
                    />
                  </Box>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                '& fieldset': { border: 'none' },
              },
            }}
          />

          {/* Filtros de categorías */}
          <Collapse in={showFilters}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                Buscar en:
              </Typography>
              <ToggleButtonGroup
                value={activeFilters}
                onChange={handleFilterChange}
                size="small"
                sx={{ flexWrap: 'wrap', gap: 0.5 }}
              >
                {Object.values(SEARCH_CATEGORIES).map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <ToggleButton
                      key={cat.key}
                      value={cat.key}
                      sx={{
                        borderRadius: '16px !important',
                        border: `1px solid ${theme.palette.divider} !important`,
                        px: 2,
                        py: 0.5,
                        '&.Mui-selected': {
                          backgroundColor: alpha(cat.color, 0.1),
                          color: cat.color,
                          borderColor: `${cat.color} !important`,
                        },
                      }}
                    >
                      <CatIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {cat.label}
                    </ToggleButton>
                  );
                })}
              </ToggleButtonGroup>
            </Box>
          </Collapse>
        </Box>

        {/* Contenido */}
        <Box sx={{ p: 2, maxHeight: 'calc(80vh - 140px)', overflow: 'auto' }}>
          {!hasQuery ? (
            <>
              {/* Estado inicial: acciones rápidas y búsquedas recientes */}
              <QuickActions onNavigate={handleNavigate} theme={theme} />
              <RecentSearches
                searches={recentSearches}
                onSearch={handleRecentSearch}
                onClear={clearRecentSearches}
                theme={theme}
              />

              {/* Tips de uso */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.info.main, 0.04),
                  borderColor: alpha(theme.palette.info.main, 0.2),
                }}
              >
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  Tips de búsqueda
                </Typography>
                <Typography variant="caption" color="textSecondary" component="div">
                  • Busca por nombre, número de historia, teléfono o correo
                  <br />
                  • Usa los filtros para limitar los resultados por categoría
                  <br />
                  • Presiona <strong>Ctrl+K</strong> para abrir la búsqueda desde cualquier lugar
                </Typography>
              </Paper>
            </>
          ) : loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : totalResults > 0 ? (
            <>
              {/* Resultados agrupados por categoría */}
              <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
              </Typography>

              {Object.keys(SEARCH_CATEGORIES).map((category) => (
                <SearchResultCategory
                  key={category}
                  category={category}
                  results={results[category]}
                  onResultClick={handleResultClick}
                  theme={theme}
                  expanded={activeFilters.length === 1}
                />
              ))}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body1" color="textSecondary">
                No se encontraron resultados para "{query}"
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Intenta con otros términos o revisa los filtros activos
              </Typography>
            </Box>
          )}
        </Box>

        {/* Footer con atajos */}
        <Box
          sx={{
            p: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="caption" color="textSecondary">
              <kbd style={{
                backgroundColor: alpha(theme.palette.text.primary, 0.1),
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: '0.7rem',
              }}>↑↓</kbd> Navegar
            </Typography>
            <Typography variant="caption" color="textSecondary">
              <kbd style={{
                backgroundColor: alpha(theme.palette.text.primary, 0.1),
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: '0.7rem',
              }}>Enter</kbd> Seleccionar
            </Typography>
            <Typography variant="caption" color="textSecondary">
              <kbd style={{
                backgroundColor: alpha(theme.palette.text.primary, 0.1),
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: '0.7rem',
              }}>Esc</kbd> Cerrar
            </Typography>
          </Box>
          <Typography variant="caption" color="textSecondary">
            Búsqueda Global ENDONOVA
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;
