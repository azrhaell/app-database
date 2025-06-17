import pandas as pd

# Caminhos dos arquivos
caminho_csv = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\BDO\bdo_filtrado.csv'
caminho_xlsx = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\tim ES.xlsx'


# Lê os arquivos
df_csv = pd.read_csv(caminho_csv, dtype=str)
df_xlsx = pd.read_excel(caminho_xlsx, dtype=str)

# Normaliza e remove espaços
df_csv['number'] = df_csv['number'].astype(str).str.strip()
df_xlsx['telefone Socio'] = df_xlsx['telefone Socio'].astype(str).str.strip()

# Converte para conjuntos para comparação rápida
numeros_csv = set(df_csv['number'])
numeros_xlsx = set(df_xlsx['telefone Socio'])

# Faz a interseção (números que existem nos dois arquivos)
numeros_em_comum = numeros_csv & numeros_xlsx

# Conta quantos do CSV estão no XLSX
total_no_csv = len(numeros_csv)
encontrados_no_xlsx = len(numeros_em_comum)
nao_encontrados = total_no_csv - encontrados_no_xlsx

# Exibe o resultado
print(f'Total de números no CSV: {total_no_csv}')
print(f'Números encontrados também no XLSX: {encontrados_no_xlsx}')
print(f'Números do CSV que NÃO estão no XLSX: {nao_encontrados}')
