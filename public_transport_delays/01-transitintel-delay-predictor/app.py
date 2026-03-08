import pandas as pd
import numpy as np
from flask import Flask, render_template, request
import joblib
import json
import plotly
import plotly.express as px

app = Flask(__name__)

# Load model and data
model = joblib.load('models/xgboost_model.pkl')

feature_cols = [
    'temperature_C', 'humidity_percent', 'wind_speed_kmh', 'precipitation_mm', 
    'event_attendance_est', 'traffic_congestion_index', 'holiday', 'peak_hour', 
    'weekday', 'hour', 'is_rush_hour', 'is_weekend', 'has_event', 
    'high_precipitation', 'high_congestion', 
    'transport_type_Bus', 'transport_type_Metro', 'transport_type_Train', 'transport_type_Tram', 
    'route_id_Route_1', 'route_id_Route_10', 'route_id_Route_11', 'route_id_Route_12', 
    'route_id_Route_13', 'route_id_Route_14', 'route_id_Route_15', 'route_id_Route_16', 
    'route_id_Route_17', 'route_id_Route_18', 'route_id_Route_19', 'route_id_Route_2', 
    'route_id_Route_20', 'route_id_Route_3', 'route_id_Route_4', 'route_id_Route_5', 
    'route_id_Route_6', 'route_id_Route_7', 'route_id_Route_8', 'route_id_Route_9', 
    'weather_condition_Clear', 'weather_condition_Cloudy', 'weather_condition_Fog', 
    'weather_condition_Rain', 'weather_condition_Snow', 'weather_condition_Storm', 
    'event_type_Concert', 'event_type_Festival', 'event_type_No Event', 'event_type_Parade', 
    'event_type_Protest', 'event_type_Sports', 
    'season_Autumn', 'season_Spring', 'season_Summer', 'season_Winter'
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        data = request.form
        
        # Parse inputs
        hour = int(data.get('hour', 0))
        weekday = int(data.get('weekday', 0))
        is_rush_hour = 1 if (7 <= hour <= 9) or (17 <= hour <= 19) else 0
        is_weekend = 1 if weekday in [5, 6] else 0
        event_type = data.get('event_type')
        has_event = 0 if event_type == 'No Event' else 1
        precipitation_mm = float(data.get('precipitation_mm', 0))
        high_precipitation = 1 if precipitation_mm > 5 else 0
        traffic_congestion_index = float(data.get('traffic_congestion_index', 0))
        high_congestion = 1 if traffic_congestion_index > 7 else 0
        
        input_dict = {col: 0 for col in feature_cols}
        
        input_dict['temperature_C'] = float(data.get('temperature_C', 0))
        input_dict['humidity_percent'] = float(data.get('humidity_percent', 0))
        input_dict['wind_speed_kmh'] = float(data.get('wind_speed_kmh', 0))
        input_dict['precipitation_mm'] = precipitation_mm
        input_dict['event_attendance_est'] = float(data.get('event_attendance_est', 0))
        input_dict['traffic_congestion_index'] = traffic_congestion_index
        input_dict['holiday'] = 1 if data.get('holiday') else 0
        input_dict['peak_hour'] = 1 if data.get('peak_hour') else 0
        input_dict['weekday'] = weekday
        input_dict['hour'] = hour
        
        input_dict['is_rush_hour'] = is_rush_hour
        input_dict['is_weekend'] = is_weekend
        input_dict['has_event'] = has_event
        input_dict['high_precipitation'] = high_precipitation
        input_dict['high_congestion'] = high_congestion
        
        transport_type = data.get('transport_type')
        if f"transport_type_{transport_type}" in input_dict:
            input_dict[f"transport_type_{transport_type}"] = 1
            
        route_id = data.get('route_id')
        if f"route_id_{route_id}" in input_dict:
            input_dict[f"route_id_{route_id}"] = 1
            
        weather_condition = data.get('weather_condition')
        if f"weather_condition_{weather_condition}" in input_dict:
            input_dict[f"weather_condition_{weather_condition}"] = 1
            
        if f"event_type_{event_type}" in input_dict:
            input_dict[f"event_type_{event_type}"] = 1
            
        season = data.get('season')
        if f"season_{season}" in input_dict:
            input_dict[f"season_{season}"] = 1
            
        input_df = pd.DataFrame([input_dict])
        
        # Predict
        prob = model.predict_proba(input_df)[0][1]
        pred = model.predict(input_df)[0]
        
        result = "Delayed" if pred == 1 else "Not Delayed"
        probability = round(prob * 100, 1)
        
        return render_template('predict.html', result=result, probability=probability, form_data=data)
        
    return render_template('predict.html', form_data={}, prediction=None, probability=None)

@app.route('/analytics')
def analytics():
    import os
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, 'data', 'public_transport_delays.csv')
    raw_df = pd.read_csv(file_path)
    raw_df['delayed_str'] = raw_df['delayed'].map({0: 'On Time', 1: 'Delayed'})
    colors = {'On Time': '#5bc0be', 'Delayed': '#ff8c00'}
    
    total_trips = len(raw_df)
    delayed_percentage = round((raw_df['delayed'].sum() / total_trips) * 100, 1) if total_trips > 0 else 0
    most_delayed_route = raw_df[raw_df['delayed'] == 1]['route_id'].value_counts().idxmax() if not raw_df[raw_df['delayed'] == 1].empty else 'N/A'
    worst_weather = raw_df[raw_df['delayed'] == 1]['weather_condition'].value_counts().idxmax() if not raw_df[raw_df['delayed'] == 1].empty else 'N/A'
    
    # 1. Transport Type
    df1 = raw_df.groupby(['transport_type', 'delayed_str']).size().reset_index(name='count')
    chart1 = px.bar(df1, x='transport_type', y='count', color='delayed_str', barmode='group',
                    title="Delays by Transport Type", color_discrete_map=colors, template="plotly_dark")
    chart1_json = json.dumps(chart1, cls=plotly.utils.PlotlyJSONEncoder)
    
    # 2. Weather Condition
    df2 = raw_df.groupby(['weather_condition', 'delayed_str']).size().reset_index(name='count')
    chart2 = px.bar(df2, x='weather_condition', y='count', color='delayed_str', barmode='group',
                    title="Delays by Weather Condition", color_discrete_map=colors, template="plotly_dark")
    chart2_json = json.dumps(chart2, cls=plotly.utils.PlotlyJSONEncoder)
    
    # 3. Season
    df3 = raw_df.groupby(['season', 'delayed_str']).size().reset_index(name='count')
    chart3 = px.bar(df3, x='season', y='count', color='delayed_str', barmode='group',
                    title="Delays by Season", color_discrete_map=colors, template="plotly_dark")
    chart3_json = json.dumps(chart3, cls=plotly.utils.PlotlyJSONEncoder)
    
    # 4. Hour of Day
    raw_df['hour'] = pd.to_datetime(raw_df['time'], errors='coerce').dt.hour
    raw_df['hour'] = raw_df['hour'].fillna(0).astype(int)
    delays_by_hour = raw_df[raw_df['delayed'] == 1].groupby('hour').size().reset_index(name='count')
    chart4 = px.line(delays_by_hour, x='hour', y='count', markers=True,
                     title="Total Delays by Hour of Day", template="plotly_dark",
                     color_discrete_sequence=['#f26419'])
    chart4.update_traces(line_shape='spline')
    chart4_json = json.dumps(chart4, cls=plotly.utils.PlotlyJSONEncoder)
    
    return render_template('analytics.html', 
                          chart1=chart1_json, chart2=chart2_json, 
                          chart3=chart3_json, chart4=chart4_json,
                          total_trips=total_trips, delayed_percentage=delayed_percentage,
                          most_delayed_route=most_delayed_route, worst_weather=worst_weather)

@app.route('/insights')
def insights():
    feature_importances = pd.DataFrame({
        'Feature': feature_cols,
        'Importance': model.feature_importances_
    }).sort_values(by='Importance', ascending=True).tail(10)
    
    fig_imp = px.bar(feature_importances, x='Importance', y='Feature', orientation='h',
                     title="Top 10 Feature Importances", template="plotly_dark",
                     color_discrete_sequence=['#f26419'])
    
    chart_imp_json = json.dumps(fig_imp, cls=plotly.utils.PlotlyJSONEncoder)
    
    return render_template('insights.html', chart_imp=chart_imp_json)

if __name__ == '__main__':
    app.run(debug=True, port=5000)