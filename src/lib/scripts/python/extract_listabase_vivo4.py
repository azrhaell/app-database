import pandas as pd

# Caminho do arquivo de entrada XLSX
caminho_entrada = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\BANCO DE DDOS LINHAS VIVO - 17 JUNHO 2025.xlsx'

# Caminho do arquivo de saída CSV
caminho_saida = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\BANCO DE DDOS LINHAS VIVO - 17 JUNHO 2025.csv'

# Lê o arquivo Excel
df = pd.read_excel(caminho_entrada, dtype=str)

# Seleciona apenas as colunas desejadas
colunas_desejadas = ['CNPJ_CLIENTE', 'NR_TELEFONE', 'OPERADORA']
df_filtrado = df[colunas_desejadas]

# Remove duplicatas
df_unico = df_filtrado.drop_duplicates()

# Salva no formato CSV com separador ;
df_unico.to_csv(caminho_saida, sep=';', index=False, encoding='utf-8-sig')
