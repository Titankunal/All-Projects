import pandas as pd

def load_and_explore_data(file_path):
    print(f"Loading data from {file_path}...")
    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"Error: {file_path} not found. Please ensure the CSV is in the same directory.")
        return None
        
    print("\n--- Data Shape ---")
    print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")
    
    print("\n--- Column Names ---")
    print(df.columns.tolist())
    
    print("\n--- Missing Values ---")
    print(df.isnull().sum())

    print("\n--- Target Column Distribution ('delayed') ---")
    if 'delayed' in df.columns:
        print(df['delayed'].value_counts())
    
    print("\n--- Basic Statistics ---")
    print(df.describe(include='all'))
    
    return df

if __name__ == "__main__":
    df = load_and_explore_data("data/public_transport_delays.csv")
