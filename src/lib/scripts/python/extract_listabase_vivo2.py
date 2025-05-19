# EXTRAÇÃO DE NÚMEROS DE TELEFONE,RAZAO SOCIAL E CNPJ DO ARQUIVO CSV DA BASE VIVO (OS TELEFONES DE CADA CNPJ ESTÃO TODOS NA MESMA LINHA, MAS EM COLUNAS DIFERENTES)
# Este script lê um arquivo CSV, extrai números de telefone, Razao Social e CNPJ, e grava os resultados em um novo arquivo CSV.

import pandas as pd

# Caminho do arquivo de entrada
caminho_entrada = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\LINHAS VIVO OUTRS PV - BANCO DE DADOS - MAIO 2025.csv'

# Caminho do arquivo de saída
caminho_saida = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\BaseVivo2.csv'

# Lê o CSV de entrada (separador ;)
df = pd.read_csv(caminho_entrada, sep=';', dtype=str)

# Lista para armazenar as linhas transformadas
linhas_saida = []

# Percorre cada linha da tabela
for _, row in df.iterrows():
    cnpj = row['CNPJ']
    razao_social = row['NOME ORGANIZACAO']

    # Coleta todos os telefones (ignorando campos vazios)
    telefones = [row[col] for col in row.index if 'LINHA' in col and pd.notna(row[col]) and row[col].strip() != '']

    # Remove duplicatas mantendo a ordem
    telefones_unicos = list(dict.fromkeys(telefones))

    # Cria uma nova linha para cada telefone
    for telefone in telefones_unicos:
        linhas_saida.append({
            'CNPJ_CLIENTE': cnpj,
            'RAZAO_SOCIAL': razao_social,
            'NR_TELEFONE': telefone
        })

# Converte para DataFrame
df_saida = pd.DataFrame(linhas_saida)

# Salva no formato CSV com separador ;
df_saida.to_csv(caminho_saida, sep=';', index=False)
