# PROCURA NÚMEROS EM CSV

import csv
import pandas as pd

# Lista de números a serem buscados
numeros_procurados = [
    '21984357389',
    ]

# Caminho do arquivo CSV
arquivo_csv = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\bdo_filtrado.csv'

# Leitura do CSV
df = pd.read_csv(arquivo_csv)

# Filtra os números que estão na lista
encontrados = df[df['number'].astype(str).isin(numeros_procurados)]

# Mostra os encontrados
print("Números encontrados no CSV:")
print(encontrados['number'].tolist())