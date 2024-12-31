
import plotly.express as px
import dash
from dash import dcc, html
from dash.dependencies import Input, Output
import plotly.graph_objs as go
import matplotlib.pyplot as plt
from flask_socketio import SocketIO
import pandas as pd

class DashboardManager:
    def __init__(self):
        self.app = dash.Dash(__name__)
        self.socketio = SocketIO(self.app.server)
        
        self.app.layout = html.Div([
            html.H1("FES Real-time Dashboard"),
            dcc.Graph(id='live-graph'),
            dcc.Interval(id='graph-update', interval=1000),
            html.Div([
                dcc.Graph(id='psd-graph'),
                dcc.Graph(id='heatmap')
            ], style={'display': 'flex'})
        ])
        
        self.setup_callbacks()
    
    def setup_callbacks(self):
        @self.socketio.on('connect')
        def handle_connect():
            print('Client connected')
            
        @self.socketio.on('disconnect')
        def handle_disconnect():
            print('Client disconnected')
            
        @self.socketio.on('request_update')
        def handle_update_request():
            data = self.get_latest_data()
            self.socketio.emit('data_update', data)
            
        @self.app.callback(
            Output('live-graph', 'figure'),
            [Input('graph-update', 'n_intervals')]
        )
        def update_graph(n):
            data = self.get_latest_data()
            return {
                'data': [
                    {'x': data.index, 'y': data.values, 'type': 'scatter', 'name': 'Signal'},
                    {'x': data.index, 'y': data.rolling(5).mean(), 'type': 'scatter', 'name': 'Moving Average'}
                ],
                'layout': {
                    'title': 'Real-time Signal Analysis',
                    'uirevision': True,
                    'hovermode': 'closest',
                    'showlegend': True
                }
            }
    
    def run(self, host='0.0.0.0', port=8050):
        self.socketio.run(self.app.server, host=host, port=port)

def plot_signal(signal, title="Signal"):
    plt.figure(figsize=(10, 4))
    plt.plot(signal, label="Signal")
    plt.title(title)
    plt.xlabel("Time")
    plt.ylabel("Amplitude")
    plt.legend()
    plt.show()

def plot_spectral_density(frequencies, psd, title="Power Spectral Density"):
    plt.figure(figsize=(10, 4))
    plt.semilogy(frequencies, psd, label="PSD")
    plt.title(title)
    plt.xlabel("Frequency (Hz)")
    plt.ylabel("Power/Frequency (dB/Hz)")
    plt.legend()
    plt.show()

def create_outbreak_heatmap(data, save_path="heatmap.png"):
    sns.heatmap(data.pivot("region", "date", "cases"), cmap="YlGnBu", annot=True)
    plt.savefig(save_path)
