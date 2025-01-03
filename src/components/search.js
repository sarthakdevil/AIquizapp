// src/components/QuizSearchBar.js

import { TextField } from '@mui/material';

const QuizSearchBar = ({ onSearch }) => {
  const handleSearchChange = (event) => {
    onSearch(event.target.value); // Pass the search term back to the parent component
  };

  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Search for a quiz by name"
      onChange={handleSearchChange}
      style={{ marginBottom: '20px' }}
    />
  );
};

export default QuizSearchBar;
