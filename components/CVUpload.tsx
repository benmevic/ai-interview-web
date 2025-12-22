import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface CVUploadProps {
  onFileSelect: (file: File | null) => void  // ← Bunu ekle/düzelt
}

/**
 * CV upload component with drag & drop
 */
export default function CVUpload({ onFileSelect }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0]
        setFile(selectedFile)
        onFileSelect(selectedFile)
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:  {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  })

  const removeFile = () => {
    setFile(null)
    onFileSelect(null)
  }

  return (
    <div className="space-y-4">
      {! file ? (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive
              ? 'border-primary-600 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm text-gray-600">
            {isDragActive
              ? 'Dosyayı buraya bırakın.. .'
              : 'CVnizi buraya sürükleyin veya seçmek için tıklayın'}
          </p>
          <p className="mt-2 text-xs text-gray-500">Sadece PDF dosyaları</p>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <File className="h-8 w-8 text-primary-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file. size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
