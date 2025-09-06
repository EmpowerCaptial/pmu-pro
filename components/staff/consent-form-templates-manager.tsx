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
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { CONSENT_FORM_TEMPLATES, getFormTemplate, getAllFormTemplates } from "@/lib/data/consent-form-templates"
import { FormTemplate, FormField, ConsentFormType } from "@/types/consent-forms"

export default function ConsentFormTemplatesManager() {
  const [templates, setTemplates] = useState<FormTemplate[]>([])
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("templates")

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = () => {
    const allTemplates = getAllFormTemplates()
    setTemplates(allTemplates)
  }

  const startEditing = (template: FormTemplate) => {
    setEditingTemplate({ ...template })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setEditingTemplate(null)
    setIsEditing(false)
  }

  const saveTemplate = () => {
    if (!editingTemplate) return

    // In a real app, this would save to database
    // For now, we'll update localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("consent-form-templates") || "{}")
      stored[editingTemplate.id] = editingTemplate
      localStorage.setItem("consent-form-templates", JSON.stringify(stored))
      
      // Update local state
      const updatedTemplates = templates.map(t => 
        t.id === editingTemplate.id ? editingTemplate : t
      )
      setTemplates(updatedTemplates)
      
      setIsEditing(false)
      setEditingTemplate(null)
      
      alert("Template saved successfully!")
    } catch (error) {
      alert("Failed to save template")
    }
  }

  const addField = () => {
    if (!editingTemplate) return

    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
      order: editingTemplate.fields.length + 1,
      helpText: ""
    }

    setEditingTemplate({
      ...editingTemplate,
      fields: [...editingTemplate.fields, newField]
    })
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!editingTemplate) return

    const updatedFields = editingTemplate.fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    )

    setEditingTemplate({
      ...editingTemplate,
      fields: updatedFields
    })
  }

  const removeField = (fieldId: string) => {
    if (!editingTemplate) return

    const updatedFields = editingTemplate.fields.filter(field => field.id !== fieldId)
    
    // Reorder remaining fields
    const reorderedFields = updatedFields.map((field, index) => ({
      ...field,
      order: index + 1
    }))

    setEditingTemplate({
      ...editingTemplate,
      fields: reorderedFields
    })
  }

  const moveField = (fieldId: string, direction: "up" | "down") => {
    if (!editingTemplate) return

    const currentIndex = editingTemplate.fields.findIndex(f => f.id === fieldId)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= editingTemplate.fields.length) return

    const updatedFields = [...editingTemplate.fields]
    const [movedField] = updatedFields.splice(currentIndex, 1)
    updatedFields.splice(newIndex, 0, movedField)

    // Update order numbers
    const reorderedFields = updatedFields.map((field, index) => ({
      ...field,
      order: index + 1
    }))

    setEditingTemplate({
      ...editingTemplate,
      fields: reorderedFields
    })
  }

  const renderFieldEditor = (field: FormField) => (
    <Card key={field.id} className="border-2 border-lavender/200 bg-white shadow-sm">
      <CardHeader className="pb-3 bg-gradient-to-r from-lavender/5 to-purple/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveField(field.id, "down")}
              disabled={field.order === editingTemplate?.fields.length}
              className="h-8 w-8 p-0 text-lavender hover:bg-lavender/10"
            >
              ↓
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeField(field.id)}
              className="h-8 w-8 p-0 text-red hover:bg-red/10"
            >
              <Trash2 className="h-4 w-4" />
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
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="radio">Radio</SelectItem>
                <SelectItem value="textarea">Textarea</SelectItem>
                <SelectItem value="signature">Signature</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`required-${field.id}`}
              checked={field.required}
              onChange={(e) => updateField(field.id, { required: e.target.checked })}
              className="border-2 border-lavender/300"
            />
            <Label htmlFor={`required-${field.id}`} className="text-sm text-gray-700">
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

  if (isEditing && editingTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Template: {editingTemplate.name}</h2>
            <p className="text-gray-600">Modify the form structure and fields</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={saveTemplate}
              className="bg-lavender hover:bg-lavender/90 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
            <Button
              variant="outline"
              onClick={cancelEditing}
              className="border-lavender text-lavender hover:bg-lavender/10"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>

        <Card className="border-2 border-lavender/200 bg-white">
          <CardHeader className="bg-gradient-to-r from-lavender/5 to-purple/5">
            <CardTitle className="text-gray-900">Template Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-900">Template Name</Label>
                <Input
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-900">Description</Label>
                <Input
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="required-template"
                checked={editingTemplate.required}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, required: e.target.checked })}
                className="border-2 border-lavender/300"
              />
              <Label htmlFor="required-template" className="text-sm text-gray-700">
                This template is required for all clients
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-lavender/200 bg-white">
          <CardHeader className="bg-gradient-to-r from-lavender/5 to-purple/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Form Fields</CardTitle>
              <Button
                onClick={addField}
                className="bg-lavender hover:bg-lavender/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingTemplate.fields
              .sort((a, b) => a.order - b.order)
              .map(renderFieldEditor)}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consent Form Templates</h2>
          <p className="text-gray-600">Manage and customize consent form templates for artists</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-white border-2 border-lavender/200">
          <TabsTrigger 
            value="templates" 
            className="data-[state=active]:bg-lavender data-[state=active]:text-white hover:bg-lavender/10 text-gray-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            className="data-[state=active]:bg-lavender data-[state=active]:text-white hover:bg-lavender/10 text-gray-700"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="border-2 border-lavender/200 bg-white hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 bg-gradient-to-r from-lavender/5 to-purple/5 rounded-t-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                        {template.name}
                      </CardTitle>
                      <CardDescription className="text-gray-700 mb-3">
                        {template.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-lavender/10 text-lavender border-lavender/200">
                          {template.fields.length} fields
                        </Badge>
                        {template.required && (
                          <Badge variant="outline" className="bg-red/10 text-red border-red/200">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    onClick={() => startEditing(template)}
                    className="w-full bg-lavender hover:bg-lavender/90 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card className="border-2 border-lavender/200 bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Template Preview</CardTitle>
              <CardDescription>Select a template to preview how it will appear to clients</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value) => setActiveTab("templates")}>
                <SelectTrigger className="bg-white border-2 border-lavender/200">
                  <SelectValue placeholder="Choose a template to preview" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}



