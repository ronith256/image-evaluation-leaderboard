// src/components/LeaderboardTable.jsx
import React from 'react'
import { motion } from 'framer-motion'

const LeaderboardTable = ({ data }) => {
  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-neon-green'
    if (score >= 0.6) return 'text-yellow-400'
    if (score >= 0.4) return 'text-orange-400'
    return 'text-red-500'
  }

  const getEmoji = (position) => {
    if (position === 1) return '🏆'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    return ''
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-3">Position</th>
            <th className="p-3">Roll Number</th>
            <th className="p-3">Name</th>
            <th className="p-3">Uploaded File</th>
            <th className="p-3">Score</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <motion.tr
              key={item.id || item.rollNumber} // Use item.id if available, otherwise fallback to rollNumber
              className="border-b border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <td className="p-3">{`${index + 1} ${getEmoji(index + 1)}`}</td>
              <td className="p-3">{item.rollNumber || item.student_roll_number}</td>
              <td className="p-3">{item.name || item.student_name}</td>
              <td className="p-3">{item.fileName || item.file_path.split('/').pop()}</td>
              <td className={`p-3 font-bold ${getScoreColor(item.score)}`}>
                {typeof item.score === 'number' ? item.score.toFixed(2) : item.score}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default LeaderboardTable