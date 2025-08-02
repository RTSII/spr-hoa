import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Timeline from './Timeline'; // Assuming Timeline.tsx is in the same 'pages' folder
import Home from './Home';
import About from './About';
import Contact from './Contact';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import NotFound from './NotFound';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* --- The route is now clean --- */}
          <Route path="/timeline" element={<Timeline />} />
          {/* ----------------------------- */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
