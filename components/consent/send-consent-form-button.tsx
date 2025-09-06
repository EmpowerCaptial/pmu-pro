"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, FileText } from "lucide-react"
import { ConsentFormModal } from "./consent-form-modal"

interface SendConsentFormButtonProps {
  clientId: string
  clientName: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export function SendConsentFormButton({ 
  clientId, 
  clientName, 
  variant = "default",
  size = "default"
}: SendConsentFormButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant={variant}
        size={size}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
      >
        <Send className="h-4 w-4 mr-2" />
        Send Consent Form
      </Button>

      <ConsentFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        clientId={clientId}
        clientName={clientName}
      />
    </>
  )
}



