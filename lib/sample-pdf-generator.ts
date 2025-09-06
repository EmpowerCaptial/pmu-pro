import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function generateSampleConsentForm(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792]) // Letter size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const { width, height } = page.getSize()
  const margin = 50
  const lineHeight = 20
  let y = height - margin

  // Title
  page.drawText('TREATMENT CONSENT FORM', {
    x: margin,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Client Information
  page.drawText('Client Information:', {
    x: margin,
    y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('Name: _________________________________', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('Date: _________________________________', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Consent Text
  page.drawText('I, the undersigned, hereby consent to receive permanent makeup treatment.', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('I understand that this is a semi-permanent procedure and results may vary.', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('I have been informed of the risks, benefits, and alternatives to this procedure.', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Signature Areas
  page.drawText('Client Signature:', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  // Signature box
  page.drawRectangle({
    x: margin,
    y: y - 50,
    width: 200,
    height: 50,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
    color: rgb(0.95, 0.95, 0.95)
  })

  page.drawText('Sign Here', {
    x: margin + 70,
    y: y - 25,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5)
  })

  y -= lineHeight * 4

  page.drawText('Date:', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  // Date box
  page.drawRectangle({
    x: margin,
    y: y - 30,
    width: 100,
    height: 30,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
    color: rgb(0.95, 0.95, 0.95)
  })

  y -= lineHeight * 3

  page.drawText('Witness Signature:', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  // Witness signature box
  page.drawRectangle({
    x: margin,
    y: y - 50,
    width: 200,
    height: 50,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
    color: rgb(0.95, 0.95, 0.95)
  })

  return await pdfDoc.save()
}

export async function generateSampleMedicalHistory(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const { width, height } = page.getSize()
  const margin = 50
  const lineHeight = 20
  let y = height - margin

  // Title
  page.drawText('MEDICAL HISTORY FORM', {
    x: margin,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Patient Information
  page.drawText('Patient Information:', {
    x: margin,
    y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('Name: _________________________________', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('Date of Birth: _________________________', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Medical Questions
  page.drawText('Medical History Questions:', {
    x: margin,
    y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  const questions = [
    'Do you have any allergies?',
    'Are you currently taking any medications?',
    'Do you have any skin conditions?',
    'Have you had any previous permanent makeup?',
    'Do you have any bleeding disorders?',
    'Are you pregnant or nursing?'
  ]

  questions.forEach(question => {
    page.drawText(`□ ${question}`, {
      x: margin,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0)
    })
    y -= lineHeight
  })

  y -= lineHeight * 2

  // Signature
  page.drawText('Patient Signature:', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  // Signature box
  page.drawRectangle({
    x: margin,
    y: y - 50,
    width: 200,
    height: 50,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
    color: rgb(0.95, 0.95, 0.95)
  })

  y -= lineHeight * 4

  page.drawText('Date Completed:', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  // Date box
  page.drawRectangle({
    x: margin,
    y: y - 30,
    width: 100,
    height: 30,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
    color: rgb(0.95, 0.95, 0.95)
  })

  return await pdfDoc.save()
}

export async function generateSampleTreatmentPlan(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const { width, height } = page.getSize()
  const margin = 50
  const lineHeight = 20
  let y = height - margin

  // Title
  page.drawText('TREATMENT PLAN', {
    x: margin,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Client Information
  page.drawText('Client: _________________________________', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Treatment Details
  page.drawText('Recommended Treatment:', {
    x: margin,
    y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('□ Microblading Eyebrows', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('□ Eyeliner Enhancement', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  page.drawText('□ Lip Liner/Blush', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  page.drawText('Estimated Cost: $_________________', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  page.drawText('Treatment Date: _________________', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Agreement
  page.drawText('I agree to the above treatment plan and understand the associated costs.', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight * 2

  // Signature
  page.drawText('Client Agreement Signature:', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  // Signature box
  page.drawRectangle({
    x: margin,
    y: y - 50,
    width: 200,
    height: 50,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
    color: rgb(0.95, 0.95, 0.95)
  })

  y -= lineHeight * 4

  page.drawText('Treatment Date:', {
    x: margin,
    y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  })
  y -= lineHeight

  // Date box
  page.drawRectangle({
    x: margin,
    y: y - 30,
    width: 100,
    height: 30,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
    color: rgb(0.95, 0.95, 0.95)
  })

  return await pdfDoc.save()
}


