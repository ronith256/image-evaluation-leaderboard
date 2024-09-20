// src/components/AdminView.jsx
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import LeaderboardTable from './LeaderboardTable'

const AdminView = () => {
  const { templateId } = useParams()
  const [leaderboardData, setLeaderboardData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:7789/getdata?template_id=${templateId}`)
        setLeaderboardData(response.data)
      } catch (error) {
        console.error('Error fetching leaderboard data:', error)
      }
    }

    fetchData()
  }, [templateId])

  return (
    <div className="min-h-screen bg-black text-neon-green p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Leaderboard</h1>
      <LeaderboardTable data={leaderboardData} />
    </div>
  )
}

export default AdminView
