import { Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path={'/'} element={<Home/>} />
        <Route path={'/dashboard'} element={<Dashboard/>} />
        <Route path={'/create'} element={<Create />} />
        <Route path={'/referral'} element={<></>} />
        <Route path={'/api'} element={<></>} />
      </Routes>
    </div>
  );
}

export default App;
