# 🚆 TransitIntel — Public Transport Delay Predictor

A full-stack machine learning web application that predicts public transport delays using weather conditions, city events, traffic congestion, and temporal data. Built with XGBoost and deployed via Flask with interactive Plotly dashboards.

---

## 🌐 Live Demo

> Run locally at `http://127.0.0.1:5000` after setup

---

## 📸 Screenshots

| Home | Live Predictor | Analytics | Model Insights |
|------|---------------|-----------|----------------|
| Hero section with stats | Real-time delay prediction | Interactive Plotly charts | Feature importance & confusion matrix |

---

## 🎯 Project Overview

**Problem:** Public transport delays are unpredictable and cost commuters time and productivity.

**Solution:** A machine learning system that predicts whether a trip will be delayed based on real-time conditions including weather, events, congestion, and time of day.

**Impact:** Helps commuters plan smarter and demonstrates end-to-end data science skills across data engineering, modeling, and full-stack deployment.

---

## ✨ Features

- 🔮 **Live Delay Prediction** — Input current conditions and get instant delay probability
- 📊 **Visual Analytics** — Interactive charts showing delay patterns by route, weather, season, and hour
- 🔍 **Model Insights** — Feature importance visualization and confusion matrix with plain English explanations
- 🏗️ **Full Pipeline** — From raw CSV to trained model to deployed web app

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Data Processing | Python, Pandas, NumPy |
| Machine Learning | XGBoost, Scikit-learn |
| Web Framework | Flask |
| Visualizations | Plotly |
| Frontend | Bootstrap 5, HTML/CSS/JS |

---

## 📊 Dataset

- **Source:** Kaggle — Public Transport Delays Dataset
- **Size:** 2,000 records, 24 features
- **Target:** `delayed` (binary: 0 = On Time, 1 = Delayed)
- **Features include:** transport type, route, weather condition, temperature, humidity, wind speed, precipitation, traffic congestion index, events, season, peak hour, holiday flag

---

## 🤖 Model Performance

| Metric | Score |
|--------|-------|
| Accuracy | 74% |
| Delayed Recall | 98% |
| Algorithm | XGBoost Classifier |
| Class Imbalance Handling | scale_pos_weight=3 |

**Top Predictive Features:**
- Route ID
- Event type (Sports, Parade)
- Weather condition (Cloudy, Storm)
- Traffic congestion index

---

## 📁 Project Structure
```
transitintel/
├── data/
│   ├── public_transport_delays.csv    # Raw dataset
│   └── processed_data.csv             # Engineered features
├── models/
│   └── xgboost_model.pkl              # Trained model
├── templates/
│   ├── base.html                      # Base layout
│   ├── index.html                     # Homepage
│   ├── predict.html                   # Live predictor
│   ├── analytics.html                 # Charts dashboard
│   └── insights.html                  # Model insights
├── data_pipeline.py                   # Data loading & cleaning
├── feature_engineering.py            # Feature creation
├── model_training.py                 # Model training & evaluation
├── app.py                            # Flask application
└── README.md
```

---

## 💻 Installation & Setup

### Prerequisites
- Python 3.8+
- pip

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/Titankunal/data-science-portfolio.git
cd public_transport_delays
```

**2. Install dependencies**
```bash
pip install pandas numpy scikit-learn xgboost flask plotly joblib
```

**3. Run the data pipeline**
```bash
python data_pipeline.py
```

**4. Engineer features**
```bash
python feature_engineering.py
```

**5. Train the model**
```bash
python model_training.py
```

**6. Launch the app**
```bash
python app.py
```

Visit `http://127.0.0.1:5000`

---

## 🚀 Usage

### Live Prediction
1. Navigate to **Live Prediction** in the navbar
2. Select transport type, route, weather condition and season
3. Set time, congestion, and event parameters
4. Click **Predict** to get instant delay probability

### Analytics Dashboard
- View delay patterns broken down by transport type, weather, season, and hour of day
- All charts are interactive — hover, zoom, and filter

### Model Insights
- See which features drive delays the most
- Understand model performance via confusion matrix

---

## 🔮 Future Improvements

- [ ] Integrate real-time weather API (OpenWeatherMap)
- [ ] Add LSTM time-series model for sequential predictions
- [ ] Deploy on cloud platform (AWS / GCP / Render)
- [ ] Add user authentication and saved prediction history
- [ ] Expand dataset with real city transit data

---

## 👤 Author

**Kunal**
- GitHub: [Titankunal](https://github.com/Titankunal)
- LinkedIn: [Kunal](https://www.linkedin.com/in/kunalhere/)

---

## 📝 License

MIT License — feel free to use and adapt for your own projects.

---