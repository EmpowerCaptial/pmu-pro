"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye,
  CheckCircle,
  AlertCircle,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Copy,
  Download,
  Upload,
  History,
  Undo,
  Redo,
  Settings
} from "lucide-react"
import { CONSENT_FORM_TEMPLATES, getAllFormTemplates } from "@/lib/data/consent-form-templates"
import { FormTemplate, FormField, ConsentFormType } from "@/types/consent-forms"

interface TemplateEditor {
  template: FormTemplate
  isDirty: boolean
  history: FormTemplate[]
  historyIndex: number
}

interface ConsentFormTemplateEditorProps {
  isOpen: boolean
  onClose: () => void
  templateId?: ConsentFormType
}

export function ConsentFormTemplateEditor({ isOpen, onClose, templateId }: ConsentFormTemplateEditorProps) {
  const [editor, setEditor] = useState<TemplateEditor | null>(null)
  const [activeTab, setActiveTab] = useState("editor")
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<{ [key: string]: any }>({})
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  useEffect(() => {
    if (templateId && isOpen) {
      loadTemplate(templateId)
    }
  }, [templateId, isOpen])

  const loadTemplate = (id: ConsentFormType) => {
    console.log('Loading template with ID:', id)
    console.log('Available templates:', Object.keys(CONSENT_FORM_TEMPLATES))
    
    const template = CONSENT_FORM_TEMPLATES[id]
    console.log('Found template:', template)
    
    if (template) {
      const editorState: TemplateEditor = {
        template: JSON.parse(JSON.stringify(template)), // Deep clone
        isDirty: false,
        history: [JSON.parse(JSON.stringify(template))],
        historyIndex: 0
      }
      setEditor(editorState)
      console.log('Editor state set:', editorState)
    } else {
      console.error('Template not found for ID:', id)
    }
  }

  const saveToHistory = (newTemplate: FormTemplate) => {
    console.log('saveToHistory called with:', newTemplate)
    
    if (!editor) {
      console.error('Editor is null in saveToHistory')
      return
    }

    const newHistory = editor.history.slice(0, editor.historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newTemplate)))
    
    console.log('New history created:', newHistory)
    console.log('New history index:', newHistory.length - 1)
    
    const updatedEditor = {
      ...editor,
      template: newTemplate,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true
    }
    
    console.log('Setting new editor state:', updatedEditor)
    setEditor(updatedEditor)
    console.log('Editor state updated successfully')
  }

  const undo = () => {
    if (!editor || editor.historyIndex <= 0) return
    
    const newIndex = editor.historyIndex - 1
    setEditor({
      ...editor,
      template: JSON.parse(JSON.stringify(editor.history[newIndex])),
      historyIndex: newIndex,
      isDirty: true
    })
  }

  const redo = () => {
    if (!editor || editor.historyIndex >= editor.history.length - 1) return
    
    const newIndex = editor.historyIndex + 1
    setEditor({
      ...editor,
      template: JSON.parse(JSON.stringify(editor.history[newIndex])),
      historyIndex: newIndex,
      isDirty: true
    })
  }

  const updateTemplate = (updates: Partial<FormTemplate>) => {
    if (!editor) return

    const newTemplate = { ...editor.template, ...updates }
    saveToHistory(newTemplate)
  }

  const addField = () => {
    console.log('Add Field button clicked!')
    console.log('Current editor state:', editor)
    
    if (!editor) {
      console.error('Editor is null, cannot add field')
      return
    }

    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
      order: editor.template.fields.length + 1,
      helpText: ""
    }

    console.log('Creating new field:', newField)
    console.log('Current fields count:', editor.template.fields.length)

    const newTemplate = {
      ...editor.template,
      fields: [...editor.template.fields, newField]
    }
    
    console.log('New template with added field:', newTemplate)
    saveToHistory(newTemplate)
    console.log('Field added successfully!')
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!editor) return

    const updatedFields = editor.template.fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    )

    const newTemplate = { ...editor.template, fields: updatedFields }
    saveToHistory(newTemplate)
  }

  const removeField = (fieldId: string) => {
    if (!editor) return

    const updatedFields = editor.template.fields.filter(field => field.id !== fieldId)
    const reorderedFields = updatedFields.map((field, index) => ({
      ...field,
      order: index + 1
    }))

    const newTemplate = { ...editor.template, fields: reorderedFields }
    saveToHistory(newTemplate)
  }

  const duplicateField = (fieldId: string) => {
    if (!editor) return

    const sourceField = editor.template.fields.find(f => f.id === fieldId)
    if (!sourceField) return

    const newField: FormField = {
      ...sourceField,
      id: `field_${Date.now()}`,
      label: `${sourceField.label} (Copy)`,
      order: editor.template.fields.length + 1
    }

    const newTemplate = {
      ...editor.template,
      fields: [...editor.template.fields, newField]
    }
    saveToHistory(newTemplate)
  }

  const moveField = (fieldId: string, direction: "up" | "down") => {
    if (!editor) return

    const currentIndex = editor.template.fields.findIndex(f => f.id === fieldId)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= editor.template.fields.length) return

    const updatedFields = [...editor.template.fields]
    const [movedField] = updatedFields.splice(currentIndex, 1)
    updatedFields.splice(newIndex, 0, movedField)

    const reorderedFields = updatedFields.map((field, index) => ({
      ...field,
      order: index + 1
    }))

    const newTemplate = { ...editor.template, fields: reorderedFields }
    saveToHistory(newTemplate)
  }

  const handleDragStart = (fieldId: string) => {
    setDraggedFieldId(fieldId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault()
    
    if (!draggedFieldId || !editor || draggedFieldId === targetFieldId) {
      setDraggedFieldId(null)
      return
    }

    const sourceIndex = editor.template.fields.findIndex(f => f.id === draggedFieldId)
    const targetIndex = editor.template.fields.findIndex(f => f.id === targetFieldId)

    if (sourceIndex === -1 || targetIndex === -1) {
      setDraggedFieldId(null)
      return
    }

    const updatedFields = [...editor.template.fields]
    const [movedField] = updatedFields.splice(sourceIndex, 1)
    updatedFields.splice(targetIndex, 0, movedField)

    const reorderedFields = updatedFields.map((field, index) => ({
      ...field,
      order: index + 1
    }))

    const newTemplate = { ...editor.template, fields: reorderedFields }
    saveToHistory(newTemplate)
    setDraggedFieldId(null)
  }

  const saveTemplate = async () => {
    if (!editor) return

    try {
      // Save to localStorage for now (in production, this would save to database)
      const customTemplates = JSON.parse(localStorage.getItem("custom-consent-templates") || "{}")
      customTemplates[editor.template.id] = {
        ...editor.template,
        lastModified: new Date().toISOString(),
        version: (customTemplates[editor.template.id]?.version || 0) + 1
      }
      localStorage.setItem("custom-consent-templates", JSON.stringify(customTemplates))
      
      setEditor({ ...editor, isDirty: false })
      alert("Template saved successfully!")
    } catch (error) {
      alert("Failed to save template")
    }
  }

  const exportTemplate = () => {
    if (!editor) return

    const dataStr = JSON.stringify(editor.template, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${editor.template.id}-template.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const renderFieldEditor = (field: FormField, index: number) => (
    <Card 
      key={field.id} 
      className={`border-2 border-lavender/200 bg-white shadow-sm transition-all ${
        draggedFieldId === field.id ? 'opacity-50 transform rotate-2' : 'hover:shadow-md'
      }`}
      draggable
      onDragStart={() => handleDragStart(field.id)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, field.id)}
    >
      <CardHeader className="pb-3 bg-gradient-to-r from-lavender/5 to-purple/5 cursor-move">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-400" />
            <Badge variant="outline" className="bg-lavender/10 text-lavender border-lavender/200">
              Field {field.order}
            </Badge>
            <Badge variant="outline" className="bg-purple/10 text-purple border-purple/200">
              {field.type}
            </Badge>
            {field.required && (
              <Badge variant="outline" className="bg-red/10 text-red border-red/200">
                Required
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveField(field.id, "up")}
              disabled={field.order === 1}
              className="h-8 w-8 p-0 text-lavender hover:bg-lavender/10"
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveField(field.id, "down")}
              disabled={field.order === editor?.template.fields.length}
              className="h-8 w-8 p-0 text-lavender hover:bg-lavender/10"
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => duplicateField(field.id)}
              className="h-8 w-8 p-0 text-blue hover:bg-blue/10"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeField(field.id)}
              className="h-8 w-8 p-0 text-red hover:bg-red/10"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-semibold text-gray-900">Field Label</Label>
            <Input
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900"
            />
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-900">Field Type</Label>
            <Select
              value={field.type}
              onValueChange={(value) => updateField(field.id, { type: value as any })}
            >
              <SelectTrigger className="bg-white border-2 border-lavender/200 focus:border-lavender/500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-lavender/200">
                <SelectItem value="text">Text Input</SelectItem>
                <SelectItem value="email">Email Address</SelectItem>
                <SelectItem value="phone">Phone Number</SelectItem>
                <SelectItem value="date">Date Picker</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="radio">Radio Buttons</SelectItem>
                <SelectItem value="textarea">Large Text Area</SelectItem>
                <SelectItem value="signature">Digital Signature</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`required-${field.id}`}
              checked={field.required}
              onCheckedChange={(checked) => updateField(field.id, { required: !!checked })}
              className="border-2 border-lavender/300 data-[state=checked]:bg-lavender data-[state=checked]:border-lavender"
            />
            <Label htmlFor={`required-${field.id}`} className="text-sm text-gray-900">
              Required Field
            </Label>
          </div>
        </div>

        {field.type === "radio" && (
          <div>
            <Label className="text-sm font-semibold text-gray-900">Options (one per line)</Label>
            <Textarea
              value={field.options?.join("\n") || ""}
              onChange={(e) => updateField(field.id, { 
                options: e.target.value.split("\n").filter(opt => opt.trim()) 
              })}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
              className="bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900 min-h-[80px]"
            />
          </div>
        )}

        <div>
          <Label className="text-sm font-semibold text-gray-900">Help Text (Optional)</Label>
          <Textarea
            value={field.helpText || ""}
            onChange={(e) => updateField(field.id, { helpText: e.target.value })}
            placeholder="Help text to display below this field..."
            className="bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900 min-h-[60px]"
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderFieldPreview = (field: FormField) => {
    const value = previewData[field.id] || ""
    
    switch (field.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <Input
            placeholder={field.helpText || `Enter ${field.label.toLowerCase()}`}
            value={value}
            onChange={(e) => setPreviewData({ ...previewData, [field.id]: e.target.value })}
            className="bg-white border-2 border-lavender/200 text-gray-900"
          />
        )
      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => setPreviewData({ ...previewData, [field.id]: e.target.value })}
            className="bg-white border-2 border-lavender/200 text-gray-900"
          />
        )
      case "textarea":
        return (
          <Textarea
            placeholder={field.helpText || `Enter ${field.label.toLowerCase()}`}
            value={value}
            onChange={(e) => setPreviewData({ ...previewData, [field.id]: e.target.value })}
            className="bg-white border-2 border-lavender/200 text-gray-900 min-h-[100px]"
          />
        )
      case "checkbox":
        return (
          <div className="flex items-center space-x-2 p-3 bg-lavender/5 rounded-lg border border-lavender/100">
            <Checkbox
              checked={!!value}
              onCheckedChange={(checked) => setPreviewData({ ...previewData, [field.id]: checked })}
              className="border-2 border-lavender/300 data-[state=checked]:bg-lavender"
            />
            <Label className="text-sm text-gray-900">{field.label}</Label>
          </div>
        )
      case "radio":
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => setPreviewData({ ...previewData, [field.id]: val })}
            className="space-y-2"
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2 p-3 bg-lavender/5 rounded-lg border border-lavender/100">
                <RadioGroupItem 
                  value={option} 
                  className="border-2 border-lavender/300 data-[state=checked]:bg-lavender"
                />
                <Label className="text-sm text-gray-900">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      case "signature":
        return (
          <div className="border-2 border-dashed border-lavender/300 bg-white rounded-lg p-8 text-center">
            <FileText className="h-8 w-8 text-lavender mx-auto mb-2" />
            <p className="text-sm text-gray-600">Digital Signature Pad</p>
          </div>
        )
      default:
        return <div className="text-gray-500 italic">Unknown field type</div>
    }
  }

  if (!editor) {
    console.log('Editor is null, cannot render')
    return (
      <div className="p-8 text-center">
        <div className="text-lg font-semibold text-gray-900 mb-2">Loading Template Editor...</div>
        <div className="text-sm text-gray-600">Please wait while the template loads</div>
        <div className="mt-4 text-xs text-gray-500">
          Debug: templateId = {templateId}, isOpen = {isOpen.toString()}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden bg-white">
        <DialogHeader className="border-b border-lavender/200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Edit Template: {editor.template.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Drag & drop fields to reorder • All changes are tracked
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={editor.historyIndex <= 0}
                className="text-lavender hover:bg-lavender/10"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={editor.historyIndex >= editor.history.length - 1}
                className="text-lavender hover:bg-lavender/10"
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVersionHistory(true)}
                className="text-lavender hover:bg-lavender/10"
              >
                <History className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportTemplate}
                className="text-lavender hover:bg-lavender/10"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                onClick={saveTemplate}
                disabled={!editor.isDirty}
                className="bg-lavender hover:bg-lavender/90 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 bg-white border-2 border-lavender/200">
            <TabsTrigger 
              value="editor" 
              className="data-[state=active]:bg-lavender data-[state=active]:text-white hover:bg-lavender/10 text-gray-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="data-[state=active]:bg-lavender data-[state=active]:text-white hover:bg-lavender/10 text-gray-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Live Preview
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-lavender data-[state=active]:text-white hover:bg-lavender/10 text-gray-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="editor" className="space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Form Fields</h3>
                <Button
                  onClick={() => {
                    console.log('Add Field button clicked - direct handler')
                    addField()
                  }}
                  className="bg-lavender hover:bg-lavender/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
              
              <div className="space-y-4">
                {editor.template.fields
                  .sort((a, b) => a.order - b.order)
                  .map((field, index) => renderFieldEditor(field, index))}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4 mt-0">
              <div className="max-w-2xl mx-auto">
                <Card className="border-0 bg-white shadow-xl">
                  <CardHeader className="text-center bg-gradient-to-r from-lavender/10 to-purple/10">
                    <div className="w-16 h-16 bg-lavender rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {editor.template.name}
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600">
                      {editor.template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {editor.template.fields
                        .sort((a, b) => a.order - b.order)
                        .map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {renderFieldPreview(field)}
                            {field.helpText && (
                              <p className="text-xs text-gray-600 bg-lavender/5 p-2 rounded border-l-2 border-lavender/20">
                                {field.helpText}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-0">
              <Card className="border-2 border-lavender/200 bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">Template Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-900">Template Name</Label>
                      <Input
                        value={editor.template.name}
                        onChange={(e) => updateTemplate({ name: e.target.value })}
                        className="bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-900">Template ID</Label>
                      <Input
                        value={editor.template.id}
                        disabled
                        className="bg-gray-100 border-2 border-gray-300 text-gray-600"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-900">Description</Label>
                    <Input
                      value={editor.template.description}
                      onChange={(e) => updateTemplate({ description: e.target.value })}
                      className="bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="required-template"
                      checked={editor.template.required}
                      onCheckedChange={(checked) => updateTemplate({ required: !!checked })}
                      className="border-2 border-lavender/300 data-[state=checked]:bg-lavender data-[state=checked]:border-lavender"
                    />
                    <Label htmlFor="required-template" className="text-sm text-gray-900">
                      This template is required for all clients
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
