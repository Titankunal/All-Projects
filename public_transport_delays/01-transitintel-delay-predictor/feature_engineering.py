import pandas as pd

def engineer_features(input_file, output_file):
    print(f"Loading data from {input_file} for feature engineering...")
    df = pd.read_csv(input_file)
    
    # 1. Fill missing values in event_type column with 'No Event'
    df['event_type'] = df['event_type'].fillna('No Event')
    
    # 2. Create new features
    # Extract hour from the time column (0-23)
    df['hour'] = pd.to_datetime(df['time'], errors='coerce').dt.hour
    df['hour'] = df['hour'].fillna(0).astype(int)
    
    # is_rush_hour: 1 if hour is between 7-9 or 17-19, else 0
    df['is_rush_hour'] = df['hour'].apply(lambda h: 1 if (7 <= h <= 9) or (17 <= h <= 19) else 0)
    
    # is_weekend: 1 if weekday is 5 or 6, else 0
    df['is_weekend'] = df['weekday'].apply(lambda w: 1 if w in [5, 6] else 0)
    
    # has_event: 1 if event_type is not 'No Event', else 0
    df['has_event'] = df['event_type'].apply(lambda e: 0 if e == 'No Event' else 1)
    
    # high_precipitation: 1 if precipitation_mm is greater than 5, else 0
    df['high_precipitation'] = df['precipitation_mm'].apply(lambda p: 1 if p > 5 else 0)
    
    # high_congestion: 1 if traffic_congestion_index is greater than 7, else 0
    df['high_congestion'] = df['traffic_congestion_index'].apply(lambda c: 1 if c > 7 else 0)
    
    # 3. Drop columns that are not useful for modeling
    cols_to_drop = ['trip_id', 'date', 'time', 'scheduled_departure', 'scheduled_arrival', 
                    'origin_station', 'destination_station']
    df = df.drop(columns=cols_to_drop)
    
    # 4. One-hot encode categorical columns
    cols_to_encode = ['transport_type', 'route_id', 'weather_condition', 'event_type', 'season']
    df = pd.get_dummies(df, columns=cols_to_encode)
    
    # Convert any newly created boolean columns from get_dummies to integers (0 and 1)
    for col in df.columns:
        if df[col].dtype == 'bool':
            df[col] = df[col].astype(int)
            
    # 5. Print final shape and column names
    print("\n--- Final Data Shape ---")
    print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")
    
    print("\n--- Final Column Names ---")
    print(df.columns.tolist())
    
    # 6. Save the processed dataframe
    df.to_csv(output_file, index=False)
    print(f"\nProcessed data saved to {output_file}")

if __name__ == "__main__":
    engineer_features("data/public_transport_delays.csv", "processed_data.csv")
