import React from 'react';
import { motion } from 'framer-motion';

const LeaderboardTable = ({ data }) => {
  const getScoreColor = (score) => {
    if (score >= 0.8) return 'from-green-400 to-green-600';
    if (score >= 0.6) return 'from-yellow-400 to-yellow-600';
    if (score >= 0.4) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getEmoji = (position) => {
    if (position === 1) return '🏆';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '';
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg bg-gradient-to-r from-purple-700 to-indigo-800 p-4">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-gray-800 to-gray-900">
            <th className="p-3 text-white">Position</th>
            <th className="p-3 text-white">Roll Number</th>
            <th className="p-3 text-white">Name</th>
            <th className="p-3 text-white">Uploaded File</th>
            <th className="p-3 text-white">Score</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <motion.tr
              key={item.id || item.rollNumber}
              className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <td className="p-3 text-white">
                <motion.span
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  {`${index + 1} ${getEmoji(index + 1)}`}
                </motion.span>
              </td>
              <td className="p-3 text-white">{item.student_roll_number}</td>
              <td className="p-3 text-white">{item.student_name}</td>
              <td className="p-3 text-white">{item.file_path.split('/').pop()}</td>
              <td className="p-3">
                <motion.div
                  className={`font-bold text-white px-3 py-1 rounded-full bg-gradient-to-r ${getScoreColor(item.score)}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                >
                  {typeof item.score === 'number' ? item.score.toFixed(2) : item.score}
                </motion.div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;