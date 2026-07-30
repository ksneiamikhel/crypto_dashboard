import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import MarketPage from './pages/MarketPage'
import SignalsPage from './pages/SignalsPage'

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<MarketPage />} />
        <Route path="/signals" element={<SignalsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
