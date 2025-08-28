'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, FileText, Download, Eye, Trash2, Plus, Search, 
  File, Image, Video, Archive, CheckCircle, XCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Document {
  id: string
  title: string
  fileName: string
  fileUrl: string
  fileSize?: number
  mimeType: string
  docType: string
  isPublic: boolean
  isApproved: boolean
  createdAt: string
  uploadedBy: string
  _count: {
    downloads: number
  }
}

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadForm, setUploadForm] = useState({
    title: '',
    docType: 'OTHER',
    uploadedFor: '',
    isPublic: false,
    file: null as File | null
  })

  useEffect(() => {
    fetchDocuments()
  }, [selectedType])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedType !== 'all') params.append('type', selectedType)
      
      const response = await fetch(`/api/documents?${params.toString()}`)
      const data = await response.json()
      setDocuments(data)
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadForm(prev => ({ 
        ...prev, 
        file,
        title: prev.title || file.name.split('.')[0]
      }))
    }
  }

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title) {
      alert('Please select a file and enter a title')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('title', uploadForm.title)
      formData.append('docType', uploadForm.docType)
      formData.append('uploadedFor', uploadForm.uploadedFor)
      formData.append('isPublic', uploadForm.isPublic.toString())

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setUploadDialogOpen(false)
        resetUploadForm()
        fetchDocuments()
      } else {
        const error = await response.json()
        alert(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      docType: 'OTHER',
      uploadedFor: '',
      isPublic: false,
      file: null
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownload = async (document: Document) => {
    try {
      // Track download
      await fetch(`/api/documents/${document.id}/download`, {
        method: 'POST'
      })

      // Download file
      const link = window.document.createElement('a')
      link.href = document.fileUrl
      link.download = document.fileName
      link.click()
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchDocuments()
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4" />
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const documentTypes = [
    { value: 'all', label: 'All Documents' },
    { value: 'CERTIFICATE', label: 'Certificates' },
    { value: 'TRANSCRIPT', label: 'Transcripts' },
    { value: 'STUDY_MATERIAL', label: 'Study Materials' },
    { value: 'SYLLABUS', label: 'Syllabus' },
    { value: 'TIMETABLE', label: 'Timetables' },
    { value: 'CIRCULAR', label: 'Circulars' },
    { value: 'OTHER', label: 'Other' }
  ]

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Document Management</h2>
          <p className="text-muted-foreground">
            Upload, organize, and manage institutional documents
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetUploadForm}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>
                Upload a new document to the system. Choose appropriate type and access level.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar"
                />
                {uploadForm.file && (
                  <div className="text-sm text-gray-600">
                    Selected: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter document title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="docType">Document Type</Label>
                  <Select 
                    value={uploadForm.docType} 
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, docType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.slice(1).map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uploadedFor">Upload For (Optional)</Label>
                  <Input
                    id="uploadedFor"
                    value={uploadForm.uploadedFor}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, uploadedFor: e.target.value }))}
                    placeholder="Student/Faculty ID"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={uploadForm.isPublic}
                  onCheckedChange={(checked) => setUploadForm(prev => ({ ...prev, isPublic: checked as boolean }))}
                />
                <Label htmlFor="isPublic">Make this document publicly accessible</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading documents...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents found</p>
          </div>
        ) : (
          filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(document.mimeType)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{document.title}</h4>
                      <p className="text-xs text-gray-500 truncate">{document.fileName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {document.isApproved ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span>Type:</span>
                    <Badge variant="outline">{document.docType}</Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Size:</span>
                    <span>{formatFileSize(document.fileSize)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Downloads:</span>
                    <span>{document._count.downloads}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Uploaded:</span>
                    <span>{formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(document)}
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(document.fileUrl, '_blank')}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(document.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {document.isPublic && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Public
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
