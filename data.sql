DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS technologies;

CREATE TABLE companies (
    handle TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    num_employees INTEGER,
    description TEXT,
    logo_url TEXT
);

INSERT INTO companies (handle, name, num_employees, description, logo_url) VALUES ('GOOG', 'Google', 100, 'Best search engine ever', 'enter logo url here');
INSERT INTO companies (handle, name, num_employees, description, logo_url) VALUES ('AAPL', 'Apple', 500, 'Best computers dude', 'another logo url');

CREATE TABLE jobs (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    salary FLOAT NOT NULL,
    equity FLOAT NOT NULL CHECK(equity <= 1),
    company_handle TEXT REFERENCES companies(handle) ON DELETE CASCADE,
    date_posted TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO jobs (title, salary, equity, company_handle) VALUES ('Software Developer', 50000.00, 0.5, 'GOOG');
INSERT INTO jobs (title, salary, equity, company_handle) VALUES ('CEO', 150000.00, 0.75, 'AAPL');

CREATE TABLE users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    photo_url TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin) VALUES ('shapirobd', 'Pot3ntiat321!', 'Brian', 'Shapiro', 'briandavidshapiro@gmail.com', 'this is a photo url', true);
INSERT INTO users (username, password, first_name, last_name, email, is_admin) VALUES ('nickgriffo', 'ireek123', 'Nick', 'Griffo', 'nickcg@gmail.com', false);

CREATE TABLE applications (
    username TEXT REFERENCES users(username) ON DELETE CASCADE,
    job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
    state TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(username, job_id)
);

INSERT INTO applications (username, job_id, state) VALUES ('shapirobd', 1, 'NC');
INSERT INTO applications (username, job_id, state) VALUES ('shapirobd', 2, 'Pending..');
INSERT INTO applications (username, job_id, state) VALUES ('nickgriffo', 2, 'NY');

CREATE TABLE technologies (
    technology TEXT NOT NULL,
    job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
    username TEXT REFERENCES users(username) ON DELETE CASCADE
);

INSERT INTO technologies (technology, job_id, username) VALUES ('JavaScript', 1, 'shapirobd');
INSERT INTO technologies (technology, job_id, username) VALUES ('Python', 2, 'nickgriffo');