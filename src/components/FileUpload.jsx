// src/components/FileUpload.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CloudArrowUpIcon } from '@heroicons/react/24/solid'

const FileUpload = ({ onFileSelect }) => {
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFileName(file.name)
      onFileSelect(file)
      simulateUpload()
    }
  }

  const simulateUpload = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
      }
    }, 200)
  }

  return (
    <div className="mb-4">
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-neon-green border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition duration-300"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <CloudArrowUpIcon className="w-10 h-10 mb-3 text-neon-green" />
          <p className="mb-2 text-sm text-neon-green">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-neon-green">PDF (MAX. 10MB)</p>
        </div>
        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
      </label>
      {fileName && (
        <div className="mt-2">
          <p className="text-sm text-neon-green">{fileName}</p>
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
            <motion.div
              className="bg-neon-green h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload
