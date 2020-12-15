DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS users;

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