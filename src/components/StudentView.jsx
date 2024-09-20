// src/components/StudentView.jsx
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import FileUpload from './FileUpload'
import axios from 'axios'

const StudentView = () => {
  const { templateId } = useParams()
  const [name, setName] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [file, setFile] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !rollNumber || !file) {
      alert('Please fill all fields and upload a file')
      return
    }

    const formData = new FormData()
    formData.append('template_id', templateId)
    formData.append('pdf_file', file)
    formData.append('student_name', name)
    formData.append('student_roll_number', rollNumber)

    try {
      await axios.post('http://localhost:7789/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('Submission successful!')
    } catch (error) {
      console.error('Submission failed:', error)
      alert('Submission failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-neon-green">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Student View</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 text-white p-2 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="rollNumber" className="block mb-1">Roll Number</label>
            <input
              type="text"
              id="rollNumber"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full bg-gray-800 text-white p-2 rounded"
              required
            />
          </div>
          <FileUpload onFileSelect={setFile} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-neon-green text-black font-bold py-2 px-4 rounded hover:bg-green-400 transition duration-300"
          >
            Submit
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

export default StudentView
