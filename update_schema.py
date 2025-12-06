import sqlite3

def add_columns():
    try:
        conn = sqlite3.connect('warefy.db')
        cursor = conn.cursor()
        
        columns = [
            ("avatar_url", "TEXT"),
            ("phone", "TEXT"),
            ("bio", "TEXT"),
            ("location", "TEXT")
        ]
        
        for col_name, col_type in columns:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                print(f"Added column {col_name}")
            except sqlite3.OperationalError as e:
                print(f"Column {col_name} might already exist: {e}")
                
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_columns()
