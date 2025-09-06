"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, CreditCard, Save, X } from "lucide-react"
import { addClientInsurance, updateClientInsurance, deleteClientInsurance, type ClientInsurance } from "@/lib/client-storage"

interface InsuranceManagerProps {
  clientId: string
  insurance: ClientInsurance[]
  onInsuranceUpdate: () => void
}

export function InsuranceManager({ clientId, insurance, onInsuranceUpdate }: InsuranceManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingInsurance, setEditingInsurance] = useState<ClientInsurance | null>(null)
  const [formData, setFormData] = useState({
    provider: "",
    policyNumber: "",
    groupNumber: "",
    subscriberName: "",
    relationship: "",
    phoneNumber: "",
    effectiveDate: "",
    expirationDate: "",
    copay: "",
    deductible: "",
    notes: ""
  })

  const resetForm = () => {
    setFormData({
      provider: "",
      policyNumber: "",
      groupNumber: "",
      subscriberName: "",
      relationship: "",
      phoneNumber: "",
      effectiveDate: "",
      expirationDate: "",
      copay: "",
      deductible: "",
      notes: ""
    })
  }

  const handleAddInsurance = () => {
    if (!formData.provider || !formData.policyNumber || !formData.subscriberName) return

    const newInsurance = addClientInsurance(clientId, {
      provider: formData.provider,
      policyNumber: formData.policyNumber,
      groupNumber: formData.groupNumber || undefined,
      subscriberName: formData.subscriberName,
      relationship: formData.relationship || "Self",
      phoneNumber: formData.phoneNumber || undefined,
      effectiveDate: formData.effectiveDate || undefined,
      expirationDate: formData.expirationDate || undefined,
      copay: formData.copay ? parseFloat(formData.copay) : undefined,
      deductible: formData.deductible ? parseFloat(formData.deductible) : undefined,
      notes: formData.notes || undefined
    })

    if (newInsurance) {
      resetForm()
      setIsAddDialogOpen(false)
      onInsuranceUpdate()
    }
  }

  const handleEditInsurance = () => {
    if (!editingInsurance || !formData.provider || !formData.policyNumber || !formData.subscriberName) return

    const success = updateClientInsurance(editingInsurance.id, editingInsurance.id, {
      provider: formData.provider,
      policyNumber: formData.policyNumber,
      groupNumber: formData.groupNumber || undefined,
      subscriberName: formData.subscriberName,
      relationship: formData.relationship || "Self",
      phoneNumber: formData.phoneNumber || undefined,
      effectiveDate: formData.effectiveDate || undefined,
      expirationDate: formData.expirationDate || undefined,
      copay: formData.copay ? parseFloat(formData.copay) : undefined,
      deductible: formData.deductible ? parseFloat(formData.deductible) : undefined,
      notes: formData.notes || undefined
    })

    if (success) {
      resetForm()
      setEditingInsurance(null)
      setIsEditDialogOpen(false)
      onInsuranceUpdate()
    }
  }

  const handleDeleteInsurance = (insuranceId: string) => {
    if (deleteClientInsurance(clientId, insuranceId)) {
      onInsuranceUpdate()
    }
  }

  const openEditDialog = (ins: ClientInsurance) => {
    setEditingInsurance(ins)
    setFormData({
      provider: ins.provider,
      policyNumber: ins.policyNumber,
      groupNumber: ins.groupNumber || "",
      subscriberName: ins.subscriberName,
      relationship: ins.relationship,
      phoneNumber: ins.phoneNumber || "",
      effectiveDate: ins.effectiveDate || "",
      expirationDate: ins.expirationDate || "",
      copay: ins.copay?.toString() || "",
      deductible: ins.deductible?.toString() || "",
      notes: ins.notes || ""
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Insurance List */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Insurance Information</h3>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Insurance
        </Button>
      </div>

      {insurance.length > 0 ? (
        <div className="grid gap-4">
          {insurance.map((ins) => (
            <Card key={ins.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-lg">{ins.provider}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Policy Number:</span>
                        <p>{ins.policyNumber}</p>
                      </div>
                      {ins.groupNumber && (
                        <div>
                          <span className="font-medium text-gray-600">Group Number:</span>
                          <p>{ins.groupNumber}</p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-600">Subscriber:</span>
                        <p>{ins.subscriberName}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Relationship:</span>
                        <p>{ins.relationship}</p>
                      </div>
                      {ins.phoneNumber && (
                        <div>
                          <span className="font-medium text-gray-600">Phone:</span>
                          <p>{ins.phoneNumber}</p>
                        </div>
                      )}
                      {ins.effectiveDate && (
                        <div>
                          <span className="font-medium text-gray-600">Effective Date:</span>
                          <p>{new Date(ins.effectiveDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {ins.expirationDate && (
                        <div>
                          <span className="font-medium text-gray-600">Expiration Date:</span>
                          <p>{new Date(ins.expirationDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {ins.copay && (
                        <div>
                          <span className="font-medium text-gray-600">Copay:</span>
                          <p>${ins.copay}</p>
                        </div>
                      )}
                      {ins.deductible && (
                        <div>
                          <span className="font-medium text-gray-600">Deductible:</span>
                          <p>${ins.deductible}</p>
                        </div>
                      )}
                    </div>
                    
                    {ins.notes && (
                      <div>
                        <span className="font-medium text-gray-600">Notes:</span>
                        <p className="text-sm">{ins.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(ins)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteInsurance(ins.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Insurance Information</h3>
            <p className="text-gray-600 mb-4">Add insurance details to keep track of coverage and billing information.</p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Insurance
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Insurance Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Insurance Information</DialogTitle>
            <DialogDescription>
              Enter the client's insurance details to keep track of coverage and billing information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Insurance Provider *</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="e.g., Blue Cross Blue Shield"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="policyNumber">Policy Number *</Label>
              <Input
                id="policyNumber"
                value={formData.policyNumber}
                onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                placeholder="e.g., ABC123456789"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="groupNumber">Group Number</Label>
              <Input
                id="groupNumber"
                value={formData.groupNumber}
                onChange={(e) => setFormData({ ...formData, groupNumber: e.target.value })}
                placeholder="e.g., GRP001"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subscriberName">Subscriber Name *</Label>
              <Input
                id="subscriberName"
                value={formData.subscriberName}
                onChange={(e) => setFormData({ ...formData, subscriberName: e.target.value })}
                placeholder="e.g., John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                placeholder="e.g., Self, Spouse, Child"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="e.g., (555) 123-4567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expirationDate">Expiration Date</Label>
              <Input
                id="expirationDate"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="copay">Copay Amount</Label>
              <Input
                id="copay"
                type="number"
                step="0.01"
                value={formData.copay}
                onChange={(e) => setFormData({ ...formData, copay: e.target.value })}
                placeholder="e.g., 25.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deductible">Deductible Amount</Label>
              <Input
                id="deductible"
                type="number"
                step="0.01"
                value={formData.deductible}
                onChange={(e) => setFormData({ ...formData, deductible: e.target.value })}
                placeholder="e.g., 1000.00"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this insurance policy"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddInsurance} disabled={!formData.provider || !formData.policyNumber || !formData.subscriberName}>
              <Save className="h-4 w-4 mr-2" />
              Add Insurance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Insurance Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Insurance Information</DialogTitle>
            <DialogDescription>
              Update the client's insurance details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-provider">Insurance Provider *</Label>
              <Input
                id="edit-provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="e.g., Blue Cross Blue Shield"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-policyNumber">Policy Number *</Label>
              <Input
                id="edit-policyNumber"
                value={formData.policyNumber}
                onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                placeholder="e.g., ABC123456789"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-groupNumber">Group Number</Label>
              <Input
                id="edit-groupNumber"
                value={formData.groupNumber}
                onChange={(e) => setFormData({ ...formData, groupNumber: e.target.value })}
                placeholder="e.g., GRP001"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-subscriberName">Subscriber Name *</Label>
              <Input
                id="edit-subscriberName"
                value={formData.subscriberName}
                onChange={(e) => setFormData({ ...formData, subscriberName: e.target.value })}
                placeholder="e.g., John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-relationship">Relationship</Label>
              <Input
                id="edit-relationship"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                placeholder="e.g., Self, Spouse, Child"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-phoneNumber">Phone Number</Label>
              <Input
                id="edit-phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="e.g., (555) 123-4567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-effectiveDate">Effective Date</Label>
              <Input
                id="edit-effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-expirationDate">Expiration Date</Label>
              <Input
                id="edit-expirationDate"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-copay">Copay Amount</Label>
              <Input
                id="edit-copay"
                type="number"
                step="0.01"
                value={formData.copay}
                onChange={(e) => setFormData({ ...formData, copay: e.target.value })}
                placeholder="e.g., 25.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-deductible">Deductible Amount</Label>
              <Input
                id="edit-deductible"
                type="number"
                step="0.01"
                value={formData.deductible}
                onChange={(e) => setFormData({ ...formData, deductible: e.target.value })}
                placeholder="e.g., 1000.00"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this insurance policy"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              setEditingInsurance(null)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditInsurance} disabled={!formData.provider || !formData.policyNumber || !formData.subscriberName}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



