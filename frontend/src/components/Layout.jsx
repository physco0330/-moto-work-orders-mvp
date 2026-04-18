import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, AppBar, Toolbar, Typography, IconButton, Divider,
  Avatar, useMediaQuery, useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const menuItems = [
  { path: '/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
  { path: '/pilotos', icon: <PeopleIcon />, label: 'Pilotos' },
  { path: '/motocicletas', icon: <TwoWheelerIcon />, label: 'Motocicletas' },
  { path: '/items', icon: <ListAltIcon />, label: 'Items' },
  { path: '/work-orders/pendientes', icon: <PendingActionsIcon />, label: 'Pendientes' },
  { path: '/work-orders/proceso', icon: <BuildIcon />, label: 'En Proceso' },
  { path: '/work-orders/terminados', icon: <CheckCircleIcon />, label: 'Terminados' },
  { path: '/work-orders/historial', icon: <HistoryIcon />, label: 'Historial' },
  { path: '/configuracion', icon: <SettingsIcon />, label: 'Mi Configuración' },
];

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/logo-skm3.jpg" alt="Pavas" style={{ width: 112, height: 112, borderRadius: 16, objectFit: 'cover' }} />
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={NavLink} 
              to={item.path}
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{ 
                borderRadius: 2,
                '&.active': { bgcolor: 'primary.lighter', color: 'primary.main' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {user?.role === 'ADMIN' && (
          <ListItem disablePadding>
            <ListItemButton 
              component={NavLink} 
              to="/users"
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Usuarios" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
            {user?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role === 'ADMIN' ? 'Administrador' : 'Mecánico'}
            </Typography>
          </Box>
        </Box>
        <ListItemButton 
          onClick={handleLogout}
          sx={{ borderRadius: 2, color: 'error.main' }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          width: { md: `calc(100% - ${drawerWidth}px)` }, 
          ml: { md: `${drawerWidth}px` },
          bgcolor: '#fff',
          color: '#212121',
          boxShadow: '0px 1px 3px rgba(0,0,0,0.08)'
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth }
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
          p: 2, 
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          bgcolor: '#fafafa',
          minHeight: '100vh'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;