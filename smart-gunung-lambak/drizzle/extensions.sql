-- Run once in each PostgreSQL environment before future geospatial work.
-- The current schema uses numeric latitude/longitude, so this extension is optional.
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
