// Enterprise Studio Supervision Service
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface SupervisionAvailability {
  id: string
  supervisorId: string
  startUtc: Date
  endUtc: Date
  location?: string
  notes?: string
  capacity: number
  bufferMinutes: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SupervisionBooking {
  id: string
  availabilityId: string
  supervisorId: string
  apprenticeId: string
  clientId?: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  procedureType: string
  notes?: string
  status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  startUtc: Date
  endUtc: Date
  completedAtUtc?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ProcedureLog {
  id: string
  apprenticeId: string
  supervisorId: string
  bookingId?: string
  clientId?: string
  clientName?: string
  procedureType: string
  performedAtUtc: Date
  referenceId?: string
  gradeId?: string
  complianceChecked: boolean
  trainingHours?: number
  complexityLevel?: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'
  createdAt: Date
  updatedAt: Date
}

export class StudioSupervisionService {
  
  // AVAILABILITY MANAGEMENT
  
  static async createAvailability(data: {
    supervisorId: string
    startUtc: Date
    endUtc: Date
    location?: string
    notes?: string
    capacity?: number
    bufferMinutes?: number
  }): Promise<SupervisionAvailability> {
    
    // Check for overlapping availability blocks
    const overlap = await prisma.$queryRaw`
      SELECT id FROM supervision_availability 
      WHERE supervisor_id = ${data.supervisorId}
      AND is_published = true
      AND (
        (${data.startUtc} < end_utc AND ${data.endUtc} > start_utc)
      )
    ` as any[]

    if (overlap.length > 0) {
      throw new Error('Availability block overlaps with existing published block')
    }

    return prisma.$queryRaw`
      INSERT INTO supervision_availability 
      (supervisor_id, start_utc, end_utc, location, notes, capacity, buffer_minutes)
      VALUES (${data.supervisorId}, ${data.startUtc}, ${data.endUtc}, ${data.location || null}, ${data.notes || null}, ${data.capacity || 1}, ${data.bufferMinutes || 15})
      RETURNING *
    ` as Promise<SupervisionAvailability>
  }

  static async getAvailabilityForSupervisor(
    supervisorId: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<SupervisionAvailability[]> {
    let whereClause = `WHERE supervisor_id = '${supervisorId}'`
    
    if (fromDate && toDate) {
      whereClause += ` AND start_utc >= '${fromDate.toISOString()}'AND end_utc <= '${toDate.toISOString()}'`
    }

    return prisma.$queryRaw`
      SELECT * FROM supervision_availability 
      ${fromDate && toDate ? 
        Prisma.sql`WHERE supervisor_id = ${supervisorId} AND start_utc >= ${fromDate} AND end_utc <= ${toDate}` :
        Prisma.sql`WHERE supervisor_id = ${supervisorId}`
      }
      ORDER BY start_utc ASC
    ` as Promise<SupervisionAvailability[]>
  }

  static async getAvailableBlocksForBooking(
    fromDate: Date,
    toDate: Date
  ): Promise<SupervisionAvailability[]> {
    return prisma.$queryRaw`
      SELECT sa.* FROM supervision_availability sa
      LEFT JOIN supervision_booking sb ON sa.id = sb.availability_id 
        AND sb.status IN ('CONFIRMED', 'REQUESTED')
      WHERE sa.is_published = true
      AND sa.start_utc >= ${fromDate}
      AND sa.end_utc <= ${toDate}
      AND sa.capacity > (
        SELECT COUNT(*) FROM supervision_booking 
        WHERE availability_id = sa.id 
        AND status IN ('CONFIRMED', 'REQUESTED')
      )
      ORDER BY sa.start_utc ASC
    ` as Promise<SupervisionAvailability[]>
  }

  // BOOKING MANAGEMENT

  static async createBooking(data: {
    availabilityId: string
    supervisorId: string
    apprenticeId: string
    clientId?: string
    clientName?: string
    clientEmail?: string
    clientPhone?: string
    procedureType: string
    notes?: string
  }): Promise<SupervisionBooking> {
    
    // Get availability block details
    const availability = await prisma.$queryRaw`
      SELECT * FROM supervision_availability WHERE id = ${data.availabilityId}
    ` as SupervisionAvailability[]

    if (!availability.length) {
      throw new Error('Availability block not found')
    }

    const block = availability[0]
    
    // Check capacity
    const currentBookings = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM supervision_booking 
      WHERE availability_id = ${data.availabilityId} 
      AND status IN ('CONFIRMED', 'REQUESTED')
    ` as { count: bigint }[]

    if (Number(currentBookings[0].count) >= block.capacity) {
      throw new Error('Availability block is fully booked')
    }

    return prisma.$queryRaw`
      INSERT INTO supervision_booking 
      (availability_id, supervisor_id, apprentice_id, client_id, client_name, client_email, client_phone, procedure_type, notes, start_utc, end_utc)
      VALUES (${data.availabilityId}, ${data.supervisorId}, ${data.apprenticeId}, ${data.clientId || null}, ${data.clientName || null}, ${data.clientEmail || null}, ${data.clientPhone || null}, ${data.procedureType}, ${data.notes || null}, ${block.startUtc}, ${block.endUtc})
      RETURNING *
    ` as Promise<SupervisionBooking>
  }

  static async completeBooking(bookingId: string): Promise<ProcedureLog> {
    // Mark booking as completed
    await prisma.$queryRaw`
      UPDATE supervision_booking 
      SET status = 'COMPLETED', completed_at_utc = NOW()
      WHERE id = ${bookingId}
    `

    // Get booking details
    const booking = await prisma.$queryRaw`
      SELECT * FROM supervision_booking WHERE id = ${bookingId}
    ` as SupervisionBooking[]

    if (!booking.length) {
      throw new Error('Booking not found')
    }

    const b = booking[0]

    // Create procedure log for licensure tracking
    return prisma.$queryRaw`
      INSERT INTO procedure_log 
      (apprentice_id, supervisor_id, booking_id, client_id, client_name, procedure_type, performed_at_utc)
      VALUES (${b.apprenticeId}, ${b.supervisorId}, ${bookingId}, ${b.clientId || null}, ${b.clientName || null}, ${b.procedureType}, ${b.startUtc})
      RETURNING *
    ` as Promise<ProcedureLog>
  }

  // PROCEDURE LOG REPORTS

  static async getProcedureLogsForApprentice(
    apprenticeId: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<ProcedureLog[]> {
    let query = Prisma.sql`SELECT * FROM procedure_log WHERE apprentice_id = ${apprenticeId}`
    
    if (fromDate && toDate) {
      query = Prisma.sql`
        SELECT * FROM procedure_log 
        WHERE apprentice_id = ${apprenticeId} 
        AND performed_at_utc >= ${fromDate} 
        AND performed_at_utc <= ${toDate}
        ORDER BY performed_at_utc DESC
      `
    } else {
      query = Prisma.sql`
        SELECT * FROM procedure_log 
        WHERE apprentice_id = ${apprenticeId}
        ORDER BY performed_at_utc DESC
      `
    }

    return prisma.$queryRaw(query) as Promise<ProcedureLog[]>
  }

  static async getProcedureReportCSV(
    fromDate: Date,
    toDate: Date,
    apprenticeId?: string,
    supervisorId?: string
  ): Promise<any[]> {
    let query = Prisma.sql`
      SELECT 
        pl.id,
        pl.performed_at_utc,
        pl.procedure_type,
        u_apprentice.name as apprentice_name,
        u_apprentice.email as apprentice_email,
        u_supervisor.name as supervisor_name,
        u_supervisor.license_number as supervisor_license,
        pl.client_name,
        pl.training_hours,
        pl.complexity_level,
        pl.compliance_checked
      FROM procedure_log pl
      JOIN users u_apprentice ON pl.apprentice_id = u_apprentice_id
      JOIN users u_supervisor ON pl.supervisor_id = u_supervisor.id
      WHERE pl.performed_at_utc >= ${fromDate}
      AND pl.performed_at_utc <= ${toDate}
    `

    if (apprenticeId) {
      query = Prisma.sql`${query} AND pl.apprentice_id = ${apprenticeId}`
    }

    if (supervisorId) {
      query = Prisma.sql`${query} AND pl.supervisor_id = ${supervisorId}`
    }

    query = Prisma.sql`${query} ORDER BY pl.performed_at_utc DESC`

    return prisma.$queryRaw(query) as Promise<any[]>
  }
}

export const Prisma = require('@prisma/client').Prisma
