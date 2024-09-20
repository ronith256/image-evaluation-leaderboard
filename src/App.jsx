import React from 'react'
import { Routes, Route } from 'react-router-dom'
import StudentView from './components/StudentView'
import AdminView from './components/AdminView'

function App() {
  return (
    <Routes>
      <Route path="/student/:templateId" element={<StudentView />} />
      <Route path="/leaderboard/:templateId" element={<AdminView />} />
    </Routes>
  )
}

export default App
