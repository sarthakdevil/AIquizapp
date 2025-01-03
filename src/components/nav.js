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
        <mark className=' bg-yellow-500 w-24 align-middle text-center rounded-md border border-dashed border-yellow-950'>
        <Typography variant="h6" className="text-white cursor-pointer font-extrabold h" onClick={() => handleNavigation('/')}>
          Quizify
        </Typography>
        </mark>
        <div className="hidden md:flex space-x-4">
          <Button color="inherit" onClick={() => handleNavigation('/')}>pdfify</Button>
          <Button color="inherit" onClick={() => handleNavigation('/create')}>create quiz</Button>
          <Button color="inherit" onClick={() => handleNavigation('/otherquiz')}>other quizzes</Button>
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
            <MenuItem onClick={() => handleNavigation('/')}>pdfify</MenuItem>
            <MenuItem onClick={() => handleNavigation('/create')}>create quiz</MenuItem>
            <MenuItem onClick={() => handleNavigation('/questions')}>other quizzes</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
