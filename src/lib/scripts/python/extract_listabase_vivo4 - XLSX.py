import pandas as pd

# Caminho do arquivo de entrada XLSX
caminho_entrada = r'd:\Github\Vivo_Database\app-database\public\MISC\BASE VIVO 21082025\ATUALIZACAO BANDO DE DADOS TC - LINHAS VIVO TC TELECOM - AGOSTO 2025.xlsx'

# Caminho do arquivo de saída CSV
caminho_saida = r'd:\Github\Vivo_Database\app-database\public\MISC\ATUALIZACAO BANDO DE DADOS TC - LINHAS VIVO TC TELECOM - AGOSTO 2025.csv'

# Lê o arquivo Excel
df = pd.read_excel(caminho_entrada, dtype=str)

# Seleciona apenas as colunas desejadas
#colunas_desejadas = ['CNPJ_CLIENTE', 'NR_TELEFONE', 'OPERADORA']
colunas_desejadas = ['CNPJ_CLIENTE', 'CELULAR']
df_filtrado = df[colunas_desejadas]

# Remove duplicatas
df_unico = df_filtrado.drop_duplicates()

# Salva no formato CSV com separador ;
df_unico.to_csv(caminho_saida, sep=';', index=False, encoding='utf-8-sig')
