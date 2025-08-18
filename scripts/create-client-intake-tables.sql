-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    client_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    address TEXT,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    occupation VARCHAR(255),
    medical_history JSONB DEFAULT '[]',
    allergies TEXT,
    medications TEXT,
    photo_consent BOOLEAN DEFAULT FALSE,
    procedure_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create documents table for ID uploads and forms
CREATE TABLE IF NOT EXISTS documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(client_id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'ID', 'Intake Form', 'Consent Form', etc.
    file_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create signatures table for digital signatures
CREATE TABLE IF NOT EXISTS signatures (
    signature_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(client_id) ON DELETE CASCADE,
    form_id UUID,
    signed_by VARCHAR(20) NOT NULL, -- 'Client' or 'Artist'
    signature_image_url TEXT,
    signed_at TIMESTAMP DEFAULT NOW()
);

-- Create sessions table for appointments/procedures
CREATE TABLE IF NOT EXISTS sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(client_id) ON DELETE CASCADE,
    artist_id UUID, -- Reference to users table if exists
    procedure_type VARCHAR(100),
    notes TEXT,
    date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create images table for before/after photos
CREATE TABLE IF NOT EXISTS images (
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(client_id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(20) NOT NULL, -- 'Before', 'After', 'Progress'
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Create forms table for form templates
CREATE TABLE IF NOT EXISTS forms (
    form_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_name VARCHAR(255) NOT NULL,
    form_description TEXT,
    form_schema JSONB,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_images_client_id ON images(client_id);
