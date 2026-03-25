# Asteroid Hazard Prediction & Visualization
This project combines a 3D asteroid tracking system with a machine learning model to analyze and predict potentially hazardous near-Earth objects using real NASA data.  

## Overview
-Visualizes asteroid flybys in an interactive 3D environment.  
-Uses a Logistic Regression model to classify asteroids as hazardous or not.  
-Built using real-world Near-Earth Object (NEO) data.
## Key Insight
Initial models showed high accuracy due to class imbalance but failed to detect hazardous asteroids. After applying class balancing, the model improved detection significantly (≈77% recall), prioritizing safety over raw accuracy.
## Tech Stack
JavaScript (Three.js) – Visualization  
Python, Pandas, Scikit-learn – Machine Learning  
Google Colab – Model development
## Project Structure
-src/ → 3D visualization  
-ml-model/ → ML model and analysis
## Future Work
-Integrate ML predictions into visualization  
-Improve model using advanced algorithms 
