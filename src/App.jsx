import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Notepad from './Components/Notepad';

const App = () => {
  return (
    <Router>
        <Routes>
          <Route
            path="/notepad"
            element={<Notepad />}
          />
        </Routes>
    </Router>
  );
};

export default App;
