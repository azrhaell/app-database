#CALCULA A BASE DE CADA CNPJ
# Este script lê um arquivo CSV, corrige CNPJs com notação científica, conta a ocorrência de operadoras por CNPJ,
# identifica a operadora mais frequente e salva o resultado em um novo arquivo CSV.

import pandas as pd

# Caminho do arquivo de entrada e saída
arquivo_entrada = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\cnpjs_filtrados_20242025 - NOVO.csv'
arquivo_saida = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\cnpjs_filtrados_20242025 - BASED.csv'

# Leitura do CSV com separador ; e codificação latin-1
df = pd.read_csv(arquivo_entrada, sep=';', encoding='latin-1', dtype={'CNPJ': str})

# Corrige CNPJs com notação científica
df['CNPJ'] = df['CNPJ'].apply(lambda x: str(int(float(x))).zfill(14))

# Conta a ocorrência de OPERADORA por CNPJ
contagens = df.groupby(['CNPJ', 'OPERADORA']).size().reset_index(name='count')

# Identifica a operadora mais frequente por CNPJ
base_operadora = contagens.sort_values(['CNPJ', 'count'], ascending=[True, False]) \
                          .drop_duplicates(subset='CNPJ') \
                          .set_index('CNPJ')['OPERADORA']

# Adiciona a coluna "BASE" ao DataFrame principal
df['BASE'] = df['CNPJ'].map(base_operadora)

# Salva o resultado em um novo CSV
df.to_csv(arquivo_saida, sep=';', index=False, encoding='latin-1')
