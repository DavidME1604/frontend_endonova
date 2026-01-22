import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  InputBase,
  alpha,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  ReceiptLong as ReceiptLongIcon,
  CalendarMonth as CalendarMonthIcon,
  AccountCircle,
  Logout,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import GlobalSearch from './GlobalSearch';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Calendario', icon: <CalendarMonthIcon />, path: '/calendario' },
  { text: 'Pacientes', icon: <PeopleIcon />, path: '/patients' },
  { text: 'Fichas', icon: <DescriptionIcon />, path: '/fichas' },
  { text: 'Presupuestos', icon: <ReceiptLongIcon />, path: '/presupuestos' },
];

const Layout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme, isDarkMode } = useThemeMode();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Atajo de teclado Ctrl+K para abrir búsqueda
  const handleKeyDown = useCallback((event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      setSearchOpen(true);
    }
    if (event.key === 'Escape' && searchOpen) {
      setSearchOpen(false);
    }
  }, [searchOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenSearch = () => {
    setSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setSearchOpen(false);
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" color="primary" fontWeight="bold">
          ENDONOVA
        </Typography>
      </Toolbar>
      <Divider />

      {/* Búsqueda en sidebar para móvil */}
      <Box sx={{ p: 2, display: { xs: 'block', sm: 'none' } }}>
        <Box
          onClick={handleOpenSearch}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Typography variant="body2" color="textSecondary">
            Buscar...
          </Typography>
        </Box>
      </Box>

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Barra de búsqueda en desktop */}
          <Box
            onClick={handleOpenSearch}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              backgroundColor: alpha(theme.palette.common.white, 0.15),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.25),
              },
              borderRadius: 2,
              px: 2,
              py: 0.75,
              cursor: 'pointer',
              minWidth: 280,
              mr: 2,
            }}
          >
            <SearchIcon sx={{ color: 'inherit', mr: 1, opacity: 0.7 }} />
            <Typography
              variant="body2"
              sx={{ color: 'inherit', opacity: 0.7, flexGrow: 1 }}
            >
              Buscar...
            </Typography>
            <Chip
              label="Ctrl+K"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                backgroundColor: alpha(theme.palette.common.white, 0.2),
                color: 'inherit',
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Botón de búsqueda para móvil en AppBar */}
            <Tooltip title="Buscar (Ctrl+K)">
              <IconButton
                color="inherit"
                onClick={handleOpenSearch}
                sx={{ display: { xs: 'flex', sm: 'none' } }}
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}>
              <IconButton color="inherit" onClick={toggleTheme}>
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            <Typography
              variant="body2"
              sx={{ ml: 1, display: { xs: 'none', md: 'block' } }}
            >
              {user?.nombre}
            </Typography>

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.nombre?.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Perfil</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cerrar Sesión</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      {/* Modal de búsqueda global */}
      <GlobalSearch open={searchOpen} onClose={handleCloseSearch} />
    </Box>
  );
};

export default Layout;
