'use client';
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/navigation';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleNavigation = (path) => {
    router.push(path);
    setAnchorEl(null); // Close menu after navigation
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" className="bg-blue-800">
      <Toolbar className="flex justify-between items-center">
        <Typography variant="h6" className="text-white cursor-pointer" onClick={() => handleNavigation('/')}>
          My Application
        </Typography>
        
        <div className="hidden md:flex space-x-4">
          <Button color="inherit" onClick={() => handleNavigation('/')}>Home</Button>
          <Button color="inherit" onClick={() => handleNavigation('/about')}>About</Button>
          <Button color="inherit" onClick={() => handleNavigation('/questions')}>Questions</Button>
        </div>

        <div className="md:hidden">
          <IconButton color="inherit" onClick={handleMenuClick}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleNavigation('/')}>Home</MenuItem>
            <MenuItem onClick={() => handleNavigation('/about')}>About</MenuItem>
            <MenuItem onClick={() => handleNavigation('/questions')}>Questions</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
