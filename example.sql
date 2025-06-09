-- DEFINIR TIPOS ENUM
CREATE TYPE student_status_enum AS ENUM (
    'pendiente',
    'inscrito',
    'activo',
    'egresado',
    'baja'
);

CREATE TYPE attendance_status_enum AS ENUM (
    'presente',
    'ausente',
    'tarde',
    'justificado'
);

CREATE TYPE student_group_status_enum AS ENUM (
    'activo',
    'inactivo',
    'completado',
    'cursando'
);

CREATE TYPE user_role_enum AS ENUM (
    'admin',
    'teacher',
    'student',
    'tutor_parent'
);

-- CREAR TABLAS
CREATE TABLE location (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    country VARCHAR NOT NULL,
    state VARCHAR NOT NULL,
    municipality VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    street VARCHAR NOT NULL,
    colony VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT location_pkey PRIMARY KEY (id)
);

CREATE TABLE period (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    period VARCHAR NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    CONSTRAINT period_pkey PRIMARY KEY (id)
);

CREATE TABLE grade (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    grade VARCHAR NOT NULL,
    CONSTRAINT grade_pkey PRIMARY KEY (id)
);

CREATE TABLE subject (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    CONSTRAINT subject_pkey PRIMARY KEY (id)
);

CREATE TABLE tutor (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    name VARCHAR NOT NULL,
    middle_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    CONSTRAINT tutor_pkey PRIMARY KEY (id)
);


CREATE TABLE users ( 
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_name VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    email VARCHAR NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    role user_role_enum NOT NULL,
    auth_user_id UUID UNIQUE,
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT user_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);

CREATE TABLE student (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    name VARCHAR NOT NULL,
    middle_name VARCHAR,
    last_name VARCHAR NOT NULL,
    tutor_id UUID NOT NULL,
    CONSTRAINT student_pkey PRIMARY KEY (id),
    CONSTRAINT student_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES tutor(id)
);

CREATE TABLE teacher (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    name VARCHAR NOT NULL DEFAULT ''::VARCHAR,
    middle_name VARCHAR DEFAULT ''::VARCHAR,
    last_name VARCHAR NOT NULL,
    age SMALLINT NOT NULL,
    phone VARCHAR NOT NULL UNIQUE,
    user_fk UUID NOT NULL UNIQUE,
    grade_id UUID,
    location_id UUID,
    CONSTRAINT teacher_pkey PRIMARY KEY (id),
    CONSTRAINT teacher_user_fk_fkey FOREIGN KEY (user_fk) REFERENCES users(id),
    CONSTRAINT teacher_location_id_fkey FOREIGN KEY (location_id) REFERENCES location(id),
    CONSTRAINT teacher_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES grade(id)
);

CREATE TABLE groups ( 
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    grade_id UUID NOT NULL,
    period_id UUID NOT NULL,
    group_name VARCHAR NOT NULL DEFAULT 'A'::VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT group_pkey PRIMARY KEY (id),
    CONSTRAINT groups_period_id_fkey FOREIGN KEY (period_id) REFERENCES period(id),
    CONSTRAINT groups_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES grade(id)
);

CREATE TABLE enrollment (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    period_id UUID NOT NULL,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delete_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status student_status_enum NOT NULL DEFAULT 'pendiente'::student_status_enum,
    CONSTRAINT enrollment_pkey PRIMARY KEY (id),
    CONSTRAINT enrollment_student_id_fkey FOREIGN KEY (student_id) REFERENCES student(id),
    CONSTRAINT enrollment_period_id_fkey FOREIGN KEY (period_id) REFERENCES period(id),
    CONSTRAINT enrollment_student_period_unique UNIQUE (student_id, period_id)
);

CREATE TABLE student_subject (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    period_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT student_subject_pkey PRIMARY KEY (id),
    CONSTRAINT student_subject_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subject(id),
    CONSTRAINT student_subject_student_id_fkey FOREIGN KEY (student_id) REFERENCES student(id),
    CONSTRAINT student_subject_period_id_fkey FOREIGN KEY (period_id) REFERENCES period(id),
    CONSTRAINT student_subject_period_unique_combination UNIQUE (student_id, subject_id, period_id)
);

CREATE TABLE evaluation_unit (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    student_subject_id UUID NOT NULL,
    unit_number VARCHAR NOT NULL,
    grade NUMERIC(5,2) NOT NULL,
    evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    observation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT evaluation_unit_pkey PRIMARY KEY (id),
    CONSTRAINT evaluation_unit_student_subject_id_fkey FOREIGN KEY (student_subject_id) REFERENCES student_subject(id)
);

CREATE TABLE student_attendance (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    group_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    justified BOOLEAN DEFAULT FALSE,
    justification_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status attendance_status_enum NOT NULL,
    CONSTRAINT student_attendance_pkey PRIMARY KEY (id),
    CONSTRAINT student_attendance_group_id_fkey FOREIGN KEY (group_id) REFERENCES groups(id),
    CONSTRAINT student_attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES student(id),
    CONSTRAINT student_attendance_student_group_date_unique UNIQUE (student_id, group_id, date)
);

CREATE TABLE student_group (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    group_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status student_group_status_enum NOT NULL DEFAULT 'activo'::student_group_status_enum,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT student_group_pkey PRIMARY KEY (id),
    CONSTRAINT student_group_group_id_fkey FOREIGN KEY (group_id) REFERENCES groups(id),
    CONSTRAINT student_group_student_id_fkey FOREIGN KEY (student_id) REFERENCES student(id),
    CONSTRAINT student_group_student_in_group_unique UNIQUE (student_id, group_id, start_date)
);

CREATE TABLE teacher_assignment (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL,
    group_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT teacher_assignment_pkey PRIMARY KEY (id),
    CONSTRAINT teacher_assignment_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subject(id),
    CONSTRAINT teacher_assignment_group_id_fkey FOREIGN KEY (group_id) REFERENCES groups(id),
    CONSTRAINT teacher_assignment_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES teacher(id),
    CONSTRAINT teacher_assignment_unique UNIQUE (teacher_id, group_id, subject_id, start_date)
);

CREATE TABLE teacher_attendance (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL,
    teacher_assignment_id UUID,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status_enum,
    justified BOOLEAN DEFAULT FALSE,
    justification_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT teacher_attendance_pkey PRIMARY KEY (id),
    CONSTRAINT teacher_attendance_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES teacher(id),
    CONSTRAINT teacher_attendance_assignment_id_fkey FOREIGN KEY (teacher_assignment_id) REFERENCES teacher_assignment(id),
    CONSTRAINT teacher_attendance_teacher_date_unique UNIQUE (teacher_id, date, teacher_assignment_id)
);

CREATE TABLE tutor_address (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL,
    street TEXT NOT NULL,
    external_number VARCHAR NOT NULL,
    internal_number VARCHAR,
    colony VARCHAR NOT NULL,
    municipality VARCHAR NOT NULL,
    state VARCHAR NOT NULL,
    zip_code VARCHAR(10) NOT NULL DEFAULT '00000'::VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_primary BOOLEAN DEFAULT TRUE,
    CONSTRAINT tutor_address_pkey PRIMARY KEY (id),
    CONSTRAINT tutor_address_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES tutor(id)
);

CREATE TABLE tutor_emergency_contact (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL,
    contact_name VARCHAR NOT NULL,
    relationship VARCHAR NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_street TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT tutor_emergency_contact_pkey PRIMARY KEY (id),
    CONSTRAINT tutor_emergency_contact_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES tutor(id)
);