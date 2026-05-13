import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './Pages/Auth/Login'
import ProtectedRoute from './Services/ProtectedRoute'
import Register from './Pages/Auth/Register'
import Pages from './Pages/PagesBuilder/Pages'
import Builder from './Pages/PagesBuilder/Builder'
import Preview from './Pages/PagesBuilder/Preview'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/pages" element={<Pages />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/preview" element={<Preview />} />
        </Route>
      </Routes>
    </Router>
  )
}

