# PROCURA OS NÚMEROS DO TXT NO CSV FILTRADO

import csv
import pandas as pd

# Caminho do arquivo TXT com os números
arquivo_txt = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\numeros.txt'

# Lê os números do arquivo TXT e remove quebras de linha e espaços extras
with open(arquivo_txt, 'r') as f:
    numeros_procurados = [linha.strip() for linha in f if linha.strip()]

# Caminho do arquivo CSV
arquivo_csv = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\bdo_filtrado.csv'

# Leitura do CSV
df = pd.read_csv(arquivo_csv)

# Filtra os números que estão na lista
encontrados = df[df['number'].astype(str).isin(numeros_procurados)]

# Mostra os encontrados
print("Números encontrados no CSV:")
print(encontrados['number'].tolist())
print(f"Total de números encontrados: {len(encontrados)}")
