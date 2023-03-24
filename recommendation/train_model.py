import numpy as np
import pandas as pd
import joblib

from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline



data = pd.read_csv('recommendation\data.csv')
genre_data = pd.read_csv('recommendation\data_by_genres.csv')
year_data = pd.read_csv('recommendation\data_by_year.csv')
artist_data = pd.read_csv('recommendation\data_by_artist.csv')

data['decade'] = data['year'].apply(lambda year : f'{(year//10)*10}s' )



#Genre clustering
cluster_pipeline = Pipeline([('scaler', StandardScaler()), ('kmeans', KMeans(n_clusters=12))])
X = genre_data.select_dtypes(np.number)
cluster_pipeline.fit(X)
joblib.dump(cluster_pipeline, 'genre_model.pkl')
genre_data['cluster'] = cluster_pipeline.predict(X)

#Song clustering
song_cluster_pipeline = Pipeline([('scaler', StandardScaler()), 
                                  ('kmeans', KMeans(n_clusters=25, 
                                   verbose=False))
                                 ], verbose=False)
Y = data.select_dtypes(np.number)
song_cluster_pipeline.fit(Y)
joblib.dump(song_cluster_pipeline, 'song_model.pkl')
song_cluster_labels = song_cluster_pipeline.predict(Y)
data['cluster_label'] = song_cluster_labels