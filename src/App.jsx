// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import DataViewPage from './pages/DataViewPage/DataViewPage';
import './index.css'; // Import Tailwind styles

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <img src="/1.png" alt="logo" className="h-12 w-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Produksi N4R1</h1>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<DataViewPage />} />
          {/* You can add more routes here for other pages */}
        </Routes>
      </main>
    </div>
  );
}

export default App;