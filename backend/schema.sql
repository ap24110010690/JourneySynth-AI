-- JourneySynth AI Relational Database Schema
-- Compatible with MySQL 8.0+ and embedded relational engines

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS datasets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    dataset_name VARCHAR(255) NOT NULL,
    generation_config TEXT NOT NULL,
    total_customers INT NOT NULL DEFAULT 0,
    total_sessions INT NOT NULL DEFAULT 0,
    total_events INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_datasets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    dataset_id VARCHAR(36) NOT NULL,
    customer_code VARCHAR(50) NOT NULL,
    customer_type VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255),
    email VARCHAR(255),
    location VARCHAR(100),
    device_preference VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customers_dataset FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(36) PRIMARY KEY,
    dataset_id VARCHAR(36) NOT NULL,
    customer_id VARCHAR(36) NOT NULL,
    session_code VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP NOT NULL,
    conversion_status VARCHAR(50) NOT NULL DEFAULT 'ABANDONED',
    total_events INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_sessions_dataset FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
    CONSTRAINT fk_sessions_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    availability VARCHAR(50) NOT NULL DEFAULT 'IN_STOCK'
);

CREATE TABLE IF NOT EXISTS journey_events (
    id VARCHAR(36) PRIMARY KEY,
    dataset_id VARCHAR(36) NOT NULL,
    customer_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NULL,
    event_type VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    event_timestamp TIMESTAMP NOT NULL,
    event_metadata TEXT NULL,
    CONSTRAINT fk_events_dataset FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
    CONSTRAINT fk_events_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_events_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_events_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ai_insights (
    id VARCHAR(36) PRIMARY KEY,
    dataset_id VARCHAR(36) NOT NULL,
    insight_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_insights_dataset FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_dataset_id ON customers(dataset_id);
CREATE INDEX IF NOT EXISTS idx_sessions_dataset_id ON sessions(dataset_id);
CREATE INDEX IF NOT EXISTS idx_sessions_customer_id ON sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_events_dataset_id ON journey_events(dataset_id);
CREATE INDEX IF NOT EXISTS idx_events_customer_id ON journey_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON journey_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_product_id ON journey_events(product_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON journey_events(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_insights_dataset_id ON ai_insights(dataset_id);
