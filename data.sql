DROP TABLE IF EXISTS companies CASCADE;

CREATE TABLE companies (
    handle TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    num_employees INTEGER,
    description TEXT,
    logo_url TEXT
);

INSERT INTO companies (handle, name, num_employees, description, logo_url) VALUES ('GOOG', 'Google', 100, 'Best search engine ever', 'enter logo url here');