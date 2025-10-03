-- ENTERPRISE STUDIO SUPERVISION FEATURES - ADDITIVE ONLY
-- These are new tables that will be added to the existing schema

-- New table: Supervisor availability blocks
CREATE TABLE supervision_availability (
    id                  TEXT PRIMARY KEY DEFAULT generate_random_id(),
    supervisor_id       TEXT NOT NULL,
    -- UTC timestamps - UI will convert to user timezone
    start_utc           TIMESTAMP NOT NULL,
    end_utc             TIMESTAMP NOT NULL,
    location            TEXT,
    notes               TEXT,
    capacity            INTEGER DEFAULT 1,
    buffer_minutes      INTEGER DEFAULT 15,
    is_published        BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    -- Index for performance
    CONSTRAINT supervision_availability_start_end_check CHECK (start_utc < end_utc)
);

-- New table: Supervisor apprentice bookings
CREATE TABLE supervision_booking (
    id                  TEXT PRIMARY KEY DEFAULT generate_random_id(),
    availability_id     TEXT NOT NULL,
    supervisor_id       TEXT NOT NULL,
    apprentice_id       TEXT NOT NULL,
    client_id           TEXT, -- References Client if exists
    client_name         TEXT,
    client_email        TEXT,
    client_phone        TEXT,
    procedure_type      TEXT NOT NULL,
    notes               TEXT,
    status              TEXT DEFAULT 'CONFIRMED' CHECK (status IN ('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    -- Time copied from availability when booking
    start_utc           TIMESTAMP NOT NULL,
    end_utc             TIMESTAMP NOT NULL,
    completed_at_utc    TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- New table: Procedure logs for licensure tracking
CREATE TABLE procedure_log (
    id                  TEXT PRIMARY KEY DEFAULT generate_random_id(),
    apprentice_id       TEXT NOT NULL,
    supervisor_id       TEXT NOT NULL,
    booking_id          TEXT, -- Reference to supervision_booking
    client_id           TEXT,
    client_name         TEXT,
    procedure_type      TEXT NOT NULL,
    performed_at_utc    TIMESTAMP NOT NULL,
    reference_id        TEXT, -- Future: AI grading reference
    grade_id            TEXT,
    compliance_checked  BOOLEAN DEFAULT FALSE,
    training_hours      DECIMAL(3,1),
    complexity_level    TEXT CHECK (complexity_level IN ('BASIC', 'INTERMEDIATE', 'ADVANCED')),
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_supervision_availability_supervisor ON supervision_availability(supervisor_id);
CREATE INDEX idx_supervisor_availability_timerange ON supervision_availability(start_utc, end_utc);
CREATE INDEX idx_supervision_booking_availability ON supervision_booking(availability_id);
CREATE INDEX idx_supervision_booking_apprentice ON supervision_booking(apprentice_id);
CREATE INDEX idx_procedure_log_apprentice ON procedure_log(apprentice_id);
CREATE INDEX idx_procedure_log_supervisor ON procedure_log(supervisor_id);
CREATE INDEX idx_procedure_log_date ON procedure_log(performed_at_utc);

-- Feature Flag Configuration (Environment Variable)
-- Set ENABLE_STUDIO_SUPERVISION=true in production
