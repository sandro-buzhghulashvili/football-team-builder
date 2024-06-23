import sqlite3

# Establish connection to SQLite database
conn = sqlite3.connect("teams.db")
cursor = conn.cursor()

# Corrected SQL statement to create the 'teams' table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        team TEXT
    )
''')

# Commit the changes and close the connection
conn.commit()
conn.close()
