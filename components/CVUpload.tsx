'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Upload, FileText, X } from 'lucide-react'

interface CVUploadProps {
  onFileUpload: (file: File) => void
}

/**
 * CV upload component with drag & drop
 */
export default function CVUpload({ onFileUpload }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('')
    
    if (acceptedFiles.length === 0) {
      setError('Please upload a PDF file')
      return
    }

    const uploadedFile = acceptedFiles[0]
    
    if (uploadedFile.type !== 'application/pdf') {
      setError('Only PDF files are accepted')
      return
    }

    if (uploadedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setFile(uploadedFile)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  })

  const handleSubmit = () => {
    if (file) {
      onFileUpload(file)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setError('')
  }

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            {isDragActive ? 'Drop your CV here' : 'Drag & drop your CV here'}
          </p>
          <p className="mt-2 text-sm text-gray-500">or click to browse</p>
          <p className="mt-2 text-xs text-gray-400">PDF only, max 5MB</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-10 w-10 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRemove}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Button onClick={handleSubmit} className="mt-4 w-full">
              Upload & Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
